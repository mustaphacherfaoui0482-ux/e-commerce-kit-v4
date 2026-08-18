export function calculateLandedCost({
  quantity = 0,
  productCost = 0,
  customization = 0,
  packaging = 0,
  factoryToChinaWarehouse = 0,
  chinaExportFees = 0,
  internationalShipping = 0,
  insurance = 0,
  customsClearance = 0,
  customsDuty = 0,
  portFees = 0,
  franceWarehouseTransport = 0,
  inspection = 0,
  otherLogistics = 0
}) {
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
    goodsCost,
    customizationCost,
    packagingCost,
    totalCost,
    landedCostPerUnit
  };
}
