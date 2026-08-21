import test from "node:test";
import assert from "node:assert/strict";
import { calculateLandedCost } from "./landed-cost-engine.js";

test("calculates full France landed cost", () => {
  const result = calculateLandedCost({
    quantity: 100,
    productCost: 5,
    customization: 0.5,
    packaging: 0.3,
    factoryToChinaWarehouse: 50,
    chinaExportFees: 20,
    internationalShipping: 300,
    insurance: 30,
    customsClearance: 80,
    customsDuty: 100,
    portFees: 40,
    franceWarehouseTransport: 60,
    inspection: 50,
    otherLogistics: 20
  });
  assert.equal(result.totalCost, 1330);
  assert.equal(result.landedCostPerUnit, 13.3);
});

test("rejects invalid negative values", () => {
  assert.throws(() => calculateLandedCost({ quantity: 10, productCost: -1 }), RangeError);
});

test("zero quantity has zero unit cost", () => {
  assert.equal(calculateLandedCost({ quantity: 0, productCost: 5 }).landedCostPerUnit, 0);
});
