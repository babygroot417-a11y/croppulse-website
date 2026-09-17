const zones = Array.from({length:36}, (_,i)=>({
 id:i+1,
 status:[0,1,0,0,1,0,0,2,0,1,0,0,0,2,1,0,0,0,1,0,2,0,1,0,0,0,1,0,2,0,1,0,0,1,0,0][i],
 ph:(6.1+(i%7)*0.12).toFixed(1), moisture:28+(i*7)%31, temp:(25.4+(i%6)*0.7).toFixed(1), pest:3+(i*5)%18
}));
const statusNames=['healthy','warning','critical'];
const grid=document.getElementById('fieldGrid'); const card=document.getElementById('zoneCard');
if(grid){ zones.forEach(z=>{const el=document.createElement('button');el.className=`zone ${statusNames[z.status]}`;el.title=`Zone ${z.id}`;el.setAttribute('aria-label',`Zone ${z.id}`);el.innerHTML=`<span>${String(z.id).padStart(2,'0')}</span>`;el.onclick=()=>selectZone(z);grid.appendChild(el)});selectZone(zones[11]); }
function selectZone(z){if(!card)return;const status=statusNames[z.status];card.innerHTML=`<span class="status-pill ${status}">ZONE ${String(z.id).padStart(2,'0')} · ${status.toUpperCase()}</span><h3>Zone ${String(z.id).padStart(2,'0')}</h3><p>${status==='healthy'?'Crop conditions are stable.':status==='warning'?'This zone needs monitoring and targeted intervention.':'Critical anomaly detected; ground verification is recommended.'}</p><div class="zone-values"><div><small>pH</small><b>${z.ph}</b></div><div><small>Moisture</small><b>${z.moisture}%</b></div><div><small>Pest risk</small><b>${z.pest}%</b></div></div><div class="mini-reading"><span>Canopy temp <b>${z.temp}°C</b></span><span>N indicator <b>${z.status===2?'Low':'Normal'}</b></span></div><a href="results.html" class="text-link">Open full analysis <i data-lucide="arrow-right"></i></a>`; if(window.lucide)lucide.createIcons();}
document.getElementById('runScan')?.addEventListener('click',()=>{const b=document.getElementById('runScan');b.disabled=true;b.innerHTML='<i data-lucide="loader-circle"></i>Scanning...';lucide.createIcons();setTimeout(()=>{b.disabled=false;b.innerHTML='<i data-lucide="check"></i>Scan Complete';lucide.createIcons();},1400)});
document.getElementById('menuBtn')?.addEventListener('click',()=>document.getElementById('sidebar')?.classList.toggle('open'));
