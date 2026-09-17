import { useState, useRef, useEffect, useCallback } from 'react';
import { KlattEngine } from './klatt/KlattEngine';
import { VoicingMode } from './klatt/types';
import { ConsonantCode, VowelCode } from './klatt/types';
import { presets, type SynthPreset } from './klatt/presets';
import { Sequencer, sequences, type Sequence, type SyllableStep } from './klatt/sequencer';
import { Recorder } from './klatt/recorder';

// Note names for keyboard
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function getNoteName(midi: number): string {
  return NOTE_NAMES[midi % 12] + Math.floor(midi / 12 - 1);
}

function App() {
  const engineRef = useRef<KlattEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const [isStarted, setIsStarted] = useState(false);
  const [mode, setMode] = useState<VoicingMode>(VoicingMode.POLYVOICE);
  const [masterVol, setMasterVol] = useState(80);
  const [waveshape, setWaveshape] = useState(90);
  const [flutter, setFlutter] = useState(10);
  const [attack, setAttack] = useState(50);
  const [release, setRelease] = useState(100);
  const [sustain, setSustain] = useState(100);
  const [resonFreq, setResonFreq] = useState(17);
  const [resonBW, setResonBW] = useState(20);
  const [resonWet, setResonWet] = useState(0);
  const [antiResonFreq, setAntiResonFreq] = useState(17);
  const [antiResonBW, setAntiResonBW] = useState(20);
  const [antiResonWet, setAntiResonWet] = useState(0);
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const [selectedConsonant, setSelectedConsonant] = useState<number>(0);
  const [selectedVowel, setSelectedVowel] = useState<number>(4); // A
  const [formantValues, setFormantValues] = useState({
    F0: 0, F1: 0, F2: 0, F3: 0, F4: 0, F5: 0,
    FNP: 0, FNZ: 0, B1: 0, B2: 0, B3: 0,
    AV: 0, AVS: 0, AF: 0, AH: 0, A0: 0
  });
  const [midiConnected, setMidiConnected] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const sequencerRef = useRef<Sequencer>(new Sequencer());
  const [seqPlaying, setSeqPlaying] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState<number>(0);
  const [currentSeqStep, setCurrentSeqStep] = useState<number>(-1);
  const recorderRef = useRef<Recorder>(new Recorder());
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState<SyllableStep[]>([]);
  const modeRef = useRef(mode);
  const selectedConsonantRef = useRef(selectedConsonant);
  const selectedVowelRef = useRef(selectedVowel);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { selectedConsonantRef.current = selectedConsonant; }, [selectedConsonant]);
  useEffect(() => { selectedVowelRef.current = selectedVowel; }, [selectedVowel]);

  // Initialize engine
  useEffect(() => {
    engineRef.current = new KlattEngine();
    
    // Setup sequencer
    const seq = sequencerRef.current;
    seq.setSequence(sequences[0]);
    seq.setOnStep((step: SyllableStep) => {
      if (!engineRef.current) return;
      if (step.velocity > 0) {
        engineRef.current.triggerPhoneme(step.consonant, step.vowel);
        engineRef.current.noteOn(60, step.velocity);
        setTimeout(() => {
          if (engineRef.current) {
            engineRef.current.noteOff(60);
          }
        }, 150);
      }
    });
    seq.setOnStepChange((step: number) => {
      setCurrentSeqStep(step);
    });
    
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      seq.stop();
    };
  }, []);

  // Start audio
  const startAudio = useCallback(async () => {
    if (!engineRef.current) return;
    await engineRef.current.start();
    setIsStarted(true);
    setupMIDI();
    drawWaveform();
  }, []);

  // Setup MIDI
  const setupMIDI = useCallback(async () => {
    try {
      const access = await navigator.requestMIDIAccess();
      const inputs = access.inputs;
      if (inputs.size > 0) {
        setMidiConnected(true);
        for (const [, input] of inputs) {
          input.onmidimessage = (event) => {
            if (!engineRef.current) return;
            if (!event.data) return;
            const status = event.data[0];
            const note = event.data[1];
            const velocity = event.data[2];
            const cmd = status & 0xF0;
            if (cmd === 0x90 && velocity > 0) {
              engineRef.current.noteOn(note, velocity);
              setActiveNotes(prev => new Set(prev).add(note));
            } else if (cmd === 0x80 || (cmd === 0x90 && velocity === 0)) {
              engineRef.current.noteOff(note);
              setActiveNotes(prev => {
                const next = new Set(prev);
                next.delete(note);
                return next;
              });
            } else if (cmd === 0xE0) {
              engineRef.current.setPitchBend(note + velocity * 128);
            } else if (cmd === 0xB0) {
              handleMIDICC(note, velocity);
            }
          };
        }
      }
    } catch {
      // MIDI not available
    }
  }, []);

  const handleMIDICC = (cc: number, value: number) => {
    if (!engineRef.current) return;
    switch (cc) {
      case 1: engineRef.current.setFlutter(value / 127); break;
      case 18: engineRef.current.setMasterVolume(value / 127); break;
      case 16: engineRef.current.setWaveshapper(1.0 - 2.0 * Math.exp(value / -25)); break;
      case 74: engineRef.current.setResonatorFreq(value / 127 * 3000); break;
      case 71: engineRef.current.setResonatorBW(value / 127 * 4999 + 1); break;
      case 76: engineRef.current.setResonatorWet(value / 127); break;
      case 77: engineRef.current.setAntiResonatorFreq(value / 127 * 3000); break;
      case 93: engineRef.current.setAntiResonatorBW(value / 127 * 4999 + 1); break;
      case 73: engineRef.current.setAntiResonatorWet(value / 127); break;
    }
  };

  // Draw waveform
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const data = engine.getAnalyserData();
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, width, height);

      if (data) {
        // Draw grid
        ctx.strokeStyle = '#1a1a3a';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          const y = (height / 4) * i;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Draw waveform
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const sliceWidth = width / data.length;
        let x = 0;
        for (let i = 0; i < data.length; i++) {
          const v = data[i] / 128.0;
          const y = (v * height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();

        // Glow effect
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        x = 0;
        for (let i = 0; i < data.length; i++) {
          const v = data[i] / 128.0;
          const y = (v * height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();
      }

      // Update formant display (throttled to ~6 updates/sec)
      frameCountRef.current++;
      if (frameCountRef.current % 10 === 0) {
        const fv = engine.getFormantValues();
        setFormantValues(fv);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  }, []);

  // Control handlers
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setMasterVolume(masterVol / 100);
  }, [masterVol]);

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setWaveshapper(waveshape / 100);
  }, [waveshape]);

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setFlutter(flutter / 100);
  }, [flutter]);

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setAttack(0.01 + attack / 1000);
  }, [attack]);

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setRelease(0.01 + release / 1000);
  }, [release]);

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setSustain(sustain / 100);
  }, [sustain]);

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setResonatorFreq(resonFreq / 100 * 3000);
  }, [resonFreq]);

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setResonatorBW(resonBW / 100 * 5000 + 1);
  }, [resonBW]);

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setResonatorWet(resonWet / 100);
  }, [resonWet]);

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setAntiResonatorFreq(antiResonFreq / 100 * 3000);
  }, [antiResonFreq]);

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setAntiResonatorBW(antiResonBW / 100 * 5000 + 1);
  }, [antiResonBW]);

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setAntiResonatorWet(antiResonWet / 100);
  }, [antiResonWet]);

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setMode(mode);
  }, [mode]);

  // Keyboard handling
  useEffect(() => {
    const keyMap: Record<string, number> = {
      'a': 60, 'w': 61, 's': 62, 'e': 63, 'd': 64, 'f': 65,
      't': 66, 'g': 67, 'y': 68, 'h': 69, 'u': 70, 'j': 71, 'k': 72,
      'o': 73, 'l': 74, 'p': 75
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const note = keyMap[e.key.toLowerCase()];
      if (note !== undefined && engineRef.current) {
        if (modeRef.current === VoicingMode.MONOVOICE) {
          // Queue the CV pair before noteOn so it gets processed
          engineRef.current.triggerPhoneme(selectedConsonantRef.current, selectedVowelRef.current);
        }
        engineRef.current.noteOn(note, 100);
        setActiveNotes(prev => new Set(prev).add(note));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const note = keyMap[e.key.toLowerCase()];
      if (note !== undefined && engineRef.current) {
        engineRef.current.noteOff(note);
        setActiveNotes(prev => {
          const next = new Set(prev);
          next.delete(note);
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Virtual keyboard click handlers
  const handleNoteOn = (note: number) => {
    if (!engineRef.current) return;
    if (mode === VoicingMode.MONOVOICE) {
      // In formant mode, trigger the selected CV pair
      engineRef.current.triggerPhoneme(selectedConsonant, selectedVowel);
      engineRef.current.noteOn(note, 100);
      
      // Record if recording
      if (isRecording) {
        recorderRef.current.recordStep(selectedConsonant, selectedVowel, 100);
      }
    } else {
      engineRef.current.noteOn(note, 100);
    }
    setActiveNotes(prev => new Set(prev).add(note));
  };

  const handleNoteOff = (note: number) => {
    if (!engineRef.current) return;
    engineRef.current.noteOff(note);
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
  };

  // Consonant/Vowel trigger
  const triggerCV = () => {
    if (!engineRef.current) return;
    // Queue the CV pair
    engineRef.current.triggerPhoneme(selectedConsonant, selectedVowel);
    // Trigger note with middle C for voice accounting
    const note = 60;
    engineRef.current.noteOn(note, 100);
    setActiveNotes(prev => new Set(prev).add(note));
    
    // Record if recording
    if (isRecording) {
      recorderRef.current.recordStep(selectedConsonant, selectedVowel, 100);
    }
    
    // Release after a short time
    setTimeout(() => {
      if (engineRef.current) {
        engineRef.current.noteOff(note);
        setActiveNotes(prev => {
          const next = new Set(prev);
          next.delete(note);
          return next;
        });
      }
    }, 200);
  };

  // Apply preset
  const applyPreset = (presetName: string) => {
    if (!engineRef.current) return;
    const preset = presets.find(p => p.name === presetName);
    if (!preset) return;
    
    engineRef.current.applyPreset(preset.params);
    setSelectedPreset(presetName);
    
    // Update UI controls to match preset
    if (preset.params.masterVolume !== undefined) setMasterVol(preset.params.masterVolume);
    if (preset.params.waveshape !== undefined) setWaveshape(preset.params.waveshape);
    if (preset.params.flutter !== undefined) setFlutter(preset.params.flutter);
    if (preset.params.attack !== undefined) setAttack(preset.params.attack);
    if (preset.params.release !== undefined) setRelease(preset.params.release);
    if (preset.params.sustain !== undefined) setSustain(preset.params.sustain);
    if (preset.params.resonFreq !== undefined) setResonFreq(preset.params.resonFreq);
    if (preset.params.resonBW !== undefined) setResonBW(preset.params.resonBW);
    if (preset.params.resonWet !== undefined) setResonWet(preset.params.resonWet);
    if (preset.params.antiResonFreq !== undefined) setAntiResonFreq(preset.params.antiResonFreq);
    if (preset.params.antiResonBW !== undefined) setAntiResonBW(preset.params.antiResonBW);
    if (preset.params.antiResonWet !== undefined) setAntiResonWet(preset.params.antiResonWet);
  };

  // Consonants and vowels for UI
  const consonants = [
    { code: ConsonantCode.CODE_SPACE, label: '∅', name: 'None' },
    { code: ConsonantCode.CODE_K, label: 'K', name: 'K' },
    { code: ConsonantCode.CODE_S, label: 'S', name: 'S' },
    { code: ConsonantCode.CODE_R, label: 'R', name: 'R' },
    { code: ConsonantCode.CODE_T, label: 'T', name: 'T' },
    { code: ConsonantCode.CODE_W, label: 'W', name: 'W' },
    { code: ConsonantCode.CODE_M, label: 'M', name: 'M' },
    { code: ConsonantCode.CODE_Y, label: 'Y', name: 'Y' },
    { code: ConsonantCode.CODE_N, label: 'N', name: 'N' },
    { code: ConsonantCode.CODE_G, label: 'G', name: 'G' },
    { code: ConsonantCode.CODE_Z, label: 'Z', name: 'Z' },
    { code: ConsonantCode.CODE_B, label: 'B', name: 'B' },
    { code: ConsonantCode.CODE_D, label: 'D', name: 'D' },
    { code: ConsonantCode.CODE_P, label: 'P', name: 'P' },
    { code: ConsonantCode.CODE_H, label: 'H', name: 'H' },
  ];

  const vowels = [
    { code: VowelCode.CODE_A, label: 'A', name: 'ah' },
    { code: VowelCode.CODE_E, label: 'E', name: 'eh' },
    { code: VowelCode.CODE_I, label: 'I', name: 'ee' },
    { code: VowelCode.CODE_O, label: 'O', name: 'oh' },
    { code: VowelCode.CODE_U, label: 'U', name: 'oo' },
    { code: VowelCode.CODE_AI, label: 'AI', name: 'eye' },
    { code: VowelCode.CODE_EI, label: 'EI', name: 'ay' },
  ];

  const presetSyllables = [
    { cons: ConsonantCode.CODE_SPACE, vowel: VowelCode.CODE_A, label: 'ah' },
    { cons: ConsonantCode.CODE_SPACE, vowel: VowelCode.CODE_E, label: 'eh' },
    { cons: ConsonantCode.CODE_SPACE, vowel: VowelCode.CODE_I, label: 'ee' },
    { cons: ConsonantCode.CODE_SPACE, vowel: VowelCode.CODE_O, label: 'oh' },
    { cons: ConsonantCode.CODE_SPACE, vowel: VowelCode.CODE_U, label: 'oo' },
    { cons: ConsonantCode.CODE_B, vowel: VowelCode.CODE_A, label: 'ba' },
    { cons: ConsonantCode.CODE_D, vowel: VowelCode.CODE_A, label: 'da' },
    { cons: ConsonantCode.CODE_G, vowel: VowelCode.CODE_O, label: 'go' },
    { cons: ConsonantCode.CODE_K, vowel: VowelCode.CODE_A, label: 'ka' },
    { cons: ConsonantCode.CODE_M, vowel: VowelCode.CODE_A, label: 'ma' },
    { cons: ConsonantCode.CODE_N, vowel: VowelCode.CODE_O, label: 'no' },
    { cons: ConsonantCode.CODE_P, vowel: VowelCode.CODE_A, label: 'pa' },
    { cons: ConsonantCode.CODE_R, vowel: VowelCode.CODE_A, label: 'ra' },
    { cons: ConsonantCode.CODE_S, vowel: VowelCode.CODE_A, label: 'sa' },
    { cons: ConsonantCode.CODE_T, vowel: VowelCode.CODE_A, label: 'ta' },
    { cons: ConsonantCode.CODE_W, vowel: VowelCode.CODE_A, label: 'wa' },
    { cons: ConsonantCode.CODE_Y, vowel: VowelCode.CODE_E, label: 'ye' },
    { cons: ConsonantCode.CODE_H, vowel: VowelCode.CODE_A, label: 'ha' },
  ];

  // Piano keys (2 octaves starting at C3)
  const pianoKeys: { note: number; isBlack: boolean; name: string }[] = [];
  for (let i = 48; i < 72; i++) {
    const isBlack = [1, 3, 6, 8, 10].includes(i % 12);
    pianoKeys.push({ note: i, isBlack, name: getNoteName(i) });
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="text-green-400">Klatt</span> Voice Synthesizer
          </h1>
          <p className="text-gray-300 text-lg mb-2">
            Formant Synthesis based on Klatt's Cascade/Parallel Filter Model
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Web implementation with Web Audio API
          </p>
          <button
            onClick={startAudio}
            className="px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-green-500/30"
          >
            🎵 Start Synthesizer
          </button>
          <div className="mt-8 text-gray-400 text-sm">
            <p>Use computer keyboard (A-K) or MIDI controller to play</p>
            <p>Two modes: Polyphonic Synth & Formant Speech Synth</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="text-green-400">Klatt</span> Voice Synthesizer
          </h1>
          <p className="text-gray-400 text-xs">Cascade/Parallel Formant Synthesis</p>
        </div>
        <div className="flex items-center gap-4">
          {midiConnected && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
              🎹 MIDI Connected
            </span>
          )}
          {isRecording && (
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded animate-pulse">
              ⏺ Recording
            </span>
          )}
          <button
            onClick={() => setMode(mode === VoicingMode.POLYVOICE ? VoicingMode.MONOVOICE : VoicingMode.POLYVOICE)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              mode === VoicingMode.POLYVOICE
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                : 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
            }`}
          >
            {mode === VoicingMode.POLYVOICE ? '🎹 Poly Synth' : '🗣️ Formant Synth'}
          </button>
        </div>
      </div>

      {/* Presets Bar */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap">Presets</h3>
          <div className="flex flex-wrap gap-2 flex-1">
            {presets.map(preset => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedPreset === preset.name
                    ? 'bg-gradient-to-r from-green-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                }`}
                title={preset.description}
              >
                <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                  preset.category === 'speech' ? 'bg-purple-400' :
                  preset.category === 'synth' ? 'bg-blue-400' : 'bg-orange-400'
                }`}></span>
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Panel - Controls */}
        <div className="space-y-4">
          {/* Master Controls */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Master</h3>
            <div className="grid grid-cols-2 gap-3">
              <KnobControl label="Volume" value={masterVol} onChange={setMasterVol} color="green" />
              <KnobControl label="Wave Shape" value={waveshape} onChange={setWaveshape} color="yellow" />
              <KnobControl label="Flutter" value={flutter} onChange={setFlutter} color="purple" />
            </div>
          </div>

          {/* ADSR */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Envelope</h3>
            <div className="grid grid-cols-3 gap-3">
              <KnobControl label="Attack" value={attack} onChange={setAttack} color="blue" />
              <KnobControl label="Sustain" value={sustain} onChange={setSustain} color="blue" />
              <KnobControl label="Release" value={release} onChange={setRelease} color="blue" />
            </div>
          </div>

          {/* Resonator */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Resonator</h3>
            <div className="grid grid-cols-3 gap-3">
              <KnobControl label="Freq" value={resonFreq} onChange={setResonFreq} color="cyan" />
              <KnobControl label="BW" value={resonBW} onChange={setResonBW} color="cyan" />
              <KnobControl label="Wet" value={resonWet} onChange={setResonWet} color="cyan" />
            </div>
          </div>

          {/* Antiresonator */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Antiresonator</h3>
            <div className="grid grid-cols-3 gap-3">
              <KnobControl label="Freq" value={antiResonFreq} onChange={setAntiResonFreq} color="orange" />
              <KnobControl label="BW" value={antiResonBW} onChange={setAntiResonBW} color="orange" />
              <KnobControl label="Wet" value={antiResonWet} onChange={setAntiResonWet} color="orange" />
            </div>
          </div>
        </div>

        {/* Center Panel - Visualizer + Formant Display */}
        <div className="space-y-4">
          {/* Waveform Display */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Waveform</h3>
            <canvas
              ref={canvasRef}
              width={500}
              height={150}
              className="w-full rounded-lg"
            />
          </div>

          {/* Formant Spectrum Visualization */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Spectrum</h3>
            <FormantSpectrum formantValues={formantValues} />
          </div>

          {/* Formant Display */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Formant Monitor</h3>
            <div className="space-y-3">
              {/* Frequencies */}
              <div>
                <div className="text-[10px] text-gray-500 mb-1 uppercase">Frequencies (Hz)</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <FormantBar label="F0" value={formantValues.F0} max={127} color="#ffd93d" />
                  <FormantBar label="F1" value={formantValues.F1} max={1500} color="#ff6b6b" />
                  <FormantBar label="F2" value={formantValues.F2} max={3500} color="#4ecdc4" />
                  <FormantBar label="F3" value={formantValues.F3} max={4500} color="#45b7d1" />
                  <FormantBar label="F4" value={formantValues.F4} max={5000} color="#6c5ce7" />
                  <FormantBar label="F5" value={formantValues.F5} max={5000} color="#a29bfe" />
                </div>
              </div>
              
              {/* Bandwidths */}
              <div>
                <div className="text-[10px] text-gray-500 mb-1 uppercase">Bandwidths (Hz)</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <FormantBar label="B1" value={formantValues.B1} max={500} color="#ff6b6b" />
                  <FormantBar label="B2" value={formantValues.B2} max={500} color="#4ecdc4" />
                  <FormantBar label="B3" value={formantValues.B3} max={500} color="#45b7d1" />
                </div>
              </div>
              
              {/* Amplitudes */}
              <div>
                <div className="text-[10px] text-gray-500 mb-1 uppercase">Amplitudes</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <FormantBar label="AV" value={formantValues.AV * 100} max={100} color="#96ceb4" />
                  <FormantBar label="AVS" value={formantValues.AVS * 100} max={100} color="#88d8b0" />
                  <FormantBar label="AF" value={formantValues.AF * 100} max={100} color="#ff8b94" />
                  <FormantBar label="AH" value={formantValues.AH * 100} max={100} color="#ffd3b6" />
                  <FormantBar label="A0" value={formantValues.A0} max={200} color="#a8e6cf" />
                </div>
              </div>
            </div>
          </div>

          {/* Phoneme Selector (Formant Mode) */}
          {mode === VoicingMode.MONOVOICE && (
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Phoneme Selector</h3>
              
              {/* Consonants */}
              <div className="mb-3">
                <label className="text-xs text-gray-400 mb-1 block">Consonant</label>
                <div className="flex flex-wrap gap-1">
                  {consonants.map(c => (
                    <button
                      key={c.code}
                      onClick={() => setSelectedConsonant(c.code)}
                      className={`w-8 h-8 rounded text-xs font-bold transition-all ${
                        selectedConsonant === c.code
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vowels */}
              <div className="mb-3">
                <label className="text-xs text-gray-400 mb-1 block">Vowel</label>
                <div className="flex flex-wrap gap-1">
                  {vowels.map(v => (
                    <button
                      key={v.code}
                      onClick={() => setSelectedVowel(v.code)}
                      className={`w-10 h-8 rounded text-xs font-bold transition-all ${
                        selectedVowel === v.code
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={triggerCV}
                className="w-full py-2 bg-gradient-to-r from-purple-500 to-green-500 rounded-lg font-bold text-sm hover:opacity-90 transition-all"
              >
                ▶ Speak: {consonants.find(c => c.code === selectedConsonant)?.label}
                {vowels.find(v => v.code === selectedVowel)?.label}
              </button>

              {/* Preset words */}
              <div className="mt-3">
                <label className="text-xs text-gray-400 mb-1 block">Preset Syllables</label>
                <div className="flex flex-wrap gap-1">
                  {presetSyllables.map((syl, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedConsonant(syl.cons);
                        setSelectedVowel(syl.vowel);
                        if (engineRef.current) {
                          // Queue the CV pair
                          engineRef.current.triggerPhoneme(syl.cons, syl.vowel);
                          // Trigger note with middle C for voice accounting
                          const note = 60;
                          engineRef.current.noteOn(note, 100);
                          setActiveNotes(prev => new Set(prev).add(note));
                          // Release after a short time
                          setTimeout(() => {
                            if (engineRef.current) {
                              engineRef.current.noteOff(note);
                              setActiveNotes(prev => {
                                const next = new Set(prev);
                                next.delete(note);
                                return next;
                              });
                            }
                          }, 200);
                        }
                      }}
                      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 transition-all"
                    >
                      {syl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Info */}
        <div className="space-y-4">
          {/* Signal Flow */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Signal Flow</h3>
            <div className="text-xs text-gray-400 space-y-1 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                <span>Glottal Source (Pulse Wave)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                <span>Noise Source (Aperiodic)</span>
              </div>
              <div className="ml-4 border-l border-gray-600 pl-2 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">↓</span>
                  <span>Cascade Track (5 resonators)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">↓</span>
                  <span>Parallel Track (5 filters)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span>→ Output</span>
              </div>
            </div>
          </div>

          {/* Keyboard shortcuts */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Keyboard</h3>
            <div className="text-xs text-gray-400 space-y-1">
              <p><span className="text-green-400 font-mono">A W S E D F T G Y H U J K O L P</span></p>
              <p className="text-gray-500">C4 through D#5 (chromatic)</p>
              <p className="mt-2"><span className="text-blue-400">MIDI:</span> Connect a controller for full control</p>
            </div>
          </div>

          {/* Sequencer */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Sequencer</h3>
            
            {/* Sequence selector */}
            <div className="mb-3">
              <label className="text-xs text-gray-400 mb-1 block">Pattern</label>
              <select
                value={selectedSequence}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setSelectedSequence(idx);
                  sequencerRef.current.setSequence(sequences[idx]);
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-xs text-gray-300"
              >
                {sequences.map((seq, idx) => (
                  <option key={idx} value={idx}>{seq.name} ({seq.bpm} BPM)</option>
                ))}
              </select>
            </div>

            {/* Step visualization */}
            <div className="mb-3">
              <div className="flex gap-0.5 flex-wrap">
                {sequences[selectedSequence].steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 min-w-[20px] h-6 rounded transition-all ${
                      currentSeqStep === idx
                        ? 'bg-green-500 shadow-lg shadow-green-500/50'
                        : step.velocity > 0
                          ? 'bg-gray-600'
                          : 'bg-gray-800'
                    }`}
                    title={`${step.consonant === 0 ? '∅' : String.fromCharCode(64 + step.consonant)}${String.fromCharCode(64 + step.vowel)}`}
                  />
                ))}
              </div>
            </div>

            {/* Play/Stop button */}
            <button
              onClick={() => {
                if (seqPlaying) {
                  sequencerRef.current.stop();
                  setSeqPlaying(false);
                } else {
                  sequencerRef.current.setSequence(sequences[selectedSequence]);
                  sequencerRef.current.start();
                  setSeqPlaying(true);
                }
              }}
              className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
                seqPlaying
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                  : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'
              }`}
            >
              {seqPlaying ? '⏹ Stop' : '▶ Play Pattern'}
            </button>

            {/* Record button */}
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => {
                  if (isRecording) {
                    const steps = recorderRef.current.stopRecording();
                    setRecordedSteps(steps);
                    setIsRecording(false);
                  } else {
                    recorderRef.current.startRecording(120);
                    setIsRecording(true);
                    setRecordedSteps([]);
                  }
                }}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {isRecording ? '⏹ Stop Rec' : '⏺ Record'}
              </button>
              {recordedSteps.length > 0 && (
                <>
                  <button
                    onClick={() => {
                      // Create a custom sequence from recorded steps
                      const customSeq: Sequence = {
                        name: 'Custom',
                        bpm: 120,
                        steps: recordedSteps
                      };
                      sequencerRef.current.setSequence(customSeq);
                      sequencerRef.current.start();
                      setSeqPlaying(true);
                    }}
                    className="flex-1 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-lg font-bold text-xs hover:bg-blue-500/30 transition-all"
                  >
                    ▶ Play Rec
                  </button>
                  <button
                    onClick={() => setRecordedSteps([])}
                    className="py-1.5 px-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-gray-300 transition-all"
                    title="Clear recorded steps"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>

            {/* Recorded steps display */}
            {recordedSteps.length > 0 && (
              <div className="mt-2">
                <div className="text-[10px] text-gray-500 mb-1">Recorded: {recordedSteps.length} steps</div>
                <div className="flex gap-0.5 flex-wrap mb-2">
                  {recordedSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="px-1.5 py-0.5 bg-gray-700 rounded text-[9px] text-gray-300"
                    >
                      {step.consonant === 0 ? '∅' : String.fromCharCode(64 + step.consonant)}
                      {String.fromCharCode(64 + step.vowel)}
                    </div>
                  ))}
                </div>
                
                {/* Export/Import buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const data = JSON.stringify({
                        bpm: 120,
                        steps: recordedSteps
                      }, null, 2);
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'klatt-sequence.json';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-[10px] text-gray-300 transition-all"
                  >
                    💾 Export
                  </button>
                  <label className="flex-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-[10px] text-gray-300 text-center cursor-pointer transition-all">
                    📂 Import
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const data = JSON.parse(event.target?.result as string);
                            
                            // Validate data structure
                            if (typeof data !== 'object' || data === null) return;
                            if (!Array.isArray(data.steps) || data.steps.length === 0) return;
                            if (typeof data.bpm !== 'number' || !isFinite(data.bpm) || data.bpm <= 0) return;
                            
                            // Validate each step
                            const validSteps = data.steps.every((step: any) => {
                              return step !== null &&
                                     typeof step === 'object' &&
                                     typeof step.consonant === 'number' && isFinite(step.consonant) &&
                                     typeof step.vowel === 'number' && isFinite(step.vowel) &&
                                     typeof step.velocity === 'number' && isFinite(step.velocity) &&
                                     typeof step.duration === 'number' && isFinite(step.duration) && step.duration > 0;
                            });
                            
                            if (!validSteps) return;
                            
                            // All validation passed
                            setRecordedSteps(data.steps);
                            const customSeq: Sequence = {
                              name: 'Imported',
                              bpm: data.bpm,
                              steps: data.steps
                            };
                            sequencerRef.current.setSequence(customSeq);
                          } catch (err) {
                            console.error('Failed to import sequence:', err);
                          }
                        };
                        reader.readAsText(file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* About */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">About</h3>
            <div className="text-xs text-gray-400 space-y-2">
              <p>
                Based on Dennis Klatt's 1980 cascade/parallel formant synthesis model.
                Uses resonator and antiresonator filters to simulate the human vocal tract.
              </p>
              <p>
                <span className="text-green-400">Poly Mode:</span> 16-voice polyphonic synthesizer with formant filters
              </p>
              <p>
                <span className="text-purple-400">Formant Mode:</span> Speech synthesis with consonant-vowel combinations
              </p>
              {selectedPreset && (
                <div className="mt-3 p-2 bg-gray-700/30 rounded-lg">
                  <div className="text-[10px] text-gray-500 uppercase mb-1">Active Preset</div>
                  <div className="text-green-400 font-medium">{selectedPreset}</div>
                  <div className="text-gray-400 text-[10px] mt-1">
                    {presets.find(p => p.name === selectedPreset)?.description}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              if (engineRef.current) {
                engineRef.current.reset();
                setMasterVol(80);
                setWaveshape(90);
                setFlutter(10);
                setAttack(50);
                setRelease(100);
                setSustain(100);
                setResonFreq(17);
                setResonBW(20);
                setResonWet(0);
                setAntiResonFreq(17);
                setAntiResonBW(20);
                setAntiResonWet(0);
                setSelectedPreset('');
              }
            }}
            className="w-full py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-sm font-medium text-gray-300 transition-all"
          >
            🔄 Reset to Defaults
          </button>
        </div>
      </div>

      {/* Piano Keyboard */}
      <div className="mt-4 bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <div className="relative h-32 flex">
          {pianoKeys.map((key) => {
            if (key.isBlack) return null;
            const isActive = activeNotes.has(key.note);
            return (
              <div
                key={key.note}
                className={`relative flex-1 border border-gray-600 rounded-b-lg cursor-pointer transition-all ${
                  isActive ? 'bg-green-300' : 'bg-white hover:bg-gray-100'
                }`}
                onMouseDown={() => handleNoteOn(key.note)}
                onMouseUp={() => handleNoteOff(key.note)}
                onMouseLeave={() => handleNoteOff(key.note)}
              >
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-gray-500">
                  {key.name}
                </span>
              </div>
            );
          })}
          {/* Black keys */}
          {pianoKeys.map((key) => {
            if (!key.isBlack) return null;
            const isActive = activeNotes.has(key.note);
            // Calculate position based on the white key before it
            const whiteKeyIndex = pianoKeys.slice(0, pianoKeys.indexOf(key)).filter(k => !k.isBlack).length;
            const leftPercent = (whiteKeyIndex / pianoKeys.filter(k => !k.isBlack).length) * 100;
            return (
              <div
                key={key.note}
                className={`absolute top-0 w-[4%] h-[60%] rounded-b-lg cursor-pointer z-10 transition-all ${
                  isActive ? 'bg-green-600' : 'bg-gray-900 hover:bg-gray-700'
                }`}
                style={{ left: `${leftPercent - 2}%` }}
                onMouseDown={() => handleNoteOn(key.note)}
                onMouseUp={() => handleNoteOff(key.note)}
                onMouseLeave={() => handleNoteOff(key.note)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Knob Control Component
function KnobControl({ label, value, onChange, color }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    green: 'from-green-500 to-green-700',
    yellow: 'from-yellow-500 to-yellow-700',
    purple: 'from-purple-500 to-purple-700',
    blue: 'from-blue-500 to-blue-700',
    cyan: 'from-cyan-500 to-cyan-700',
    orange: 'from-orange-500 to-orange-700',
  };

  const trackColor: Record<string, string> = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    cyan: 'bg-cyan-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-12 h-12 mb-1">
        <div className="absolute inset-0 rounded-full bg-gray-700 border-2 border-gray-600"></div>
        <div
          className={`absolute inset-1 rounded-full bg-gradient-to-br ${colorClasses[color]} opacity-80`}
          style={{
            transform: `rotate(${(value / 100) * 270 - 135}deg)`,
          }}
        >
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-3 bg-white rounded-full"></div>
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-current"
        style={{ accentColor: color === 'green' ? '#22c55e' : color === 'yellow' ? '#eab308' : color === 'purple' ? '#a855f7' : color === 'blue' ? '#3b82f6' : color === 'cyan' ? '#06b6d4' : '#f97316' }}
      />
      <span className="text-[10px] text-gray-400 mt-1">{label}</span>
    </div>
  );
}

// Formant Bar Component
function FormantBar({ label, value, max, color }: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <span className="w-7 text-gray-400 font-mono text-[10px]">{label}</span>
      <div className="flex-1 h-2.5 bg-gray-700/50 rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-75 ease-out"
          style={{ 
            width: `${percent}%`, 
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}40`
          }}
        />
      </div>
      <span className="w-10 text-right text-gray-400 font-mono text-[10px] tabular-nums">
        {value < 10 ? value.toFixed(2) : value.toFixed(0)}
      </span>
    </div>
  );
}

// Formant Spectrum Visualization Component
function FormantSpectrum({ formantValues }: { 
  formantValues: { F0: number; F1: number; F2: number; F3: number; F4: number; F5: number } 
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw frequency scale (0-5000 Hz)
    ctx.strokeStyle = '#1a1a3a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const x = (i / 5) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      // Frequency labels
      ctx.fillStyle = '#4a4a6a';
      ctx.font = '9px monospace';
      ctx.fillText(`${i * 1000}`, x + 2, height - 2);
    }
    
    // Draw formant peaks
    const formants = [
      { freq: formantValues.F1, color: '#ff6b6b', label: 'F1' },
      { freq: formantValues.F2, color: '#4ecdc4', label: 'F2' },
      { freq: formantValues.F3, color: '#45b7d1', label: 'F3' },
      { freq: formantValues.F4, color: '#6c5ce7', label: 'F4' },
      { freq: formantValues.F5, color: '#a29bfe', label: 'F5' },
    ];
    
    formants.forEach(f => {
      if (f.freq > 0 && f.freq < 5000) {
        const x = (f.freq / 5000) * width;
        
        // Draw peak
        const gradient = ctx.createLinearGradient(x, height, x, 0);
        gradient.addColorStop(0, f.color + '00');
        gradient.addColorStop(0.5, f.color + '80');
        gradient.addColorStop(1, f.color + 'ff');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(x, height * 0.7, 15, height * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw label
        ctx.fillStyle = f.color;
        ctx.font = 'bold 10px monospace';
        ctx.fillText(f.label, x - 8, 12);
      }
    });
  }, [formantValues]);
  
  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={80}
      className="w-full rounded-lg"
    />
  );
}

export default App;
