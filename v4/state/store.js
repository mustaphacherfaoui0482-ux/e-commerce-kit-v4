const KEY = "ecommerce_kit_v4";
const VERSION = 3;

const defaults = () => ({
  version: VERSION,
  inputs: {
    ads: 0,
    orders: 0,
    revenue: 0,
    sellingPrice: 0,
    landedCost: 0,
    variableFees: 0,
    targetContribution: 0
  },
  stock: [],
  cash: [],
  creatives: [],
  actions: [],
  tasks: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, done: false }))
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
    tasks: Array.isArray(raw.tasks) && raw.tasks.length ? raw.tasks : base.tasks
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
