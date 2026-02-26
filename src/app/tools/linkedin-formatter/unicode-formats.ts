// Unicode font mapping utilities for LinkedIn Text Formatter
// All 22 format types

type CharMap = Record<string, string>;

function buildMap(upperStart: number, lowerStart: number, digitStart?: number): CharMap {
  const map: CharMap = {};
  for (let i = 0; i < 26; i++) {
    map[String.fromCharCode(65 + i)] = String.fromCodePoint(upperStart + i);
    map[String.fromCharCode(97 + i)] = String.fromCodePoint(lowerStart + i);
  }
  if (digitStart !== undefined) {
    for (let i = 0; i < 10; i++) {
      map[String(i)] = String.fromCodePoint(digitStart + i);
    }
  }
  return map;
}

// Sans-Serif Bold (Bold): U+1D5D4 upper, U+1D5EE lower, U+1D7EC digits
const boldMap = buildMap(0x1D5D4, 0x1D5EE, 0x1D7EC);

// Sans-Serif Italic: U+1D608 upper, U+1D622 lower
const italicSansMap = buildMap(0x1D608, 0x1D622);

// Sans-Serif Bold Italic: U+1D63C upper, U+1D656 lower
const boldItalicSansMap = buildMap(0x1D63C, 0x1D656);

// Sans-Serif: U+1D5A0 upper, U+1D5BA lower, U+1D7E2 digits
const sansMap = buildMap(0x1D5A0, 0x1D5BA, 0x1D7E2);

// Serif Italic: U+1D434 upper, U+1D44E lower (h is special: ℎ U+210E)
const italicSerifMap: CharMap = {};
for (let i = 0; i < 26; i++) {
  italicSerifMap[String.fromCharCode(65 + i)] = String.fromCodePoint(0x1D434 + i);
  if (i === 7) {
    italicSerifMap[String.fromCharCode(97 + i)] = '\u210E'; // ℎ
  } else {
    italicSerifMap[String.fromCharCode(97 + i)] = String.fromCodePoint(0x1D44E + i);
  }
}

// Serif Bold Italic: U+1D468 upper, U+1D482 lower
const boldItalicSerifMap = buildMap(0x1D468, 0x1D482);

// Mathematical Script: U+1D49C upper, U+1D4B6 lower
// Some uppercase have special codepoints
const scriptMap: CharMap = {};
const scriptUpperSpecial: Record<number, string> = {
  1: '\u212C',  // ℬ B
  4: '\u2130',  // ℰ E
  5: '\u2131',  // ℱ F
  7: '\u210B',  // ℋ H
  8: '\u2110',  // ℐ I
  11: '\u2112', // ℒ L
  12: '\u2133', // ℳ M
  17: '\u211B', // ℛ R
};
const scriptLowerSpecial: Record<number, string> = {
  4: '\u212F',  // ℯ e
  6: '\u210A',  // ℊ g
  14: '\u2134', // ℴ o
};
for (let i = 0; i < 26; i++) {
  scriptMap[String.fromCharCode(65 + i)] = scriptUpperSpecial[i] ?? String.fromCodePoint(0x1D49C + i);
  scriptMap[String.fromCharCode(97 + i)] = scriptLowerSpecial[i] ?? String.fromCodePoint(0x1D4B6 + i);
}

// Double-Struck: U+1D538 upper, U+1D552 lower, U+1D7D8 digits
// Some uppercase have special codepoints
const doublestruckMap: CharMap = {};
const dsUpperSpecial: Record<number, string> = {
  2: '\u2102',  // ℂ C
  7: '\u210D',  // ℍ H
  13: '\u2115', // ℕ N
  15: '\u2119', // ℙ P
  16: '\u211A', // ℚ Q
  17: '\u211D', // ℝ R
  25: '\u2124', // ℤ Z
};
for (let i = 0; i < 26; i++) {
  doublestruckMap[String.fromCharCode(65 + i)] = dsUpperSpecial[i] ?? String.fromCodePoint(0x1D538 + i);
  doublestruckMap[String.fromCharCode(97 + i)] = String.fromCodePoint(0x1D552 + i);
}
for (let i = 0; i < 10; i++) {
  doublestruckMap[String(i)] = String.fromCodePoint(0x1D7D8 + i);
}

// Fullwidth: a-z → U+FF41, A-Z → U+FF21, 0-9 → U+FF10
const fullwidthMap: CharMap = {};
for (let i = 0; i < 26; i++) {
  fullwidthMap[String.fromCharCode(65 + i)] = String.fromCodePoint(0xFF21 + i);
  fullwidthMap[String.fromCharCode(97 + i)] = String.fromCodePoint(0xFF41 + i);
}
for (let i = 0; i < 10; i++) {
  fullwidthMap[String(i)] = String.fromCodePoint(0xFF10 + i);
}

function applyMap(text: string, map: CharMap): string {
  return [...text].map((ch) => map[ch] ?? ch).join('');
}

function addCombining(text: string, combiningChar: string): string {
  return [...text].map((ch) => ch + combiningChar).join('');
}

function addCombiningToMapped(text: string, map: CharMap, combiningChar: string): string {
  return [...text].map((ch) => (map[ch] ?? ch) + combiningChar).join('');
}

export interface FormatDef {
  key: string;
  label: string;
  transform: (text: string) => string;
}

export const FORMAT_DEFS: FormatDef[] = [
  { key: 'normal', label: 'Normal', transform: (t) => t },
  { key: 'bold', label: 'Bold', transform: (t) => applyMap(t, boldMap) },
  { key: 'bold-sans', label: 'Bold Sans', transform: (t) => applyMap(t, boldMap) },
  { key: 'italic', label: 'Italic', transform: (t) => applyMap(t, italicSerifMap) },
  { key: 'italic-sans', label: 'Italic Sans', transform: (t) => applyMap(t, italicSansMap) },
  { key: 'bold-italic', label: 'Bold Italic', transform: (t) => applyMap(t, boldItalicSerifMap) },
  { key: 'bold-italic-sans', label: 'Bold Italic Sans', transform: (t) => applyMap(t, boldItalicSansMap) },
  { key: 'sans', label: 'Sans', transform: (t) => applyMap(t, sansMap) },
  { key: 'underline', label: 'Underline', transform: (t) => addCombining(t, '\u0332') },
  { key: 'strikethrough', label: 'Strikethrough', transform: (t) => addCombining(t, '\u0336') },
  { key: 'bold-underline', label: 'Bold Underline', transform: (t) => addCombiningToMapped(t, boldMap, '\u0332') },
  { key: 'bold-strikethrough', label: 'Bold Strikethrough', transform: (t) => addCombiningToMapped(t, boldMap, '\u0336') },
  { key: 'script', label: 'Script', transform: (t) => applyMap(t, scriptMap) },
  { key: 'doublestruck', label: 'Doublestruck', transform: (t) => applyMap(t, doublestruckMap) },
  { key: 'fullwidth', label: 'Fullwidth', transform: (t) => applyMap(t, fullwidthMap) },
  { key: 'uppercase', label: 'Uppercase', transform: (t) => t.toUpperCase() },
  { key: 'lowercase', label: 'Lowercase', transform: (t) => t.toLowerCase() },
  {
    key: 'numbered',
    label: 'Numbered List',
    transform: (t) => t.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n'),
  },
  {
    key: 'bullets',
    label: 'Bullet Points',
    transform: (t) => t.split('\n').map((line) => `• ${line}`).join('\n'),
  },
  {
    key: 'checklist',
    label: 'Checklist',
    transform: (t) => t.split('\n').map((line) => `☐ ${line}`).join('\n'),
  },
  {
    key: 'ascending',
    label: 'Ascending List',
    transform: (t) => t.split('\n').sort((a, b) => a.localeCompare(b)).join('\n'),
  },
  {
    key: 'descending',
    label: 'Descending List',
    transform: (t) => t.split('\n').sort((a, b) => b.localeCompare(a)).join('\n'),
  },
];

// Export individual maps for toolbar use
export { boldMap, italicSansMap as italicMap, sansMap };
export { applyMap, addCombining, addCombiningToMapped };
