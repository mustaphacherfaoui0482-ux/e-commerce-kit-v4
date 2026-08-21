# CHECKPOINT V4 — E-COMMERCE AUDIT / ALIGNMENT

**Date:** 21 août 2026  
**Base:** `main`  
**Feature branch:** `feat/master-v4-ecommerce-alignment`

## Master used

The MASTER V4 defines the application as the main daily business cockpit, while Sourcing Intelligence remains an independent specialized module. The main Dashboard must prioritize CA, commandes, marge/contribution and trésorerie, with CAC/ROAS/stock and other indicators when data is available. It must transform data into a clear diagnosis and a single priority, without false certainty.

The MASTER also requires shared reference data, centralized critical calculations, a single source of truth, progressive MVP/V1/V2 prioritization, and consistency across Application, Excel, PowerPoint and eBook.

## Audit findings corrected in this branch

- `main/index.html` contained a duplicated fragment inside `updateOrderProducts()`, making the legacy inline script syntactically unsafe.
- Critical calculation logic was duplicated in the HTML instead of being centralized in the existing calculation engines.
- The repository had ES-module test files but no root `package.json` declaring `type: module`.
- CI workflows only ran on `v4-development`, not on `main`, pull requests or feature branches.
- Business-health logic existed as a large standalone script with duplicated decision logic.
- Default business inputs in the legacy store could create a demo state instead of a genuinely empty/unknown state.

## Corrections implemented

- Added root `package.json` with ESM configuration and test scripts.
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
- Added a GitHub Pages deployment workflow as a Vercel-independent deployment path.
- Hardened the Pages build so the copied artifact removes the known duplicated `updateOrderProducts()` fragment before publication and then injects the centralized `app.js` runtime.
- Added publication-time assertions for the sanitized artifact and module syntax checks.

## Current validation status

- GitHub Actions engine tests: passed on the previously validated PR commit.
- PR #2: open, draft, mergeable.
- Latest feature branch contains the hardened Pages workflow.
- Vercel remains blocked by the previously observed build-rate-limit condition.
- Browser validation is still not proven.
- GitHub Pages availability/configuration has not been independently confirmed; the workflow is prepared but that is not the same as a successful deployment.

## Remaining validation

1. Confirm CI against the latest feature commit.
2. If GitHub Pages is enabled for the repository, run the Pages workflow and inspect its deployed result.
3. Browser validation of the deployed page.
4. Confirm no console/runtime error remains.
5. Confirm the visual shell remains unchanged.
6. Confirm real inputs feed the centralized Opportunity/business runtime correctly.
7. Only after these checks, mark PR #2 ready and merge to `main`.

## Architectural boundary

Sourcing Intelligence remains a separate specialized module. It must not be merged into the main daily-control Dashboard. Only validated opportunity information should cross the boundary.

## Continuation rule

Continue non-destructive validation and correction automatically. Do not claim success without evidence. Do not add unrelated features or redesign the UI. A deployment provider limitation must not be misreported as an application defect.
