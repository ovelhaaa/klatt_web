// Sequencer for syllable patterns

import { ConsonantCode, VowelCode } from './types';

export interface SyllableStep {
  consonant: number;
  vowel: number;
  duration: number; // in beats
  velocity: number; // 0-127
}

export interface Sequence {
  name: string;
  bpm: number;
  steps: SyllableStep[];
}

// Pre-defined sequences
export const sequences: Sequence[] = [
  {
    name: 'Ba-Ba-Ba',
    bpm: 120,
    steps: [
      { consonant: ConsonantCode.CODE_B, vowel: VowelCode.CODE_A, duration: 1, velocity: 100 },
      { consonant: ConsonantCode.CODE_B, vowel: VowelCode.CODE_A, duration: 1, velocity: 80 },
      { consonant: ConsonantCode.CODE_B, vowel: VowelCode.CODE_A, duration: 1, velocity: 60 },
      { consonant: ConsonantCode.CODE_B, vowel: VowelCode.CODE_A, duration: 1, velocity: 40 },
    ]
  },
  {
    name: 'Ma-Me-Mi',
    bpm: 100,
    steps: [
      { consonant: ConsonantCode.CODE_M, vowel: VowelCode.CODE_A, duration: 1, velocity: 100 },
      { consonant: ConsonantCode.CODE_M, vowel: VowelCode.CODE_E, duration: 1, velocity: 100 },
      { consonant: ConsonantCode.CODE_M, vowel: VowelCode.CODE_I, duration: 1, velocity: 100 },
      { consonant: ConsonantCode.CODE_SPACE, vowel: VowelCode.CODE_A, duration: 1, velocity: 0 },
    ]
  },
  {
    name: 'Da-Da-Da-Da',
    bpm: 140,
    steps: [
      { consonant: ConsonantCode.CODE_D, vowel: VowelCode.CODE_A, duration: 0.5, velocity: 100 },
      { consonant: ConsonantCode.CODE_D, vowel: VowelCode.CODE_A, duration: 0.5, velocity: 80 },
      { consonant: ConsonantCode.CODE_D, vowel: VowelCode.CODE_A, duration: 0.5, velocity: 100 },
      { consonant: ConsonantCode.CODE_D, vowel: VowelCode.CODE_A, duration: 0.5, velocity: 80 },
      { consonant: ConsonantCode.CODE_D, vowel: VowelCode.CODE_A, duration: 0.5, velocity: 100 },
      { consonant: ConsonantCode.CODE_D, vowel: VowelCode.CODE_A, duration: 0.5, velocity: 80 },
      { consonant: ConsonantCode.CODE_D, vowel: VowelCode.CODE_A, duration: 0.5, velocity: 100 },
      { consonant: ConsonantCode.CODE_D, vowel: VowelCode.CODE_A, duration: 0.5, velocity: 80 },
    ]
  },
  {
    name: 'Ka-Go-Ka-Go',
    bpm: 110,
    steps: [
      { consonant: ConsonantCode.CODE_K, vowel: VowelCode.CODE_A, duration: 1, velocity: 100 },
      { consonant: ConsonantCode.CODE_G, vowel: VowelCode.CODE_O, duration: 1, velocity: 90 },
      { consonant: ConsonantCode.CODE_K, vowel: VowelCode.CODE_A, duration: 1, velocity: 100 },
      { consonant: ConsonantCode.CODE_G, vowel: VowelCode.CODE_O, duration: 1, velocity: 90 },
    ]
  },
  {
    name: 'Sa-Sha-Ta',
    bpm: 90,
    steps: [
      { consonant: ConsonantCode.CODE_S, vowel: VowelCode.CODE_A, duration: 1, velocity: 80 },
      { consonant: ConsonantCode.CODE_SPACE, vowel: VowelCode.CODE_A, duration: 0.5, velocity: 0 },
      { consonant: ConsonantCode.CODE_SPACE, vowel: VowelCode.CODE_A, duration: 0.5, velocity: 0 },
      { consonant: ConsonantCode.CODE_T, vowel: VowelCode.CODE_A, duration: 1, velocity: 100 },
      { consonant: ConsonantCode.CODE_SPACE, vowel: VowelCode.CODE_A, duration: 1, velocity: 0 },
    ]
  },
  {
    name: 'Ra-Ra-Ro-Ro',
    bpm: 130,
    steps: [
      { consonant: ConsonantCode.CODE_R, vowel: VowelCode.CODE_A, duration: 0.5, velocity: 100 },
      { consonant: ConsonantCode.CODE_R, vowel: VowelCode.CODE_A, duration: 0.5, velocity: 70 },
      { consonant: ConsonantCode.CODE_R, vowel: VowelCode.CODE_O, duration: 0.5, velocity: 100 },
      { consonant: ConsonantCode.CODE_R, vowel: VowelCode.CODE_O, duration: 0.5, velocity: 70 },
      { consonant: ConsonantCode.CODE_R, vowel: VowelCode.CODE_A, duration: 0.5, velocity: 100 },
      { consonant: ConsonantCode.CODE_R, vowel: VowelCode.CODE_A, duration: 0.5, velocity: 70 },
      { consonant: ConsonantCode.CODE_R, vowel: VowelCode.CODE_O, duration: 0.5, velocity: 100 },
      { consonant: ConsonantCode.CODE_R, vowel: VowelCode.CODE_O, duration: 0.5, velocity: 70 },
    ]
  },
  {
    name: 'Wa-Ya-Wa-Ya',
    bpm: 100,
    steps: [
      { consonant: ConsonantCode.CODE_W, vowel: VowelCode.CODE_A, duration: 1, velocity: 90 },
      { consonant: ConsonantCode.CODE_Y, vowel: VowelCode.CODE_A, duration: 1, velocity: 90 },
      { consonant: ConsonantCode.CODE_W, vowel: VowelCode.CODE_A, duration: 1, velocity: 90 },
      { consonant: ConsonantCode.CODE_Y, vowel: VowelCode.CODE_A, duration: 1, velocity: 90 },
    ]
  },
  {
    name: 'Ha-Ha-Ha',
    bpm: 160,
    steps: [
      { consonant: ConsonantCode.CODE_H, vowel: VowelCode.CODE_A, duration: 0.5, velocity: 80 },
      { consonant: ConsonantCode.CODE_SPACE, vowel: VowelCode.CODE_A, duration: 0.25, velocity: 0 },
      { consonant: ConsonantCode.CODE_H, vowel: VowelCode.CODE_A, duration: 0.5, velocity: 80 },
      { consonant: ConsonantCode.CODE_SPACE, vowel: VowelCode.CODE_A, duration: 0.25, velocity: 0 },
      { consonant: ConsonantCode.CODE_H, vowel: VowelCode.CODE_A, duration: 0.5, velocity: 80 },
      { consonant: ConsonantCode.CODE_SPACE, vowel: VowelCode.CODE_A, duration: 0.5, velocity: 0 },
    ]
  },
];

// Sequencer class
export class Sequencer {
  private sequence: Sequence | null = null;
  private currentStep = 0;
  private isPlaying = false;
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private onStep: ((step: SyllableStep) => void) | null = null;
  private onStepChange: ((step: number) => void) | null = null;

  setSequence(seq: Sequence) {
    // Clear active timeout before changing sequence
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    
    this.sequence = seq;
    this.currentStep = 0;
    
    // Restart scheduling if playing
    if (this.isPlaying) {
      this.scheduleNext();
    }
  }

  setOnStep(callback: (step: SyllableStep) => void) {
    this.onStep = callback;
  }

  setOnStepChange(callback: (step: number) => void) {
    this.onStepChange = callback;
  }

  start() {
    if (!this.sequence || this.isPlaying) return;
    this.isPlaying = true;
    this.currentStep = 0;
    this.scheduleNext();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.currentStep = 0;
    if (this.onStepChange) this.onStepChange(-1);
  }

  private scheduleNext() {
    if (!this.sequence || !this.isPlaying) return;

    const step = this.sequence.steps[this.currentStep];
    if (this.onStep) this.onStep(step);
    if (this.onStepChange) this.onStepChange(this.currentStep);

    const beatDuration = 60000 / this.sequence.bpm; // ms per beat
    const stepDuration = step.duration * beatDuration;
    const seq = this.sequence; // Capture for closure

    this.timerId = setTimeout(() => {
      this.currentStep = (this.currentStep + 1) % seq.steps.length;
      this.scheduleNext();
    }, stepDuration);
  }

  getCurrentStep(): number {
    return this.currentStep;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getSequence(): Sequence | null {
    return this.sequence;
  }
}
