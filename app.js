/* =========================================================
   Nexora — incident reconstruction console
   Vanilla JS: pseudo-3D entity graph + simulated event bus
   ========================================================= */

/* ---------------- nav: springy pill highlight ---------------- */
(function nav(){
  const links=[...document.querySelectorAll('.pill')];
  const glow=document.getElementById('pillGlow');
  const move=el=>{glow.style.width=el.offsetWidth+'px';glow.style.transform=`translateX(${el.offsetLeft}px)`;};
  const active=()=>document.querySelector('.pill.active')||links[0];
  requestAnimationFrame(()=>move(active()));
  links.forEach(l=>{
    l.addEventListener('mouseenter',()=>move(l));
    l.addEventListener('click',()=>{links.forEach(x=>x.classList.remove('active'));l.classList.add('active');move(l);});
  });
  document.getElementById('navlinks').addEventListener('mouseleave',()=>move(active()));
  window.addEventListener('resize',()=>move(active()));
  addEventListener('scroll',()=>document.getElementById('nav').classList.toggle('shrunk',scrollY>28),{passive:true});

  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.14});
  document.querySelectorAll('.kpi,.panel,.classcard,.statcard,.benchhead').forEach(el=>{el.classList.add('reveal');io.observe(el);});

  const bio=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;
    e.target.querySelectorAll('.prf .bar i').forEach((b,i)=>setTimeout(()=>b.style.width=b.dataset.w+'%',i*110));
    bio.unobserve(e.target);
  }),{threshold:.4});
  document.querySelectorAll('.classcard').forEach(c=>bio.observe(c));
})();

/* ---------------- clock ---------------- */
const clockEl=document.getElementById('clock');
setInterval(()=>{clockEl.textContent=new Date().toLocaleTimeString('en-GB');},1000);

/* ---------------- entity model ---------------- */
const ENTITIES=[
  {id:'auth',  label:'Auth service',   kind:'identity', ip:'10.0.1.4'},
  {id:'vpn',   label:'VPN gateway',    kind:'network',  ip:'10.0.1.9'},
  {id:'api',   label:'API gateway',    kind:'service',  ip:'10.0.2.11'},
  {id:'db',    label:'Postgres core',  kind:'data',     ip:'10.0.3.7'},
  {id:'files', label:'File store',     kind:'data',     ip:'10.0.3.22'},
  {id:'ws1',   label:'WS-114 (m.rao)', kind:'endpoint', ip:'10.0.7.114'},
  {id:'ws2',   label:'WS-208 (s.iyer)',kind:'endpoint', ip:'10.0.7.208'},
  {id:'ws3',   label:'WS-331 (k.das)', kind:'endpoint', ip:'10.0.7.331'},
  {id:'edge',  label:'Edge proxy',     kind:'network',  ip:'10.0.0.2'},
  {id:'mail',  label:'Mail relay',     kind:'service',  ip:'10.0.2.40'}
];

const PLAYBOOK={
  bruteforce:{
    name:'Credential stuffing → account takeover',
    action:'Force password reset for m.rao, revoke active sessions and rate-limit /auth from 203.0.113.44. Add the source ASN to the edge blocklist for 24h.',
    path:['edge','auth','ws1','api'],
    focus:'ws1',
    stages:[
      {t:'Auth failure burst',   d:'41 failed logins for m.rao in 68s from a single unseen source — 12σ above that account’s baseline.',who:'auth · 203.0.113.44'},
      {t:'Success from new geo', d:'Login succeeds from an ASN this identity has never used, no MFA challenge satisfied.',who:'auth → ws1'},
      {t:'Session pivot',        d:'New session immediately calls internal API scopes the account rarely touches.',who:'ws1 → api'},
      {t:'Privileged read',      d:'Token used against admin endpoint /v1/users:list — first occurrence for this identity.',who:'api · token 8fa2'}
    ],
    evidence:[
      ['41 × auth.failure','same user, same source, 68s window','12σ'],
      ['auth.success','unseen ASN 64512, no MFA','0.91'],
      ['session.reuse','token minted 3s after final failure','link'],
      ['api.privileged','scope never used by identity before','0.87']
    ],
    severity:91
  },
  portscan:{
    name:'Internal reconnaissance sweep',
    action:'Quarantine WS-208 at the switch port, snapshot the host for forensics and confirm whether the scan originated from a user process or a scheduled agent.',
    path:['ws2','edge','api','db','mail'],
    focus:'ws2',
    stages:[
      {t:'Horizontal sweep',   d:'WS-208 touches 214 distinct ports across 9 hosts in 40s — no prior fan-out from this endpoint.',who:'ws2 · 10.0.7.208'},
      {t:'Service fingerprint',d:'Repeated half-open connects to 5432, 6379, 445 with no completed handshake.',who:'ws2 → db'},
      {t:'Banner collection',  d:'SMTP and API banners pulled sequentially, consistent with automated tooling cadence.',who:'ws2 → mail, api'},
      {t:'Target selection',   d:'Scan narrows to the two hosts that answered — recon converging on the data tier.',who:'db, api'}
    ],
    evidence:[
      ['214 distinct ports','9 hosts, 40s sliding window','0.98'],
      ['half-open ratio 0.94','SYN without completion','0.95'],
      ['same src entity','all events share host + session id','link'],
      ['cadence 4.2ms','machine-generated, not human','0.93']
    ],
    severity:74
  },
  exfil:{
    name:'Staged data exfiltration',
    action:'Block egress for WS-331, revoke its file-store grants and hold the 2.4 GB outbound transfer at the edge pending review.',
    path:['ws3','db','files','edge'],
    focus:'ws3',
    stages:[
      {t:'Bulk query',       d:'Single query returns 1.2M rows from customers — 340× this account’s median result size.',who:'ws3 → db'},
      {t:'Local staging',    d:'Result written to a compressed archive in the shared file store outside working hours.',who:'files · 02:14'},
      {t:'Egress spike',     d:'2.4 GB outbound to an unclassified destination — baseline for this host is 40 MB/day.',who:'ws3 → edge'},
      {t:'Cleanup attempt',  d:'Staged archive deleted 90s after transfer completes.',who:'files · delete'}
    ],
    evidence:[
      ['db.query 1.2M rows','340× median for identity','0.96'],
      ['off-hours write','02:14, outside baseline shift','0.88'],
      ['egress 2.4 GB','60× host daily baseline','0.94'],
      ['file.delete','same session as transfer','link']
    ],
    severity:96
  }
};

/* ---------------- graph ---------------- */
const canvas=document.getElementById('graph');
const ctx=canvas.getContext('2d');
const wrap=document.getElementById('canvasWrap');
const tip=document.getElementById('tip');

let W=0,H=0,DPR=1;
function resize(){
  DPR=Math.min(devicePixelRatio||1,2);
  W=wrap.clientWidth;H=wrap.clientHeight;
  canvas.width=W*DPR;canvas.height=H*DPR;
  canvas.style.width=W+'px';canvas.style.height=H+'px';
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
new ResizeObserver(resize).observe(wrap);
resize();

const nodes=ENTITIES.map((e,i)=>{
  const n=ENTITIES.length;
  const phi=Math.acos(1-2*(i+0.5)/n);           // even-ish spherical spread
  const theta=Math.PI*(1+Math.sqrt(5))*(i+0.5);
  const rr=0.88+((i*7)%5)*0.06;                   // slight orbital variance
  return {...e,
    bx:Math.sin(phi)*Math.cos(theta)*rr,
    by:Math.cos(phi)*0.78*rr,
    bz:Math.sin(phi)*Math.sin(theta)*rr,
    heat:0,pulse:Math.random()*Math.PI*2,sx:0,sy:0,sr:8,scale:1,hover:0};
});
const core={id:'org',label:'ACME-NET',kind:'organization',ip:'10.0.0.0/16',bx:0,by:0,bz:0,sx:0,sy:0,sr:26,heat:0};

/* edges: every node to core + a handful of lateral links */
const edges=nodes.map(n=>({a:'org',b:n.id,lat:false}));
[['api','db'],['auth','api'],['ws1','api'],['ws2','edge'],['ws3','files'],['db','files'],['edge','mail'],['vpn','auth'],['ws3','db']]
  .forEach(([a,b])=>edges.push({a,b,lat:true}));

const byId=id=>id==='org'?core:nodes.find(n=>n.id===id);

/* packets travelling along edges */
const packets=[];
function spawnPacket(edge,hostile){
  packets.push({e:edge,t:0,v:(hostile?0.010:0.0045)+Math.random()*0.003,hostile,dir:Math.random()<.5?1:-1});
}

let rot=0,tilt=0,targetTilt=0,targetYaw=0,yaw=0;
let hoverId=null,pinnedId=null;
let attack=null;                      // {key, pathSet, until}

/* pointer parallax + hover */
wrap.addEventListener('pointermove',e=>{
  const r=wrap.getBoundingClientRect();
  const mx=e.clientX-r.left,my=e.clientY-r.top;
  targetYaw=((mx/W)-0.5)*0.55;
  targetTilt=((my/H)-0.5)*-0.45;
  let best=null,bd=1e9;
  for(const n of nodes){
    const d=(n.sx-mx)**2+(n.sy-my)**2;
    if(d<bd){bd=d;best=n;}
  }
  const dcore=(core.sx-mx)**2+(core.sy-my)**2;
  if(dcore<Math.max(bd,1)&&dcore<44**2){hoverId='org';showTip(core,mx,my);}
  else if(best&&bd<(best.sr+16)**2){hoverId=best.id;showTip(best,mx,my);}
  else {hoverId=null;tip.hidden=true;}
  wrap.style.cursor=hoverId?'pointer':'default';
});
wrap.addEventListener('pointerleave',()=>{hoverId=null;tip.hidden=true;targetYaw=0;targetTilt=0;});
wrap.addEventListener('click',()=>{ if(hoverId){pinnedId=hoverId;renderEntity(byId(hoverId));} });

function showTip(n,x,y){
  tip.hidden=false;
  tip.style.left=x+'px';tip.style.top=y+'px';
  const risk=n.id==='org'?orgRisk():Math.min(0.99,0.06+n.heat*0.9);
  tip.innerHTML=`<b>${n.label}</b><s>${n.kind} · ${n.ip}</s><s>risk ${risk.toFixed(2)}</s>`;
}

function project(p){
  const cy=Math.cos(yaw),sy=Math.sin(yaw),ct=Math.cos(tilt),st=Math.sin(tilt);
  let x=p.bx,y=p.by,z=p.bz;
  const a=rot+yaw;
  let X=x*Math.cos(a)-z*Math.sin(a);
  let Z=x*Math.sin(a)+z*Math.cos(a);
  let Y=y*ct-Z*st;
  Z=y*st+Z*ct;
  const R=Math.min(W,H)*0.40;
  const f=340/(340-Z*R*0.9);
  return {x:W/2+X*R*f,y:H/2+Y*R*f,f,z:Z};
}

function orgRisk(){
  const m=nodes.reduce((s,n)=>s+n.heat,0)/nodes.length;
  return Math.min(0.99,0.08+m*1.4);
}

function draw(ts){
  rot+=0.0016;
  yaw+=(targetYaw-yaw)*0.06;
  tilt+=(targetTilt-tilt)*0.06;
  ctx.clearRect(0,0,W,H);

  // project
  const cp=project(core);core.sx=cp.x;core.sy=cp.y;core.f=cp.f;
  nodes.forEach(n=>{const p=project(n);n.sx=p.x;n.sy=p.y;n.f=p.f;n.zi=p.z;n.sr=(n.id===hoverId||n.id===pinnedId?11:8)*p.f;});

  // ambient rings around core
  for(let i=0;i<3;i++){
    const rr=(Math.min(W,H)*0.13)+i*Math.min(W,H)*0.11+Math.sin(ts/1400+i)*3;
    ctx.beginPath();ctx.ellipse(core.sx,core.sy,rr,rr*(0.34+0.08*Math.cos(tilt)),0,0,Math.PI*2);
    ctx.strokeStyle=`rgba(150,190,255,${0.10-i*0.025})`;ctx.lineWidth=1;ctx.stroke();
  }

  // edges
  edges.forEach(e=>{
    const A=byId(e.a),B=byId(e.b);
    const hostile=attack&&attack.set.has(e.a)&&attack.set.has(e.b);
    const depth=((A.f||1)+(B.f||1))/2;
    const midX=(A.sx+B.sx)/2, midY=(A.sy+B.sy)/2-22*depth;
    ctx.beginPath();ctx.moveTo(A.sx,A.sy);ctx.quadraticCurveTo(midX,midY,B.sx,B.sy);
    if(hostile){
      ctx.strokeStyle=`rgba(240,119,106,${0.42+0.22*Math.sin(ts/220)})`;
      ctx.lineWidth=1.9*depth;ctx.shadowColor='rgba(240,119,106,.9)';ctx.shadowBlur=12;
    }else{
      ctx.strokeStyle=`rgba(114,188,143,${(e.lat?0.11:0.18)*depth})`;
      ctx.lineWidth=(e.lat?0.8:1.1)*depth;ctx.shadowBlur=0;
    }
    ctx.stroke();ctx.shadowBlur=0;
    e._mid=[midX,midY];e._hostile=hostile;
  });

  // packets
  for(let i=packets.length-1;i>=0;i--){
    const p=packets[i];p.t+=p.v;
    if(p.t>=1){packets.splice(i,1);continue;}
    const A=byId(p.dir>0?p.e.a:p.e.b),B=byId(p.dir>0?p.e.b:p.e.a);
    const [mx,my]=p.e._mid||[(A.sx+B.sx)/2,(A.sy+B.sy)/2];
    const t=p.t,it=1-t;
    const x=it*it*A.sx+2*it*t*mx+t*t*B.sx;
    const y=it*it*A.sy+2*it*t*my+t*t*B.sy;
    const hostile=p.hostile||p.e._hostile;
    const r=hostile?3.1:2.2;
    const g=ctx.createRadialGradient(x,y,0,x,y,r*4.5);
    const col=hostile?'240,119,106':'126,214,168';
    g.addColorStop(0,`rgba(${col},1)`);g.addColorStop(1,`rgba(${col},0)`);
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*4.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=`rgba(255,255,255,${hostile?.95:.8})`;ctx.beginPath();ctx.arc(x,y,r*0.62,0,Math.PI*2);ctx.fill();
  }

  // nodes back-to-front
  [...nodes].sort((a,b)=>a.zi-b.zi).forEach(n=>{
    n.heat*=0.994;
    n.pulse+=0.03;
    const hot=n.heat>0.12;
    const R=n.sr*(1+(n.id===hoverId?0.35:0)+Math.sin(n.pulse)*0.05);
    const col=hot?[240,119,106]:[150,200,255];
    const halo=ctx.createRadialGradient(n.sx,n.sy,0,n.sx,n.sy,R*(hot?6:4));
    halo.addColorStop(0,`rgba(${col.join(',')},${hot?0.5:0.26})`);
    halo.addColorStop(1,`rgba(${col.join(',')},0)`);
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(n.sx,n.sy,R*(hot?6:4),0,Math.PI*2);ctx.fill();

    ctx.beginPath();ctx.arc(n.sx,n.sy,R,0,Math.PI*2);
    const gg=ctx.createLinearGradient(n.sx-R,n.sy-R,n.sx+R,n.sy+R);
    gg.addColorStop(0,hot?'#FFD2CB':'#EAF3FF');gg.addColorStop(1,hot?'#E0655A':'#7FA6E8');
    ctx.fillStyle=gg;ctx.fill();
    ctx.strokeStyle=n.id===pinnedId?'rgba(255,255,255,.95)':'rgba(255,255,255,.4)';
    ctx.lineWidth=n.id===pinnedId?2:1;ctx.stroke();

    if(n.f>0.92||n.id===hoverId||n.id===pinnedId){
      ctx.font=`${11*Math.min(1.1,n.f)}px -apple-system,system-ui,sans-serif`;
      ctx.textAlign='center';
      ctx.fillStyle=`rgba(255,255,255,${Math.min(0.85,n.f*0.7)})`;
      const tw=ctx.measureText(n.label).width;
      const lx=Math.max(tw/2+8,Math.min(W-tw/2-8,n.sx));
      ctx.fillText(n.label,lx,n.sy+R+15);
    }
  });

  // core
  const cr=26*(core.f||1)+Math.sin(ts/700)*1.6;
  const risk=orgRisk();
  const coreHot=risk>0.4;
  const ch=ctx.createRadialGradient(core.sx,core.sy,0,core.sx,core.sy,cr*5);
  ch.addColorStop(0,coreHot?'rgba(240,119,106,.42)':'rgba(120,170,255,.36)');
  ch.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=ch;ctx.beginPath();ctx.arc(core.sx,core.sy,cr*5,0,Math.PI*2);ctx.fill();

  ctx.beginPath();ctx.arc(core.sx,core.sy,cr,0,Math.PI*2);
  const cg=ctx.createLinearGradient(core.sx-cr,core.sy-cr,core.sx+cr,core.sy+cr);
  cg.addColorStop(0,'rgba(255,255,255,.95)');cg.addColorStop(.55,coreHot?'#F09A8E':'#9EC4FF');cg.addColorStop(1,coreHot?'#C4544A':'#4E6FD0');
  ctx.fillStyle=cg;ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=1.4;ctx.stroke();
  ctx.font='600 12px -apple-system,system-ui,sans-serif';ctx.textAlign='center';
  ctx.fillStyle='rgba(255,255,255,.94)';
  ctx.shadowColor='rgba(0,0,0,.9)';ctx.shadowBlur=8;
  ctx.fillText('ACME-NET',core.sx,core.sy-cr-14);
  ctx.shadowBlur=0;

  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

/* ---------------- event bus ---------------- */
const feed=document.getElementById('feed');
const evCount=document.getElementById('evCount');
let paused=false,total=0,anomalies=0,incidents=0,epsHist=[],epsWindow=0;

const BENIGN=[
  ['auth','auth.success','session established','ws1'],
  ['api','api.request','GET /v1/orders 200','ws2'],
  ['db','db.query','SELECT · 214 rows','api'],
  ['files','file.read','quarterly-plan.pdf','ws3'],
  ['vpn','vpn.connect','tunnel up, known device','ws2'],
  ['edge','net.flow','egress 1.4 MB','api'],
  ['mail','mail.send','outbound, policy pass','ws1'],
  ['api','api.request','POST /v1/tickets 201','ws3']
];

function pushEvent({src,type,detail,flag}){
  total++;epsWindow++;
  const li=document.createElement('li');
  li.className='ev '+(flag?'flag':'ok');
  li.innerHTML=`<time>${new Date().toLocaleTimeString('en-GB')}</time>
    <p>${detail} <small>· ${src}</small></p>
    <span class="tag">${type}</span>`;
  feed.prepend(li);
  while(feed.children.length>9)feed.lastElementChild.remove();
  evCount.textContent=total;
  if(flag){anomalies++;document.getElementById('kpiAnom').textContent=anomalies;}
}

function tickBenign(){
  if(paused)return;
  const [src,type,detail,peer]=BENIGN[(Math.random()*BENIGN.length)|0];
  pushEvent({src,type,detail,flag:false});
  const cands=edges.filter(e=>e.a===src||e.b===src);
  if(cands.length)spawnPacket(cands[(Math.random()*cands.length)|0],false);
  spawnPacket(edges[(Math.random()*edges.length)|0],false);
}
setInterval(tickBenign,760);
setInterval(()=>{if(!paused)spawnPacket(edges[(Math.random()*edges.length)|0],false);},430);

/* eps sparkline */
const sparkPath=document.getElementById('sparkPath');
setInterval(()=>{
  const eps=epsWindow;epsWindow=0;
  epsHist.push(eps);if(epsHist.length>26)epsHist.shift();
  document.getElementById('kpiEps').textContent=eps?eps.toFixed(0):'0';
  const max=Math.max(4,...epsHist);
  const d=epsHist.map((v,i)=>`${i===0?'M':'L'}${(i/(Math.max(epsHist.length-1,1)))*118+1},${32-(v/max)*28}`).join(' ');
  sparkPath.setAttribute('d',d);
},1000);

document.getElementById('pauseBtn').addEventListener('click',e=>{
  paused=!paused;
  e.currentTarget.classList.toggle('paused',paused);
  e.currentTarget.title=paused?'Resume stream':'Pause stream';
});

/* ---------------- entity panel ---------------- */
function renderEntity(n){
  const risk=n.id==='org'?orgRisk():Math.min(0.99,0.06+n.heat*0.9);
  document.getElementById('entName').textContent=n.label;
  document.getElementById('entMeta').textContent=n.id==='org'
    ? `organization root · ${nodes.length} linked entities`
    : `${n.kind} · ${n.ip}`;
  const badge=document.getElementById('entBadge');
  const hot=risk>0.45;
  badge.textContent=hot?'under investigation':'nominal';
  badge.classList.toggle('hot',hot);
  const dev=(risk*6.4).toFixed(2);
  const r=document.getElementById('mRisk'),d=document.getElementById('mDev');
  r.style.width=(risk*100).toFixed(0)+'%';d.style.width=Math.min(100,risk*112).toFixed(0)+'%';
  r.classList.toggle('hot',hot);d.classList.toggle('hot',hot);
  document.getElementById('mRiskV').textContent=risk.toFixed(2);
  document.getElementById('mDevV').textContent=dev+'σ';
}
setInterval(()=>{const n=byId(pinnedId||'org');if(n)renderEntity(n);},1500);

/* ---------------- attack injection + correlation ---------------- */
const chain=document.getElementById('chain');
const chainFoot=document.getElementById('chainFoot');
const sevRing=document.getElementById('sevRing');

document.querySelectorAll('[data-attack]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-attack]').forEach(b=>b.classList.remove('armed'));
    btn.classList.add('armed');
    runAttack(btn.dataset.attack);
  });
});
document.getElementById('resetBtn').addEventListener('click',resetAll);

function resetAll(){
  attack=null;pinnedId=null;
  nodes.forEach(n=>n.heat=0);
  incidents=0;
  document.getElementById('kpiInc').textContent='0';
  document.getElementById('kpiIncFoot').textContent='no active chains';
  document.getElementById('kpiCorr').textContent='—';
  document.querySelectorAll('[data-attack]').forEach(b=>b.classList.remove('armed'));
  chain.innerHTML=`<div class="emptychain"><span class="eicon">◇</span><p>No active incident. Inject an attack on the entity surface to watch a chain assemble stage by stage.</p></div>`;
  chainFoot.hidden=true;
  sevRing.style.strokeDashoffset=188.5;
  document.getElementById('sevNum').textContent='—';
  renderEntity(core);
}

function runAttack(key){
  const pb=PLAYBOOK[key];
  attack={key,set:new Set([...pb.path,'org'])};
  pinnedId=pb.focus;

  incidents=1;
  document.getElementById('kpiInc').textContent='1';
  document.getElementById('kpiIncFoot').textContent=pb.name;

  // scaffold stages as pending
  chain.innerHTML='';
  pb.stages.forEach((s,i)=>{
    const el=document.createElement('div');
    el.className='stage pending';
    el.style.animationDelay=(i*60)+'ms';
    el.innerHTML=`<span class="idx">Stage 0${i+1}</span><h4>${s.t}</h4><p>${s.d}</p><span class="who">${s.who}</span>`;
    chain.appendChild(el);
  });
  chainFoot.hidden=true;

  // stage-by-stage reveal, each firing packets + events
  pb.stages.forEach((s,i)=>{
    setTimeout(()=>{
      chain.children[i].classList.remove('pending');
      const nid=pb.path[Math.min(i,pb.path.length-1)];
      const n=byId(nid);if(n&&n!==core)n.heat=Math.min(1,(n.heat||0)+0.8);
      byId(pb.focus).heat=1;
      edges.filter(e=>attack.set.has(e.a)&&attack.set.has(e.b))
           .forEach(e=>{for(let k=0;k<3;k++)setTimeout(()=>spawnPacket(e,true),k*130);});
      pushEvent({src:nid,type:'anomaly',detail:`${s.t} — correlated to incident INC-${key.slice(0,3).toUpperCase()}-01`,flag:true});
      renderEntity(byId(pinnedId));

      if(i===pb.stages.length-1)completeIncident(pb);
    },500+i*950);
  });
}

function completeIncident(pb){
  chainFoot.hidden=false;
  document.getElementById('actionText').textContent=pb.action;
  const list=document.getElementById('evidenceList');
  list.innerHTML=pb.evidence.map(([a,b,c])=>
    `<li><span class="k"></span><span><b>${a}</b> — ${b}</span><em>${c}</em></li>`).join('');
  const off=188.5-(188.5*pb.severity/100);
  sevRing.style.strokeDashoffset=off;
  document.getElementById('sevNum').textContent=pb.severity;
  document.getElementById('kpiCorr').textContent=(pb.severity>90?'4 / 4':'4 / 4');
  document.getElementById('kpiIncFoot').textContent=pb.name;
}

/* keep hostile heat alive while an attack is pinned */
setInterval(()=>{
  if(!attack)return;
  const pb=PLAYBOOK[attack.key];
  pb.path.forEach(id=>{const n=byId(id);if(n&&n!==core)n.heat=Math.max(n.heat,0.75);});
  edges.filter(e=>attack.set.has(e.a)&&attack.set.has(e.b))
       .forEach(e=>{if(Math.random()<.55)spawnPacket(e,true);});
},900);

renderEntity(core);
