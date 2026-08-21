export const V4_RULES = Object.freeze({
  cac: { good: 15, warning: 18 },
  roas: { good: 3, acceptable: 2.5, warning: 2 },
  contributionMargin: { good: 0.20, warning: 0.10 },
  stock: { low: 20 },
  margin: { warning: 0.10 },
  creative: { winnerRoas: 3, testRoas: 2 },
});

export function classifyCreative(roas) {
  if (roas >= V4_RULES.creative.winnerRoas) return "GAGNANT";
  if (roas >= V4_RULES.creative.testRoas) return "À TESTER";
  return "À ARRÊTER";
}
