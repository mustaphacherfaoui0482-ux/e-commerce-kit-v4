import test from "node:test";
import assert from "node:assert/strict";
import { calculateProfitability } from "./profitability-engine.js";

test("calculates profitable product", () => {
  const r = calculateProfitability({ sellingPrice: 40, landedCost: 10, variableFees: 3, cac: 8, targetContribution: 5 });
  assert.equal(r.contributionBeforeAds, 27);
  assert.equal(r.contribution, 19);
  assert.equal(r.maxCac, 22);
  assert.equal(r.minimumSellingPrice, 26);
  assert.equal(r.profitable, true);
  assert.equal(r.contributionMargin, 19 / 40);
});

test("detects non-profitable product", () => {
  const r = calculateProfitability({ sellingPrice: 30, landedCost: 15, variableFees: 3, cac: 15, targetContribution: 5 });
  assert.equal(r.contribution, -3);
  assert.equal(r.profitable, false);
});

test("zero selling price does not divide by zero", () => {
  assert.equal(calculateProfitability({ sellingPrice: 0, landedCost: 10, variableFees: 2, cac: 5, targetContribution: 3 }).contributionMargin, 0);
});
