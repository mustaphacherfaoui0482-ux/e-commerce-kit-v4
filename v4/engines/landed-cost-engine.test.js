import { calculateLandedCost } from "./landed-cost-engine.js";

const result = calculateLandedCost({
  quantity: 100,
  productCost: 5,
  customization: 0.50,
  packaging: 0.30,
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

if (result.complete !== true) {
  throw new Error("Le calcul complet doit être marqué complete=true");
}

const expectedTotal =
  100 * 5 +
  100 * 0.50 +
  100 * 0.30 +
  50 +
  20 +
  300 +
  30 +
  80 +
  100 +
  40 +
  60 +
  50 +
  20;

const expectedUnitCost =
  expectedTotal / 100;

if (result.totalCost !== expectedTotal) {
  throw new Error(
    `Total incorrect : ${result.totalCost} au lieu de ${expectedTotal}`
  );
}

if (result.landedCostPerUnit !== expectedUnitCost) {
  throw new Error(
    `Coût rendu unitaire incorrect : ${result.landedCostPerUnit} au lieu de ${expectedUnitCost}`
  );
}

// Test : donnée manquante ≠ zéro
{
  const incomplete = calculateLandedCost({
    quantity: 100,
    productCost: 5,
    customization: 0.50,
    packaging: 0.30,
    factoryToChinaWarehouse: 50,
    chinaExportFees: null,
    internationalShipping: 300,
    insurance: 30,
    customsClearance: 80,
    customsDuty: 100,
    portFees: 40,
    franceWarehouseTransport: 60,
    inspection: 50,
    otherLogistics: 20
  });

  if (incomplete.complete !== false) {
    throw new Error("Une donnée manquante doit rendre le calcul incomplet");
  }
  if (incomplete.totalCost !== null || incomplete.landedCostPerUnit !== null) {
    throw new Error("Un calcul incomplet ne doit pas produire un coût numérique");
  }
  if (!incomplete.missingFields.includes("chinaExportFees")) {
    throw new Error("Le champ manquant doit être identifié");
  }
}

console.log("🟢 Test Coût rendu France réussi");
console.log(`Total : ${result.totalCost.toFixed(2)} €`);
console.log(`Coût rendu unitaire : ${result.landedCostPerUnit.toFixed(2)} €`);
