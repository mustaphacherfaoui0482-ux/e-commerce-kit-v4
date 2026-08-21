import { calculateProfitability } from "../engines/profitability-engine.js";
import { V4_RULES } from "./rules.js";

const levelFor = (value, good, warning) => value <= good ? "good" : value <= warning ? "warning" : "danger";

export function calculateBusinessHealth({
  sellingPrice = 0,
  landedCost = 0,
  variableFees = 0,
  ads = 0,
  orders = 0,
  revenue = 0,
  stock = [],
  cash = []
} = {}) {
  const safe = (value) => Math.max(0, Number(value) || 0);
  const safeOrders = safe(orders);
  const safeAds = safe(ads);
  const safeRevenue = safe(revenue);
  const price = safe(sellingPrice);
  const cost = safe(landedCost);
  const fees = safe(variableFees);
  const cac = safeOrders > 0 ? safeAds / safeOrders : 0;
  const roas = safeAds > 0 ? safeRevenue / safeAds : 0;
  const profitability = calculateProfitability({
    sellingPrice: price,
    landedCost: cost,
    variableFees: fees,
    cac
  });

  const stockItems = Array.isArray(stock) ? stock : [];
  const lowStock = stockItems.filter(item => safe(item.qty) <= safe(item.min)).length;
  const stockQty = stockItems.reduce((sum, item) => sum + safe(item.qty), 0);
  const cashItems = Array.isArray(cash) ? cash : [];
  const cashBalance = cashItems.reduce((sum, item) => sum + (item.type === "in" ? 1 : -1) * safe(item.amount), 0);

  if (safeOrders === 0 || safeRevenue === 0) {
    return {
      level: "insufficient",
      score: null,
      title: "⚪ Données insuffisantes",
      message: "Renseignez CA et commandes pour établir un diagnostic fiable.",
      cac,
      roas,
      ...profitability,
      contributionRate: profitability.contributionMargin,
      stockQty,
      lowStock,
      cashBalance,
      metrics: { cac: "insufficient", roas: "insufficient", contribution: "insufficient", stock: "insufficient", cash: "insufficient" },
      problem: "Données de vente insuffisantes.",
      action: "Renseigner les ventes et dépenses nécessaires au diagnostic."
    };
  }

  const metrics = {
    cac: levelFor(cac, V4_RULES.cac.good, V4_RULES.cac.warning),
    roas: roas >= V4_RULES.roas.good ? "good" : roas >= V4_RULES.roas.acceptable ? "good" : roas >= V4_RULES.roas.warning ? "warning" : "danger",
    contribution: profitability.contributionMargin >= V4_RULES.contributionMargin.good ? "good" : profitability.contributionMargin >= V4_RULES.contributionMargin.warning ? "warning" : "danger",
    stock: stockItems.length === 0 ? "unknown" : lowStock === 0 ? "good" : lowStock < stockItems.length ? "warning" : "danger",
    cash: cashItems.length === 0 ? "unknown" : cashBalance > 0 ? "good" : cashBalance === 0 ? "warning" : "danger"
  };

  const score = Math.max(0, Math.min(100, Math.round(
    (metrics.cac === "good" ? 25 : metrics.cac === "warning" ? 15 : 0) +
    (metrics.roas === "good" ? (roas >= 3 ? 25 : 20) : metrics.roas === "warning" ? 12 : 0) +
    (metrics.contribution === "good" ? 25 : metrics.contribution === "warning" ? 17 : 0) +
    (metrics.stock === "good" ? 10 : metrics.stock === "warning" ? 5 : 0) +
    (metrics.cash === "good" ? 15 : metrics.cash === "warning" ? 7 : 0)
  )));

  const priority = [
    [metrics.contribution === "danger", "Contribution insuffisante.", "Améliorer prix, coût rendu, frais variables ou CAC."],
    [metrics.cac === "danger", "CAC trop élevé.", "Réduire le CAC avant d'augmenter le budget publicitaire."],
    [metrics.roas === "danger", "ROAS insuffisant.", "Optimiser campagnes et créatifs avant de scaler."],
    [metrics.cash === "danger", "Trésorerie négative.", "Sécuriser la trésorerie avant toute accélération."],
    [metrics.stock === "danger", "Risque de rupture de stock.", "Réapprovisionner les produits critiques."],
    [metrics.stock === "warning", "Stock à surveiller.", "Vérifier les seuils de réapprovisionnement."]
  ].find(([condition]) => condition);

  const incomplete = stockItems.length === 0 || cashItems.length === 0;
  const level = score >= 75 && !incomplete ? "good" : score >= 50 ? "warning" : "danger";
  const title = level === "good" ? "🟢 Business sain" : level === "warning" ? "🟠 Business à surveiller" : "🔴 Business sous pression";
  const message = level === "good"
    ? "Les indicateurs disponibles sont cohérents."
    : level === "warning"
      ? "Le diagnostic est exploitable, mais certains leviers ou données doivent être surveillés."
      : "Corrigez les indicateurs critiques avant d'augmenter les dépenses.";

  return {
    level,
    score,
    title,
    message,
    cac,
    roas,
    ...profitability,
    contributionRate: profitability.contributionMargin,
    stockQty,
    lowStock,
    cashBalance,
    metrics,
    problem: priority ? priority[1] : "Aucun problème critique détecté.",
    action: priority ? priority[2] : "Continuer l'optimisation et surveiller les KPI."
  };
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
