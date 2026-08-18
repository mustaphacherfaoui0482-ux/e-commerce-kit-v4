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

    if (orders <= 0 || revenue <= 0) {
      return {
        level: "insufficient",
        score: 0,
        title: "⚪ Données insuffisantes",
        message:
          "Renseignez suffisamment de données pour obtenir un diagnostic fiable.",
        details:
          "CA et commandes sont nécessaires pour analyser la santé du business."
      };
    }

    let score = 0;
    const signals = [];

    // CAC
    if (cac <= 15) {
      score += 30;
      signals.push("CAC sain");
    } else if (cac <= 18) {
      score += 18;
      signals.push("CAC à surveiller");
    } else {
      signals.push("CAC trop élevé");
    }

    // ROAS
    if (roas >= 3) {
      score += 30;
      signals.push("ROAS solide");
    } else if (roas >= 2.5) {
      score += 24;
      signals.push("ROAS correct");
    } else if (roas >= 2) {
      score += 12;
      signals.push("ROAS sous la zone saine");
    } else {
      signals.push("ROAS faible");
    }

    // Contribution
    if (contributionRate >= 20) {
      score += 25;
      signals.push("contribution solide");
    } else if (contributionRate >= 10) {
      score += 17;
      signals.push("contribution à surveiller");
    } else if (contributionRate > 0) {
      score += 8;
      signals.push("contribution faible");
    } else {
      signals.push("contribution négative");
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

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
        "Le business fonctionne, mais un ou plusieurs leviers peuvent rapidement dégrader la rentabilité.";
    } else {
      level = "danger";
      title = "🔴 Business sous pression";
      message =
        "La priorité est de corriger la rentabilité avant de chercher à accélérer.";
    }

    return {
      level,
      score,
      title,
      message,
      details:
        signals.join(" • ") +
        "<br>" +
        "Contribution après publicité / commande : " +
        euro(contribution) +
        " • Taux : " +
        contributionRate.toFixed(1) +
        " %"
    };
  }

  window.updateBusinessHealth = function () {
    const status = document.getElementById("businessHealthStatus");
    const message = document.getElementById("businessHealthMessage");
    const details = document.getElementById("businessHealthDetails");
    const card = document.getElementById("businessHealthCard");

    if (!status || !message) return;

    const health = getBusinessHealth();

    status.textContent =
      health.level === "insufficient"
        ? health.title
        : health.title + " • " + health.score + " / 100";

    message.textContent = health.message;

    if (details) {
      details.innerHTML = health.details;
    }

    if (card) {
      card.className = "card health";

      if (health.level === "good") {
        card.classList.add("good");
      } else if (health.level === "warning") {
        card.classList.add("warning");
      } else if (health.level === "danger") {
        card.classList.add("danger");
      }
    }
  };

  window.addEventListener("DOMContentLoaded", function () {
    updateBusinessHealth();
  });

})();
