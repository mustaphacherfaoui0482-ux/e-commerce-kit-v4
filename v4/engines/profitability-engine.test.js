import { calculateProfitability } from "./profitability-engine.js";

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      `${message} — attendu: ${expected}, obtenu: ${actual}`
    );
  }
}

function assertClose(actual, expected, message, tolerance = 0.000001) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(
      `${message} — attendu: ${expected}, obtenu: ${actual}`
    );
  }
}

// Test 1 : produit rentable
{
  const result = calculateProfitability({
    sellingPrice: 40,
    landedCost: 10,
    variableFees: 3,
    cac: 8,
    targetContribution: 5,
  });

  assertEqual(result.contributionBeforeAds, 27, "Contribution avant publicité");
  assertEqual(result.contribution, 19, "Contribution après CAC");
  assertClose(result.contributionMargin, 19 / 40, "Marge de contribution");
  assertEqual(result.maxCac, 22, "CAC maximum");
  assertEqual(result.minimumSellingPrice, 26, "Prix minimum");
  assertEqual(result.profitable, true, "Produit rentable");
}

// Test 2 : produit non rentable
{
  const result = calculateProfitability({
    sellingPrice: 30,
    landedCost: 15,
    variableFees: 3,
    cac: 15,
    targetContribution: 5,
  });

  assertEqual(result.contribution, -3, "Contribution négative");
  assertEqual(result.profitable, false, "Produit non rentable");
}

// Test 3 : prix nul
{
  const result = calculateProfitability({
    sellingPrice: 0,
    landedCost: 10,
    variableFees: 2,
    cac: 5,
    targetContribution: 3,
  });

  assertEqual(result.contributionMargin, 0, "Marge avec prix nul");
}

console.log("ProfitabilityEngine : tous les tests sont passés.");
