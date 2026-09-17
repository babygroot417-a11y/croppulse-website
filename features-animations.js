const $=(s,p=document)=>p.querySelector(s);const $$=(s,p=document)=>[...p.querySelectorAll(s)];

const progress=$('#scrollProgress');
const nav=$('#siteNav');
function updateScrollUI(){
  const max=document.documentElement.scrollHeight-window.innerHeight;
  const pct=max>0?(window.scrollY/max)*100:0;
  if(progress) progress.style.width=`${pct}%`;
  if(nav) nav.classList.toggle('scrolled',window.scrollY>24);
}
window.addEventListener('scroll',updateScrollUI,{passive:true});
updateScrollUI();

const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}});
},{threshold:.14,rootMargin:'0px 0px -50px 0px'});
$$('.reveal').forEach(el=>revealObserver.observe(el));

const counters=$$('[data-count]');
const countObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const el=entry.target; const target=Number(el.dataset.count||0); const suffix=el.dataset.suffix||''; const start=performance.now(); const duration=1200;
    function tick(now){
      const p=Math.min(1,(now-start)/duration); const eased=1-Math.pow(1-p,3); el.textContent=`${Math.round(target*eased)}${suffix}`; if(p<1)requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick); countObserver.unobserve(el);
  });
},{threshold:.5});
counters.forEach(el=>countObserver.observe(el));

const parallaxItems=$$('[data-parallax]');
function parallax(){
  parallaxItems.forEach(el=>{
    const speed=Number(el.dataset.parallax||.1); const r=el.getBoundingClientRect();
    if(r.bottom<0||r.top>innerHeight) return;
    const center=r.top+r.height/2; const offset=(innerHeight/2-center)*speed;
    el.style.transform=`translate3d(0,${offset}px,0)`;
  });
}
window.addEventListener('scroll',parallax,{passive:true});
parallax();

const workflowSteps=$$('.workflow-step');
const stagePanel=$('#stagePanel');
const stepContent=[
  ['01','Map the field','Drone imagery creates a field-wide view and highlights unusual crop patterns.'],
  ['02','Detect anomalies','Crop health signals surface low-vigor, water-stress and pest-risk patterns.'],
  ['03','Verify on the ground','The rover validates targeted zones with moisture, pH and other ground readings.'],
  ['04','Act and rescan','Recommendations guide the next action, then a new scan measures change.']
];
const workflowObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    workflowSteps.forEach(s=>s.classList.remove('active'));
    entry.target.classList.add('active');
    const i=Number(entry.target.dataset.step||0), data=stepContent[i];
    if(stagePanel&&data){stagePanel.style.opacity='0';setTimeout(()=>{stagePanel.querySelector('.step-number').textContent=data[0];stagePanel.querySelector('h3').textContent=data[1];stagePanel.querySelector('p').textContent=data[2];stagePanel.style.opacity='1'},180)}
  });
},{threshold:.55});
workflowSteps.forEach(s=>workflowObserver.observe(s));

$$('[data-tilt]').forEach(card=>{
  card.addEventListener('pointermove',e=>{
    if(innerWidth<900)return;
    const r=card.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5; const y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`perspective(900px) rotateX(${y*-4}deg) rotateY(${x*5}deg) translateY(-5px)`;
  });
  card.addEventListener('pointerleave',()=>card.style.transform='');
});

const menu=$('#navMenu');
if(menu){menu.addEventListener('click',()=>{
  const navEl=$('.site-nav nav');
  if(!navEl)return;
  const open=navEl.classList.toggle('mobile-open');
  navEl.style.display=open?'flex':'';
  if(open){navEl.style.position='absolute';navEl.style.top='68px';navEl.style.left='18px';navEl.style.right='18px';navEl.style.padding='18px';navEl.style.flexDirection='column';navEl.style.background='rgba(7,17,10,.96)';navEl.style.border='1px solid rgba(160,205,169,.14)';navEl.style.borderRadius='16px'}
});}
