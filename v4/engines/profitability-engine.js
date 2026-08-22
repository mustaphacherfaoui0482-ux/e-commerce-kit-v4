const REQUIRED_FIELDS = [
  "sellingPrice",
  "landedCost",
  "variableFees",
  "cac",
  "targetContribution"
];

function isProvidedNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

export function calculateProfitability(input = {}) {
  const missingFields = REQUIRED_FIELDS.filter(
    (field) => !isProvidedNumber(input[field])
  );

  if (missingFields.length) {
    return {
      complete: false,
      missingFields,
      contributionBeforeAds: null,
      contribution: null,
      contributionMargin: null,
      maxCac: null,
      minimumSellingPrice: null,
      profitable: null
    };
  }

  const {
    sellingPrice,
    landedCost,
    variableFees,
    cac,
    targetContribution
  } = input;

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
    complete: true,
    missingFields: [],
    contributionBeforeAds,
    contribution,
    contributionMargin,
    maxCac,
    minimumSellingPrice,
    profitable
  };
}
