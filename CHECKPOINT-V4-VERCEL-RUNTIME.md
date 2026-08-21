# V4 Vercel runtime validation

The latest inspected Vercel deployment exposed a real source/runtime issue: `index.html` still contained a duplicated fragment after `updateOrderProducts()`, and the centralized `app.js` runtime was not loaded by the source HTML.

A deterministic Vercel build step was added in `scripts/prepare-vercel.mjs` and wired through `vercel.json` so the deployed artifact sanitizes the legacy fragment and loads `app.js` exactly once.

This checkpoint must be validated against the next Vercel deployment before the PR can be considered production-ready.
