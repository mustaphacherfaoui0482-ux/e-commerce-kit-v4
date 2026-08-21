import { calculateBusinessHealth, buildAlerts } from './diagnostics.js';

const insufficient = calculateBusinessHealth();
if (insufficient.score !== null || insufficient.level !== 'insufficient') {
  throw new Error('Un jeu de données vide ne doit pas produire un score de santé.');
}

const healthy = calculateBusinessHealth({
  sellingPrice: 40,
  landedCost: 10,
  variableFees: 2,
  ads: 100,
  orders: 10,
  revenue: 400,
  stock: [{ qty: 100, min: 20 }],
  cash: [{ type: 'in', amount: 1000 }]
});

if (healthy.score === null || healthy.level === 'insufficient') {
  throw new Error('Des données cohérentes doivent produire un diagnostic exploitable.');
}

const danger = calculateBusinessHealth({
  sellingPrice: 30,
  landedCost: 20,
  variableFees: 2,
  ads: 300,
  orders: 10,
  revenue: 300,
  stock: [{ qty: 5, min: 20 }],
  cash: [{ type: 'out', amount: 100 }]
});

const alerts = buildAlerts(danger);
if (!alerts.some(a => a.text.includes('CAC'))) {
  throw new Error('Un CAC supérieur au seuil doit générer une alerte.');
}
if (!alerts.some(a => a.text.includes('ROAS'))) {
  throw new Error('Un ROAS insuffisant doit générer une alerte.');
}

console.log('BusinessHealth : tous les tests sont passés.');
