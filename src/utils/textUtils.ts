export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/&/g, 'and')
    .replace(/\b(st|street)\b/g, 'street')
    .replace(/\b(ave|avenue)\b/g, 'avenue')
    .replace(/\b(rd|road)\b/g, 'road')
    .replace(/\b(blvd|boulevard)\b/g, 'boulevard')
    .replace(/\b(dr|drive)\b/g, 'drive')
    .replace(/\b(ln|lane)\b/g, 'lane')
    .replace(/\b(ct|court)\b/g, 'court')
    .replace(/\b(pl|place)\b/g, 'place')
    .replace(/\b(pkwy|parkway)\b/g, 'parkway')
    .replace(/\s+/g, ' ')
    .trim();
}

export function calculateEnhancedSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  if (s1 === s2) return 100;
  if (s1.includes(s2) || s2.includes(s1)) return 95;
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  let wordMatches = 0;
  words2.forEach(word2 => {
    if (words1.some(word1 => word1 === word2)) {
      wordMatches++;
    }
  });
  if (wordMatches > 0) {
    const exactScore = (wordMatches / words2.length) * 80;
    return Math.min(95, 40 + exactScore);
  }
  return 0;
}