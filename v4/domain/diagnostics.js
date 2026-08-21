import { calculateProfitability } from "../engines/profitability-engine.js";
import { V4_RULES } from "./rules.js";

const cacLevel = (value) => value <= V4_RULES.cac.good ? "good" : value <= V4_RULES.cac.warning ? "warning" : "danger";

export function calculateBusinessHealth({
  sellingPrice = 0,
  landedCost = 0,
  variableFees = 0,
  ads = 0,
  orders = 0,
  revenue = 0,
  stock = [],
  cash = [],
} = {}) {
  const safeOrders = Math.max(0, Number(orders) || 0);
  const safeAds = Math.max(0, Number(ads) || 0);
  const safeRevenue = Math.max(0, Number(revenue) || 0);
  const cac = safeOrders > 0 ? safeAds / safeOrders : 0;
  const roas = safeAds > 0 ? safeRevenue / safeAds : 0;
  const profitability = calculateProfitability({ sellingPrice, landedCost, variableFees, cac });

  const stockItems = Array.isArray(stock) ? stock : [];
  const lowStock = stockItems.filter(item => Number(item.qty || 0) <= Number(item.min || 0)).length;
  const stockQty = stockItems.reduce((sum, item) => sum + Math.max(0, Number(item.qty) || 0), 0);
  const cashItems = Array.isArray(cash) ? cash : [];
  const cashBalance = cashItems.reduce((sum, item) => sum + (item.type === "in" ? 1 : -1) * Math.max(0, Number(item.amount) || 0), 0);

  if (safeOrders === 0 || safeRevenue === 0) {
    return {
      level: "insufficient", score: null, title: "⚪ Données insuffisantes",
      message: "Renseignez CA et commandes pour établir un diagnostic fiable.",
      cac, roas, ...profitability, contributionRate: profitability.contributionMargin,
      stockQty, lowStock, cashBalance,
      metrics: { cac: "insufficient", roas: "insufficient", contribution: "insufficient", stock: "insufficient", cash: "insufficient" },
      problem: "Données de vente insuffisantes.",
      action: "Renseigner les ventes, commandes et dépenses publicitaires.",
    };
  }

  const metrics = {
    cac: cacLevel(cac),
    roas: roas >= V4_RULES.roas.good ? "good" : roas >= V4_RULES.roas.acceptable ? "good" : roas >= V4_RULES.roas.warning ? "warning" : "danger",
    contribution: profitability.contributionMargin >= V4_RULES.contributionMargin.good ? "good" : profitability.contributionMargin >= V4_RULES.contributionMargin.warning ? "warning" : "danger",
    stock: stockItems.length === 0 ? "unknown" : lowStock === 0 ? "good" : lowStock < stockItems.length ? "warning" : "danger",
    cash: cashBalance > 0 ? "good" : cashBalance === 0 ? "unknown" : "danger",
  };

  const score = Math.max(0, Math.min(100, Math.round(
    (metrics.cac === "good" ? 25 : metrics.cac === "warning" ? 15 : 0) +
    (metrics.roas === "good" ? (roas >= 3 ? 25 : 20) : metrics.roas === "warning" ? 12 : 0) +
    (metrics.contribution === "good" ? 25 : metrics.contribution === "warning" ? 17 : 0) +
    (metrics.stock === "good" ? 10 : metrics.stock === "warning" ? 5 : 0) +
    (metrics.cash === "good" ? 15 : metrics.cash === "warning" ? 7 : 0)
  )));

  let problem = "Aucun problème critique détecté.";
  let action = "Continuer l'optimisation et surveiller les KPI.";
  const priority = [
    [metrics.contribution === "danger", "Contribution insuffisante.", "Améliorer prix, coût rendu, frais variables ou CAC."],
    [metrics.cac === "danger", "CAC trop élevé.", "Réduire le CAC avant d'augmenter le budget publicitaire."],
    [metrics.roas === "danger", "ROAS insuffisant.", "Optimiser campagnes et créatifs avant de scaler."],
    [metrics.cash === "danger", "Trésorerie négative.", "Sécuriser la trésorerie avant toute accélération."],
    [metrics.stock === "danger", "Risque de rupture de stock.", "Réapprovisionner les produits critiques."],
    [metrics.stock === "warning" && lowStock > 0, "Stock à surveiller.", "Vérifier les seuils de réapprovisionnement."],
  ].find(([condition]) => condition);
  if (priority) [, problem, action] = priority;

  const incomplete = stockItems.length === 0 || cashItems.length === 0;
  const health = score >= 75 && !incomplete
    ? ["good", "🟢 Business sain", "Les indicateurs sont cohérents."]
    : score >= 50
      ? ["warning", "🟠 Données partielles", "Le diagnostic est exploitable, mais stock ou trésorerie ne sont pas encore renseignés."]
      : ["danger", "🔴 Business sous pression", "Corrigez les indicateurs critiques avant d'augmenter les dépenses."];

  return { level: health[0], score, title: health[1], message: health[2], cac, roas, ...profitability, contributionRate: profitability.contributionMargin, stockQty, lowStock, cashBalance, metrics, problem, action };
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
