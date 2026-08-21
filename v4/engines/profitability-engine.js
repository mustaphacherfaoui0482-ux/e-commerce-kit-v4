function number(value, field) {
  const result = Number(value ?? 0);
  if (!Number.isFinite(result)) throw new TypeError(`${field} doit être un nombre fini`);
  if (result < 0) throw new RangeError(`${field} ne peut pas être négatif`);
  return result;
}

export function calculateProfitability({
  sellingPrice = 0,
  landedCost = 0,
  variableFees = 0,
  cac = 0,
  targetContribution = 0,
} = {}) {
  sellingPrice = number(sellingPrice, "sellingPrice");
  landedCost = number(landedCost, "landedCost");
  variableFees = number(variableFees, "variableFees");
  cac = number(cac, "cac");
  targetContribution = number(targetContribution, "targetContribution");

  const contributionBeforeAds = sellingPrice - landedCost - variableFees;
  const contribution = contributionBeforeAds - cac;
  const contributionMargin = sellingPrice > 0 ? contribution / sellingPrice : 0;
  const maxCac = sellingPrice - landedCost - variableFees - targetContribution;
  const minimumSellingPrice = landedCost + variableFees + cac + targetContribution;
  const profitable = contribution >= targetContribution;

  return {
    contributionBeforeAds,
    contribution,
    contributionMargin,
    maxCac,
    minimumSellingPrice,
    profitable,
  };
}
