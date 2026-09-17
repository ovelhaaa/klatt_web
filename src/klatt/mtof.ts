// MIDI note to frequency conversion table
// Standard equal temperament: f = 440 * 2^((n-69)/12)

export function mtof(midi: number): number {
  if (midi < 0) midi = 0;
  if (midi > 127) midi = 127;
  return 440.0 * Math.pow(2, (midi - 69) / 12);
}

// Pre-computed MIDI to increment table (frequency / sampleRate)
export function createMtoIncTable(sampleRate: number): Float32Array {
  const table = new Float32Array(128);
  for (let i = 0; i < 128; i++) {
    table[i] = mtof(i) / sampleRate;
  }
  return table;
}

// Pitch bend table (1024 entries, centered at 8192 = no bend)
export function createPitchBendTable(): Float32Array {
  const table = new Float32Array(16384);
  for (let i = 0; i < 16384; i++) {
    // 2 semitones range, centered at 8192
    const semitones = (i - 8192) / 8192 * 2;
    table[i] = Math.pow(2, semitones / 12);
  }
  return table;
}
