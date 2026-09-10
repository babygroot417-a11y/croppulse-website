function renderHealthCheck(gridId='farmGrid', panelId='readingPanel', summaryId='healthSummary'){
  const grid=document.getElementById(gridId), panel=document.getElementById(panelId), summaryEl=document.getElementById(summaryId);
  if(!grid||!panel||!window.CropPulseHealth) return;
  const {rows,summary,recommendation}=CropPulseHealth; const s=summary();
  if(summaryEl){ summaryEl.innerHTML=`
    <div class="metric green"><div class="label">Healthy / Green</div><div class="value">${s.healthy}</div></div>
    <div class="metric yellow"><div class="label">Watch / Yellow</div><div class="value">${s.warning}</div></div>
    <div class="metric red"><div class="label">Critical / Red</div><div class="value">${s.critical}</div></div>
    <div class="metric"><div class="label">Average moisture</div><div class="value">${s.avgMoisture.toFixed(1)}%</div></div>`; }
  grid.innerHTML='';
  rows.forEach(r=>{const b=document.createElement('button');b.type='button';b.className=`farm-block ${r.status}`;b.innerHTML=`B${r.id}<small>${r.moisture}% moisture</small>`;b.setAttribute('aria-label',`Block ${r.id}, ${r.status}`);b.onclick=()=>{document.querySelectorAll('.farm-block.active').forEach(x=>x.classList.remove('active'));b.classList.add('active');showReading(r,panel,recommendation);};grid.appendChild(b);});
  showReading(rows[0],panel,recommendation); grid.firstElementChild?.classList.add('active');
}
function showReading(r,panel,recommendation){
  const labels={healthy:'Healthy',warning:'Watch',critical:'Critical'};
  panel.innerHTML=`<div class="reading-title"><div><strong>Block ${r.id}</strong><div class="demo-note" style="margin:2px 0 0">RGB vegetation + rover-style soil sample</div></div><span class="status-pill ${r.status}">${labels[r.status]}</span></div>
  <div class="reading-grid">
    <div class="reading"><span>Soil pH</span><b>${r.pH.toFixed(1)}</b></div><div class="reading"><span>Moisture</span><b>${r.moisture}%</b></div><div class="reading"><span>Canopy temp.</span><b>${r.temp.toFixed(1)}°C</b></div><div class="reading"><span>Nitrogen index*</span><b>${r.nitrogen}</b></div><div class="reading"><span>RGB VARI</span><b>${r.vari.toFixed(2)}</b></div><div class="reading"><span>Pest risk*</span><b>${r.pestRisk}%</b></div>
  </div><p class="demo-note">${recommendation(r)}<br>*Demo-derived indicator, not a laboratory measurement.</p>`;
}
function runDemo(){document.getElementById('healthCheck')?.scrollIntoView({behavior:'smooth',block:'start'});renderHealthCheck();}
