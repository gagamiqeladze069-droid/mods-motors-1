const $=s=>document.querySelector(s);
const DEF={color:'#c1121f',finish:'gloss',rim:'#d9dde2',spokes:5,wheel:1,ride:0,cal:'#e63946',spoiler:false,kit:false,scoop:false,glow:false,glowColor:'#00e5ff',tint:.7,night:false};
const S=Object.assign({},DEF);
const F={matte:{m:.1,r:.7,c:0},gloss:{m:.3,r:.25,c:1},metal:{m:.9,r:.3,c:.6}};
const COLORS=['#c1121f','#f2f2f2','#15171a','#1d4ed8','#0f766e','#ff7a00','#f4c20d','#aeb4bb','#6d28d9'];
const RIMS=['#d9dde2','#15171a','#d4af37','#f2f2f2','#e63946'];
const CALS=['#e63946','#f4c20d','#1d4ed8','#15171a'];
const PRE={
 jdm:{color:'#f2f2f2',finish:'gloss',rim:'#d4af37',spokes:6,wheel:1.05,ride:-.04,spoiler:true,kit:true,scoop:false,glow:false,tint:.8,cal:'#e63946'},
 stance:{color:'#1d4ed8',finish:'metal',rim:'#d9dde2',spokes:10,wheel:1.1,ride:-.06,spoiler:false,kit:true,scoop:false,glow:false,tint:.6,cal:'#f4c20d'},
 drift:{color:'#15171a',finish:'matte',rim:'#e63946',spokes:5,wheel:1,ride:-.03,spoiler:true,kit:true,scoop:true,glow:true,glowColor:'#ff2a3d',tint:.9,cal:'#e63946'},
 muscle:{color:'#ff7a00',finish:'metal',rim:'#15171a',spokes:6,wheel:1.1,ride:0,spoiler:false,kit:true,scoop:true,glow:false,tint:.7,cal:'#f4c20d'}
};

/* ---------- renderer / scene ---------- */
const cv=$('#c'),R=new THREE.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:true});
R.setPixelRatio(Math.min(devicePixelRatio,2));
R.toneMapping=THREE.ACESFilmicToneMapping;R.outputEncoding=THREE.sRGBEncoding;
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(40,1,.1,100);

// სტუდიის ანარეკლები (ფანჯრები/სოფტბოქსები)
const ec=document.createElement('canvas');ec.width=1024;ec.height=512;
const g=ec.getContext('2d'),gr=g.createLinearGradient(0,0,0,512);
gr.addColorStop(0,'#3a4350');gr.addColorStop(.5,'#161a20');gr.addColorStop(1,'#07080a');
g.fillStyle=gr;g.fillRect(0,0,1024,512);g.fillStyle='#fff';
[[100,120,260,40],[560,90,300,50],[330,230,160,24],[820,200,120,30]].forEach(a=>g.fillRect(...a));
const et=new THREE.CanvasTexture(ec);et.mapping=THREE.EquirectangularReflectionMapping;et.encoding=THREE.sRGBEncoding;
scene.environment=new THREE.PMREMGenerator(R).fromEquirectangular(et).texture;
const key=new THREE.DirectionalLight(0xffffff,.8);key.position.set(4,6,3);scene.add(key);

const floorM=new THREE.MeshStandardMaterial({color:0x14171c,roughness:.55,metalness:.3});
const floor=new THREE.Mesh(new THREE.CircleGeometry(14,64),floorM);floor.rotation.x=-Math.PI/2;scene.add(floor);
const gc=document.createElement('canvas');gc.width=gc.height=128;
const gg=gc.getContext('2d'),rg=gg.createRadialGradient(64,64,0,64,64,64);
rg.addColorStop(0,'rgba(255,255,255,1)');rg.addColorStop(1,'rgba(255,255,255,0)');gg.fillStyle=rg;gg.fillRect(0,0,128,128);
const gt=new THREE.CanvasTexture(gc);
const shadow=new THREE.Mesh(new THREE.PlaneGeometry(6.2,3.2),new THREE.MeshBasicMaterial({map:gt,color:0,transparent:true,opacity:.75,depthWrite:false}));
shadow.rotation.x=-Math.PI/2;shadow.position.y=.01;scene.add(shadow);
const glowM=new THREE.MeshBasicMaterial({map:gt,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.9});
const glow=new THREE.Mesh(new THREE.PlaneGeometry(7,3.8),glowM);glow.rotation.x=-Math.PI/2;glow.position.y=.02;scene.add(glow);
const glowL=new THREE.PointLight(0x00e5ff,2.2,7);glowL.position.set(0,.15,0);scene.add(glowL);

/* ---------- materials ---------- */
const body=new THREE.MeshPhysicalMaterial({clearcoatRoughness:.05});
const glass=new THREE.MeshPhysicalMaterial({color:0x0a0e12,metalness:.9,roughness:.05,transparent:true});
const rimM=new THREE.MeshStandardMaterial({metalness:1,roughness:.2});
const calM=new THREE.MeshStandardMaterial({roughness:.4,metalness:.3});
const tireM=new THREE.MeshStandardMaterial({color:0x0b0b0c,roughness:.9});
const dark=new THREE.MeshStandardMaterial({color:0x050506,roughness:.7});
const headM=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xfff4d6,emissiveIntensity:2});
const tailM=new THREE.MeshStandardMaterial({color:0xff2233,emissive:0xff1122,emissiveIntensity:2});

/* ---------- car ---------- */
const car=new THREE.Group(),shell=new THREE.Group();car.add(shell);scene.add(car);
function ex(sh,d,b){const ge=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:!!b,bevelSize:b||0,bevelThickness:b||0,bevelSegments:4,curveSegments:24});ge.translate(0,0,-d/2);return ge;}
const box=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||shell).add(o);return o;};

// ძარის პროფილი (გვერდიდან) + თაღები
const s=new THREE.Shape();
s.moveTo(-2.25,.3);s.lineTo(-1.82,.3);s.lineTo(-1.82,.4);s.absarc(-1.35,.4,.47,Math.PI,0,true);
s.lineTo(-.88,.3);s.lineTo(.88,.3);s.lineTo(.88,.4);s.absarc(1.35,.4,.47,Math.PI,0,true);
s.lineTo(1.82,.3);s.lineTo(2.22,.3);s.lineTo(2.3,.55);s.lineTo(2.15,.82);s.lineTo(1.1,.92);s.lineTo(-1.5,.98);s.lineTo(-2.2,.9);s.lineTo(-2.3,.6);s.closePath();
shell.add(new THREE.Mesh(ex(s,1.7,.07),body));
const cb=new THREE.Shape();cb.moveTo(-1.15,.95);cb.lineTo(-.7,1.42);cb.lineTo(.5,1.44);cb.lineTo(1.1,.93);cb.closePath();
shell.add(new THREE.Mesh(ex(cb,1.45,.03),glass));
const rf=new THREE.Shape();rf.moveTo(-.74,1.39);rf.lineTo(.5,1.41);rf.lineTo(.52,1.46);rf.lineTo(-.7,1.44);rf.closePath();
shell.add(new THREE.Mesh(ex(rf,1.47,.03),body));
[-1,1].forEach(z=>{
  box(.08,.11,.42,headM,2.27,.68,z*.58);box(.06,.1,.5,tailM,-2.27,.72,z*.58);
  box(.16,.09,.08,body,.85,1.0,z*.98);                       // სარკეები
  box(1.1,.012,.012,dark,.1,.62,z*.935);                     // კარის ხაზი
  box(.012,.34,.012,dark,.1,.78,z*.935);box(.012,.34,.012,dark,-.75,.78,z*.935);
});
box(.05,.14,.7,dark,2.29,.5,0);                              // გრილი

const spoiler=new THREE.Group();shell.add(spoiler);
box(.45,.05,1.8,body,-2.15,1.2,0,spoiler);
[-.6,.6].forEach(z=>box(.06,.24,.06,dark,-2.1,1.07,z,spoiler));
const kit=new THREE.Group();shell.add(kit);
box(.4,.04,1.85,dark,2.3,.32,0,kit);                         // სპლიტერი
box(.5,.05,1.5,dark,-2.3,.32,0,kit);                         // დიფუზორი
[-.9,.9].forEach(z=>box(1.5,.07,.05,dark,0,.33,z,kit));      // ზღურბლები
const scoop=box(.5,.07,.5,dark,1.5,.95,0);

/* ---------- wheels ---------- */
const wh=[];
function spokes(w){
  while(w.userData.a.children.length)w.userData.a.remove(w.userData.a.children[0]);
  const n=S.spokes,wd=n>6?.05:.09;
  for(let i=0;i<n;i++){const sp=new THREE.Mesh(new THREE.BoxGeometry(wd,.3,.04),rimM);sp.geometry.translate(0,.15,0);sp.rotation.z=i*Math.PI*2/n;sp.position.z=.13;w.userData.a.add(sp);}
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.06,20),rimM);hub.rotation.x=Math.PI/2;hub.position.z=.14;w.userData.a.add(hub);
}
[[1.35,.82],[1.35,-.82],[-1.35,.82],[-1.35,-.82]].forEach(([x,z])=>{
  const w=new THREE.Group(),a=new THREE.Group();w.userData.a=a;
  const tire=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.3,40),tireM);tire.rotation.x=Math.PI/2;w.add(tire);
  const lip=new THREE.Mesh(new THREE.TorusGeometry(.3,.03,10,40),rimM);lip.position.z=.15;w.add(lip);
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.02,40),dark);disc.rotation.x=Math.PI/2;disc.position.z=.1;w.add(disc);
  const rotor=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.02,32),rimM);rotor.rotation.x=Math.PI/2;rotor.position.z=.105;w.add(rotor);
  box(.1,.2,.05,calM,.2,.04,.115,w);                           // კალიპერი
  w.add(a);w.position.set(x,0,z);if(z<0)w.rotation.y=Math.PI;
  car.add(w);wh.push(w);
});

/* ---------- state -> scene/ui ---------- */
function apply(){
  const f=F[S.finish];body.color.set(S.color);body.metalness=f.m;body.roughness=f.r;body.clearcoat=f.c;
  rimM.color.set(S.rim);calM.color.set(S.cal);
  wh.forEach(w=>{w.scale.set(S.wheel,S.wheel,1);w.position.y=.4*S.wheel;});
  shell.position.y=S.ride;spoiler.visible=S.spoiler;kit.visible=S.kit;scoop.visible=S.scoop;
  glow.visible=glowL.visible=S.glow;glowM.color.set(S.glowColor);glowL.color.set(S.glowColor);
  glass.opacity=.45+.5*S.tint;
  scene.background=new THREE.Color(S.night?0x04050a:0x0f1114);floorM.color.set(S.night?0x0a0c10:0x14171c);
  R.toneMappingExposure=S.night?.7:1.1;key.intensity=S.night?.15:.8;
  headM.emissiveIntensity=S.night?6:2;tailM.emissiveIntensity=S.night?5:2;
}
function rebuildSpokes(){wh.forEach(spokes);}
function sw(el,list,key){list.forEach(c=>{const b=document.createElement('button');b.className='sw';b.style.background=c;b.dataset.c=c;b.setAttribute('aria-label',c);b.onclick=()=>{S[key]=c;sync();};el.appendChild(b);});}
sw($('#colors'),COLORS,'color');sw($('#rims'),RIMS,'rim');sw($('#cal'),CALS,'cal');
function mark(sel,key){document.querySelectorAll(sel+' .sw').forEach(b=>b.classList.toggle('on',b.dataset.c===S[key]));}
function sync(){
  rebuildSpokes();apply();
  mark('#colors','color');mark('#rims','rim');mark('#cal','cal');
  document.querySelectorAll('#fin button').forEach(b=>b.classList.toggle('on',b.dataset.f===S.finish));
  document.querySelectorAll('#spk button').forEach(b=>b.classList.toggle('on',+b.dataset.s===S.spokes));
  $('#cc').value=S.color;$('#ws').value=S.wheel;$('#rd').value=S.ride;$('#sp').checked=S.spoiler;$('#kit').checked=S.kit;
  $('#sc').checked=S.scoop;$('#gl').checked=S.glow;$('#gc').value=S.glowColor;$('#tn').value=S.tint;$('#nt').checked=S.night;
}
const bind=(id,ev,fn)=>$(id)[ev]=fn;
bind('#cc','oninput',e=>{S.color=e.target.value;sync();});
bind('#ws','oninput',e=>{S.wheel=+e.target.value;apply();});
bind('#rd','oninput',e=>{S.ride=+e.target.value;apply();});
bind('#sp','onchange',e=>{S.spoiler=e.target.checked;apply();});
bind('#kit','onchange',e=>{S.kit=e.target.checked;apply();});
bind('#sc','onchange',e=>{S.scoop=e.target.checked;apply();});
bind('#gl','onchange',e=>{S.glow=e.target.checked;apply();});
bind('#gc','oninput',e=>{S.glowColor=e.target.value;apply();});
bind('#tn','oninput',e=>{S.tint=+e.target.value;apply();});
bind('#nt','onchange',e=>{S.night=e.target.checked;apply();});
document.querySelectorAll('#fin button').forEach(b=>b.onclick=()=>{S.finish=b.dataset.f;sync();});
document.querySelectorAll('#spk button').forEach(b=>b.onclick=()=>{S.spokes=+b.dataset.s;sync();});
const pick=a=>a[Math.floor(Math.random()*a.length)];
document.querySelectorAll('#pre button').forEach(b=>b.onclick=()=>{
  const k=b.dataset.p;
  if(k==='rand')Object.assign(S,{color:pick(COLORS),finish:pick(Object.keys(F)),rim:pick(RIMS),cal:pick(CALS),spokes:pick([5,6,10]),wheel:.95+Math.random()*.15,ride:-.06+Math.random()*.1,spoiler:Math.random()<.5,kit:Math.random()<.6,scoop:Math.random()<.3,glow:Math.random()<.4,glowColor:pick(['#00e5ff','#ff2a3d','#7c3aed','#22c55e']),tint:.5+Math.random()*.5});
  else Object.assign(S,{glowColor:'#00e5ff'},PRE[k]);
  sync();
});

/* ---------- შენახვა / გაზიარება / სურათი ---------- */
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),1800);};
$('#save').onclick=()=>{try{localStorage.setItem('tuning-build',JSON.stringify(S));toast('ბილდი შენახულია');}catch(e){toast('შენახვა ვერ მოხერხდა');}};
$('#share').onclick=()=>{
  const url=location.href.split('#')[0]+'#'+btoa(JSON.stringify(S));
  (navigator.clipboard?navigator.clipboard.writeText(url):Promise.reject()).then(()=>toast('ბმული დაკოპირდა'),()=>{location.hash=url.split('#')[1];toast('ბმული მისამართის ველშია');});
};
$('#shot').onclick=()=>{R.render(scene,cam);const a=document.createElement('a');a.download='my-car.png';a.href=cv.toDataURL('image/png');a.click();};
$('#reset').onclick=()=>{Object.assign(S,DEF);sync();};
try{const h=location.hash.slice(1),v=h?atob(h):localStorage.getItem('tuning-build');if(v)Object.assign(S,JSON.parse(v));}catch(e){}

/* ---------- კამერა (გლუვი ორბიტა) ---------- */
let th=-.6,ph=1.35,ds=7.5,tth=th,tph=ph,tds=ds,drag=0,auto=!matchMedia('(prefers-reduced-motion:reduce)').matches,lx=0,ly=0;
cv.addEventListener('pointerdown',e=>{drag=1;auto=false;lx=e.clientX;ly=e.clientY;cv.setPointerCapture(e.pointerId);});
addEventListener('pointerup',()=>drag=0);
cv.addEventListener('pointermove',e=>{if(!drag)return;tth-=(e.clientX-lx)*.008;tph=Math.min(1.5,Math.max(.6,tph-(e.clientY-ly)*.006));lx=e.clientX;ly=e.clientY;});
cv.addEventListener('wheel',e=>{e.preventDefault();tds=Math.min(11,Math.max(4.5,tds+e.deltaY*.005));},{passive:false});
new ResizeObserver(()=>{const r=$('#stage').getBoundingClientRect();R.setSize(r.width,r.height,false);cam.aspect=r.width/r.height;cam.updateProjectionMatrix();}).observe($('#stage'));
(function loop(){
  if(auto)tth+=.003;
  th+=(tth-th)*.12;ph+=(tph-ph)*.12;ds+=(tds-ds)*.12;
  cam.position.set(ds*Math.sin(ph)*Math.sin(th),ds*Math.cos(ph)+.7,ds*Math.sin(ph)*Math.cos(th));
  cam.lookAt(0,.6,0);R.render(scene,cam);requestAnimationFrame(loop);
})();
sync();
