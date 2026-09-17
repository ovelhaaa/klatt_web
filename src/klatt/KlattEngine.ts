import {
  SynthVoice, SignalInterp, Resonator, DelayedInterp,
  VoiceState, VoicingMode, FormantParam, ResonatorName,
  ConsonantCode, VowelCode,
  SAMPLE_RATE, DELTA_TIME, PI, PI_DT,
  NUM_FORMANT_PARAM, NUM_RESONATOR
} from './types';
import { createMtoIncTable, createPitchBendTable } from './mtof';
import { getConsonantParams, getVowelParams } from './phonemes';

const CV_QUEUE_CAP = 64;
const DEL_QUEUE_CAP = 32;
const TABLE_SIZE = 4096;
const TABLE_MASK = TABLE_SIZE - 1;

export class KlattEngine {
  // Tables
  private mtoinc: Float32Array;
  private pitchbendTable: Float32Array;
  private wavetable: Float32Array;

  // expfFast buffers (reused to avoid allocations)
  private expfBuf: ArrayBuffer;
  private expfFView: Float32Array;
  private expfIView: Int32Array;

  // Voices
  private voices: SynthVoice[];
  private keyboard: Int32Array;

  // Synth globals
  private masterVolume = 1.0;
  private masterVolumeKnob = 1.0;
  private waveshapper = 0.9;
  private waveshapperKnob = 0.9;

  // Resonator controls (poly mode)
  private pResonator: Resonator;
  private pResonF = 500;
  private pResonFKnob = 500;
  private pResonBW = 1000;
  private pResonBWKnob = 1000;
  private pResonWet = 0;
  private pResonWetKnob = 0;

  private pAResonator: Resonator;
  private pAResonF = 500;
  private pAResonFKnob = 500;
  private pAResonBW = 1000;
  private pAResonBWKnob = 1000;
  private pAResonWet = 0;
  private pAResonWetKnob = 0;

  // Mode
  private voiceMode: VoicingMode = VoicingMode.POLYVOICE;

  // Formant mode state
  private voiceCount = 0;
  private voiceSum = 0;
  private runningVoicePhase = 0;
  private formantParams: SignalInterp[];
  private resonators: Resonator[];

  // Flutter
  private flutter = 0.1;
  private flutterf1 = 12.7 * DELTA_TIME;
  private flutterf2 = 7.1 * DELTA_TIME;
  private flutterf3 = 4.7 * DELTA_TIME;
  private flutterp1 = 0;
  private flutterp2 = 0;
  private flutterp3 = 0;

  // CV queue
  private cvKeyboard = 0;
  private cvQueue: number[];
  private cvQueueFront = 0;
  private cvQueueRear = -1;
  private cvQueueSize = 0;
  private lastVowel: VowelCode = VowelCode.CODE_A;

  // Delay queue
  private delQueue: DelayedInterp[];
  private delQueueFront = 0;
  private delQueueRear = -1;
  private delQueueSize = 0;
  private delTime = 0;

  // Random state
  private randNext = 0;

  // Pitch
  private pitchbend = 8192;

  // ADSR
  private attack = 0.05;
  private release = 0.1;
  private sustain = 1.0;

  // Audio context
  private audioContext: AudioContext | null = null;
  private scriptNode: ScriptProcessorNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  // Callbacks
  onAnalyserUpdate?: (data: Uint8Array) => void;

  constructor() {
    this.mtoinc = createMtoIncTable(SAMPLE_RATE);
    this.pitchbendTable = createPitchBendTable();
    this.wavetable = new Float32Array(TABLE_SIZE);

    // Initialize expfFast buffers once
    this.expfBuf = new ArrayBuffer(4);
    this.expfFView = new Float32Array(this.expfBuf);
    this.expfIView = new Int32Array(this.expfBuf);

    this.voices = [];
    this.keyboard = new Int32Array(128);
    this.formantParams = [];
    this.resonators = [];
    this.cvQueue = new Array(CV_QUEUE_CAP).fill(0);
    this.delQueue = [];

    this.pResonator = this.createResonator();
    this.pAResonator = this.createResonator();

    this.init();
  }

  private createResonator(): Resonator {
    return { out1: 0, out2: 0, a: 0, b: 0, c: 0, f: 0, bw: 0 };
  }

  private init() {
    // Init wavetable
    for (let i = 0; i < TABLE_SIZE; i++) {
      this.wavetable[i] = this.sinTaylor(i / TABLE_SIZE);
    }

    // Init voices
    for (let i = 0; i < 16; i++) {
      this.voices.push({
        active: VoiceState.INACTIVE,
        note: 0,
        velocity: 0,
        volume: 0,
        frequency: 0,
        phase1: 0,
        phase2: 0
      });
    }

    // Init keyboard
    for (let i = 0; i < 128; i++) {
      this.keyboard[i] = -1;
    }

    // Init formant params with default values
    for (let i = 0; i < NUM_FORMANT_PARAM; i++) {
      let defaultValue = 0;
      // Set default formant frequencies and bandwidths
      if (i === FormantParam.F1) defaultValue = 500;
      else if (i === FormantParam.F2) defaultValue = 1500;
      else if (i === FormantParam.F3) defaultValue = 2500;
      else if (i === FormantParam.F4) defaultValue = 3300;
      else if (i === FormantParam.F5) defaultValue = 3750;
      else if (i === FormantParam.F6) defaultValue = 4900;
      else if (i === FormantParam.FNP) defaultValue = 270;
      else if (i === FormantParam.FNZ) defaultValue = 270;
      else if (i === FormantParam.B1) defaultValue = 60;
      else if (i === FormantParam.B2) defaultValue = 90;
      else if (i === FormantParam.B3) defaultValue = 150;
      else if (i === FormantParam.B4) defaultValue = 250;
      else if (i === FormantParam.B5) defaultValue = 200;
      else if (i === FormantParam.B6) defaultValue = 1000;
      else if (i === FormantParam.BNP) defaultValue = 50;
      else if (i === FormantParam.BNZ) defaultValue = 50;
      
      this.formantParams.push({
        value: defaultValue,
        duration: 0.01,
        t: 0,
        delta: 0,
        resting: true
      });
    }

    // Init resonators
    for (let i = 0; i < NUM_RESONATOR; i++) {
      this.resonators.push(this.createResonator());
    }

    // Push default 'a' vowel
    this.cvQueueRear = (this.cvQueueRear + 1) % CV_QUEUE_CAP;
    this.cvQueue[this.cvQueueRear] = (ConsonantCode.CODE_SPACE << 3) | VowelCode.CODE_A;
    this.cvQueueSize++;
  }

  // Fast exp approximation (Schraudolph's method)
  private expfFast(a: number): number {
    const x = Math.round(12102203 * a + 1064866805);
    this.expfIView[0] = x;
    return this.expfFView[0];
  }

  // Taylor series sine approximation
  private sinTaylor(phase: number): number {
    while (phase > 1.0) phase -= 1.0;
    let tp = phase * 2.0 - 1.0;
    let yp: number;
    if (tp > 0.5) yp = 1.0 - tp;
    else if (tp < -0.5) yp = -1.0 - tp;
    else yp = tp;

    const x = yp * PI;
    const x2 = x * x;
    return x * (x2 * (x2 * (x2 * (x2 * 0.000002755731922 - 0.000198412698413) + 0.008333333333333) - 0.166666666666667) + 1.0);
  }

  // Table lookup
  private sinTable(phase: number): number {
    const phint = Math.floor(phase * TABLE_SIZE);
    const frac = phase * TABLE_SIZE - phint;
    const idx0 = phint & TABLE_MASK;
    const idx1 = (phint + 1) & TABLE_MASK;
    return this.wavetable[idx0] * (1.0 - frac) + this.wavetable[idx1] * frac;
  }

  // Random float [-1, 1)
  private randf(): number {
    this.randNext = (this.randNext * 196314165 + 907633515) | 0;
    return this.randNext * 0.0000000004656612873077392578125;
  }

  // Resonator filter
  private resonatorSamp(r: Resonator, input: number, frequency: number, bandwidth: number): number {
    if (frequency !== r.f || bandwidth !== r.bw) {
      r.f = frequency;
      r.bw = bandwidth;
      const e = this.expfFast(-bandwidth * PI_DT);
      r.c = -e * e;
      r.b = 2.0 * e * this.sinTable(2.0 * DELTA_TIME * frequency + 0.75);
      r.a = 1.0 - r.c - r.b;
    }
    const out = input * r.a + r.b * r.out1 + r.c * r.out2;
    r.out2 = r.out1;
    r.out1 = out;
    return out;
  }

  // Antiresonator filter
  private antiresonatorSamp(r: Resonator, input: number, frequency: number, bandwidth: number): number {
    if (frequency !== r.f || bandwidth !== r.bw) {
      r.f = frequency;
      r.bw = bandwidth;
      const e = this.expfFast(-bandwidth * PI_DT);
      r.c = -e * e;
      r.b = 2.0 * e * this.sinTable(2.0 * DELTA_TIME * frequency + 0.75);
      r.a = 1.0 / (1.0 - r.c - r.b);
    }
    const out = (input - r.b * r.out1 - r.c * r.out2) * r.a;
    r.out2 = r.out1;
    r.out1 = input;
    return out;
  }

  // Interpolation
  private interpSet(interp: SignalInterp, value: number) {
    interp.value = value;
    interp.resting = true;
  }

  private interp(interp: SignalInterp, value: number, duration: number) {
    if (duration === 0) {
      // Instant set
      this.interpSet(interp, value);
      return;
    } else if (duration < 0) {
      // Use existing duration
      if (interp.duration === 0) {
        // No existing duration, set instantly
        this.interpSet(interp, value);
        return;
      }
      interp.delta = (value - interp.value) / interp.duration * DELTA_TIME;
      interp.t = 0;
      interp.resting = false;
    } else {
      // Use new duration
      interp.duration = duration;
      interp.delta = (value - interp.value) / interp.duration * DELTA_TIME;
      interp.t = 0;
      interp.resting = false;
    }
  }

  private enqueueDelInterp(param: FormantParam, delay: number, value: number, duration: number) {
    if (this.delQueueSize >= DEL_QUEUE_CAP) return;
    this.delQueueRear = (this.delQueueRear + 1) % DEL_QUEUE_CAP;
    let curr = this.delQueueRear;
    let prior = curr === 0 ? DEL_QUEUE_CAP - 1 : curr - 1;

    while (curr !== this.delQueueFront && delay < this.delQueue[prior].start) {
      this.delQueue[curr] = { ...this.delQueue[prior] };
      curr = prior;
      prior = curr === 0 ? DEL_QUEUE_CAP - 1 : curr - 1;
    }
    this.delQueue[curr] = { start: delay, value, duration, param };
    this.delQueueSize++;
  }

  private dequeueDelInterp(): DelayedInterp {
    const di = this.delQueue[this.delQueueFront];
    this.delQueueFront = (this.delQueueFront === DEL_QUEUE_CAP - 1) ? 0 : this.delQueueFront + 1;
    this.delQueueSize--;
    return di;
  }

  private emptyDelInterp() {
    this.delQueueFront = (this.delQueueRear === DEL_QUEUE_CAP - 1) ? 0 : this.delQueueRear + 1;
    this.delQueueSize = 0;
    this.delTime = 0;
  }

  private setFormantTransitions(duration: number) {
    const params = [FormantParam.F1, FormantParam.F2, FormantParam.F3, FormantParam.F4,
      FormantParam.F5, FormantParam.FNZ, FormantParam.B1, FormantParam.B2,
      FormantParam.B3, FormantParam.B4, FormantParam.B5];
    for (const p of params) {
      this.formantParams[p].duration = duration;
    }
  }

  private voiceResting(thresh: number): boolean {
    return this.formantParams[FormantParam.AV].value < 0
      ? this.formantParams[FormantParam.AV].value > -thresh
      : this.formantParams[FormantParam.AV].value < thresh;
  }

  // Process a CV (consonant-vowel) pair
  private processCV(currCV: number) {
    const consCode = (currCV & 0x78) >> 3;
    let vowelDelay = 0;
    let vowelTransition = -1;

    this.emptyDelInterp();

    // Process consonant
    const consParams = getConsonantParams(consCode, this.voiceResting.bind(this));
    if (consParams) {
      for (const p of consParams) {
        if (p.type === 'setTransitions') {
          this.setFormantTransitions(p.duration ?? 0);
        } else if (p.type === 'setVowelDelay') {
          vowelDelay = p.delay ?? 0;
        } else if (p.type === 'setVowelTransition') {
          vowelTransition = p.transition ?? -1;
        } else {
          this.enqueueDelInterp(p.param!, p.delay ?? 0, p.value ?? 0, p.duration ?? 0);
        }
      }
    }

    // Process vowel
    const vowelCode = ((currCV & 0x7) === VowelCode.CODE_REP) ? this.lastVowel : (currCV & 0x7);
    this.lastVowel = vowelCode;

    const vowelParams = getVowelParams(vowelCode, vowelDelay, vowelTransition);
    if (vowelParams) {
      for (const p of vowelParams) {
        this.enqueueDelInterp(p.param, p.delay, p.value, p.duration);
      }
    }
  }

  // Note on
  noteOn(note: number, velocity: number) {
    if (this.voiceMode === VoicingMode.POLYVOICE) {
      // Release existing voice on same note
      if (this.keyboard[note] !== -1) {
        this.voices[this.keyboard[note]].active = VoiceState.RELEASE;
        this.keyboard[note] = -1;
      }
      // Find inactive voice
      for (let i = 0; i < 16; i++) {
        if (this.voices[i].active === VoiceState.INACTIVE) {
          this.voices[i].active = VoiceState.ATTACK;
          this.voices[i].note = note;
          this.voices[i].velocity = velocity;
          this.keyboard[note] = i;
          break;
        }
      }
    } else {
      // Formant mode
      if (note >= 44) {
        this.voiceSum += note;
        this.voiceCount++;
        if (this.voiceCount === 1 && this.voiceResting(0.05)) {
          this.interpSet(this.formantParams[FormantParam.F0], note);
          this.interpSet(this.formantParams[FormantParam.A0], velocity);
        } else {
          this.interp(this.formantParams[FormantParam.F0], this.voiceSum / this.voiceCount, -1);
          this.interp(this.formantParams[FormantParam.A0], velocity, -1);
        }

        // Get CV from queue
        let currCV: number;
        if (this.cvQueueSize > 0) {
          currCV = this.cvQueue[this.cvQueueFront];
          this.cvQueueFront = (this.cvQueueFront + 1) % CV_QUEUE_CAP;
          this.cvQueueSize--;
        } else {
          currCV = this.cvQueue[this.cvQueueFront ? this.cvQueueFront : CV_QUEUE_CAP - 1];
        }
        this.processCV(currCV);
      } else if (note >= 36 && note <= 42) {
        this.cvKeyboard ^= 1 << (42 - note);
      } else if (note === 43) {
        if (this.cvQueueSize >= CV_QUEUE_CAP) return;
        this.cvQueueRear = (this.cvQueueRear === CV_QUEUE_CAP - 1) ? 0 : this.cvQueueRear + 1;
        this.cvQueue[this.cvQueueRear] = this.cvKeyboard;
        this.cvKeyboard = 0;
        this.cvQueueSize++;
      }
    }
  }

  // Note off
  noteOff(note: number) {
    if (this.voiceMode === VoicingMode.POLYVOICE) {
      for (let i = 0; i < 16; i++) {
        if (this.voices[i].note === note) {
          this.voices[i].active = VoiceState.RELEASE;
          this.keyboard[note] = -1;
        }
      }
    } else {
      if (note >= 44) {
        if (this.voiceCount) {
          this.voiceSum -= note;
          this.voiceCount--;
          if (!this.voiceCount) {
            const endDelay = Math.max(0, this.delQueue[this.delQueueRear].start - this.delTime);
            this.interp(this.formantParams[FormantParam.F0], this.formantParams[FormantParam.F0].value, -1);
            this.enqueueDelInterp(FormantParam.AV, endDelay + 0.1, 0, 0.2);
            this.enqueueDelInterp(FormantParam.AVS, endDelay + 0.1, 0, 0.2);
            this.enqueueDelInterp(FormantParam.AH, endDelay + 0.1, 0.01, 0.02);
            this.enqueueDelInterp(FormantParam.AH, endDelay + 0.1, 0, 0.2);
          } else {
            this.interp(this.formantParams[FormantParam.F0], this.voiceSum / this.voiceCount, -1);
          }
        }
      }
    }
  }

  // Generate audio samples
  processSamples(buffer: Float32Array, numSamples: number) {
    // Smoothing factor for parameter changes (1/16 = 0.0625)
    const smoothFactor = 0.0625;
    const masterInc = (this.masterVolumeKnob - this.masterVolume) * smoothFactor;
    const waveshapeInc = (this.waveshapperKnob - this.waveshapper) * smoothFactor;
    const pResonFInc = (this.pResonFKnob - this.pResonF) * smoothFactor;
    const pResonBWInc = (this.pResonBWKnob - this.pResonBW) * smoothFactor;
    const pResonWetInc = (this.pResonWetKnob - this.pResonWet) * smoothFactor;
    const pAResonFInc = (this.pAResonFKnob - this.pAResonF) * smoothFactor;
    const pAResonBWInc = (this.pAResonBWKnob - this.pAResonBW) * smoothFactor;
    const pAResonWetInc = (this.pAResonWetKnob - this.pAResonWet) * smoothFactor;

    // Pre-calculate pitch bend multiplier
    const pitchBendMult = this.pitchbendTable[this.pitchbend >> 4];

    for (let i = 0; i < numSamples; i++) {
      // Smooth parameter changes
      this.masterVolume += masterInc;
      this.waveshapper += waveshapeInc;

      let out = 0;

      if (this.voiceMode === VoicingMode.POLYVOICE) {
        this.pResonF += pResonFInc;
        this.pResonBW += pResonBWInc;
        this.pResonWet += pResonWetInc;
        this.pAResonF += pAResonFInc;
        this.pAResonBW += pAResonBWInc;
        this.pAResonWet += pAResonWetInc;

        for (let v = 0; v < 16; v++) {
          const voice = this.voices[v];
          if (voice.active !== VoiceState.INACTIVE) {
            // Use pre-calculated pitch bend multiplier
            voice.frequency = this.mtoinc[voice.note] * pitchBendMult;
            voice.phase1 += voice.frequency;
            if (voice.phase1 >= 1.0) voice.phase1 -= 1.0;

            let sig = this.sinTable(voice.phase1);
            // Waveshaping with soft clipping
            sig = (sig > this.waveshapper) ? (sig - this.waveshapper) / (1.0 - this.waveshapper) : 0;

            // Mix voice output with volume and velocity scaling
            out += sig * voice.volume * voice.velocity * 0.0009765625 * this.masterVolume;

            // Envelope
            if (voice.active === VoiceState.ATTACK) {
              voice.volume += 1.0 / this.attack * DELTA_TIME;
              if (voice.volume >= 1.0) voice.active = VoiceState.SUSTAIN;
            } else if (voice.active === VoiceState.SUSTAIN) {
              voice.volume = this.sustain;
            } else if (voice.active === VoiceState.RELEASE) {
              voice.volume -= 1.0 / this.release * DELTA_TIME;
              if (voice.volume <= 0) {
                voice.active = VoiceState.INACTIVE;
                voice.volume = 0;
              }
            }
          }
        }

        // Apply resonator effects
        out = this.pResonWet * this.resonatorSamp(this.pResonator, out, this.pResonF, this.pResonBW)
          + (1.0 - this.pResonWet) * out;
        out = this.pAResonWet * this.antiresonatorSamp(this.pAResonator, out, this.pAResonF, this.pAResonBW)
          + (1.0 - this.pAResonWet) * out;

      } else {
        // Formant mode
        // Check delays
        while (this.delQueueSize > 0 && this.delQueue[this.delQueueFront].start < this.delTime) {
          const di = this.dequeueDelInterp();
          this.interp(this.formantParams[di.param], di.value, di.duration);
        }
        this.delTime += DELTA_TIME;

        // Adjust parameters
        for (let j = 0; j < NUM_FORMANT_PARAM; j++) {
          const fp = this.formantParams[j];
          if (!fp.resting) {
            fp.resting = fp.t > fp.duration;
            if (!fp.resting) {
              if (j <= FormantParam.F0) {
                fp.value += fp.delta;
                fp.t += DELTA_TIME;
              } else if (i === 0) {
                fp.value += fp.delta;
                fp.t += DELTA_TIME;
              }
            }
          }
        }

        // Calculate fundamental frequency with linear interpolation
        const midiPitch = Math.floor(this.formantParams[FormantParam.F0].value);
        const clampedPitch = Math.max(0, Math.min(126, midiPitch));
        const midiMix = this.formantParams[FormantParam.F0].value - midiPitch;
        let frequency = ((1.0 - midiMix) * this.mtoinc[clampedPitch] + midiMix * this.mtoinc[clampedPitch + 1])
          * pitchBendMult;

        // Flutter
        this.flutterp1 += this.flutterf1;
        if (this.flutterp1 > 1.0) this.flutterp1 -= 1.0;
        this.flutterp2 += this.flutterf2;
        if (this.flutterp2 > 1.0) this.flutterp2 -= 1.0;
        this.flutterp3 += this.flutterf3;
        if (this.flutterp3 > 1.0) this.flutterp3 -= 1.0;
        frequency += this.flutter * frequency * 0.01 * (this.sinTable(this.flutterp1) + this.sinTable(this.flutterp2) + this.sinTable(this.flutterp3));

        // Voice phase
        this.runningVoicePhase += frequency;
        if (this.runningVoicePhase > 1.0) this.runningVoicePhase -= 1.0;

        // Glottal source
        let sig = this.sinTable(this.runningVoicePhase);
        sig = (sig > this.waveshapper) ? (sig - this.waveshapper) / (1.0 - this.waveshapper) : 0;

        // Preliminary filtering
        sig = this.resonatorSamp(this.resonators[ResonatorName.RGP], sig, 0, 200);
        sig = this.formantParams[FormantParam.AV].value * this.antiresonatorSamp(this.resonators[ResonatorName.RGZ], sig, 1500, 6000)
          + this.formantParams[FormantParam.AVS].value * this.resonatorSamp(this.resonators[ResonatorName.RGS], sig, 0, 200);

        // Noise source
        const noise = this.resonatorSamp(this.resonators[ResonatorName.LPF], this.randf(), 0, 1000);

        // Track splitting
        let sigc = this.formantParams[FormantParam.AH].value * noise + sig;
        const noiseP = this.formantParams[FormantParam.AF].value * noise;

        // Cascade track
        sigc = this.resonatorSamp(this.resonators[ResonatorName.RNP], sigc, 270, 50);
        sigc = this.antiresonatorSamp(this.resonators[ResonatorName.RNZ], sigc, this.formantParams[FormantParam.FNZ].value, 50);
        sigc = this.resonatorSamp(this.resonators[ResonatorName.RC1], sigc, this.formantParams[FormantParam.F1].value, this.formantParams[FormantParam.B1].value);
        sigc = this.resonatorSamp(this.resonators[ResonatorName.RC2], sigc, this.formantParams[FormantParam.F2].value, this.formantParams[FormantParam.B2].value);
        sigc = this.resonatorSamp(this.resonators[ResonatorName.RC3], sigc, this.formantParams[FormantParam.F3].value, this.formantParams[FormantParam.B3].value);
        sigc = this.resonatorSamp(this.resonators[ResonatorName.RC4], sigc, 3300, 250);
        sigc = this.resonatorSamp(this.resonators[ResonatorName.RC5], sigc, 3750, 200);

        // Parallel track
        let sigp = 0;
        sigp += this.formantParams[FormantParam.A2].value * this.resonatorSamp(this.resonators[ResonatorName.RP2], noiseP, this.formantParams[FormantParam.F2].value, this.formantParams[FormantParam.B2].value);
        sigp += this.formantParams[FormantParam.A3].value * this.resonatorSamp(this.resonators[ResonatorName.RP3], noiseP, this.formantParams[FormantParam.F3].value, this.formantParams[FormantParam.B3].value);
        sigp += this.formantParams[FormantParam.A4].value * this.resonatorSamp(this.resonators[ResonatorName.RP4], noiseP, 3300, 250);
        sigp += this.formantParams[FormantParam.A5].value * this.resonatorSamp(this.resonators[ResonatorName.RP5], noiseP, 3750, 200);
        sigp += this.formantParams[FormantParam.A6].value * this.resonatorSamp(this.resonators[ResonatorName.RP6], noiseP, 4900, 1000);
        sigp += this.formantParams[FormantParam.AB].value * noiseP;

        // Output
        out = (sigp + sigc) * this.formantParams[FormantParam.A0].value * 0.0078125 * this.masterVolume;
      }

      // Soft clip
      if (out > 1.0) out = 1.0;
      if (out < -1.0) out = -1.0;

      buffer[i * 2] = out;
      buffer[i * 2 + 1] = out;
    }

    this.masterVolume = this.masterVolumeKnob;
    this.waveshapper = this.waveshapperKnob;
    this.pResonF = this.pResonFKnob;
    this.pResonBW = this.pResonBWKnob;
    this.pResonWet = this.pResonWetKnob;
    this.pAResonF = this.pAResonFKnob;
    this.pAResonBW = this.pAResonBWKnob;
    this.pAResonWet = this.pAResonWetKnob;
  }

  // Start audio
  async start() {
    if (this.audioContext) return;

    this.audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.8;

    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;

    this.scriptNode = this.audioContext.createScriptProcessor(2048, 0, 2);
    this.scriptNode.onaudioprocess = (e) => {
      const outputL = e.outputBuffer.getChannelData(0);
      const outputR = e.outputBuffer.getChannelData(1);
      const numSamples = outputL.length;
      const buffer = new Float32Array(numSamples * 2);
      this.processSamples(buffer, numSamples);
      for (let i = 0; i < numSamples; i++) {
        outputL[i] = buffer[i * 2];
        outputR[i] = buffer[i * 2 + 1];
      }
    };

    this.scriptNode.connect(this.gainNode);
    this.gainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.audioContext.destination);
  }

  // Get analyser data
  getAnalyserData(): Uint8Array | null {
    if (!this.analyserNode) return null;
    const data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteTimeDomainData(data);
    return data;
  }

  // Setters for controls
  setMode(mode: VoicingMode) {
    this.voiceMode = mode;
  }

  getMode(): VoicingMode {
    return this.voiceMode;
  }

  setMasterVolume(value: number) {
    this.masterVolumeKnob = value;
  }

  setWaveshapper(value: number) {
    this.waveshapperKnob = value;
  }

  setPitchBend(value: number) {
    this.pitchbend = value;
  }

  setFlutter(value: number) {
    this.flutter = value;
  }

  setResonatorFreq(value: number) {
    this.pResonFKnob = value;
  }

  setResonatorBW(value: number) {
    this.pResonBWKnob = value;
  }

  setResonatorWet(value: number) {
    this.pResonWetKnob = value;
  }

  setAntiResonatorFreq(value: number) {
    this.pAResonFKnob = value;
  }

  setAntiResonatorBW(value: number) {
    this.pAResonBWKnob = value;
  }

  setAntiResonatorWet(value: number) {
    this.pAResonWetKnob = value;
  }

  setAttack(value: number) {
    this.attack = value;
  }

  setRelease(value: number) {
    this.release = value;
  }

  setSustain(value: number) {
    this.sustain = value;
  }

  // Direct phoneme trigger for UI - queues CV pair for processing by noteOn
  triggerPhoneme(consonant: number, vowel: number) {
    const cv = (consonant << 3) | vowel;
    if (this.cvQueueSize >= CV_QUEUE_CAP) return;
    this.cvQueueRear = (this.cvQueueRear === CV_QUEUE_CAP - 1) ? 0 : this.cvQueueRear + 1;
    this.cvQueue[this.cvQueueRear] = cv;
    this.cvQueueSize++;

    // Set default F0 and A0 if voice is resting (for UI button clicks)
    if (this.voiceMode === VoicingMode.MONOVOICE && this.voiceResting(0.05)) {
      this.interpSet(this.formantParams[FormantParam.F0], 60);
      this.interpSet(this.formantParams[FormantParam.A0], 100);
    }
  }

  // Get formant params for visualization
  getFormantValues() {
    return {
      F0: this.formantParams[FormantParam.F0].value,
      F1: this.formantParams[FormantParam.F1].value,
      F2: this.formantParams[FormantParam.F2].value,
      F3: this.formantParams[FormantParam.F3].value,
      F4: this.formantParams[FormantParam.F4].value,
      F5: this.formantParams[FormantParam.F5].value,
      FNP: this.formantParams[FormantParam.FNP].value,
      FNZ: this.formantParams[FormantParam.FNZ].value,
      B1: this.formantParams[FormantParam.B1].value,
      B2: this.formantParams[FormantParam.B2].value,
      B3: this.formantParams[FormantParam.B3].value,
      AV: this.formantParams[FormantParam.AV].value,
      AVS: this.formantParams[FormantParam.AVS].value,
      AF: this.formantParams[FormantParam.AF].value,
      AH: this.formantParams[FormantParam.AH].value,
      A0: this.formantParams[FormantParam.A0].value,
    };
  }

  // Apply preset parameters
  applyPreset(params: {
    masterVolume?: number;
    waveshape?: number;
    flutter?: number;
    attack?: number;
    release?: number;
    sustain?: number;
    resonFreq?: number;
    resonBW?: number;
    resonWet?: number;
    antiResonFreq?: number;
    antiResonBW?: number;
    antiResonWet?: number;
  }) {
    if (params.masterVolume !== undefined) this.setMasterVolume(params.masterVolume / 100);
    if (params.waveshape !== undefined) this.setWaveshapper(params.waveshape / 100);
    if (params.flutter !== undefined) this.setFlutter(params.flutter / 100);
    if (params.attack !== undefined) this.setAttack(0.01 + params.attack / 1000);
    if (params.release !== undefined) this.setRelease(0.01 + params.release / 1000);
    if (params.sustain !== undefined) this.setSustain(params.sustain / 100);
    if (params.resonFreq !== undefined) this.setResonatorFreq(params.resonFreq / 100 * 3000);
    if (params.resonBW !== undefined) this.setResonatorBW(params.resonBW / 100 * 5000 + 1);
    if (params.resonWet !== undefined) this.setResonatorWet(params.resonWet / 100);
    if (params.antiResonFreq !== undefined) this.setAntiResonatorFreq(params.antiResonFreq / 100 * 3000);
    if (params.antiResonBW !== undefined) this.setAntiResonatorBW(params.antiResonBW / 100 * 5000 + 1);
    if (params.antiResonWet !== undefined) this.setAntiResonatorWet(params.antiResonWet / 100);
  }

  // Reset all parameters to defaults
  reset() {
    this.masterVolumeKnob = 0.8;
    this.waveshapperKnob = 0.9;
    this.flutter = 0.1;
    this.attack = 0.05;
    this.release = 0.1;
    this.sustain = 1.0;
    this.pResonFKnob = 500;
    this.pResonBWKnob = 1000;
    this.pResonWetKnob = 0;
    this.pAResonFKnob = 500;
    this.pAResonBWKnob = 1000;
    this.pAResonWetKnob = 0;
  }
}
