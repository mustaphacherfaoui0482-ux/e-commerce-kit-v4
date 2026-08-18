(function () {
  "use strict";

  function number(id) {
    const el = document.getElementById(id);
    return el ? Number(el.value || 0) : 0;
  }

  function euro(value) {
    return Number(value || 0).toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR"
    });
  }

  function getSavedData() {
    try {
      return JSON.parse(
        localStorage.getItem("ecommerce_kit_v4") ||
        '{"stock":[],"cash":[]}'
      );
    } catch (error) {
      return {
        stock: [],
        cash: []
      };
    }
  }

  function statusIcon(level) {
    if (level === "good") return "🟢";
    if (level === "warning") return "🟠";
    if (level === "danger") return "🔴";
    return "⚪";
  }

  function getBusinessHealth() {
    const ads = number("ads");
    const orders = number("orders");
    const revenue = number("revenue");

    const salePrice = number("salePrice");
    const landedCost = number("landedCost");

    const cac = orders > 0 ? ads / orders : 0;
    const roas = ads > 0 ? revenue / ads : 0;

    const contribution =
      salePrice > 0
        ? salePrice - landedCost - cac
        : 0;

    const contributionRate =
      salePrice > 0
        ? (contribution / salePrice) * 100
        : 0;

    const savedData = getSavedData();

    const stockItems = Array.isArray(savedData.stock)
      ? savedData.stock
      : [];

    const cashItems = Array.isArray(savedData.cash)
      ? savedData.cash
      : [];

    const stockQty = stockItems.reduce(
      (total, item) => total + Number(item.qty || 0),
      0
    );

    const lowStock = stockItems.filter(
      item => Number(item.qty || 0) <= Number(item.min || 0)
    ).length;

    const cashBalance = cashItems.reduce(
      (total, item) =>
        total +
        (
          item.type === "in"
            ? Number(item.amount || 0)
            : -Number(item.amount || 0)
        ),
      0
    );

    if (orders <= 0 || revenue <= 0) {
      return {
        level: "insufficient",
        score: 0,
        title: "⚪ Données insuffisantes",
        message:
          "Renseignez suffisamment de données pour obtenir un diagnostic fiable.",
        cac,
        roas,
        contribution,
        contributionRate,
        stockQty,
        lowStock,
        cashBalance,
        cacLevel: "insufficient",
        roasLevel: "insufficient",
        contributionLevel: "insufficient",
        stockLevel: "insufficient",
        cashLevel: "insufficient",
        problem:
          "CA et commandes sont nécessaires pour établir un diagnostic.",
        action:
          "Renseigner les données de vente et d'acquisition."
      };
    }

    let score = 0;

    let cacLevel = "danger";
    let roasLevel = "danger";
    let contributionLevel = "danger";
    let stockLevel = "good";
    let cashLevel = "good";

    /*
     * CAC — 25 points
     */
    if (cac <= 15) {
      score += 25;
      cacLevel = "good";
    } else if (cac <= 18) {
      score += 15;
      cacLevel = "warning";
    }

    /*
     * ROAS — 25 points
     */
    if (roas >= 3) {
      score += 25;
      roasLevel = "good";
    } else if (roas >= 2.5) {
      score += 20;
      roasLevel = "good";
    } else if (roas >= 2) {
      score += 12;
      roasLevel = "warning";
    }

    /*
     * Contribution — 25 points
     */
    if (contributionRate >= 20) {
      score += 25;
      contributionLevel = "good";
    } else if (contributionRate >= 10) {
      score += 17;
      contributionLevel = "warning";
    } else if (contributionRate > 0) {
      score += 8;
      contributionLevel = "warning";
    }

    /*
     * Stock — 10 points
     */
    if (stockItems.length === 0) {
      score += 5;
      stockLevel = "warning";
    } else if (lowStock === 0) {
      score += 10;
      stockLevel = "good";
    } else if (lowStock < stockItems.length) {
      score += 5;
      stockLevel = "warning";
    } else {
      stockLevel = "danger";
    }

    /*
     * Trésorerie — 15 points
     */
    if (cashItems.length === 0) {
      score += 7;
      cashLevel = "warning";
    } else if (cashBalance > 0) {
      score += 15;
      cashLevel = "good";
    } else if (cashBalance === 0) {
      score += 7;
      cashLevel = "warning";
    } else {
      cashLevel = "danger";
    }

    score = Math.max(
      0,
      Math.min(100, Math.round(score))
    );

    let level;
    let title;
    let message;

    if (score >= 75) {
      level = "good";
      title = "🟢 Business sain";
      message =
        "Les principaux indicateurs sont cohérents. Le business peut être optimisé sans augmenter inutilement le risque.";
    } else if (score >= 50) {
      level = "warning";
      title = "🟠 Business à surveiller";
      message =
        "Le business fonctionne, mais certains leviers doivent être surveillés avant d'accélérer.";
    } else {
      level = "danger";
      title = "🔴 Business sous pression";
      message =
        "La priorité est de corriger les indicateurs critiques avant d'augmenter les dépenses.";
    }

    let problem;
    let action;

    if (contributionLevel === "danger") {
      problem = "Contribution trop faible ou négative.";
      action =
        "Améliorer la contribution par commande : prix, coût rendu ou CAC.";
    } else if (cacLevel === "danger") {
      problem = "CAC trop élevé.";
      action =
        "Réduire le CAC avant d'augmenter le budget publicitaire.";
    } else if (roasLevel === "danger") {
      problem = "ROAS insuffisant.";
      action =
        "Optimiser les campagnes et les créatifs avant de scaler.";
    } else if (cashLevel === "danger") {
      problem = "Trésorerie négative.";
      action =
        "Sécuriser la trésorerie avant toute accélération.";
    } else if (stockLevel === "danger") {
      problem = "Risque de rupture de stock.";
      action =
        "Réapprovisionner les produits critiques.";
    } else if (stockLevel === "warning") {
      problem = "Stock à surveiller.";
      action =
        "Vérifier les seuils de réapprovisionnement.";
    } else {
      problem = "Aucun problème critique détecté.";
      action =
        "Continuer l'optimisation et surveiller les KPI.";
    }

    return {
      level,
      score,
      title,
      message,
      cac,
      roas,
      contribution,
      contributionRate,
      stockQty,
      lowStock,
      cashBalance,
      cacLevel,
      roasLevel,
      contributionLevel,
      stockLevel,
      cashLevel,
      problem,
      action
    };
  }

  function createRow(label, value, level) {
    return `
      <tr>
        <td style="padding:9px 6px;">
          ${label}
        </td>

        <td style="
          padding:9px 6px;
          text-align:right;
          font-weight:600;
        ">
          ${value}
        </td>

        <td style="
          padding:9px 6px;
          text-align:center;
        ">
          ${statusIcon(level)}
        </td>
      </tr>
    `;
  }

  window.updateBusinessHealth = function () {
    const status =
      document.getElementById("businessHealthStatus");

    const message =
      document.getElementById("businessHealthMessage");

    const details =
      document.getElementById("businessHealthDetails");

    const card =
      document.getElementById("businessHealthCard");

    if (!status || !message) return;

    const health = getBusinessHealth();

    status.innerHTML =
      health.level === "insufficient"
        ? health.title
        : health.title +
          " • " +
          health.score +
          " / 100";

    message.textContent = health.message;

    if (details) {
      details.innerHTML = `

        <div style="
          margin-top:16px;
          overflow-x:auto;
        ">

          <table style="
            width:100%;
            border-collapse:collapse;
          ">

            <thead>
              <tr>

                <th style="
                  text-align:left;
                  padding:8px 6px;
                ">
                  KPI
                </th>

                <th style="
                  text-align:right;
                  padding:8px 6px;
                ">
                  Valeur
                </th>

                <th style="
                  text-align:center;
                  padding:8px 6px;
                ">
                  État
                </th>

              </tr>
            </thead>

            <tbody>

              ${createRow(
                "🎯 CAC",
                health.orders <= 0
                  ? "—"
                  : euro(health.cac),
                health.cacLevel
              )}

              ${createRow(
                "📈 ROAS",
                health.orders <= 0
                  ? "—"
                  : health.roas.toFixed(2),
                health.roasLevel
              )}

              ${createRow(
                "💰 Contribution",
                health.orders <= 0
                  ? "—"
                  : euro(health.contribution) +
                    " • " +
                    health.contributionRate.toFixed(1) +
                    "%",
                health.contributionLevel
              )}

              ${createRow(
                "📦 Stock",
                health.stockQty +
                  " unités" +
                  (
                    health.lowStock > 0
                      ? " • " +
                        health.lowStock +
                        " faible(s)"
                      : ""
                  ),
                health.stockLevel
              )}

              ${createRow(
                "💧 Trésorerie",
                euro(health.cashBalance),
                health.cashLevel
              )}

            </tbody>

          </table>

        </div>

        <div style="
          margin-top:16px;
          padding:12px;
          border-radius:10px;
          background:rgba(0,0,0,.04);
        ">

          <strong>
            🚨 Problème principal
          </strong>

          <br>

          ${health.problem}

        </div>

        <div style="
          margin-top:10px;
          padding:12px;
          border-radius:10px;
          background:rgba(0,0,0,.04);
        ">

          <strong>
            🎯 Action prioritaire
          </strong>

          <br>

          ${health.action}

        </div>
      `;
    }

    if (card) {
      card.className = "card health";

      if (health.level === "good") {
        card.classList.add("good");
      }

      if (health.level === "warning") {
        card.classList.add("warning");
      }

      if (health.level === "danger") {
        card.classList.add("danger");
      }
    }
  };

  window.addEventListener(
    "DOMContentLoaded",
    function () {
      window.updateBusinessHealth();
    }
  );

})();
