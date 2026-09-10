// CropPulse demo dataset: realistic sample readings for a vegetable/cereal field.
// These are NOT live sensor readings. Replace this array with drone/rover API data when hardware is connected.
const CropPulseHealth = (() => {
  const samples = [
    [6.6,44,29.4,42,0.31,4],[6.5,47,29.1,45,0.34,3],[6.7,41,30.0,39,0.29,5],[6.4,39,30.4,36,0.27,7],[6.8,46,29.2,48,0.33,2],[6.5,43,29.8,41,0.30,5],
    [6.3,35,31.2,31,0.20,12],[6.4,37,30.9,34,0.22,10],[6.6,42,29.9,40,0.28,6],[6.7,45,29.6,44,0.31,4],[6.2,33,31.5,28,0.18,14],[6.5,40,30.2,38,0.26,8],
    [5.8,25,33.1,19,0.08,28],[6.0,29,32.4,24,0.13,20],[6.4,36,31.0,33,0.21,13],[6.6,43,29.7,43,0.30,5],[6.7,46,29.5,47,0.32,3],[6.3,34,31.4,30,0.19,15],
    [5.7,22,33.8,17,0.05,35],[5.9,27,33.0,21,0.10,27],[6.2,32,31.9,28,0.17,18],[6.5,39,30.5,37,0.25,9],[6.7,44,29.8,45,0.31,4],[6.6,42,30.1,41,0.28,6],
    [6.1,30,32.0,25,0.15,19],[6.3,34,31.3,30,0.20,14],[6.5,38,30.8,35,0.24,10],[6.8,45,29.6,46,0.33,3],[6.7,43,29.9,42,0.30,5],[6.4,37,30.7,34,0.23,11],
    [6.5,41,30.1,39,0.27,7],[6.6,44,29.7,44,0.31,4],[6.4,38,30.6,35,0.24,9],[6.2,32,31.8,27,0.16,17],[5.9,26,33.2,20,0.09,30],[6.3,35,31.1,31,0.21,12]
  ];
  const rows = samples.map((v,i)=>({id:i+1,pH:v[0],moisture:v[1],temp:v[2],nitrogen:v[3],vari:v[4],pestRisk:v[5]}));
  function classify(r){
    const critical = r.moisture < 28 || r.pH < 5.9 || r.nitrogen < 22 || r.vari < .10 || r.pestRisk >= 28;
    const warning = r.moisture < 38 || r.pH < 6.2 || r.nitrogen < 35 || r.vari < .23 || r.pestRisk >= 12;
    return critical ? 'critical' : warning ? 'warning' : 'healthy';
  }
  rows.forEach(r=>r.status=classify(r));
  function summary(){
    const counts={healthy:0,warning:0,critical:0};rows.forEach(r=>counts[r.status]++);
    const avg=(key)=>rows.reduce((s,r)=>s+r[key],0)/rows.length;
    return {...counts,total:rows.length,avgMoisture:avg('moisture'),avgPH:avg('pH'),avgVari:avg('vari')};
  }
  function recommendation(r){
    if(r.status==='healthy') return 'Conditions are within the demo target range. Continue routine monitoring.';
    const a=[];
    if(r.moisture<38) a.push('check irrigation');
    if(r.pH<6.2) a.push('confirm soil pH with a calibrated probe/lab test');
    if(r.nitrogen<35) a.push('verify nitrogen status before fertilizer application');
    if(r.pestRisk>=12) a.push('inspect leaves for pest/disease symptoms');
    return 'Suggested follow-up: '+a.join(', ')+'.';
  }
  return {rows,summary,recommendation};
})();
