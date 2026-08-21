function finiteNumber(value, field) {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number)) throw new TypeError(`${field} doit être un nombre fini`);
  return number;
}

function nonNegative(value, field) {
  const number = finiteNumber(value, field);
  if (number < 0) throw new RangeError(`${field} ne peut pas être négatif`);
  return number;
}

export function calculateLandedCost(input = {}) {
  const quantity = nonNegative(input.quantity ?? 0, "quantity");
  const productCost = nonNegative(input.productCost ?? 0, "productCost");
  const customization = nonNegative(input.customization ?? 0, "customization");
  const packaging = nonNegative(input.packaging ?? 0, "packaging");

  const logisticsFields = [
    "factoryToChinaWarehouse", "chinaExportFees", "internationalShipping",
    "insurance", "customsClearance", "customsDuty", "portFees",
    "franceWarehouseTransport", "inspection", "otherLogistics"
  ];
  const logistics = Object.fromEntries(
    logisticsFields.map((field) => [field, nonNegative(input[field] ?? 0, field)])
  );

  const goodsCost = quantity * productCost;
  const customizationCost = quantity * customization;
  const packagingCost = quantity * packaging;
  const logisticsCost = Object.values(logistics).reduce((sum, value) => sum + value, 0);
  const totalCost = goodsCost + customizationCost + packagingCost + logisticsCost;
  const landedCostPerUnit = quantity > 0 ? totalCost / quantity : 0;

  return {
    goodsCost,
    customizationCost,
    packagingCost,
    logisticsCost,
    totalCost,
    landedCostPerUnit,
  };
}
