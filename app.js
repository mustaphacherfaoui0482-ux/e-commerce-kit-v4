import { calculateLandedCost } from './v4/engines/landed-cost-engine.js';
import { calculateProfitability } from './v4/engines/profitability-engine.js';
import { calculateBusinessHealth, buildAlerts } from './v4/domain/diagnostics.js';
import { classifyCreative, V4_RULES } from './v4/domain/rules.js';
import { loadStore, saveStore } from './v4/state/store.js';

let state = loadStore();
const $ = (id) => document.getElementById(id);
const money = (v) => Number(v || 0).toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
const n = (id) => Math.max(0, Number($(id)?.value || 0));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

function persist(){ state=saveStore(state); render(); }
function syncInputs(){ state.inputs={...state.inputs,ads:n('ads'),orders:n('orders'),revenue:n('revenue'),sellingPrice:n('salePrice'),landedCost:n('landedCost'),variableFees:n('variableFees'),targetContribution:n('targetContribution')}; }
function injectField(form,id,label,value='0'){ if($(id)) return; const wrap=document.createElement('div'); wrap.className='field'; wrap.innerHTML=`<label>${label}</label><input id="${id}" type="number" min="0" step="0.01" value="${value}">`; (form.querySelector('.form-grid')||form).appendChild(wrap); }
function prepareForms(){ const landed=$('calculer')?.querySelector('h3')?.parentElement; if(landed){ injectField(landed,'quantity','Quantité','100'); injectField(landed,'factoryToChinaWarehouse','Usine → entrepôt Chine'); injectField(landed,'chinaExportFees','Frais export Chine'); injectField(landed,'internationalShipping','Transport international'); injectField(landed,'insurance','Assurance'); injectField(landed,'customsClearance','Dédouanement'); injectField(landed,'customsDuty','Droits de douane'); injectField(landed,'portFees','Frais portuaires'); injectField(landed,'franceWarehouseTransport','Transport France'); injectField(landed,'inspection','Inspection / QC'); injectField(landed,'otherLogistics','Autres logistiques'); } const profit=$('calculer')?.querySelectorAll('.card')[1]; if(profit){ injectField(profit,'variableFees','Frais variables / vente'); injectField(profit,'targetContribution','Contribution cible','5'); } }

function showPage(page,button){ document.querySelectorAll('.page').forEach(p=>p.classList.remove('active')); const target=$(page); if(target) target.classList.add('active'); document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active')); if(button) button.classList.add('active'); }
window.showPage=showPage;

function calculateLanded(){ const r=calculateLandedCost({quantity:n('quantity'),productCost:n('productCost'),customization:n('customCost'),packaging:n('packCost'),factoryToChinaWarehouse:n('factoryToChinaWarehouse'),chinaExportFees:n('chinaExportFees'),internationalShipping:n('internationalShipping'),insurance:n('insurance'),customsClearance:n('customsClearance'),customsDuty:n('customsDuty'),portFees:n('portFees'),franceWarehouseTransport:n('franceWarehouseTransport'),inspection:n('inspection'),otherLogistics:n('otherLogistics')}); if($('landedResult')) $('landedResult').textContent=`${money(r.landedCostPerUnit)} / unité · ${money(r.totalCost)} total`; if($('landedCost')) $('landedCost').value=r.landedCostPerUnit.toFixed(2); state.inputs.landedCost=r.landedCostPerUnit; saveStore(state); render(); return r; }
window.calculateLanded=calculateLanded;

function calculateMargin(){ syncInputs(); const p=calculateProfitability({sellingPrice:n('salePrice'),landedCost:n('landedCost'),variableFees:n('variableFees'),cac:state.inputs.orders?state.inputs.ads/state.inputs.orders:0,targetContribution:n('targetContribution')}); if(!state.inputs.orders || !state.inputs.revenue){ if($('marginResult')) $('marginResult').textContent='— Données insuffisantes'; return p; } if($('marginResult')) $('marginResult').innerHTML=`${money(p.contribution)} • ${(p.contributionMargin*100).toFixed(1)} %`; return p; }
window.calculateMargin=calculateMargin;
function calculateKPI(){ syncInputs(); persist(); if($('kpiResult')) $('kpiResult').innerHTML=`CAC : ${state.inputs.orders?money(state.inputs.ads/state.inputs.orders):'—'}<br>ROAS : ${state.inputs.ads?(state.inputs.revenue/state.inputs.ads).toFixed(2):'—'}`; }
window.calculateKPI=calculateKPI;

function addStock(){ const product=$('stockProduct')?.value.trim(); if(!product)return; state.stock.push({id:Date.now(),product,sku:$('stockSku')?.value.trim()||'',qty:n('stockQty'),min:n('stockMin')}); $('stockProduct').value=''; $('stockSku').value=''; $('stockQty').value=''; $('stockMin').value=''; persist(); }
window.addStock=addStock;
function stockEntry(id){ const x=state.stock.find(v=>v.id===id); if(!x)return; const q=Number(prompt('Quantité à ajouter :')||0); if(q>0){x.qty+=q;persist();} }
window.stockEntry=stockEntry;
function stockExit(id){ const x=state.stock.find(v=>v.id===id); if(!x)return; const q=Number(prompt('Quantité à retirer :')||0); if(q>0&&q<=x.qty){x.qty-=q;persist();} }
window.stockExit=stockExit;
function deleteStock(id){ state.stock=state.stock.filter(v=>v.id!==id); persist(); }
window.deleteStock=deleteStock;
function updateOrderProducts(){ const s=$('orderProduct'); if(!s)return; s.innerHTML=state.stock.map(x=>`<option value="${x.id}">${esc(x.product)} — ${x.qty} disponibles</option>`).join(''); }
window.updateOrderProducts=updateOrderProducts;
function addProductOrder(){ const id=Number($('orderProduct')?.value),q=Math.floor(n('orderQty')); const x=state.stock.find(v=>v.id===id); if(!x||q<1||q>x.qty)return; x.qty-=q; state.inputs.orders+=q; persist(); if($('orderQty'))$('orderQty').value=''; }
window.addProductOrder=addProductOrder;
function addCash(){ const amount=n('cashAmount'); if(!amount)return; state.cash.push({type:$('cashType')?.value||'in',amount,description:$('cashDescription')?.value.trim()||'Opération'}); persist(); }
window.addCash=addCash;
function addCreative(){ const spend=n('creativeSpend'),revenue=n('creativeRevenue'); state.creatives.push({name:$('creativeName')?.value.trim()||'Créatif',spend,impressions:n('creativeImpressions'),ctr:n('creativeCTR'),conversions:n('creativeConversions'),revenue,roas:spend?revenue/spend:0}); persist(); }
window.addCreative=addCreative;
function addAction(){ const text=$('actionText')?.value.trim(); if(!text)return; state.actions.push({text,priority:$('actionPriority')?.value||'À FAIRE',done:false}); persist(); }
window.addAction=addAction;
function toggleAction(i){ if(state.actions[i])state.actions[i].done=!state.actions[i].done; persist(); }
window.toggleAction=toggleAction;
function toggleTask(i){ if(state.tasks[i])state.tasks[i].done=!state.tasks[i].done; persist(); }
window.toggleTask=toggleTask;

function render(){ syncInputs(); const h=calculateBusinessHealth({...state.inputs,stock:state.stock,cash:state.cash}); const alerts=buildAlerts(h); if($('ca'))$('ca').textContent=state.inputs.revenue?money(state.inputs.revenue):'—'; if($('ordersDisplay'))$('ordersDisplay').textContent=state.inputs.orders||'—'; if($('cacDisplay'))$('cacDisplay').textContent=state.inputs.orders?money(state.inputs.ads/state.inputs.orders):'—'; if($('roasDisplay'))$('roasDisplay').textContent=state.inputs.ads?(state.inputs.revenue/state.inputs.ads).toFixed(2):'—'; if($('aov'))$('aov').textContent=state.inputs.orders?money(state.inputs.revenue/state.inputs.orders):'—'; const stockQty=state.stock.reduce((s,x)=>s+Number(x.qty||0),0); if($('stockTotal'))$('stockTotal').textContent=stockQty; const cash=state.cash.reduce((s,x)=>s+(x.type==='in'?1:-1)*Number(x.amount||0),0); if($('cashTotal'))$('cashTotal').textContent=money(cash); if($('cashBalance'))$('cashBalance').textContent=money(cash); if($('businessHealthStatus'))$('businessHealthStatus').textContent=h.score==null?h.title:`${h.title} · ${h.score}/100`; if($('businessHealthMessage'))$('businessHealthMessage').textContent=h.message; if($('businessHealthDetails'))$('businessHealthDetails').textContent=h.score==null?h.problem:`${h.problem} ${h.action}`; if($('priorityAction'))$('priorityAction').textContent=h.action; const html=alerts.length?alerts.map(a=>`<div class="card alert">${a.level==='danger'?'🔴':'🟠'} ${esc(a.text)}</div>`).join(''):`<div class="card good">🟢 Aucun problème critique détecté.</div>`; if($('alerts'))$('alerts').innerHTML=html; if($('dashboardAlerts'))$('dashboardAlerts').innerHTML=html; if($('stockList'))$('stockList').innerHTML=state.stock.length?state.stock.map(x=>`<div class="card"><strong>${esc(x.product)}</strong><br>SKU : ${esc(x.sku||'—')}<br>${x.qty} unités · seuil ${x.min}<br>${x.qty===0?'⚫ Rupture':x.qty<=V4_RULES.stock.low?'🟠 Stock faible':'🟢 Stock OK'}<br><br><button class="btn" onclick="stockEntry(${x.id})">➕ Entrée</button> <button class="btn" onclick="stockExit(${x.id})">➖ Sortie</button> <button class="btn" onclick="deleteStock(${x.id})">🗑️ Supprimer</button></div>`).join(''):'<div class="card">Aucun stock enregistré.</div>'; if($('cashList'))$('cashList').innerHTML=state.cash.length?state.cash.map(x=>`<div class="card">${x.type==='in'?'➕':'➖'} ${money(x.amount)} — ${esc(x.description)}</div>`).join(''):'<div class="card">Aucune opération.</div>'; if($('creativeList'))$('creativeList').innerHTML=state.creatives.length?state.creatives.map(x=>`<div class="card"><strong>${esc(x.name)}</strong><br>CTR : ${Number(x.ctr||0).toFixed(2)} % · Conversions : ${x.conversions||0}<br>ROAS : ${Number(x.roas||0).toFixed(2)} · <strong>${classifyCreative(Number(x.roas||0))}</strong></div>`).join(''):'<div class="card">Aucun test créatif.</div>'; if($('actionList'))$('actionList').innerHTML=state.actions.length?state.actions.map((x,i)=>`<div class="task"><input type="checkbox" ${x.done?'checked':''} onchange="toggleAction(${i})"> <strong>${esc(x.priority)}</strong> — ${esc(x.text)}</div>`).join(''):'<div class="card">Aucune action.</div>'; if($('tasks'))$('tasks').innerHTML=state.tasks.map((x,i)=>`<div class="task"><input type="checkbox" ${x.done?'checked':''} onchange="toggleTask(${i})"> Jour ${x.day} — action e-commerce</div>`).join(''); if($('progress'))$('progress').textContent=`${Math.round(state.tasks.filter(x=>x.done).length/state.tasks.length*100)} %`; updateOrderProducts(); }

window.addEventListener('DOMContentLoaded',()=>{ prepareForms(); for(const [id,value] of Object.entries({ads:state.inputs.ads,orders:state.inputs.orders,revenue:state.inputs.revenue,salePrice:state.inputs.sellingPrice,landedCost:state.inputs.landedCost,variableFees:state.inputs.variableFees,targetContribution:state.inputs.targetContribution})) if($(id))$(id).value=value; render(); calculateLanded(); calculateMargin(); });
