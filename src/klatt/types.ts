// Core types for the Klatt Synthesizer

export interface SynthVoice {
  active: VoiceState;
  note: number;
  velocity: number;
  volume: number;
  frequency: number;
  phase1: number;
  phase2: number;
}

export interface SignalInterp {
  value: number;
  duration: number;
  t: number;
  delta: number;
  resting: boolean;
}

export interface Resonator {
  out1: number;
  out2: number;
  a: number;
  b: number;
  c: number;
  f: number;
  bw: number;
}

export interface DelayedInterp {
  start: number;
  value: number;
  duration: number;
  param: FormantParam;
}

export enum VoiceState {
  INACTIVE = 0,
  ATTACK,
  DECAY,
  SUSTAIN,
  RELEASE
}

export enum VoicingMode {
  POLYVOICE = 0,
  MONOVOICE
}

export enum FormantParam {
  AV = 0, AVS, AF, AH, A0, A1, A2, A3, A4, A5, A6, AB,
  F0, F1, F2, F3, F4, F5, F6, FNP, FNZ,
  B1, B2, B3, B4, B5, B6, BNP, BNZ,
  NUM_FORMANT_PARAM
}

export enum ResonatorName {
  RGP = 0, RGZ, RGS, LPF, RNP, RNZ,
  RC1, RC2, RC3, RC4, RC5,
  RP2, RP3, RP4, RP5, RP6,
  NUM_RESONATOR
}

export enum ConsonantCode {
  CODE_K = 0x1,
  CODE_S = 0x2,
  CODE_R = 0x3,
  CODE_T = 0x4,
  CODE_W = 0x5,
  CODE_M = 0x6,
  CODE_Y = 0x7,
  CODE_N = 0x8,
  CODE_G = 0x9,
  CODE_Z = 0xA,
  CODE_B = 0xB,
  CODE_D = 0xC,
  CODE_P = 0xD,
  CODE_H = 0xE,
  CODE_SPACE = 0x0
}

export enum VowelCode {
  CODE_U = 0x1,
  CODE_I = 0x2,
  CODE_O = 0x3,
  CODE_A = 0x4,
  CODE_E = 0x6,
  CODE_AI = 0x5,
  CODE_EI = 0x7,
  CODE_REP = 0x0
}

export const SAMPLE_RATE = 48000;
export const DELTA_TIME = 1.0 / SAMPLE_RATE;
export const PI = Math.PI;
export const PI_DT = PI * DELTA_TIME;
export const NUM_FORMANT_PARAM = FormantParam.NUM_FORMANT_PARAM;
export const NUM_RESONATOR = ResonatorName.NUM_RESONATOR;
