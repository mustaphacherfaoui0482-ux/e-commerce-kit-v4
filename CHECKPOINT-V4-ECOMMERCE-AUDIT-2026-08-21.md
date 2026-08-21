# CHECKPOINT V4 — E-COMMERCE AUDIT / ALIGNMENT

**Date:** 21 août 2026  
**Base:** `main`  
**Feature branch:** `feat/master-v4-ecommerce-alignment`

## Master used

The MASTER V4 defines the application as the main daily business cockpit, while Sourcing Intelligence remains an independent specialized module. The main Dashboard must prioritize CA, commandes, marge/contribution and trésorerie, with CAC/ROAS/stock and other indicators when data is available. It must transform data into a clear diagnosis and a single priority, without false certainty.

The MASTER also requires shared reference data, centralized critical calculations, a single source of truth, progressive MVP/V1/V2 prioritization, and consistency across Application, Excel, PowerPoint and eBook.

## Corrections implemented

- Added root `package.json` with ESM configuration and a unified `npm test` command covering profitability, landed cost, Business Health, runtime syntax and structural runtime validation.
- Added `scripts/validate-v4-runtime.mjs` for deterministic file, syntax and dashboard-structure checks.
- Added centralized `v4/domain/rules.js`.
- Added centralized `v4/domain/diagnostics.js` and tests.
- Added centralized `v4/state/store.js` with neutral empty defaults.
- Added `app.js` as the application runtime using the canonical landed-cost and profitability engines.
- Added the full landed-cost input set programmatically to the existing calculator without replacing the existing visual shell.
- Added contribution and target-contribution handling to the profitability calculator.
- Added safe data-insufficient states instead of false KPI certainty.
- Added stock/order/cash/creative/action runtime handling.
- Replaced the legacy `business-health.js` implementation with a compatibility bridge to the new runtime.
- Expanded CI triggers to `main`, `v4-development`, feature branches and pull requests.
- Consolidated automatic V4 validation into the core workflow; standalone runtime and landed-cost workflows are now manual to avoid duplicate automatic test runs.
- Added a GitHub Pages deployment workflow as a Vercel-independent deployment path.
- Hardened the Pages build so the copied artifact removes the known duplicated `updateOrderProducts()` fragment before publication and then injects the centralized `app.js` runtime.
- Added publication-time assertions for the sanitized artifact and module syntax checks.

## Current validation status

- Previously validated V4 engine tests passed, including profitability, landed cost and Business Health.
- The deterministic runtime validation script is now part of `npm test`.
- The latest workflow edits have not yet produced a new workflow run; no success is claimed for the newest commit until GitHub reports it.
- Vercel remains blocked by the observed `upgradeToPro=build-rate-limit` status.
- Browser validation is not proven.
- GitHub Pages availability/configuration is not independently confirmed; the workflow is prepared but that is not the same as a successful deployment.

## Remaining validation

1. Trigger/confirm CI on the latest feature commit and confirm `npm test`.
2. If GitHub Pages is enabled, run the Pages workflow and inspect the deployment.
3. Browser validation of the deployed page.
4. Confirm no console/runtime error remains.
5. Confirm the visual shell remains unchanged.
6. Confirm real inputs feed the centralized Opportunity/business runtime correctly.
7. Only after these checks, mark PR #2 ready and merge to `main`.

## Architectural boundary

Sourcing Intelligence remains a separate specialized module. It must not be merged into the main daily-control Dashboard. Only validated opportunity information should cross the boundary.

## Continuation rule

Continue non-destructive validation and correction automatically. Do not claim success without evidence. Do not add unrelated features or redesign the UI. A deployment provider limitation must not be misreported as an application defect.
