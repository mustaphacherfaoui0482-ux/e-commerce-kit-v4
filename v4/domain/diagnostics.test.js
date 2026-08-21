import test from "node:test";
import assert from "node:assert/strict";
import { calculateBusinessHealth, buildAlerts } from "./diagnostics.js";

test("business health detects insufficient sales data", () => {
  const result = calculateBusinessHealth({ orders: 0, revenue: 0 });
  assert.equal(result.level, "insufficient");
  assert.equal(result.score, null);
});

test("business health identifies a healthy operating case", () => {
  const result = calculateBusinessHealth({
    sellingPrice: 40,
    landedCost: 10,
    variableFees: 2,
    ads: 200,
    orders: 20,
    revenue: 800,
    stock: [{ qty: 100, min: 20 }],
    cash: [{ type: "in", amount: 1000 }]
  });
  assert.equal(result.level, "good");
  assert.ok(result.score >= 75);
  assert.equal(buildAlerts(result).length, 0);
});

test("business health prioritizes negative contribution", () => {
  const result = calculateBusinessHealth({
    sellingPrice: 30,
    landedCost: 20,
    variableFees: 5,
    ads: 400,
    orders: 10,
    revenue: 300
  });
  assert.equal(result.metrics.contribution, "danger");
  assert.equal(result.problem, "Contribution insuffisante.");
  assert.ok(buildAlerts(result).some(alert => alert.text.includes("Contribution")));
});
