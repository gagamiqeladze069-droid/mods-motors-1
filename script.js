const $=s=>document.querySelector(s);
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};

/* ================= მანქანების მოდელები =================
 pts: ძარის კონტური წინიდან უკან (თაღები ავტომატურად იჭრება); cab: მინები
 nx/tx ცხვირი/კუდი, ly ფარის სიმაღლე, ry უკანა დეკი, hx/hy კაპოტი, mx/my სარკე */
const MODELS={
 coupe:{n:'კუპე',d:'სპორტული, დაბალი',col:'#c1121f',w:1.75,fx:1.4,rx:-1.35,wr:.38,bot:.3,nx:2.3,tx:-2.3,ly:.66,hx:1.6,hy:.8,ry:.9,mx:.85,my:.98,
  pts:[[2.22,.3],[2.33,.5],[2.2,.72],[1.4,.82],[.9,.9],[-1.6,.92],[-2.2,.88],[-2.33,.6],[-2.22,.3]],cab:[[-1.2,.9],[-.75,1.3],[.2,1.34],[.95,.88]]},
 sedan:{n:'სედანი',d:'კლასიკური 4-კარიანი',col:'#1d4ed8',w:1.8,fx:1.45,rx:-1.45,wr:.38,bot:.3,nx:2.45,tx:-2.5,ly:.68,hx:1.75,hy:.82,ry:.95,mx:.95,my:1.0,
  pts:[[2.35,.3],[2.45,.52],[2.3,.76],[1.5,.86],[1.05,.92],[-1.7,.95],[-2.4,.92],[-2.5,.6],[-2.4,.3]],cab:[[-1.5,.93],[-1.0,1.38],[.4,1.42],[1.05,.9]]},
 hatch:{n:'ჰეჩბეკი',d:'კომპაქტური ქალაქისთვის',col:'#0f766e',w:1.7,fx:1.2,rx:-1.1,wr:.36,bot:.3,nx:2.1,tx:-2.0,ly:.64,hx:1.45,hy:.78,ry:.96,mx:.7,my:1.0,
  pts:[[2.0,.3],[2.1,.5],[1.95,.72],[1.2,.82],[.8,.9],[-1.9,.96],[-2.0,.7],[-2.0,.3]],cab:[[-1.85,.95],[-1.75,1.4],[.35,1.42],[.85,.9]]},
 wagon:{n:'უნივერსალი',d:'გრძელი სახურავი',col:'#aeb4bb',w:1.8,fx:1.45,rx:-1.4,wr:.38,bot:.3,nx:2.45,tx:-2.42,ly:.68,hx:1.75,hy:.82,ry:.97,mx:.95,my:1.0,
  pts:[[2.35,.3],[2.45,.52],[2.3,.76],[1.5,.86],[1.05,.92],[-2.1,.97],[-2.35,.93],[-2.42,.6],[-2.35,.3]],cab:[[-2.2,.95],[-2.0,1.4],[.4,1.42],[1.05,.9]]},
 suv:{n:'ჯიპი',d:'მაღალი, ძლიერი',col:'#15171a',w:1.9,fx:1.45,rx:-1.4,wr:.45,bot:.4,nx:2.38,tx:-2.4,ly:.88,hx:1.7,hy:1.03,ry:1.14,mx:1.05,my:1.2,
  pts:[[2.3,.4],[2.38,.7],[2.25,.98],[1.4,1.08],[.9,1.12],[-2.0,1.14],[-2.35,1.1],[-2.4,.7],[-2.3,.4]],cab:[[-2.2,1.12],[-2.1,1.7],[.5,1.74],[1.1,1.1]]},
 pickup:{n:'პიკაპი',d:'ღია ძარით',col:'#ff7a00',w:1.9,fx:1.5,rx:-1.45,wr:.46,bot:.4,nx:2.5,tx:-2.5,ly:.9,hx:1.85,hy:1.08,ry:1.0,mx:1.0,my:1.25,bed:[-1.6,1.9,1.0],
  pts:[[2.4,.4],[2.48,.72],[2.35,1.0],[1.5,1.08],[1.1,1.12],[-.25,1.14],[-.3,1.0],[-2.45,1.0],[-2.5,.7],[-2.4,.4]],cab:[[-.3,1.12],[-.2,1.68],[.7,1.72],[1.15,1.1]]},
 super:{n:'სუპერკარი',d:'დაბალი და ფართო',col:'#f4c20d',w:1.95,fx:1.4,rx:-1.3,wr:.36,bot:.22,nx:2.4,tx:-2.4,ly:.46,hx:1.5,hy:.68,ry:.88,mx:.55,my:.86,
  pts:[[2.25,.22],[2.4,.4],[2.2,.6],[1.2,.7],[.5,.78],[-1.5,.9],[-2.3,.85],[-2.4,.5],[-2.3,.22]],cab:[[-.9,.78],[-.4,1.12],[.3,1.15],[.85,.76]]},
 muscle:{n:'მასლ-კარი',d:'გრძელი კაპოტი, V8 სტილი',col:'#6d28d9',w:1.9,fx:1.55,rx:-1.4,wr:.4,bot:.3,nx:2.55,tx:-2.55,ly:.7,hx:1.9,hy:.88,ry:.98,mx:.9,my:1.0,
  pts:[[2.45,.3],[2.55,.52],[2.4,.78],[1.6,.9],[.9,.96],[-1.8,.98],[-2.45,.92],[-2.55,.6],[-2.45,.3]],cab:[[-1.3,.95],[-.85,1.36],[.3,1.4],[.95,.93]]}
};
const DEF={model:'coupe',color:'#c1121f',finish:'gloss',rim:'#d9dde2',spokes:5,wheel:1,ride:0,cal:'#e63946',wing:'none',hood:'stock',kit:false,wide:false,exhaust:false,hl:'#fff4d6',glow:false,glowColor:'#00e5ff',tint:.7,night:false,plate:'GE-777'};
const S=Object.assign({},DEF);
const BASE=Object.assign({},DEF,{color:'#5d6470',finish:'metal'});
const F={matte:{m:.1,r:.7,c:0},gloss:{m:.3,r:.25,c:1},metal:{m:.9,r:.3,c:.6}};
const COLORS=[['#c1121f','წითელი'],['#f2f2f2','თეთრი'],['#15171a','შავი'],['#1d4ed8','ლურჯი'],['#0f766e','მწვანე'],['#ff7a00','ნარინჯისფერი'],['#f4c20d','ყვითელი'],['#aeb4bb','ვერცხლისფერი'],['#6d28d9','იისფერი']];
const RIMS=[['#d9dde2','ქრომი'],['#15171a','შავი'],['#d4af37','ოქროსფერი'],['#f2f2f2','თეთრი'],['#e63946','წითელი']];
const CALS=[['#e63946','წითელი'],['#f4c20d','ყვითელი'],['#1d4ed8','ლურჯი'],['#15171a','შავი']];
const HLS=[['#fff4d6','თბილი თეთრი'],['#cfe8ff','ცივი თეთრი'],['#ffd24a','ყვითელი'],['#ff8a3d','ნარინჯისფერი']];
const GLOWS=[['#00e5ff','ციანი'],['#ff2a3d','წითელი'],['#7c3aed','იისფერი'],['#22c55e','მწვანე']];
const PRE={
 jdm:{n:'JDM კუპე',model:'coupe',color:'#f2f2f2',finish:'gloss',rim:'#d4af37',spokes:6,wheel:1.05,ride:-.04,wing:'gt',kit:true,tint:.8,hl:'#cfe8ff'},
 stance:{n:'სტენს სედანი',model:'sedan',color:'#1d4ed8',finish:'metal',rim:'#d9dde2',spokes:10,wheel:1.1,ride:-.06,kit:true,wide:true,tint:.6,cal:'#f4c20d'},
 drift:{n:'დრიფტ კუპე',model:'coupe',color:'#15171a',finish:'matte',rim:'#e63946',wing:'gt',kit:true,hood:'carbon',exhaust:true,glow:true,glowColor:'#ff2a3d',ride:-.03,tint:.9,night:true},
 muscle:{n:'მასლ-კარი',model:'muscle',color:'#ff7a00',finish:'metal',rim:'#15171a',spokes:6,wheel:1.1,hood:'scoop',kit:true,exhaust:true,cal:'#f4c20d',hl:'#ffd24a'},
 street:{n:'ქუჩის ჰეჩბეკი',model:'hatch',color:'#0f766e',finish:'gloss',rim:'#f2f2f2',wheel:1.05,ride:-.04,wing:'duck',kit:true,exhaust:true},
 hyper:{n:'ღამის სუპერკარი',model:'super',color:'#6d28d9',finish:'metal',rim:'#15171a',spokes:10,wheel:1.05,ride:-.04,wing:'gt',kit:true,hood:'carbon',glow:true,glowColor:'#7c3aed',night:true,cal:'#f4c20d'}
};

/* ================= მინიატურები (3D-დან დარენდერებული ფოტოები) ================= */
const VW={
 car:M=>({p:[5.6,1.8,5.2],t:[0,.55,0],f:32}),
 side:M=>({p:[0,.95,8],t:[0,.6,0],f:34}),
 wheel:M=>({p:[M.fx+1.0,.6,3.2],t:[M.fx,M.wr,.85],f:30}),
 rear:M=>({p:[-5.4,1.8,4.4],t:[-1,.75,0],f:32}),
 hood:M=>({p:[M.hx+2.6,2.5,2.7],t:[M.hx,M.hy,0],f:30}),
 front:M=>({p:[M.nx+2.8,1,2.0],t:[M.nx-.2,.6,0],f:32}),
 tail:M=>({p:[M.tx-2.5,1,2.1],t:[M.tx,.6,0],f:32})
};
const TH={},waiting={},Q=[];let pumping=0;
function snaps(jobs){
  const keep=Object.assign({},S),sz=R.getSize(new THREE.Vector2()),pr=R.getPixelRatio(),fov=cam.fov;
  R.setPixelRatio(1);R.setSize(420,270,false);cam.aspect=420/270;
  const out=jobs.map(j=>{Object.assign(S,j.raw?j.cfg:Object.assign({},BASE,j.cfg));refresh();
    const v=VW[j.view](MODELS[S.model]);cam.fov=v.f;cam.updateProjectionMatrix();cam.position.set(...v.p);cam.lookAt(...v.t);
    R.render(scene,cam);return cv.toDataURL('image/jpeg',.85);});
  Object.assign(S,keep);R.setPixelRatio(pr);R.setSize(sz.x||300,sz.y||150,false);cam.fov=fov;cam.aspect=(sz.x/sz.y)||1;cam.updateProjectionMatrix();refresh();placeCam();
  return out;
}
function pump(){
  if(pumping||!Q.length)return;pumping=1;
  setTimeout(()=>{const jobs=Q.splice(0,4),urls=snaps(jobs);
    jobs.forEach((j,i)=>{TH[j.key]=urls[i];(waiting[j.key]||[]).forEach(im=>im.src=urls[i]);});
    pumping=0;pump();},30);
}
function thumb(img,key,cfg,view,raw){
  if(TH[key]){img.src=TH[key];return;}
  const w=waiting[key]=waiting[key]||[];w.push(img);if(w.length===1){Q.push({key,cfg,view,raw});pump();}
}

/* ================= UI: მთავარი ================= */
function goto(v){
  document.querySelectorAll('.view').forEach(s=>s.classList.toggle('on',s.id===v));
  document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.go===v));
  if(v==='lab'){fit();sync();}if(v==='mine')renderMine();scrollTo(0,0);
}
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>goto(b.dataset.go));
$('#theme').onclick=()=>{const r=document.documentElement,l=r.dataset.theme==='light';r.dataset.theme=l?'':'light';$('#theme').textContent=l?'☀':'☾';};
function carCard(label,sub,key,cfg,view,raw,fn){
  const b=el('button','car','<img alt=""><span class="badge">3D</span><div class="meta"><b></b><small></small></div>');
  b.querySelector('b').textContent=label;b.querySelector('small').textContent=sub;b.onclick=fn;if(cfg)thumb(b.querySelector('img'),key,cfg,view,raw);return b;
}
Object.entries(MODELS).forEach(([k,m])=>$('#cars').appendChild(carCard(m.n,m.d,'m:'+k,{model:k,color:m.col,finish:'gloss'},'car',0,()=>{Object.assign(S,DEF,{plate:S.plate,model:k,color:m.col,finish:'gloss'});goto('lab');})));
$('#cars').appendChild(el('button','empty','<b>შექმენი შენი ბილდი</b><span>აირჩიე მანქანა და შეცვალე ყველა დეტალი 3D-ში</span>')).onclick=()=>goto('lab');
Object.entries(PRE).forEach(([k,p])=>$('#styles').appendChild(carCard(p.n,MODELS[p.model].n,'p:'+k,p,'car',0,()=>{Object.assign(S,DEF,{plate:S.plate},p);goto('lab');})));

/* ================= UI: ლაბორატორია (კატალოგი) ================= */
const mc=(arr,key,view,x)=>arr.map(([v,n])=>({n,set:{[key]:v},view,x}));
const CAT=[
 {t:'მანქანა',g:[{t:'მოდელი',o:Object.entries(MODELS).map(([k,m])=>({n:m.n,set:{model:k,color:m.col},view:'car',x:{color:m.col},key:'m:'+k}))},
   {t:'მზა სტილები',o:Object.entries(PRE).map(([k,p])=>({n:p.n,set:p,view:'car',raw:1,key:'p:'+k,full:1}))}]},
 {t:'ფერი',g:[{t:'ძარის ფერი',o:mc(COLORS,'color','car')},
   {t:'ლაქის ტიპი',o:[['matte','მქრქალი'],['gloss','მბზინავი'],['metal','მეტალიკი']].map(([v,n])=>({n,set:{finish:v},view:'car',x:{color:'#c1121f'}}))}]},
 {t:'დისკები',g:[{t:'სტილი',o:[[5,'5 სხივი'],[6,'6 სხივი'],[10,'10 სხივი']].map(([v,n])=>({n,set:{spokes:v},view:'wheel'}))},
   {t:'დისკის ფერი',o:mc(RIMS,'rim','wheel')},
   {t:'დისკის ზომა',r:{key:'wheel',min:.85,max:1.1,step:.01}},
   {t:'სამუხრუჭე კალიპერი',o:mc(CALS,'cal','wheel')}]},
 {t:'დაშვება და კიტი',g:[{t:'დაშვება',o:[[-.06,'დაბალი'],[0,'სტანდარტი'],[.1,'მაღალი']].map(([v,n])=>({n,set:{ride:v},view:'side'}))},
   {t:'ზუსტი რეგულირება',r:{key:'ride',min:-.06,max:.1,step:.005}},
   {t:'ბოდიკიტი',o:[[false,'სტანდარტული'],[true,'სპლიტერი + ზღურბლები']].map(([v,n])=>({n,set:{kit:v},view:'front'}))},
   {t:'ფენდერები',o:[[false,'სტანდარტული'],[true,'გაფართოებული']].map(([v,n])=>({n,set:{wide:v},view:'side'}))}]},
 {t:'აეროდინამიკა',g:[{t:'სპოილერი',o:[['none','არა'],['duck','იხვის კუდი'],['gt','GT ფრთა']].map(([v,n])=>({n,set:{wing:v},view:'rear'}))},
   {t:'კაპოტი',o:[['stock','სტანდარტი'],['scoop','ჰაერმიმღები'],['carbon','კარბონი']].map(([v,n])=>({n,set:{hood:v},view:'hood'}))}]},
 {t:'გამონაბოლქვი და შუქი',g:[{t:'გამონაბოლქვი',o:[[false,'სტანდარტული'],[true,'სპორტული']].map(([v,n])=>({n,set:{exhaust:v},view:'tail'}))},
   {t:'ფარების ფერი',o:mc(HLS,'hl','front',{night:true})},
   {t:'ქვედა განათება',o:[{n:'გამორთული',set:{glow:false},view:'side',x:{night:true}}].concat(GLOWS.map(([c,n])=>({n,set:{glow:true,glowColor:c},view:'side',x:{night:true}})))}]},
 {t:'მინები და ნომერი',g:[{t:'ტონირება',o:[[.1,'გამჭვირვალე'],[.45,'მსუბუქი'],[.75,'საშუალო'],[1,'მუქი']].map(([v,n])=>({n,set:{tint:v},view:'side'}))},
   {t:'სახელმწიფო ნომერი',txt:1},
   {t:'სცენა',o:[[false,'დღე'],[true,'ღამე']].map(([v,n])=>({n,set:{night:v},view:'car'}))}]}
];
const cats=$('#cats'),groups=$('#groups'),cards=[],ranges=[];
const isOn=set=>Object.entries(set).every(([k,v])=>S[k]===v);
CAT.forEach((c,i)=>{
  const tb=el('button','',c.t);tb.setAttribute('role','tab');tb.onclick=()=>{document.querySelectorAll('.cgrp').forEach((x,j)=>x.hidden=j!==i);[...cats.children].forEach((x,j)=>x.classList.toggle('on',j===i));};cats.appendChild(tb);
  const box_=el('div','cgrp');box_.hidden=true;
  c.g.forEach(gp=>{
    const d=el('div','grp','<h3></h3>');d.firstChild.textContent=gp.t;
    if(gp.o){const o=el('div','opts');gp.o.forEach(it=>{
      const b=el('button','opt','<img alt=""><span></span>');b.lastChild.textContent=it.n;
      const cfg=Object.assign({},it.full?it.set:it.set,it.x||{});
      thumb(b.firstChild,it.key||c.t+gp.t+it.n,cfg,it.view,0);
      b.onclick=()=>{if(it.raw)Object.assign(S,DEF,{plate:S.plate},it.set);else Object.assign(S,it.set);sync();};
      cards.push([b,it]);o.appendChild(b);});d.appendChild(o);}
    if(gp.r){const r=el('input');r.type='range';Object.assign(r,gp.r);r.setAttribute('aria-label',gp.t);r.oninput=()=>{S[gp.r.key]=+r.value;apply();sync(1);};ranges.push([r,gp.r.key]);d.appendChild(r);}
    if(gp.txt){const t=el('input');t.type='text';t.maxLength=8;t.setAttribute('aria-label','ნომერი');t.oninput=()=>{S.plate=t.value;drawPlate();};t.id='pl';d.appendChild(t);}
    box_.appendChild(d);});
  groups.appendChild(box_);
});
cats.children[0].click();
function sync(soft){
  if(!soft)refresh();
  cards.forEach(([b,it])=>b.classList.toggle('on',!it.raw&&isOn(it.set)));
  ranges.forEach(([r,k])=>r.value=S[k]);
  if($('#pl')&&document.activeElement!==$('#pl'))$('#pl').value=S.plate;
  $('#chip').textContent=MODELS[S.model].n;
}

/* ================= ბარი: შენახვა / გაზიარება / PNG ================= */
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),1800);};
const pick=a=>a[Math.floor(Math.random()*a.length)],rnd=p=>Math.random()<p;
$('#rand').onclick=()=>{Object.assign(S,DEF,{plate:S.plate,model:pick(Object.keys(MODELS)),color:pick(COLORS)[0],finish:pick(Object.keys(F)),rim:pick(RIMS)[0],cal:pick(CALS)[0],hl:pick(HLS)[0],spokes:pick([5,6,10]),wheel:.95+Math.random()*.15,ride:-.06+Math.random()*.1,wing:pick(['none','duck','gt']),hood:pick(['stock','scoop','carbon']),kit:rnd(.6),wide:rnd(.3),exhaust:rnd(.5),glow:rnd(.4),glowColor:pick(GLOWS)[0],tint:.5+Math.random()*.5});sync();};
$('#reset').onclick=()=>{Object.assign(S,DEF);sync();};
const store=()=>{try{return JSON.parse(localStorage.getItem('mods-builds')||'[]');}catch(e){return[];}};
$('#save').onclick=()=>{try{const l=store();l.unshift({s:Object.assign({},S),img:snaps([{cfg:S,view:'car',raw:1}])[0]});localStorage.setItem('mods-builds',JSON.stringify(l.slice(0,12)));toast('ბილდი შენახულია');}catch(e){toast('შენახვა ვერ მოხერხდა');}};
$('#share').onclick=()=>{const url=location.href.split('#')[0]+'#'+btoa(JSON.stringify(S));
  (navigator.clipboard?navigator.clipboard.writeText(url):Promise.reject()).then(()=>toast('ბმული დაკოპირდა'),()=>{location.hash=url.split('#')[1];toast('ბმული მისამართის ველშია');});};
$('#shot').onclick=()=>{R.render(scene,cam);const a=document.createElement('a');a.download='my-car.png';a.href=cv.toDataURL('image/png');a.click();};
function renderMine(){
  const box_=$('#mylist');box_.innerHTML='';const l=store();
  if(!l.length){box_.appendChild(el('button','empty','<b>ჯერ არაფერი გაქვს შენახული</b><span>შექმენი ბილდი 3D ლაბორატორიაში და დააჭირე „შენახვა“</span>')).onclick=()=>goto('lab');return;}
  l.forEach((it,i)=>{const b=carCard(MODELS[it.s.model].n,'ჩემი ბილდი #'+(l.length-i),'my'+i+it.img.length,0,0,0,()=>{Object.assign(S,DEF,it.s);goto('lab');});
    b.querySelector('img').src=it.img;const x=el('button','x','×');x.setAttribute('aria-label','წაშლა');
    x.onclick=e=>{e.stopPropagation();l.splice(i,1);localStorage.setItem('mods-builds',JSON.stringify(l));renderMine();};b.appendChild(x);box_.appendChild(b);});
}
try{const h=location.hash.slice(1);if(h){Object.assign(S,DEF,JSON.parse(atob(h)));if(!MODELS[S.model])S.model='coupe';}}catch(e){}

/* ================= 3D სცენა ================= */
const cv=$('#c'),R=new THREE.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:true});
R.setPixelRatio(Math.min(devicePixelRatio,2));R.toneMapping=THREE.ACESFilmicToneMapping;R.outputEncoding=THREE.sRGBEncoding;
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(40,1,.1,100);
const ec=document.createElement('canvas');ec.width=1024;ec.height=512;
const g=ec.getContext('2d'),gr=g.createLinearGradient(0,0,0,512);
gr.addColorStop(0,'#3a4350');gr.addColorStop(.5,'#161a20');gr.addColorStop(1,'#07080a');g.fillStyle=gr;g.fillRect(0,0,1024,512);g.fillStyle='#fff';
[[100,120,260,40],[560,90,300,50],[330,230,160,24],[820,200,120,30]].forEach(a=>g.fillRect(...a));
const et=new THREE.CanvasTexture(ec);et.mapping=THREE.EquirectangularReflectionMapping;et.encoding=THREE.sRGBEncoding;
scene.environment=new THREE.PMREMGenerator(R).fromEquirectangular(et).texture;
const key=new THREE.DirectionalLight(0xffffff,.8);key.position.set(4,6,3);scene.add(key);
const floorM=new THREE.MeshStandardMaterial({color:0x14171c,roughness:.55,metalness:.3});
const floor=new THREE.Mesh(new THREE.CircleGeometry(16,64),floorM);floor.rotation.x=-Math.PI/2;scene.add(floor);
const gc=document.createElement('canvas');gc.width=gc.height=128;
const gg=gc.getContext('2d'),rg=gg.createRadialGradient(64,64,0,64,64,64);rg.addColorStop(0,'rgba(255,255,255,1)');rg.addColorStop(1,'rgba(255,255,255,0)');gg.fillStyle=rg;gg.fillRect(0,0,128,128);
const gt=new THREE.CanvasTexture(gc);
const shadow=new THREE.Mesh(new THREE.PlaneGeometry(6.2,3.2),new THREE.MeshBasicMaterial({map:gt,color:0,transparent:true,opacity:.75,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.01;scene.add(shadow);
const glowM=new THREE.MeshBasicMaterial({map:gt,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.9});
const glow=new THREE.Mesh(new THREE.PlaneGeometry(7,3.8),glowM);glow.rotation.x=-Math.PI/2;glow.position.y=.02;scene.add(glow);
const glowL=new THREE.PointLight(0x00e5ff,2.2,7);glowL.position.set(0,.15,0);scene.add(glowL);

const body=new THREE.MeshPhysicalMaterial({clearcoatRoughness:.05});
const glass=new THREE.MeshPhysicalMaterial({color:0x0a0e12,metalness:.9,roughness:.05,transparent:true});
const rimM=new THREE.MeshStandardMaterial({metalness:1,roughness:.2});
const calM=new THREE.MeshStandardMaterial({roughness:.4,metalness:.3});
const tireM=new THREE.MeshStandardMaterial({color:0x0b0b0c,roughness:.9});
const dark=new THREE.MeshStandardMaterial({color:0x050506,roughness:.7});
const carbonM=new THREE.MeshPhysicalMaterial({color:0x0c0d10,metalness:.5,roughness:.35,clearcoat:1});
const chrome=new THREE.MeshStandardMaterial({color:0xcfd3d8,metalness:1,roughness:.12});
const headM=new THREE.MeshStandardMaterial({color:0xffffff,emissiveIntensity:2});
const tailM=new THREE.MeshStandardMaterial({color:0xff2233,emissive:0xff1122,emissiveIntensity:2});
const pc=document.createElement('canvas');pc.width=256;pc.height=128;
const pt=new THREE.CanvasTexture(pc),plateM=new THREE.MeshBasicMaterial({map:pt,side:THREE.DoubleSide});
function drawPlate(){const x=pc.getContext('2d');x.fillStyle='#f4f4f0';x.fillRect(0,0,256,128);x.fillStyle='#1d4ed8';x.fillRect(0,0,34,128);
  x.strokeStyle='#111';x.lineWidth=5;x.strokeRect(2,2,252,124);x.fillStyle='#111';x.font='bold 62px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText((S.plate||'').toUpperCase(),145,68);pt.needsUpdate=true;}

let car,shell,P={wh:[]},built='';
function ex(sh,d,b){const ge=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:!!b,bevelSize:b||0,bevelThickness:b||0,bevelSegments:4,curveSegments:24});ge.translate(0,0,-d/2);return ge;}
const box=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||shell).add(o);return o;};
function spokes(w){const a=w.userData.a;while(a.children.length)a.remove(a.children[0]);const n=S.spokes,wd=n>6?.05:.09;
  for(let i=0;i<n;i++){const sp=new THREE.Mesh(new THREE.BoxGeometry(wd,.3,.04),rimM);sp.geometry.translate(0,.15,0);sp.rotation.z=i*Math.PI*2/n;sp.position.z=.13;a.add(sp);}
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.06,20),rimM);hub.rotation.x=Math.PI/2;hub.position.z=.14;a.add(hub);}
function buildCar(){
  if(car){car.traverse(o=>{if(o.geometry)o.geometry.dispose();});scene.remove(car);}
  const M=MODELS[S.model],W=M.w,ar=M.wr+.08;
  car=new THREE.Group();shell=new THREE.Group();car.add(shell);scene.add(car);P={wh:[]};
  const s=new THREE.Shape();
  s.moveTo(M.rx-ar,M.bot);s.lineTo(M.rx-ar,M.wr);s.absarc(M.rx,M.wr,ar,Math.PI,0,true);s.lineTo(M.rx+ar,M.bot);
  s.lineTo(M.fx-ar,M.bot);s.lineTo(M.fx-ar,M.wr);s.absarc(M.fx,M.wr,ar,Math.PI,0,true);s.lineTo(M.fx+ar,M.bot);
  M.pts.forEach(p=>s.lineTo(p[0],p[1]));s.closePath();
  shell.add(new THREE.Mesh(ex(s,W-.14,.07),body));
  const c=M.cab,cb=new THREE.Shape();cb.moveTo(...c[0]);c.slice(1).forEach(p=>cb.lineTo(...p));cb.closePath();
  shell.add(new THREE.Mesh(ex(cb,W-.35,.03),glass));
  const rf=new THREE.Shape();rf.moveTo(c[1][0]-.04,c[1][1]-.03);rf.lineTo(c[2][0],c[2][1]-.03);rf.lineTo(c[2][0],c[2][1]+.02);rf.lineTo(c[1][0]+.04,c[1][1]+.02);rf.closePath();
  shell.add(new THREE.Mesh(ex(rf,W-.33,.03),body));
  if(M.bed)box(M.bed[1],.03,W-.35,dark,M.bed[0],M.bed[2]+.01,0);
  const xf=c[3][0]-.15,xr=c[0][0]+.5,sy=(M.bot+M.ry)/2+.02,sh=(M.ry-M.bot)*.6;
  [-1,1].forEach(z=>{box(.08,.11,.42,headM,M.nx-.05,M.ly,z*W*.33);box(.06,.1,.5,tailM,M.tx+.06,M.ry-.17,z*W*.3);
    box(.16,.09,.08,body,M.mx,M.my,z*(W/2+.04));[xf,xr].forEach(x=>box(.012,sh,.012,dark,x,sy,z*(W/2+.01)));});
  box(.05,.13,W*.4,dark,M.nx-.02,M.ly-.16,0);
  P.gt=new THREE.Group();shell.add(P.gt);
  box(.45,.05,W*.95,body,M.tx+.2,M.ry+.3,0,P.gt);[-.3,.3].forEach(k=>box(.06,.3,.06,dark,M.tx+.25,M.ry+.15,k*W,P.gt));
  P.duck=box(.35,.05,W*.85,body,M.tx+.22,M.ry+.03,0);P.duck.rotation.z=.25;
  P.kit=new THREE.Group();shell.add(P.kit);
  box(.4,.04,W+.05,dark,M.nx,M.bot+.03,0,P.kit);box(.5,.05,W*.85,dark,M.tx,M.bot+.03,0,P.kit);
  [-1,1].forEach(z=>box(M.fx-M.rx-2*ar,.07,.05,dark,(M.fx+M.rx)/2,M.bot+.04,z*W/2,P.kit));
  P.scoop=box(.5,.07,.5,dark,M.hx,M.hy+.03,0);
  P.carbon=box(.9,.015,W*.55,carbonM,M.hx,M.hy+.012,0);P.carbon.rotation.z=-.12;
  P.exh=new THREE.Group();shell.add(P.exh);
  [-1,1].forEach(z=>{const e=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.25,20),chrome);e.rotation.z=Math.PI/2;e.position.set(M.tx+.02,M.bot+.1,z*W*.25);P.exh.add(e);});
  P.flare=new THREE.Group();shell.add(P.flare);
  [M.fx,M.rx].forEach(x=>[-1,1].forEach(z=>{const t=new THREE.Mesh(new THREE.TorusGeometry(ar,.05,8,32,Math.PI),body);t.position.set(x,M.wr,z*W/2);P.flare.add(t);}));
  const fp=new THREE.Mesh(new THREE.PlaneGeometry(.42,.2),plateM);fp.rotation.y=Math.PI/2;fp.position.set(M.nx+.03,M.bot+.17,0);shell.add(fp);
  const rp=new THREE.Mesh(new THREE.PlaneGeometry(.42,.2),plateM);rp.rotation.y=-Math.PI/2;rp.position.set(M.tx-.02,M.bot+.35,0);shell.add(rp);
  [[M.fx,1],[M.fx,-1],[M.rx,1],[M.rx,-1]].forEach(([x,sg])=>{
    const w=new THREE.Group(),a=new THREE.Group();w.userData={a,sg};
    const tire=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.3,40),tireM);tire.rotation.x=Math.PI/2;w.add(tire);
    const lip=new THREE.Mesh(new THREE.TorusGeometry(.3,.03,10,40),rimM);lip.position.z=.15;w.add(lip);
    const disc=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.02,40),dark);disc.rotation.x=Math.PI/2;disc.position.z=.1;w.add(disc);
    const rotor=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.02,32),rimM);rotor.rotation.x=Math.PI/2;rotor.position.z=.105;w.add(rotor);
    box(.1,.2,.05,calM,.2,.04,.115,w);w.add(a);w.position.x=x;if(sg<0)w.rotation.y=Math.PI;car.add(w);P.wh.push(w);});
  const L=M.nx-M.tx;shadow.scale.set(L/4.6,W/1.8,1);glow.scale.set(L/4.6,W/1.8,1);built=S.model;
}
function apply(){
  const M=MODELS[S.model],f=F[S.finish];
  body.color.set(S.color);body.metalness=f.m;body.roughness=f.r;body.clearcoat=f.c;rimM.color.set(S.rim);calM.color.set(S.cal);headM.emissive.set(S.hl);
  const sc=M.wr/.4*S.wheel;P.wh.forEach(w=>{w.scale.set(sc,sc,1);w.position.y=M.wr*S.wheel;w.position.z=w.userData.sg*(M.w/2-.08+(S.wide?.1:0));});
  shell.position.y=S.ride;P.gt.visible=S.wing==='gt';P.duck.visible=S.wing==='duck';P.kit.visible=S.kit;
  P.scoop.visible=S.hood==='scoop';P.carbon.visible=S.hood==='carbon';P.flare.visible=S.wide;P.exh.visible=S.exhaust;
  glow.visible=glowL.visible=S.glow;glowM.color.set(S.glowColor);glowL.color.set(S.glowColor);glass.opacity=.45+.5*S.tint;
  scene.background=new THREE.Color(S.night?0x04050a:0x0f1114);floorM.color.set(S.night?0x0a0c10:0x14171c);
  R.toneMappingExposure=S.night?.7:1.1;key.intensity=S.night?.15:.8;headM.emissiveIntensity=S.night?6:2;tailM.emissiveIntensity=S.night?5:2;
}
function refresh(){if(built!==S.model)buildCar();P.wh.forEach(spokes);apply();drawPlate();}

/* ================= კამერა ================= */
let th=-.6,ph=1.35,ds=8,tth=th,tph=ph,tds=ds,drag=0,auto=!matchMedia('(prefers-reduced-motion:reduce)').matches,lx=0,ly=0;
cv.addEventListener('pointerdown',e=>{drag=1;auto=false;lx=e.clientX;ly=e.clientY;cv.setPointerCapture(e.pointerId);});
addEventListener('pointerup',()=>drag=0);
cv.addEventListener('pointermove',e=>{if(!drag)return;tth-=(e.clientX-lx)*.008;tph=Math.min(1.5,Math.max(.25,tph-(e.clientY-ly)*.006));lx=e.clientX;ly=e.clientY;});
cv.addEventListener('wheel',e=>{e.preventDefault();tds=Math.min(12,Math.max(4.5,tds+e.deltaY*.005));},{passive:false});
const VIEWS={front:[Math.PI/2,1.4],side:[0,1.4],rear:[-Math.PI/2,1.4],top:[0,.3]};
document.querySelectorAll('#views button').forEach(b=>b.onclick=()=>{const[a,p]=VIEWS[b.dataset.view],T=Math.PI*2;auto=false;tth=a+T*Math.round((tth-a)/T);tph=p;});
function placeCam(){cam.position.set(ds*Math.sin(ph)*Math.sin(th),ds*Math.cos(ph)+.7,ds*Math.sin(ph)*Math.cos(th));cam.lookAt(0,.6,0);}
function fit(){const r=$('#stage').getBoundingClientRect();if(r.width<2||r.height<2)return;R.setSize(r.width,r.height,false);cam.aspect=r.width/r.height;cam.updateProjectionMatrix();}
new ResizeObserver(fit).observe($('#stage'));
(function loop(){if(auto)tth+=.003;th+=(tth-th)*.12;ph+=(tph-ph)*.12;ds+=(tds-ds)*.12;placeCam();R.render(scene,cam);requestAnimationFrame(loop);})();
refresh();sync();
