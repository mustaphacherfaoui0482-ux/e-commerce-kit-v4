export function calculateProfitability({
  sellingPrice = 0,
  landedCost = 0,
  variableFees = 0,
  cac = 0,
  targetContribution = 0
}) {
  const contributionBeforeAds =
    sellingPrice - landedCost - variableFees;

  const contribution =
    contributionBeforeAds - cac;

  const contributionMargin =
    sellingPrice > 0 ? contribution / sellingPrice : 0;

  const maxCac =
    sellingPrice - landedCost - variableFees - targetContribution;

  const minimumSellingPrice =
    landedCost + variableFees + cac + targetContribution;

  const profitable =
    contribution >= targetContribution;

  return {
    contributionBeforeAds,
    contribution,
    contributionMargin,
    maxCac,
    minimumSellingPrice,
    profitable
  };
}
