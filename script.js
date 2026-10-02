// --- CAR MODELS GLTF DATA & APP STATE ---
const CAR_DATA = {
  porsche: {
    name: "Porsche 911 GT3 RS",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BugattiAttire/glTF-Binary/BugattiAttire.glb"
  },
  mustang: {
    name: "Ford Mustang Dark Horse",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/ToyCar/glTF-Binary/ToyCar.glb"
  },
  m4: {
    name: "BMW M4 Competition",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb"
  },
  gtr: {
    name: "Nissan GT-R Nismo",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb"
  }
};

const appState = {
  currentModel: 'porsche',
  paintColor: '#555555',
  paintFinish: 'metallic',
  wing: 'stock',
  wingPrice: 0,
  rims: 'stock',
  rimsPrice: 0,
  caliperColor: '#ff0000',
  underglow: false,
  underglowColor: '#00e676',
  lightsOn: true,
  engineRunning: false
};

let scene, camera, renderer, controls, gltfLoader;
let currentCarGroup, carBodyMaterials = [], rimMaterials = [], caliperMaterials = [];
let underglowLight, headLights = [];

function init3D() {
  const container = document.getElementById('canvas-container');

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0b0d);
  scene.fog = new THREE.FogExp2(0x0a0b0d, 0.02);

  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(4, 1.8, 4.5);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.01;
  controls.minDistance = 2.5;
  controls.maxDistance = 10;

  gltfLoader = new THREE.GLTFLoader();

  setupStudioEnvironment();
  buildProceduralRealisticCar();
  animate();

  window.addEventListener('resize', onWindowResize);
}

function setupStudioEnvironment() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
  mainLight.position.set(5, 8, 5);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0x0088ff, 0.5);
  fillLight.position.set(-5, 3, -5);
  scene.add(fillLight);

  // Reflective Metallic Studio Floor
  const floorGeo = new THREE.PlaneGeometry(30, 30);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x111317,
    roughness: 0.15,
    metalness: 0.85
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(30, 30, 0xe63946, 0x222630);
  grid.position.y = 0.01;
  scene.add(grid);
}

// REALISTIC CAR MESH GENERATOR (PROPORTIONAL AUTOMOTIVE SHAPES)
function buildProceduralRealisticCar() {
  if (currentCarGroup) scene.remove(currentCarGroup);

  currentCarGroup = new THREE.Group();
  carBodyMaterials = [];
  rimMaterials = [];
  caliperMaterials = [];
  headLights = [];

  // Realistic Car Paint Material
  const bodyMat = getRealisticPaintMaterial();
  carBodyMaterials.push(bodyMat);

  // Smooth Aerodynamic Car Body Frame
  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-2.0, 0.3);
  bodyShape.lineTo(-1.8, 0.55);
  bodyShape.lineTo(-0.8, 0.65);
  bodyShape.lineTo(-0.3, 1.25);
  bodyShape.lineTo(0.8, 1.25);
  bodyShape.lineTo(1.5, 0.7);
  bodyShape.lineTo(2.0, 0.6);
  bodyShape.lineTo(2.1, 0.3);
  bodyShape.lineTo(-2.0, 0.3);

  const extrudeSettings = {
    steps: 2,
    depth: 1.6,
    bevelEnabled: true,
    bevelThickness: 0.15,
    bevelSize: 0.15,
    bevelSegments: 5
  };

  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
  bodyGeo.center();
  const carBody = new THREE.Mesh(bodyGeo, bodyMat);
  carBody.position.y = 0.65;
  carBody.castShadow = true;
  carBody.receiveShadow = true;
  currentCarGroup.add(carBody);

  // Tinted Glass Canopy
  const glassGeo = new THREE.BoxGeometry(1.4, 0.5, 1.45);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x050505,
    metalness: 0.9,
    roughness: 0.1,
    transmission: 0.8,
    transparent: true,
    opacity: 0.85
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0.1, 1.1, 0);
  currentCarGroup.add(glass);

  // Realistic Wheels & Alloy Rims
  const wheelPositions = [
    [-1.2, 0.4, 0.85],
    [1.2, 0.4, 0.85],
    [-1.2, 0.4, -0.85],
    [1.2, 0.4, -0.85]
  ];

  wheelPositions.forEach(pos => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(...pos);

    // Rubber Tire
    const tireGeo = new THREE.TorusGeometry(0.32, 0.12, 16, 32);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);

    // Forged Metallic Rim
    const rimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 20);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.95, roughness: 0.1 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    wheelGroup.add(rim);
    rimMaterials.push(rimMat);

    // Red Sport Calipers
    const caliperGeo = new THREE.BoxGeometry(0.1, 0.18, 0.12);
    const caliperMat = new THREE.MeshStandardMaterial({ color: appState.caliperColor });
    const caliper = new THREE.Mesh(caliperGeo, caliperMat);
    caliper.position.set(0.12, 0, 0);
    wheelGroup.add(caliper);
    caliperMaterials.push(caliperMat);

    currentCarGroup.add(wheelGroup);
  });

  // LED Headlights with Light Beams
  const lightGeo = new THREE.SphereGeometry(0.08, 16, 16);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  
  const headlightL = new THREE.Mesh(lightGeo, lightMat);
  headlightL.position.set(2.05, 0.6, 0.6);
  const headlightR = headlightL.clone();
  headlightR.position.z = -0.6;

  const spotL = new THREE.SpotLight(0xffffff, 3, 10, Math.PI / 6, 0.5);
  spotL.position.copy(headlightL.position);
  spotL.target.position.set(6, 0, 0.6);
  
  currentCarGroup.add(headlightL, headlightR, spotL, spotL.target);
  headLights.push(spotL);

  // Underglow Lighting
  underglowLight = new THREE.PointLight(appState.underglowColor, 0, 5);
  underglowLight.position.set(0, 0.1, 0);
  currentCarGroup.add(underglowLight);

  scene.add(currentCarGroup);
}

function getRealisticPaintMaterial() {
  let roughness = 0.2;
  let metalness = 0.8;

  if (appState.paintFinish === 'matte') {
    roughness = 0.8;
    metalness = 0.2;
  } else if (appState.paintFinish === 'chrome') {
    roughness = 0.05;
    metalness = 1.0;
  } else if (appState.paintFinish === 'gloss') {
    roughness = 0.1;
    metalness = 0.3;
  }

  return new THREE.MeshStandardMaterial({
    color: appState.paintColor,
    roughness: roughness,
    metalness: metalness
  });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  if (appState.engineRunning) {
    currentCarGroup.position.y = Math.sin(Date.now() * 0.06) * 0.003;
  } else {
    currentCarGroup.position.y = 0;
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  const container = document.getElementById('canvas-container');
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

// UI EVENT LISTENERS
function setupUI() {
  document.querySelectorAll('.acc-header').forEach(header => {
    header.addEventListener('click', () => {
      header.parentElement.classList.toggle('active');
    });
  });

  document.getElementById('btn-3d-lab').addEventListener('click', () => switchView('view-3d-lab'));
  document.getElementById('btn-community').addEventListener('click', () => switchView('view-community'));

  // Color Swatches
  document.querySelectorAll('.swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      appState.paintColor = swatch.dataset.color;
      updateCarMaterials();
    });
  });

  document.getElementById('customColorPicker').addEventListener('input', (e) => {
    appState.paintColor = e.target.value;
    updateCarMaterials();
  });

  // Finish Types
  document.querySelectorAll('#finishTypeGroup .group-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#finishTypeGroup .group-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.paintFinish = btn.dataset.finish;
      buildProceduralRealisticCar();
    });
  });

  // Wheels Rims
  document.querySelectorAll('[data-rim]').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('[data-rim]').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      appState.rimsPrice = parseInt(card.dataset.price);
      const color = card.dataset.rim === 'bbs' ? 0xffd700 : 0xdddddd;
      rimMaterials.forEach(m => m.color.setHex(color));
      updateTotalPrice();
    });
  });

  // Caliper Colors
  document.querySelectorAll('.caliper-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.caliper-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      appState.caliperColor = dot.dataset.caliper;
      caliperMaterials.forEach(m => m.color.set(appState.caliperColor));
    });
  });

  // Neon Underglow
  document.getElementById('toggleUnderglow').addEventListener('change', (e) => {
    appState.underglow = e.target.checked;
    underglowLight.intensity = appState.underglow ? 4 : 0;
  });

  document.getElementById('underglowPicker').addEventListener('input', (e) => {
    appState.underglowColor = e.target.value;
    underglowLight.color.set(appState.underglowColor);
  });

  // Engine Start Audio / Animation
  const engineBtn = document.getElementById('btnEngineSound');
  engineBtn.addEventListener('click', () => {
    appState.engineRunning = !appState.engineRunning;
    engineBtn.classList.toggle('running', appState.engineRunning);
    engineBtn.querySelector('span').innerText = appState.engineRunning ? 'ENGINE ON' : 'ENGINE START';
  });

  document.getElementById('btnResetView').addEventListener('click', () => {
    camera.position.set(4, 1.8, 4.5);
    controls.target.set(0, 0.6, 0);
  });

  document.getElementById('openCartBtn').addEventListener('click', openCartModal);
  document.getElementById('closeCartBtn').addEventListener('click', closeCartModal);
  document.getElementById('closeCartBtn2').addEventListener('click', closeCartModal);
}

function updateCarMaterials() {
  carBodyMaterials.forEach(m => m.color.set(appState.paintColor));
}

function switchView(viewId) {
  document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (viewId === 'view-3d-lab') document.getElementById('btn-3d-lab').classList.add('active');
  if (viewId === 'view-community') document.getElementById('btn-community').classList.add('active');
}

function updateTotalPrice() {
  let total = appState.wingPrice + appState.rimsPrice;
  document.getElementById('totalPriceDisplay').innerText = `$${total.toLocaleString()}`;
}

function openCartModal() {
  const itemsList = document.getElementById('cartItemsList');
  itemsList.innerHTML = '';
  let total = appState.wingPrice + appState.rimsPrice;

  if (appState.rimsPrice > 0) {
    itemsList.innerHTML += `<li><span>Forged Alloy Rims</span> <strong>+$${appState.rimsPrice.toLocaleString()}</strong></li>`;
  }
  if (total === 0) {
    itemsList.innerHTML = '<li style="color:#8d95a1;">No extra mods selected.</li>';
  }

  document.getElementById('modalTotalPrice').innerText = `$${total.toLocaleString()}`;
  document.getElementById('cartModal').classList.add('active');
}

function closeCartModal() {
  document.getElementById('cartModal').classList.remove('active');
}

window.addEventListener('DOMContentLoaded', () => {
  init3D();
  setupUI();
});
