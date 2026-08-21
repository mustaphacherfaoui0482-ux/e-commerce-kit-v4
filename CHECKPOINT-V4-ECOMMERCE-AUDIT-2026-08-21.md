# CHECKPOINT V4 — E-COMMERCE AUDIT / ALIGNMENT

**Date:** 21 août 2026  
**Base:** `main`  
**Feature branch:** `feat/master-v4-ecommerce-alignment`

## Master used

The MASTER V4 defines the application as the main daily business cockpit, while Sourcing Intelligence remains an independent specialized module. The main Dashboard must prioritize CA, commandes, marge/contribution and trésorerie, with CAC/ROAS/stock and other indicators when data is available. It must transform data into a clear diagnosis and a single priority, without false certainty. fileciteturn75file0L45-L77

The MASTER also requires shared reference data, centralized critical calculations, a single source of truth, progressive MVP/V1/V2 prioritization, and consistency across Application, Excel, PowerPoint and eBook. fileciteturn52file4L307-L355

## Audit findings

### Critical findings corrected in this branch

- `main/index.html` contained a duplicated fragment inside `updateOrderProducts()`, making the legacy inline script syntactically unsafe.
- Critical calculation logic was duplicated in the HTML instead of being centralized in the existing calculation engines.
- The repository had ES-module test files but no root `package.json` declaring `type: module`, making the Node execution contract ambiguous.
- CI workflows only ran on `v4-development`, not on `main`, pull requests or feature branches.
- Business-health logic existed as a large standalone script with duplicated decision logic.
- Default business inputs in the legacy store could create a demo state instead of a genuinely empty/unknown state.

### Corrections implemented

- Added root `package.json` with ESM configuration and test scripts.
- Added centralized `v4/domain/rules.js`.
- Added centralized `v4/domain/diagnostics.js` and tests.
- Added centralized `v4/state/store.js` with neutral empty defaults.
- Added `app.js` as the application runtime using the canonical landed-cost and profitability engines.
- Added full landed-cost inputs programmatically to the existing calculator without replacing the existing visual shell.
- Added contribution and target-contribution handling to the profitability calculator.
- Added safe data-insufficient states instead of false KPI certainty.
- Added stock/order/cash/creative/action runtime handling.
- Replaced the legacy `business-health.js` implementation with a compatibility bridge to the new runtime.
- Expanded CI triggers to `main`, `v4-development`, feature branches and pull requests.

## Remaining validation

- Browser validation of the deployed page.
- Confirm no console/runtime error remains in the deployed page.
- Confirm the legacy inline script syntax issue does not prevent the compatibility bridge/runtime from loading.
- Confirm the current visual shell remains unchanged in the browser.
- Confirm GitHub Actions pass on the feature branch/PR.
- Only after those checks: merge to `main` and validate the resulting deployment.

## Architectural boundary

Sourcing Intelligence must remain a separate specialized module. It must not be merged into the main daily-control Dashboard. The approved architecture explicitly keeps the two dashboards separate and passes only validated opportunity data across the boundary. fileciteturn52file5L417-L440

## Rule for continuation

Continue non-destructive validation and correction automatically. Do not claim success without evidence. Do not add unrelated features or redesign the UI.
