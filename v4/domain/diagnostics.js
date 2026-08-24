import { calculateProfitability } from "../engines/profitability-engine.js";
import { V4_RULES } from "./rules.js";

const toNumber = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
const levelFor = (value, good, warning) => value === null ? "unknown" : value <= good ? "good" : value <= warning ? "warning" : "danger";

export function calculateBusinessHealth({
  sellingPrice,
  landedCost,
  variableFees,
  ads,
  orders,
  newCustomers,
  revenue,
  stock,
  cash,
  targetContribution
} = {}) {
  const price = toNumber(sellingPrice);
  const cost = toNumber(landedCost);
  const fees = toNumber(variableFees);
  const adSpend = toNumber(ads);
  const orderCount = toNumber(orders);
  const newCustomerCount = toNumber(newCustomers);
  const revenueValue = toNumber(revenue);
  const stockItems = Array.isArray(stock) ? stock : [];
  const cashItems = Array.isArray(cash) ? cash : [];
  const stockRows = stockItems.map((item) => ({ qty: toNumber(item?.qty), min: toNumber(item?.min) }));
  const knownStockRows = stockRows.filter((item) => item.qty !== null && item.min !== null);
  const stockQty = stockRows.every((item) => item.qty !== null) ? stockRows.reduce((sum, item) => sum + item.qty, 0) : null;
  const lowStock = knownStockRows.length === stockRows.length ? knownStockRows.filter((item) => item.qty <= item.min).length : null;
  const cashAmounts = cashItems.map((item) => ({ type: item?.type, amount: toNumber(item?.amount) }));
  const cashBalance = cashAmounts.length > 0 && cashAmounts.every((item) => item.amount !== null && (item.type === "in" || item.type === "out"))
    ? cashAmounts.reduce((sum, item) => sum + (item.type === "in" ? item.amount : -item.amount), 0) : null;
  const cac = adSpend !== null && newCustomerCount !== null && newCustomerCount > 0 ? adSpend / newCustomerCount : null;
  const roas = adSpend !== null && revenueValue !== null && adSpend > 0 ? revenueValue / adSpend : null;
  const contributionBeforeAds = price !== null && cost !== null && fees !== null ? price - cost - fees : null;
  const contribution = contributionBeforeAds !== null && cac !== null ? contributionBeforeAds - cac : null;
  const contributionMargin = contribution !== null && price !== null && price > 0 ? contribution / price : null;
  const profitabilityInput = { sellingPrice: price, landedCost: cost, variableFees: fees, cac, targetContribution: toNumber(targetContribution) };
  const profitability = Object.values(profitabilityInput).every((value) => value !== null) ? calculateProfitability(profitabilityInput) : {
    complete: false,
    missingFields: Object.entries(profitabilityInput).filter(([, value]) => value === null).map(([field]) => field),
    contributionBeforeAds, contribution, contributionMargin, maxCac: null, minimumSellingPrice: null, profitable: null
  };
  if (orderCount === null || revenueValue === null || orderCount === 0) {
    return { level: "insufficient", score: null, title: "⚪ Données insuffisantes", message: "Renseignez CA et commandes pour établir un diagnostic fiable.", cac, roas, ...profitability, contributionRate: contributionMargin, stockQty, lowStock, cashBalance,
      metrics: { cac: "unknown", roas: "unknown", contribution: "unknown", stock: "unknown", cash: "unknown" },
      problem: "Données de vente insuffisantes.", action: "Renseigner les ventes et dépenses nécessaires au diagnostic." };
  }
  const metrics = {
    cac: levelFor(cac, V4_RULES.cac.good, V4_RULES.cac.warning),
    roas: roas === null ? "unknown" : roas >= V4_RULES.roas.good ? "good" : roas >= V4_RULES.roas.acceptable ? "good" : roas >= V4_RULES.roas.warning ? "warning" : "danger",
    contribution: contributionMargin === null ? "unknown" : contributionMargin >= V4_RULES.contributionMargin.good ? "good" : contributionMargin >= V4_RULES.contributionMargin.warning ? "warning" : "danger",
    stock: stockRows.length === 0 ? "unknown" : lowStock === null ? "unknown" : lowStock === 0 ? "good" : lowStock < stockRows.length ? "warning" : "danger",
    cash: cashItems.length === 0 ? "unknown" : cashBalance === null ? "unknown" : cashBalance > 0 ? "good" : cashBalance === 0 ? "warning" : "danger"
  };
  const score = Math.max(0, Math.min(100, Math.round((metrics.cac === "good" ? 25 : metrics.cac === "warning" ? 15 : 0) + (metrics.roas === "good" ? (roas >= 3 ? 25 : 20) : metrics.roas === "warning" ? 12 : 0) + (metrics.contribution === "good" ? 25 : metrics.contribution === "warning" ? 17 : 0) + (metrics.stock === "good" ? 10 : metrics.stock === "warning" ? 5 : 0) + (metrics.cash === "good" ? 15 : metrics.cash === "warning" ? 7 : 0))));
  const priority = [[metrics.contribution === "danger", "Contribution insuffisante.", "Améliorer prix, coût rendu, frais variables ou CAC."], [metrics.cac === "danger", "CAC trop élevé.", "Réduire le CAC avant d'augmenter le budget publicitaire."], [metrics.roas === "danger", "ROAS insuffisant.", "Optimiser campagnes et créatifs avant de scaler."], [metrics.cash === "danger", "Trésorerie négative.", "Sécuriser la trésorerie avant toute accélération."], [metrics.stock === "danger", "Risque de rupture de stock.", "Réapprovisionner les produits critiques."], [metrics.stock === "warning", "Stock à surveiller.", "Vérifier les seuils de réapprovisionnement."]].find(([condition]) => condition);
  const incomplete = Object.values(metrics).some((status) => status === "unknown");
  const level = score >= 75 && !incomplete ? "good" : score >= 50 ? "warning" : "danger";
  const title = level === "good" ? "🟢 Business sain" : level === "warning" ? "🟠 Business à surveiller" : "🔴 Business sous pression";
  const message = level === "good" ? "Les indicateurs disponibles sont cohérents." : level === "warning" ? "Le diagnostic est exploitable, mais certains leviers ou données doivent être surveillés." : "Corrigez les indicateurs critiques avant d'augmenter les dépenses.";
  return { level, score, title, message, cac, roas, ...profitability, contributionRate: contributionMargin, stockQty, lowStock, cashBalance, metrics, problem: priority ? priority[1] : "Aucun problème critique détecté.", action: priority ? priority[2] : "Continuer l'optimisation et surveiller les KPI." };
}

export function buildAlerts(health) {
  if (!health || health.level === "insufficient") return [];
  const alerts = [];
  if (health.metrics.cac === "danger") alerts.push({ level: "danger", text: `CAC élevé : ${health.cac.toFixed(2)} €` });
  if (health.metrics.roas === "danger") alerts.push({ level: "danger", text: `ROAS faible : ${health.roas.toFixed(2)}` });
  if (health.metrics.contribution === "danger") alerts.push({ level: "danger", text: `Contribution faible : ${(health.contributionRate * 100).toFixed(1)} %` });
  if ((health.metrics.stock === "danger" || health.metrics.stock === "warning") && health.lowStock > 0) alerts.push({ level: health.metrics.stock, text: `Stock à surveiller : ${health.lowStock} référence(s)` });
  if (health.metrics.cash === "danger") alerts.push({ level: "danger", text: `Trésorerie négative : ${health.cashBalance.toFixed(2)} €` });
  return alerts;
}
