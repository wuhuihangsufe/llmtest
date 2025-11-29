export function seededShuffle<T>(array: T[], seed: string): T[] {
  const m = array.length;
  const t = array.slice(); // Copy array
  let i = m;
  
  // Simple hash function to generate a numeric seed from string
  let h = 0;
  for (let j = 0; j < seed.length; j++) {
    h = Math.imul(31, h) + seed.charCodeAt(j) | 0;
  }
  
  // Mulberry32 generator
  const random = () => {
    h += 0x6D2B79F5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Fisher-Yates shuffle with seeded random
  while (i) {
    const r = Math.floor(random() * i--);
    [t[i], t[r]] = [t[r], t[i]];
  }

  return t;
}

