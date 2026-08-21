import { calculateLandedCost } from "./v4/engines/landed-cost-engine.js";
import { calculateProfitability } from "./v4/engines/profitability-engine.js";
import { calculateBusinessHealth, buildAlerts } from "./v4/domain/diagnostics.js";
import { classifyCreative } from "./v4/domain/rules.js";
import { loadStore, saveStore } from "./v4/state/store.js";

const $ = (id) => document.getElementById(id);
const money = (value) => Number(value || 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
const num = (id) => Math.max(0, Number($(id)?.value || 0));
const esc = (value) => String(value ?? "").replace(/[&<>\"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[c]));

let state = loadStore();

function persist() {
  state = saveStore(state);
  render();
}

function setInput(id, value) {
  if ($(id)) $(id).value = value;
}

function health() {
  return calculateBusinessHealth({ ...state.inputs, stock: state.stock, cash: state.cash });
}

function render() {
  const h = health();
  const alerts = buildAlerts(h);
  $("ca").textContent = money(state.inputs.revenue);
  $("ordersDisplay").textContent = state.inputs.orders;
  $("cacDisplay").textContent = state.inputs.orders ? money(state.inputs.ads / state.inputs.orders) : "—";
  $("roasDisplay").textContent = state.inputs.ads ? (state.inputs.revenue / state.inputs.ads).toFixed(2) : "—";
  $("aov").textContent = state.inputs.orders ? money(state.inputs.revenue / state.inputs.orders) : "—";
  $("stockTotal").textContent = state.stock.reduce((s, x) => s + Math.max(0, Number(x.qty) || 0), 0);
  const cash = state.cash.reduce((s, x) => s + (x.type === "in" ? 1 : -1) * Math.max(0, Number(x.amount) || 0), 0);
  $("cashTotal").textContent = money(cash);
  $("healthStatus").textContent = h.score == null ? h.title : `${h.title} · ${h.score}/100`;
  $("healthMessage").textContent = h.message;
  $("healthDetails").textContent = h.score == null ? h.problem : `${h.problem} ${h.action}`;
  $("priorityAction").textContent = h.action;
  $("alerts").innerHTML = alerts.length ? alerts.map(a => `<div class="alert ${a.level}">${a.level === "danger" ? "🔴" : "🟠"} ${esc(a.text)}</div>`).join("") : `<div class="empty">🟢 Aucun problème critique détecté.</div>`;

  $("stockList").innerHTML = state.stock.length ? state.stock.map((x, i) => `<div class="list-row"><span><strong>${esc(x.product || "Produit")}</strong><small>${esc(x.sku || "Sans SKU")}</small></span><span>${x.qty} u. ${x.qty <= x.min ? "🔴" : "🟢"} <button data-action="delete-stock" data-index="${i}">Supprimer</button></span></div>`).join("") : `<div class="empty">Aucun stock enregistré.</div>`;
  $("cashList").innerHTML = state.cash.length ? state.cash.map((x, i) => `<div class="list-row"><span>${x.type === "in" ? "➕" : "➖"} ${esc(x.description || "Opération")}</span><span>${money(x.amount)} <button data-action="delete-cash" data-index="${i}">×</button></span></div>`).join("") : `<div class="empty">Aucune opération.</div>`;
  $("creativeList").innerHTML = state.creatives.length ? state.creatives.map((x, i) => `<div class="list-row"><span><strong>${esc(x.name || "Créatif")}</strong><small>CTR ${Number(x.ctr || 0).toFixed(2)} % · ${x.conversions || 0} conv.</small></span><span>ROAS ${Number(x.roas || 0).toFixed(2)} · <strong>${esc(classifyCreative(Number(x.roas || 0)))}</strong> <button data-action="delete-creative" data-index="${i}">×</button></span></div>`).join("") : `<div class="empty">Aucun test créatif.</div>`;
  $("actionList").innerHTML = state.actions.length ? state.actions.map((x, i) => `<label class="task"><input type="checkbox" data-action="toggle-action" data-index="${i}" ${x.done ? "checked" : ""}> <strong>${esc(x.priority)}</strong> — ${esc(x.text)}</label>`).join("") : `<div class="empty">Aucune action.</div>`;
  const done = state.tasks.filter(x => x.done).length;
  $("progress").textContent = `${Math.round(done / state.tasks.length * 100)} %`;
  $("tasks").innerHTML = state.tasks.map((x, i) => `<label class="task"><input type="checkbox" data-action="toggle-task" data-index="${i}" ${x.done ? "checked" : ""}> Jour ${x.day} — action e-commerce</label>`).join("");
}

function calculateLanded() {
  const result = calculateLandedCost({
    quantity: num("quantity"), productCost: num("productCost"), customization: num("customCost"), packaging: num("packCost"),
    factoryToChinaWarehouse: num("factoryToChinaWarehouse"), chinaExportFees: num("chinaExportFees"), internationalShipping: num("internationalShipping"), insurance: num("insurance"), customsClearance: num("customsClearance"), customsDuty: num("customsDuty"), portFees: num("portFees"), franceWarehouseTransport: num("franceWarehouseTransport"), inspection: num("inspection"), otherLogistics: num("otherLogistics")
  });
  $("landedResult").textContent = `${money(result.landedCostPerUnit)} / unité · ${money(result.totalCost)} total`;
  setInput("landedCost", result.landedCostPerUnit.toFixed(2));
}

function calculateProfit() {
  const r = calculateProfitability({
    sellingPrice: num("salePrice"), landedCost: num("landedCost"), variableFees: num("variableFees"),
    cac: state.inputs.orders ? state.inputs.ads / state.inputs.orders : 0, targetContribution: num("targetContribution")
  });
  $("profitResult").innerHTML = `<strong>${money(r.contribution)}</strong> contribution · ${(r.contributionMargin * 100).toFixed(1)} %<br><small>CAC max : ${money(r.maxCac)} · Prix minimum : ${money(r.minimumSellingPrice)}</small>`;
}

function savePilotInputs() {
  state.inputs = {
    ...state.inputs, ads: num("ads"), orders: num("orders"), revenue: num("revenue"), sellingPrice: num("salePrice"),
    landedCost: num("landedCost"), variableFees: num("variableFees"), targetContribution: num("targetContribution")
  };
  persist();
}

function bind() {
  document.querySelectorAll("[data-page]").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    $(b.dataset.page).classList.add("active");
    document.querySelectorAll("nav button").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
  }));

  $("landedForm").addEventListener("submit", e => { e.preventDefault(); calculateLanded(); });
  $("profitForm").addEventListener("submit", e => { e.preventDefault(); calculateProfit(); savePilotInputs(); });
  $("pilotForm").addEventListener("submit", e => { e.preventDefault(); savePilotInputs(); });

  $("stockForm").addEventListener("submit", e => {
    e.preventDefault();
    const product = $("stockProduct").value.trim();
    const qty = num("stockQty");
    const min = num("stockMin");
    if (!product) return;
    state.stock.push({ product, sku: $("stockSku").value.trim(), qty, min });
    $("stockForm").reset();
    persist();
  });

  $("cashForm").addEventListener("submit", e => {
    e.preventDefault();
    const amount = num("cashAmount");
    if (!amount) return;
    state.cash.push({ type: $("cashType").value, amount, description: $("cashDescription").value.trim() });
    $("cashForm").reset();
    persist();
  });

  $("creativeForm").addEventListener("submit", e => {
    e.preventDefault();
    const spend = num("creativeSpend"), revenue = num("creativeRevenue"), conversions = num("creativeConversions");
    state.creatives.push({ name: $("creativeName").value.trim(), spend, impressions: num("creativeImpressions"), ctr: num("creativeCTR"), conversions, revenue, roas: spend ? revenue / spend : 0 });
    $("creativeForm").reset();
    persist();
  });

  $("actionForm").addEventListener("submit", e => {
    e.preventDefault();
    const text = $("actionText").value.trim();
    if (!text) return;
    state.actions.push({ text, priority: $("actionPriority").value, done: false });
    $("actionForm").reset();
    persist();
  });

  document.addEventListener("click", e => {
    const b = e.target.closest("button[data-action]");
    if (!b) return;
    const i = Number(b.dataset.index), a = b.dataset.action;
    if (a === "delete-stock") state.stock.splice(i, 1);
    if (a === "delete-cash") state.cash.splice(i, 1);
    if (a === "delete-creative") state.creatives.splice(i, 1);
    persist();
  });

  document.addEventListener("change", e => {
    const el = e.target.closest("input[data-action]");
    if (!el) return;
    const i = Number(el.dataset.index);
    if (el.dataset.action === "toggle-action") state.actions[i].done = el.checked;
    if (el.dataset.action === "toggle-task") state.tasks[i].done = el.checked;
    persist();
  });
}

window.addEventListener("DOMContentLoaded", () => {
  for (const [id, value] of Object.entries({
    ads: state.inputs.ads, orders: state.inputs.orders, revenue: state.inputs.revenue, salePrice: state.inputs.sellingPrice,
    landedCost: state.inputs.landedCost, variableFees: state.inputs.variableFees, targetContribution: state.inputs.targetContribution
  })) setInput(id, value);
  bind();
  render();
  calculateLanded();
  calculateProfit();
});
