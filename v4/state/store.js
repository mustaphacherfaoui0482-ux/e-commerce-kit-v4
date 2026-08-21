const KEY = "ecommerce_kit_v4";
const VERSION = 2;
const defaults = () => ({
  version: VERSION,
  inputs: { ads: 500, orders: 35, revenue: 1396.5, sellingPrice: 39.9, landedCost: 19.72, variableFees: 0, targetContribution: 0 },
  stock: [], cash: [], creatives: [], actions: [],
  tasks: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, done: false })),
});

function normalize(raw) {
  const base = defaults();
  if (!raw || typeof raw !== "object") return base;
  return {
    ...base,
    ...raw,
    version: VERSION,
    inputs: { ...base.inputs, ...(raw.inputs || {}) },
    stock: Array.isArray(raw.stock) ? raw.stock : [],
    cash: Array.isArray(raw.cash) ? raw.cash : [],
    creatives: Array.isArray(raw.creatives) ? raw.creatives : [],
    actions: Array.isArray(raw.actions) ? raw.actions : [],
    tasks: Array.isArray(raw.tasks) && raw.tasks.length ? raw.tasks : base.tasks,
  };
}

export function loadStore() {
  try {
    return normalize(JSON.parse(localStorage.getItem(KEY) || "null"));
  } catch {
    return defaults();
  }
}

export function saveStore(data) {
  const normalized = normalize(data);
  localStorage.setItem(KEY, JSON.stringify(normalized));
  return normalized;
}

export { KEY, VERSION };
