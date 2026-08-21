import fs from 'node:fs';

const path = 'index.html';
let html = fs.readFileSync(path, 'utf8');

const cleanUpdateOrderProducts = `function updateOrderProducts(){
  const select = document.getElementById("orderProduct");
  if(!select) return;
  select.innerHTML = "";
  data.stock.forEach(item => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.product + (item.sku ? " • " + item.sku : "") + " — " + item.qty + " disponibles";
    select.appendChild(option);
  });
}
function addCash(){`;

const pattern = /function updateOrderProducts\(\)\{[\s\S]*?\nfunction addCash\(\)\{/;
if (!pattern.test(html)) {
  throw new Error('Impossible de localiser updateOrderProducts() dans index.html.');
}
html = html.replace(pattern, cleanUpdateOrderProducts);

const runtimeTag = '<script type="module" src="./app.js"></script>';
if (!html.includes(runtimeTag)) {
  html = html.replace('</body>', `  ${runtimeTag}\n</body>`);
}

if ((html.match(/function updateOrderProducts\(\)/g) || []).length !== 1) {
  throw new Error('updateOrderProducts() doit apparaître exactement une fois.');
}
if ((html.match(/<script type="module" src="\.\/app\.js"><\/script>/g) || []).length !== 1) {
  throw new Error('app.js doit être chargé exactement une fois.');
}

fs.writeFileSync(path, html);
console.log('Vercel artifact preparation: OK');
