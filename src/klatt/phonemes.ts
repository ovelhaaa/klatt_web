import { FormantParam, ConsonantCode, VowelCode } from './types';

interface ParamChange {
  type: 'interp' | 'setTransitions' | 'setVowelDelay' | 'setVowelTransition';
  param?: FormantParam;
  delay?: number;
  value?: number;
  duration?: number;
  transition?: number;
}

interface VowelParam {
  param: FormantParam;
  delay: number;
  value: number;
  duration: number;
}

export function getConsonantParams(code: number, voiceResting: (t: number) => boolean): ParamChange[] | null {
  switch (code) {
    case ConsonantCode.CODE_R:
      return [
        { type: 'setTransitions', duration: voiceResting(0.01) ? 0 : 0.1 },
        { type: 'interp', param: FormantParam.F1, delay: 0, value: 310, duration: -1 },
        { type: 'interp', param: FormantParam.F2, delay: 0, value: 1060, duration: -1 },
        { type: 'interp', param: FormantParam.F3, delay: 0, value: 2500, duration: -1 },
        { type: 'interp', param: FormantParam.B1, delay: 0, value: 70, duration: -1 },
        { type: 'interp', param: FormantParam.B2, delay: 0, value: 100, duration: -1 },
        { type: 'interp', param: FormantParam.B3, delay: 0, value: 200, duration: -1 },
        { type: 'interp', param: FormantParam.AH, delay: 0, value: 0.001, duration: 0.025 },
        { type: 'interp', param: FormantParam.AH, delay: 0.025, value: 0, duration: 0.05 },
        { type: 'interp', param: FormantParam.AV, delay: 0, value: 0.2, duration: 0.1 },
        { type: 'interp', param: FormantParam.AVS, delay: 0, value: 0.2, duration: 0.1 },
        { type: 'setVowelDelay', delay: 0.1 },
        { type: 'setVowelTransition', transition: 0.1 },
        { type: 'interp', param: FormantParam.AV, delay: 0.1, value: 1.0, duration: 0.1 },
        { type: 'interp', param: FormantParam.AVS, delay: 0.1, value: 1.0, duration: 0.1 },
      ];

    case ConsonantCode.CODE_W:
      return [
        { type: 'setTransitions', duration: voiceResting(0.1) ? 0 : 0.1 },
        { type: 'interp', param: FormantParam.F1, delay: 0, value: 290, duration: -1 },
        { type: 'interp', param: FormantParam.F2, delay: 0, value: 610, duration: -1 },
        { type: 'interp', param: FormantParam.F3, delay: 0, value: 2150, duration: -1 },
        { type: 'interp', param: FormantParam.B1, delay: 0, value: 50, duration: -1 },
        { type: 'interp', param: FormantParam.B2, delay: 0, value: 80, duration: -1 },
        { type: 'interp', param: FormantParam.B3, delay: 0, value: 60, duration: -1 },
        { type: 'interp', param: FormantParam.AH, delay: 0, value: 0.001, duration: 0.025 },
        { type: 'interp', param: FormantParam.AH, delay: 0.025, value: 0, duration: 0.05 },
        { type: 'interp', param: FormantParam.AV, delay: 0, value: 0.2, duration: 0.1 },
        { type: 'interp', param: FormantParam.AVS, delay: 0, value: 0.2, duration: 0.1 },
        { type: 'setVowelDelay', delay: 0.1 },
        { type: 'setVowelTransition', transition: 0.1 },
        { type: 'interp', param: FormantParam.AV, delay: 0.1, value: 1.0, duration: 0.1 },
        { type: 'interp', param: FormantParam.AVS, delay: 0.1, value: 1.0, duration: 0.1 },
      ];

    case ConsonantCode.CODE_Y:
      return [
        { type: 'setTransitions', duration: voiceResting(0.1) ? 0 : 0.1 },
        { type: 'interp', param: FormantParam.F1, delay: 0, value: 260, duration: -1 },
        { type: 'interp', param: FormantParam.F2, delay: 0, value: 2070, duration: -1 },
        { type: 'interp', param: FormantParam.F3, delay: 0, value: 3020, duration: -1 },
        { type: 'interp', param: FormantParam.B1, delay: 0, value: 40, duration: -1 },
        { type: 'interp', param: FormantParam.B2, delay: 0, value: 250, duration: -1 },
        { type: 'interp', param: FormantParam.B3, delay: 0, value: 500, duration: -1 },
        { type: 'interp', param: FormantParam.AH, delay: 0, value: 0.001, duration: 0.025 },
        { type: 'interp', param: FormantParam.AH, delay: 0.025, value: 0, duration: 0.05 },
        { type: 'interp', param: FormantParam.AV, delay: 0, value: 0.2, duration: 0.1 },
        { type: 'interp', param: FormantParam.AVS, delay: 0, value: 0.2, duration: 0.1 },
        { type: 'setVowelDelay', delay: 0.1 },
        { type: 'setVowelTransition', transition: 0.1 },
        { type: 'interp', param: FormantParam.AV, delay: 0.1, value: 1.0, duration: 0.1 },
        { type: 'interp', param: FormantParam.AVS, delay: 0.1, value: 1.0, duration: 0.1 },
      ];

    case ConsonantCode.CODE_H:
      return [
        { type: 'interp', param: FormantParam.AV, delay: 0, value: 0, duration: 0.015 },
        { type: 'interp', param: FormantParam.AVS, delay: 0, value: 0, duration: 0.015 },
        { type: 'setTransitions', duration: 0 },
        { type: 'interp', param: FormantParam.AH, delay: 0.025, value: 0.1, duration: 0.025 },
        { type: 'interp', param: FormantParam.AH, delay: 0.05, value: 0, duration: 0.25 },
        { type: 'setVowelDelay', delay: 0.025 },
        { type: 'interp', param: FormantParam.AV, delay: 0.125, value: 1.0, duration: 0.1 },
        { type: 'interp', param: FormantParam.AVS, delay: 0.125, value: 1.0, duration: 0.1 },
      ];

    case ConsonantCode.CODE_K:
      return [
        { type: 'interp', param: FormantParam.AV, delay: 0, value: 0, duration: 0.015 },
        { type: 'interp', param: FormantParam.AVS, delay: 0, value: 0, duration: 0.015 },
        { type: 'setTransitions', duration: 0 },
        { type: 'interp', param: FormantParam.F1, delay: 0.02, value: 300, duration: -1 },
        { type: 'interp', param: FormantParam.F2, delay: 0.02, value: 1990, duration: -1 },
        { type: 'interp', param: FormantParam.F3, delay: 0.02, value: 2850, duration: -1 },
        { type: 'interp', param: FormantParam.B1, delay: 0.02, value: 250, duration: -1 },
        { type: 'interp', param: FormantParam.B2, delay: 0.02, value: 160, duration: -1 },
        { type: 'interp', param: FormantParam.B3, delay: 0.02, value: 330, duration: -1 },
        { type: 'interp', param: FormantParam.A3, delay: 0, value: 0.75, duration: 0 },
        { type: 'interp', param: FormantParam.A4, delay: 0, value: 0.125, duration: 0 },
        { type: 'interp', param: FormantParam.A5, delay: 0, value: 0.1, duration: 0 },
        { type: 'interp', param: FormantParam.AB, delay: 0, value: 0.1, duration: 0 },
        { type: 'interp', param: FormantParam.AF, delay: 0.05, value: 0.25, duration: 0.005 },
        { type: 'interp', param: FormantParam.AF, delay: 0.055, value: 0, duration: 0.015 },
        { type: 'interp', param: FormantParam.A3, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.A4, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.A5, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.AB, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.AH, delay: 0.05, value: 0.05, duration: 0.025 },
        { type: 'interp', param: FormantParam.AH, delay: 0.075, value: 0, duration: 0.3 },
        { type: 'setVowelDelay', delay: 0.0201 },
        { type: 'setVowelTransition', transition: 0.2 },
        { type: 'interp', param: FormantParam.AV, delay: 0.0201, value: 1.0, duration: 0.05 },
        { type: 'interp', param: FormantParam.AVS, delay: 0.0201, value: 1.0, duration: 0.05 },
      ];

    case ConsonantCode.CODE_T:
      return [
        { type: 'interp', param: FormantParam.AV, delay: 0, value: 0, duration: 0.015 },
        { type: 'interp', param: FormantParam.AVS, delay: 0, value: 0, duration: 0.015 },
        { type: 'setTransitions', duration: 0 },
        { type: 'interp', param: FormantParam.F1, delay: 0.02, value: 400, duration: -1 },
        { type: 'interp', param: FormantParam.F2, delay: 0.02, value: 1600, duration: -1 },
        { type: 'interp', param: FormantParam.F3, delay: 0.02, value: 2600, duration: -1 },
        { type: 'interp', param: FormantParam.B1, delay: 0.02, value: 300, duration: -1 },
        { type: 'interp', param: FormantParam.B2, delay: 0.02, value: 120, duration: -1 },
        { type: 'interp', param: FormantParam.B3, delay: 0.02, value: 250, duration: -1 },
        { type: 'interp', param: FormantParam.A3, delay: 0, value: 0.01, duration: 0 },
        { type: 'interp', param: FormantParam.A4, delay: 0, value: 0.2, duration: 0 },
        { type: 'interp', param: FormantParam.A5, delay: 0, value: 1.0, duration: 0 },
        { type: 'interp', param: FormantParam.AB, delay: 0, value: 1.0, duration: 0 },
        { type: 'interp', param: FormantParam.AF, delay: 0.05, value: 0.25, duration: 0.005 },
        { type: 'interp', param: FormantParam.AF, delay: 0.055, value: 0, duration: 0.015 },
        { type: 'interp', param: FormantParam.A3, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.A4, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.A5, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.AB, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.AH, delay: 0.05, value: 0.01, duration: 0.025 },
        { type: 'interp', param: FormantParam.AH, delay: 0.075, value: 0, duration: 0.3 },
        { type: 'setVowelDelay', delay: 0.0201 },
        { type: 'setVowelTransition', transition: 0.2 },
        { type: 'interp', param: FormantParam.AV, delay: 0.0201, value: 1.0, duration: 0.05 },
        { type: 'interp', param: FormantParam.AVS, delay: 0.0201, value: 1.0, duration: 0.05 },
      ];

    case ConsonantCode.CODE_P:
      return [
        { type: 'interp', param: FormantParam.AV, delay: 0, value: 0, duration: 0.015 },
        { type: 'interp', param: FormantParam.AVS, delay: 0, value: 0, duration: 0.015 },
        { type: 'setTransitions', duration: 0 },
        { type: 'interp', param: FormantParam.F1, delay: 0.02, value: 400, duration: -1 },
        { type: 'interp', param: FormantParam.F2, delay: 0.02, value: 1100, duration: -1 },
        { type: 'interp', param: FormantParam.F3, delay: 0.02, value: 2150, duration: -1 },
        { type: 'interp', param: FormantParam.B1, delay: 0.02, value: 60, duration: -1 },
        { type: 'interp', param: FormantParam.B2, delay: 0.02, value: 110, duration: -1 },
        { type: 'interp', param: FormantParam.B3, delay: 0.02, value: 130, duration: -1 },
        { type: 'interp', param: FormantParam.A3, delay: 0, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.A4, delay: 0, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.A5, delay: 0, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.AB, delay: 0, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.AF, delay: 0.05, value: 0.25, duration: 0.005 },
        { type: 'interp', param: FormantParam.AF, delay: 0.055, value: 0, duration: 0.015 },
        { type: 'interp', param: FormantParam.A3, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.A4, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.A5, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.AB, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.AH, delay: 0.05, value: 0.02, duration: 0.025 },
        { type: 'interp', param: FormantParam.AH, delay: 0.075, value: 0, duration: 0.3 },
        { type: 'setVowelDelay', delay: 0.0201 },
        { type: 'setVowelTransition', transition: 0.2 },
        { type: 'interp', param: FormantParam.AV, delay: 0.0201, value: 1.0, duration: 0.05 },
        { type: 'interp', param: FormantParam.AVS, delay: 0.0201, value: 1.0, duration: 0.05 },
      ];

    case ConsonantCode.CODE_G:
      return [
        { type: 'interp', param: FormantParam.AV, delay: 0, value: 0, duration: 0.015 },
        { type: 'interp', param: FormantParam.AVS, delay: 0, value: 0, duration: 0.015 },
        { type: 'setTransitions', duration: 0 },
        { type: 'interp', param: FormantParam.F1, delay: 0.02, value: 200, duration: -1 },
        { type: 'interp', param: FormantParam.F2, delay: 0.02, value: 1990, duration: -1 },
        { type: 'interp', param: FormantParam.F3, delay: 0.02, value: 2850, duration: -1 },
        { type: 'interp', param: FormantParam.B1, delay: 0.02, value: 60, duration: -1 },
        { type: 'interp', param: FormantParam.B2, delay: 0.02, value: 150, duration: -1 },
        { type: 'interp', param: FormantParam.B3, delay: 0.02, value: 280, duration: -1 },
        { type: 'interp', param: FormantParam.A3, delay: 0, value: 0.5, duration: 0 },
        { type: 'interp', param: FormantParam.A4, delay: 0, value: 0.125, duration: 0 },
        { type: 'interp', param: FormantParam.A5, delay: 0, value: 0.15, duration: 0 },
        { type: 'interp', param: FormantParam.AB, delay: 0, value: 0.15, duration: 0 },
        { type: 'interp', param: FormantParam.AF, delay: 0.05, value: 0.05, duration: 0.001 },
        { type: 'interp', param: FormantParam.AF, delay: 0.051, value: 0, duration: 0.01 },
        { type: 'interp', param: FormantParam.A3, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.A4, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.A5, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.AB, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.AH, delay: 0.05, value: 0.01, duration: 0.025 },
        { type: 'interp', param: FormantParam.AH, delay: 0.075, value: 0, duration: 0.1 },
        { type: 'setVowelDelay', delay: 0.1 },
        { type: 'setVowelTransition', transition: 0.1 },
        { type: 'interp', param: FormantParam.AV, delay: 0.1, value: 1.0, duration: 0.05 },
        { type: 'interp', param: FormantParam.AVS, delay: 0.1, value: 1.0, duration: 0.05 },
      ];

    case ConsonantCode.CODE_D:
      return [
        { type: 'interp', param: FormantParam.AV, delay: 0, value: 0, duration: 0.015 },
        { type: 'interp', param: FormantParam.AVS, delay: 0, value: 0, duration: 0.015 },
        { type: 'setTransitions', duration: 0 },
        { type: 'interp', param: FormantParam.F1, delay: 0.02, value: 200, duration: -1 },
        { type: 'interp', param: FormantParam.F2, delay: 0.02, value: 1600, duration: -1 },
        { type: 'interp', param: FormantParam.F3, delay: 0.02, value: 2600, duration: -1 },
        { type: 'interp', param: FormantParam.B1, delay: 0.02, value: 60, duration: -1 },
        { type: 'interp', param: FormantParam.B2, delay: 0.02, value: 100, duration: -1 },
        { type: 'interp', param: FormantParam.B3, delay: 0.02, value: 170, duration: -1 },
        { type: 'interp', param: FormantParam.A3, delay: 0, value: 0.25, duration: 0 },
        { type: 'interp', param: FormantParam.A4, delay: 0, value: 1.0, duration: 0 },
        { type: 'interp', param: FormantParam.A5, delay: 0, value: 1.2, duration: 0 },
        { type: 'interp', param: FormantParam.AB, delay: 0, value: 1.0, duration: 0 },
        { type: 'interp', param: FormantParam.AF, delay: 0.05, value: 0.05, duration: 0.001 },
        { type: 'interp', param: FormantParam.AF, delay: 0.051, value: 0, duration: 0.01 },
        { type: 'interp', param: FormantParam.A3, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.A4, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.A5, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.AB, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.AH, delay: 0.05, value: 0.005, duration: 0.025 },
        { type: 'interp', param: FormantParam.AH, delay: 0.075, value: 0, duration: 0.1 },
        { type: 'setVowelDelay', delay: 0.0201 },
        { type: 'setVowelTransition', transition: 0.2 },
        { type: 'interp', param: FormantParam.AV, delay: 0.0201, value: 1.0, duration: 0.05 },
        { type: 'interp', param: FormantParam.AVS, delay: 0.0201, value: 1.0, duration: 0.05 },
      ];

    case ConsonantCode.CODE_B:
      return [
        { type: 'interp', param: FormantParam.AV, delay: 0, value: 0, duration: 0.015 },
        { type: 'interp', param: FormantParam.AVS, delay: 0, value: 0, duration: 0.015 },
        { type: 'setTransitions', duration: 0 },
        { type: 'interp', param: FormantParam.F1, delay: 0.02, value: 200, duration: -1 },
        { type: 'interp', param: FormantParam.F2, delay: 0.02, value: 1100, duration: -1 },
        { type: 'interp', param: FormantParam.F3, delay: 0.02, value: 2150, duration: -1 },
        { type: 'interp', param: FormantParam.B1, delay: 0.02, value: 300, duration: -1 },
        { type: 'interp', param: FormantParam.B2, delay: 0.02, value: 150, duration: -1 },
        { type: 'interp', param: FormantParam.B3, delay: 0.02, value: 220, duration: -1 },
        { type: 'interp', param: FormantParam.A3, delay: 0, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.A4, delay: 0, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.A5, delay: 0, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.AB, delay: 0, value: 1.0, duration: 0 },
        { type: 'interp', param: FormantParam.AF, delay: 0.05, value: 0.05, duration: 0.001 },
        { type: 'interp', param: FormantParam.AF, delay: 0.051, value: 0, duration: 0.01 },
        { type: 'interp', param: FormantParam.A3, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.A4, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.A5, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.AB, delay: 0.1, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.AH, delay: 0.05, value: 0.005, duration: 0.025 },
        { type: 'interp', param: FormantParam.AH, delay: 0.075, value: 0, duration: 0.1 },
        { type: 'setVowelDelay', delay: 0.0201 },
        { type: 'setVowelTransition', transition: 0.2 },
        { type: 'interp', param: FormantParam.AV, delay: 0.0201, value: 1.0, duration: 0.05 },
        { type: 'interp', param: FormantParam.AVS, delay: 0.0201, value: 1.0, duration: 0.05 },
      ];

    case ConsonantCode.CODE_S:
      return [
        { type: 'interp', param: FormantParam.AV, delay: 0, value: 0, duration: 0.025 },
        { type: 'interp', param: FormantParam.AVS, delay: 0, value: 0, duration: 0.025 },
        { type: 'setTransitions', duration: 0 },
        { type: 'interp', param: FormantParam.F1, delay: 0.03, value: 320, duration: -1 },
        { type: 'interp', param: FormantParam.F2, delay: 0.03, value: 1390, duration: -1 },
        { type: 'interp', param: FormantParam.F3, delay: 0.03, value: 2530, duration: -1 },
        { type: 'interp', param: FormantParam.B1, delay: 0.03, value: 200, duration: -1 },
        { type: 'interp', param: FormantParam.B2, delay: 0.03, value: 80, duration: -1 },
        { type: 'interp', param: FormantParam.B3, delay: 0.03, value: 200, duration: -1 },
        { type: 'interp', param: FormantParam.A3, delay: 0, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.A4, delay: 0, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.A5, delay: 0, value: 0.4, duration: 0 },
        { type: 'interp', param: FormantParam.AB, delay: 0, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.AF, delay: 0.05, value: 0.2, duration: 0.015 },
        { type: 'interp', param: FormantParam.AF, delay: 0.10, value: 0, duration: 0.2 },
        { type: 'interp', param: FormantParam.A5, delay: 0.3, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.AH, delay: 0.1, value: 0.02, duration: 0.1 },
        { type: 'interp', param: FormantParam.AH, delay: 0.15, value: 0, duration: 0.15 },
        { type: 'setVowelDelay', delay: 0.1 },
        { type: 'setVowelTransition', transition: 0.05 },
        { type: 'interp', param: FormantParam.AV, delay: 0.1, value: 1.0, duration: 0.1 },
        { type: 'interp', param: FormantParam.AVS, delay: 0.1, value: 1.0, duration: 0.1 },
      ];

    case ConsonantCode.CODE_Z:
      return [
        { type: 'interp', param: FormantParam.AV, delay: 0, value: 0, duration: 0.025 },
        { type: 'interp', param: FormantParam.AVS, delay: 0, value: 0, duration: 0.025 },
        { type: 'setTransitions', duration: 0 },
        { type: 'interp', param: FormantParam.F1, delay: 0.03, value: 240, duration: -1 },
        { type: 'interp', param: FormantParam.F2, delay: 0.03, value: 1390, duration: -1 },
        { type: 'interp', param: FormantParam.F3, delay: 0.03, value: 2530, duration: -1 },
        { type: 'interp', param: FormantParam.B1, delay: 0.03, value: 70, duration: -1 },
        { type: 'interp', param: FormantParam.B2, delay: 0.03, value: 60, duration: -1 },
        { type: 'interp', param: FormantParam.B3, delay: 0.03, value: 180, duration: -1 },
        { type: 'interp', param: FormantParam.A3, delay: 0, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.A4, delay: 0, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.A5, delay: 0, value: 0.4, duration: 0 },
        { type: 'interp', param: FormantParam.AF, delay: 0.05, value: 0.1, duration: 0.015 },
        { type: 'interp', param: FormantParam.AF, delay: 0.10, value: 0, duration: 0.2 },
        { type: 'interp', param: FormantParam.AF, delay: 0.2, value: 0, duration: 0.1 },
        { type: 'interp', param: FormantParam.A5, delay: 0.3, value: 0, duration: 0 },
        { type: 'interp', param: FormantParam.AH, delay: 0.1, value: 0.02, duration: 0.1 },
        { type: 'interp', param: FormantParam.AH, delay: 0.15, value: 0, duration: 0.15 },
        { type: 'setVowelDelay', delay: 0.1 },
        { type: 'setVowelTransition', transition: 0.05 },
        { type: 'interp', param: FormantParam.AV, delay: 0.2, value: 1.0, duration: 0.05 },
        { type: 'interp', param: FormantParam.AVS, delay: 0.2, value: 1.0, duration: 0.05 },
      ];

    case ConsonantCode.CODE_M:
      return [
        { type: 'setTransitions', duration: voiceResting(0.01) ? 0 : 0.05 },
        { type: 'interp', param: FormantParam.FNZ, delay: 0, value: 450, duration: -1 },
        { type: 'interp', param: FormantParam.F1, delay: 0, value: 480, duration: -1 },
        { type: 'interp', param: FormantParam.F2, delay: 0, value: 1270, duration: -1 },
        { type: 'interp', param: FormantParam.F3, delay: 0, value: 2130, duration: -1 },
        { type: 'interp', param: FormantParam.B1, delay: 0, value: 40, duration: -1 },
        { type: 'interp', param: FormantParam.B2, delay: 0, value: 200, duration: -1 },
        { type: 'interp', param: FormantParam.B3, delay: 0, value: 200, duration: -1 },
        { type: 'interp', param: FormantParam.AV, delay: 0, value: 0.2, duration: 0.1 },
        { type: 'interp', param: FormantParam.AVS, delay: 0, value: 0.2, duration: 0.1 },
        { type: 'setVowelDelay', delay: 0.1 },
        { type: 'setVowelTransition', transition: 0.1 },
        { type: 'interp', param: FormantParam.AV, delay: 0.15, value: 1.0, duration: 0.1 },
        { type: 'interp', param: FormantParam.AVS, delay: 0.15, value: 1.0, duration: 0.1 },
      ];

    case ConsonantCode.CODE_N:
      return [
        { type: 'setTransitions', duration: voiceResting(0.01) ? 0 : 0.05 },
        { type: 'interp', param: FormantParam.FNZ, delay: 0, value: 450, duration: -1 },
        { type: 'interp', param: FormantParam.F1, delay: 0, value: 480, duration: -1 },
        { type: 'interp', param: FormantParam.F2, delay: 0, value: 1340, duration: -1 },
        { type: 'interp', param: FormantParam.F3, delay: 0, value: 2470, duration: -1 },
        { type: 'interp', param: FormantParam.B1, delay: 0, value: 40, duration: -1 },
        { type: 'interp', param: FormantParam.B2, delay: 0, value: 300, duration: -1 },
        { type: 'interp', param: FormantParam.B3, delay: 0, value: 300, duration: -1 },
        { type: 'interp', param: FormantParam.AV, delay: 0, value: 0.2, duration: 0.1 },
        { type: 'interp', param: FormantParam.AVS, delay: 0, value: 0.2, duration: 0.1 },
        { type: 'setVowelDelay', delay: 0.1 },
        { type: 'setVowelTransition', transition: 0.1 },
        { type: 'interp', param: FormantParam.AV, delay: 0.15, value: 1.0, duration: 0.1 },
        { type: 'interp', param: FormantParam.AVS, delay: 0.15, value: 1.0, duration: 0.1 },
      ];

    case ConsonantCode.CODE_SPACE:
      return [
        { type: 'interp', param: FormantParam.AV, delay: 0, value: 1.0, duration: 0.2 },
        { type: 'interp', param: FormantParam.AVS, delay: 0, value: 1.0, duration: 0.2 },
        { type: 'setTransitions', duration: voiceResting(0.01) ? 0 : 0.1 },
      ];

    default:
      return null;
  }
}

export function getVowelParams(code: number, vowelDelay: number, vowelTransition: number): VowelParam[] | null {
  const vd = vowelDelay;
  const vt = vowelTransition;

  switch (code) {
    case VowelCode.CODE_A:
      return [
        { param: FormantParam.A2, delay: 0, value: 1.0, duration: 0 },
        { param: FormantParam.A2, delay: 0.1, value: 0, duration: 0 },
        { param: FormantParam.FNZ, delay: vd, value: 270, duration: vt },
        { param: FormantParam.F1, delay: vd, value: 850, duration: vt },
        { param: FormantParam.F2, delay: vd, value: 1220, duration: vt },
        { param: FormantParam.F3, delay: vd, value: 2810, duration: vt },
        { param: FormantParam.B1, delay: vd, value: 80, duration: vt },
        { param: FormantParam.B2, delay: vd, value: 70, duration: vt },
        { param: FormantParam.B3, delay: vd, value: 70, duration: vt },
      ];

    case VowelCode.CODE_I:
      return [
        { param: FormantParam.A2, delay: 0, value: 1.0, duration: 0 },
        { param: FormantParam.A2, delay: 0.1, value: 0, duration: 0 },
        { param: FormantParam.FNZ, delay: vd, value: 270, duration: vt },
        { param: FormantParam.F1, delay: vd, value: 300, duration: vt },
        { param: FormantParam.F2, delay: vd, value: 2800, duration: vt },
        { param: FormantParam.F3, delay: vd, value: 3300, duration: vt },
        { param: FormantParam.B1, delay: vd, value: 45, duration: vt },
        { param: FormantParam.B2, delay: vd, value: 200, duration: vt },
        { param: FormantParam.B3, delay: vd, value: 400, duration: vt },
      ];

    case VowelCode.CODE_U:
      return [
        { param: FormantParam.FNZ, delay: vd, value: 270, duration: vt },
        { param: FormantParam.F1, delay: vd, value: 470, duration: vt },
        { param: FormantParam.F2, delay: vd, value: 1160, duration: vt },
        { param: FormantParam.F3, delay: vd, value: 2680, duration: vt },
        { param: FormantParam.B1, delay: vd, value: 80, duration: vt },
        { param: FormantParam.B2, delay: vd, value: 100, duration: vt },
        { param: FormantParam.B3, delay: vd, value: 80, duration: vt },
      ];

    case VowelCode.CODE_E:
      return [
        { param: FormantParam.A2, delay: 0, value: 0.5, duration: 0 },
        { param: FormantParam.A2, delay: 0.1, value: 0, duration: 0 },
        { param: FormantParam.FNZ, delay: vd, value: 270, duration: vt },
        { param: FormantParam.F1, delay: vd, value: 600, duration: vt },
        { param: FormantParam.F2, delay: vd, value: 2350, duration: vt },
        { param: FormantParam.F3, delay: vd, value: 3000, duration: vt },
        { param: FormantParam.B1, delay: vd, value: 60, duration: vt },
        { param: FormantParam.B2, delay: vd, value: 90, duration: vt },
        { param: FormantParam.B3, delay: vd, value: 200, duration: vt },
      ];

    case VowelCode.CODE_O:
      return [
        { param: FormantParam.FNZ, delay: vd, value: 270, duration: vt },
        { param: FormantParam.F1, delay: vd, value: 540, duration: vt },
        { param: FormantParam.F2, delay: vd, value: 1100, duration: vt },
        { param: FormantParam.F3, delay: vd, value: 2300, duration: vt },
        { param: FormantParam.B1, delay: vd, value: 80, duration: vt },
        { param: FormantParam.B2, delay: vd, value: 70, duration: vt },
        { param: FormantParam.B3, delay: vd, value: 70, duration: vt },
      ];

    case VowelCode.CODE_AI:
      return [
        { param: FormantParam.A2, delay: 0, value: 0.5, duration: 0 },
        { param: FormantParam.A2, delay: 0.1, value: 0, duration: 0 },
        { param: FormantParam.FNZ, delay: vd, value: 270, duration: vt },
        { param: FormantParam.F1, delay: vd, value: 850, duration: vt },
        { param: FormantParam.F2, delay: vd, value: 1220, duration: vt },
        { param: FormantParam.F3, delay: vd, value: 2810, duration: vt },
        { param: FormantParam.B1, delay: vd, value: 80, duration: vt },
        { param: FormantParam.B2, delay: vd, value: 70, duration: vt },
        { param: FormantParam.B3, delay: vd, value: 70, duration: vt },
        // Diphthong
        { param: FormantParam.F1, delay: vd + 0.2, value: 300, duration: 0.5 },
        { param: FormantParam.F2, delay: vd + 0.2, value: 2800, duration: 0.5 },
        { param: FormantParam.F3, delay: vd + 0.2, value: 3300, duration: 0.5 },
        { param: FormantParam.B1, delay: vd + 0.2, value: 45, duration: 0.5 },
        { param: FormantParam.B2, delay: vd + 0.2, value: 200, duration: 0.5 },
        { param: FormantParam.B3, delay: vd + 0.2, value: 400, duration: 0.5 },
      ];

    case VowelCode.CODE_EI:
      return [
        { param: FormantParam.A2, delay: 0, value: 0.5, duration: 0 },
        { param: FormantParam.A2, delay: 0.1, value: 0, duration: 0 },
        { param: FormantParam.FNZ, delay: vd, value: 270, duration: vt },
        { param: FormantParam.F1, delay: vd, value: 600, duration: vt },
        { param: FormantParam.F2, delay: vd, value: 2350, duration: vt },
        { param: FormantParam.F3, delay: vd, value: 3000, duration: vt },
        { param: FormantParam.B1, delay: vd, value: 60, duration: vt },
        { param: FormantParam.B2, delay: vd, value: 90, duration: vt },
        { param: FormantParam.B3, delay: vd, value: 200, duration: vt },
        // Diphthong
        { param: FormantParam.F1, delay: vd + 0.2, value: 300, duration: 0.5 },
        { param: FormantParam.F2, delay: vd + 0.2, value: 2800, duration: 0.5 },
        { param: FormantParam.F3, delay: vd + 0.2, value: 3300, duration: 0.5 },
        { param: FormantParam.B1, delay: vd + 0.2, value: 45, duration: 0.5 },
        { param: FormantParam.B2, delay: vd + 0.2, value: 200, duration: 0.5 },
        { param: FormantParam.B3, delay: vd + 0.2, value: 400, duration: 0.5 },
      ];

    default:
      return null;
  }
}
