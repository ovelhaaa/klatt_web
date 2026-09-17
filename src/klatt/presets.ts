// Presets for the Klatt Synthesizer

export interface SynthPreset {
  name: string;
  description: string;
  category: 'speech' | 'synth' | 'effect';
  params: {
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
  };
}

export const presets: SynthPreset[] = [
  // Speech presets
  {
    name: 'Clear Vowel',
    description: 'Clean vowel sound',
    category: 'speech',
    params: {
      masterVolume: 80,
      waveshape: 85,
      flutter: 5,
    }
  },
  {
    name: 'Breathy Voice',
    description: 'Soft, breathy vocal quality',
    category: 'speech',
    params: {
      masterVolume: 70,
      waveshape: 95,
      flutter: 15,
    }
  },
  {
    name: 'Robotic',
    description: 'Mechanical speech',
    category: 'speech',
    params: {
      masterVolume: 85,
      waveshape: 70,
      flutter: 0,
    }
  },
  {
    name: 'Whisper',
    description: 'Whispered speech',
    category: 'speech',
    params: {
      masterVolume: 60,
      waveshape: 98,
      flutter: 8,
    }
  },

  // Synth presets
  {
    name: 'Warm Pad',
    description: 'Smooth, warm pad sound',
    category: 'synth',
    params: {
      masterVolume: 75,
      waveshape: 80,
      attack: 80,
      release: 150,
      sustain: 90,
      resonFreq: 30,
      resonBW: 40,
      resonWet: 30,
    }
  },
  {
    name: 'Pluck',
    description: 'Short, percussive pluck',
    category: 'synth',
    params: {
      masterVolume: 85,
      waveshape: 75,
      attack: 5,
      release: 50,
      sustain: 20,
      resonFreq: 50,
      resonBW: 60,
      resonWet: 50,
    }
  },
  {
    name: 'Organ',
    description: 'Classic organ tone',
    category: 'synth',
    params: {
      masterVolume: 80,
      waveshape: 60,
      attack: 20,
      release: 30,
      sustain: 100,
      resonFreq: 20,
      resonBW: 30,
      resonWet: 10,
    }
  },
  {
    name: 'String Ensemble',
    description: 'Rich string ensemble',
    category: 'synth',
    params: {
      masterVolume: 75,
      waveshape: 85,
      attack: 100,
      release: 200,
      sustain: 85,
      resonFreq: 40,
      resonBW: 50,
      resonWet: 40,
    }
  },

  // Effect presets
  {
    name: 'Resonant Sweep',
    description: 'Sweeping resonator effect',
    category: 'effect',
    params: {
      masterVolume: 80,
      waveshape: 90,
      resonFreq: 60,
      resonBW: 80,
      resonWet: 70,
    }
  },
  {
    name: 'Notch Filter',
    description: 'Antiresonator notch effect',
    category: 'effect',
    params: {
      masterVolume: 75,
      waveshape: 85,
      antiResonFreq: 50,
      antiResonBW: 70,
      antiResonWet: 60,
    }
  },
  {
    name: 'Distortion',
    description: 'Heavy waveshaping',
    category: 'effect',
    params: {
      masterVolume: 70,
      waveshape: 40,
    }
  },
  {
    name: 'Tremolo',
    description: 'Flutter-based tremolo',
    category: 'effect',
    params: {
      masterVolume: 80,
      waveshape: 85,
      flutter: 50,
    }
  },
];

export function getPresetByName(name: string): SynthPreset | undefined {
  return presets.find(p => p.name === name);
}

export function getPresetsByCategory(category: 'speech' | 'synth' | 'effect'): SynthPreset[] {
  return presets.filter(p => p.category === category);
}
