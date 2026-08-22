const REQUIRED_FIELDS = [
  "quantity",
  "productCost",
  "customization",
  "packaging",
  "factoryToChinaWarehouse",
  "chinaExportFees",
  "internationalShipping",
  "insurance",
  "customsClearance",
  "customsDuty",
  "portFees",
  "franceWarehouseTransport",
  "inspection",
  "otherLogistics"
];

function isProvidedNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

export function calculateLandedCost(input = {}) {
  const missingFields = REQUIRED_FIELDS.filter(
    (field) => !isProvidedNumber(input[field])
  );

  if (missingFields.length) {
    return {
      complete: false,
      missingFields,
      goodsCost: null,
      customizationCost: null,
      packagingCost: null,
      totalCost: null,
      landedCostPerUnit: null
    };
  }

  const {
    quantity,
    productCost,
    customization,
    packaging,
    factoryToChinaWarehouse,
    chinaExportFees,
    internationalShipping,
    insurance,
    customsClearance,
    customsDuty,
    portFees,
    franceWarehouseTransport,
    inspection,
    otherLogistics
  } = input;

  const goodsCost =
    quantity * productCost;

  const customizationCost =
    quantity * customization;

  const packagingCost =
    quantity * packaging;

  const totalCost =
    goodsCost +
    customizationCost +
    packagingCost +
    factoryToChinaWarehouse +
    chinaExportFees +
    internationalShipping +
    insurance +
    customsClearance +
    customsDuty +
    portFees +
    franceWarehouseTransport +
    inspection +
    otherLogistics;

  const landedCostPerUnit =
    quantity > 0
      ? totalCost / quantity
      : 0;

  return {
    complete: true,
    missingFields: [],
    goodsCost,
    customizationCost,
    packagingCost,
    totalCost,
    landedCostPerUnit
  };
}
