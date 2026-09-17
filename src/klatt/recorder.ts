// Recorder for custom sequences

import { SyllableStep } from './sequencer';

export class Recorder {
  private isRecording = false;
  private steps: SyllableStep[] = [];
  private startTime = 0;
  private lastStepTime = 0;
  private bpm = 120;

  startRecording(bpm: number = 120) {
    this.isRecording = true;
    this.steps = [];
    this.startTime = Date.now();
    this.lastStepTime = this.startTime;
    this.bpm = bpm;
  }

  stopRecording(): SyllableStep[] {
    this.isRecording = false;
    return this.steps;
  }

  recordStep(consonant: number, vowel: number, velocity: number) {
    if (!this.isRecording) return;

    const now = Date.now();
    const duration = (now - this.lastStepTime) / (60000 / this.bpm); // Convert to beats
    
    this.steps.push({
      consonant,
      vowel,
      duration: Math.max(0.25, Math.min(4, duration)), // Clamp between 0.25 and 4 beats
      velocity
    });

    this.lastStepTime = now;
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  getSteps(): SyllableStep[] {
    return this.steps;
  }

  getBpm(): number {
    return this.bpm;
  }
}
