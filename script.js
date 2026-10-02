// --- APP STATE & DATA ---
const appState = {
  currentModel: 'porsche',
  paintColor: '#808080',
  paintFinish: 'metallic',
  wing: 'stock',
  wingPrice: 0,
  rims: 'stock',
  rimsPrice: 0,
  caliperColor: '#ff0000',
  splitter: false,
  widebody: false,
  underglow: false,
  underglowColor: '#00e676',
  lightsOn: true,
  engineRunning: false
};

const MOD_PRICES = {
  splitter: 850,
  widebody: 3200
};

// --- THREE.JS ENGINE SETUP ---
let scene, camera, renderer, controls;
let carGroup, bodyMesh, wingMesh, rimMeshes = [], caliperMeshes = [], lightMeshes = [], underglowLight;

function init3D() {
  const container = document.getElementById('canvas-container');

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0b0d);
  scene.fog = new THREE.FogExp2(0x0a0b0d, 0.03);

  // Camera
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(4, 1.8, 4.5);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.01;
  controls.minDistance = 2.5;
  controls.maxDistance = 8;

  // Environment Lighting
  setupLighting();

  // Floor Grid Studio
  setupStudioFloor();

  // Load Procedural Car Model
  buildCarModel();

  // Animation Loop
  animate();

  window.addEventListener('resize', onWindowResize);
}

function setupLighting() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
  mainLight.position.set(5, 8, 5);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xff0055, 0.4);
  fillLight.position.set(-5, 3, -5);
  scene.add(fillLight);
}

function setupStudioFloor() {
  const floorGeo = new THREE.PlaneGeometry(30, 30);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x111317,
    roughness: 0.2,
    metalness: 0.8
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(30, 30, 0xe63946, 0x222630);
  grid.position.y = 0.01;
  scene.add(grid);
}

// --- PROCEDURAL CAR BUILDER ---
function buildCarModel() {
  if (carGroup) scene.remove(carGroup);

  carGroup = new THREE.Group();
  rimMeshes = [];
  caliperMeshes = [];
  lightMeshes = [];

  // Body Material
  const bodyMat = getBodyMaterial();

  // 1. Car Base Chassis
  const bodyGeo = new THREE.BoxGeometry(2, 0.6, 4);
  bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 0.6;
  bodyMesh.castShadow = true;
  carGroup.add(bodyMesh);

  // Cabin / Windows
  const cabinGeo = new THREE.BoxGeometry(1.6, 0.5, 2);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x111111,
    metalness: 0.9,
    roughness: 0.1,
    transmission: 0.6,
    transparent: true,
    opacity: 0.8
  });
  const cabin = new THREE.Mesh(cabinGeo, glassMat);
  cabin.position.set(0, 1.05, -0.2);
  cabin.castShadow = true;
  carGroup.add(cabin);

  // 2. Wheels Assembly
  const wheelPositions = [
    [-0.95, 0.35, 1.2],  // Front Left
    [0.95, 0.35, 1.2],   // Front Right
    [-0.95, 0.35, -1.2], // Rear Left
    [0.95, 0.35, -1.2]   // Rear Right
  ];

  wheelPositions.forEach(pos => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(...pos);

    // Tire
    const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 32);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);

    // Rim
    const rimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.31, 16);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.2 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);
    rimMeshes.push(rim);

    // Brake Caliper
    const caliperGeo = new THREE.BoxGeometry(0.1, 0.18, 0.12);
    const caliperMat = new THREE.MeshStandardMaterial({ color: appState.caliperColor });
    const caliper = new THREE.Mesh(caliperGeo, caliperMat);
    caliper.position.set(0, 0.12, 0);
    wheelGroup.add(caliper);
    caliperMeshes.push(caliper);

    carGroup.add(wheelGroup);
  });

  // 3. Headlights & Taillights
  const headLightGeo = new THREE.BoxGeometry(0.4, 0.1, 0.1);
  const headLightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const frontLeftLight = new THREE.Mesh(headLightGeo, headLightMat);
  frontLeftLight.position.set(-0.6, 0.65, 2.01);
  const frontRightLight = frontLeftLight.clone();
  frontRightLight.position.x = 0.6;
  carGroup.add(frontLeftLight, frontRightLight);
  lightMeshes.push(frontLeftLight, frontRightLight);

  const tailLightGeo = new THREE.BoxGeometry(1.6, 0.08, 0.1);
  const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });
  const tailLight = new THREE.Mesh(tailLightGeo, tailLightMat);
  tailLight.position.set(0, 0.65, -2.01);
  carGroup.add(tailLight);
  lightMeshes.push(tailLight);

  // 4. GT Rear Wing Placeholder
  updateWing();

  // 5. Underglow Light
  underglowLight = new THREE.PointLight(appState.underglowColor, 0, 4);
  underglowLight.position.set(0, 0.1, 0);
  carGroup.add(underglowLight);

  scene.add(carGroup);
}

function getBodyMaterial() {
  const roughness = appState.paintFinish === 'matte' ? 0.8 : (appState.paintFinish === 'metallic' ? 0.3 : 0.1);
  const metalness = appState.paintFinish === 'matte' ? 0.1 : (appState.paintFinish === 'metallic' ? 0.9 : 0.5);

  return new THREE.MeshStandardMaterial({
    color: appState.paintColor,
    roughness: roughness,
    metalness: metalness
  });
}

function updateWing() {
  if (wingMesh) carGroup.remove(wingMesh);

  if (appState.wing === 'carbon-gt') {
    const wingGroup = new THREE.Group();
    const bladeGeo = new THREE.BoxGeometry(1.8, 0.04, 0.4);
    const carbonMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });
    const blade = new THREE.Mesh(bladeGeo, carbonMat);
    blade.position.set(0, 1.15, -1.8);

    const pillarGeo = new THREE.BoxGeometry(0.05, 0.3, 0.1);
    const p1 = new THREE.Mesh(pillarGeo, carbonMat);
    p1.position.set(-0.5, 0.95, -1.8);
    const p2 = p1.clone();
    p2.position.x = 0.5;

    wingGroup.add(blade, p1, p2);
    wingMesh = wingGroup;
    carGroup.add(wingMesh);
  }
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Engine Rev Animation Effect
  if (appState.engineRunning) {
    carGroup.position.y = Math.sin(Date.now() * 0.05) * 0.003;
  } else {
    carGroup.position.y = 0;
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  const container = document.getElementById('canvas-container');
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

// --- INTERACTIVE UI LISTENERS & LOGIC ---
function setupUI() {
  // Accordion Toggles
  document.querySelectorAll('.acc-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      item.classList.toggle('active');
    });
  });

  // Top Nav View Switching
  document.getElementById('btn-3d-lab').addEventListener('click', () => switchView('view-3d-lab'));
  document.getElementById('btn-community').addEventListener('click', () => switchView('view-community'));

  // Color Swatches
  document.querySelectorAll('.swatch').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
      document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      appState.paintColor = swatch.dataset.color;
      bodyMesh.material.color.set(appState.paintColor);
    });
  });

  // Custom Color Picker
  document.getElementById('customColorPicker').addEventListener('input', (e) => {
    appState.paintColor = e.target.value;
    bodyMesh.material.color.set(appState.paintColor);
  });

  // Finish Types
  document.querySelectorAll('#finishTypeGroup .group-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#finishTypeGroup .group-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.paintFinish = btn.dataset.finish;
      bodyMesh.material = getBodyMaterial();
    });
  });

  // Wings / Spoilers Selection
  document.querySelectorAll('[data-wing]').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('[data-wing]').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      appState.wing = card.dataset.wing;
      appState.wingPrice = parseInt(card.dataset.price);
      updateWing();
      updateTotalPrice();
    });
  });

  // Rims Selection
  document.querySelectorAll('[data-rim]').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('[data-rim]').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      appState.rims = card.dataset.rim;
      appState.rimsPrice = parseInt(card.dataset.price);
      
      const rimColor = card.dataset.rim === 'bbs' ? 0xffd700 : 0xdddddd;
      rimMeshes.forEach(r => r.material.color.setHex(rimColor));
      updateTotalPrice();
    });
  });

  // Caliper Colors
  document.querySelectorAll('.caliper-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.caliper-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      appState.caliperColor = dot.dataset.caliper;
      caliperMeshes.forEach(c => c.material.color.set(appState.caliperColor));
    });
  });

  // Underglow Toggle
  document.getElementById('toggleUnderglow').addEventListener('change', (e) => {
    appState.underglow = e.target.checked;
    underglowLight.intensity = appState.underglow ? 3 : 0;
  });

  document.getElementById('underglowPicker').addEventListener('input', (e) => {
    appState.underglowColor = e.target.value;
    underglowLight.color.set(appState.underglowColor);
  });

  // Splitter & Widebody Toggles
  document.getElementById('toggleSplitter').addEventListener('change', (e) => {
    appState.splitter = e.target.checked;
    updateTotalPrice();
  });

  document.getElementById('toggleWidebody').addEventListener('change', (e) => {
    appState.widebody = e.target.checked;
    updateTotalPrice();
  });

  // Car Model Switcher
  document.getElementById('carModelSelect').addEventListener('change', (e) => {
    appState.currentModel = e.target.value;
    buildCarModel();
  });

  document.querySelectorAll('.car-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.car-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      appState.currentModel = card.dataset.model;
      document.getElementById('carModelSelect').value = appState.currentModel;
      buildCarModel();
    });
  });

  // HUD Engine Sound Button
  const engineBtn = document.getElementById('btnEngineSound');
  engineBtn.addEventListener('click', () => {
    appState.engineRunning = !appState.engineRunning;
    engineBtn.classList.toggle('running', appState.engineRunning);
    engineBtn.querySelector('span').innerText = appState.engineRunning ? 'ENGINE ON' : 'ENGINE START';
  });

  // Camera Reset
  document.getElementById('btnResetView').addEventListener('click', () => {
    camera.position.set(4, 1.8, 4.5);
    controls.target.set(0, 0.6, 0);
  });

  // Modal Cart
  document.getElementById('openCartBtn').addEventListener('click', openCartModal);
  document.getElementById('closeCartBtn').addEventListener('click', closeCartModal);
  document.getElementById('closeCartBtn2').addEventListener('click', closeCartModal);

  // Build in 3D Preset buttons in Community Tab
  document.querySelectorAll('.build-in-3d-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      appState.currentModel = preset;
      document.getElementById('carModelSelect').value = preset;
      switchView('view-3d-lab');
      buildCarModel();
    });
  });
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
  if (appState.splitter) total += MOD_PRICES.splitter;
  if (appState.widebody) total += MOD_PRICES.widebody;

  document.getElementById('totalPriceDisplay').innerText = `$${total.toLocaleString()}`;
}

function openCartModal() {
  const itemsList = document.getElementById('cartItemsList');
  itemsList.innerHTML = '';

  let total = 0;

  if (appState.wingPrice > 0) {
    itemsList.innerHTML += `<li><span>Rear Wing Option</span> <strong>+$${appState.wingPrice.toLocaleString()}</strong></li>`;
    total += appState.wingPrice;
  }
  if (appState.rimsPrice > 0) {
    itemsList.innerHTML += `<li><span>Forged Rims Package</span> <strong>+$${appState.rimsPrice.toLocaleString()}</strong></li>`;
    total += appState.rimsPrice;
  }
  if (appState.splitter) {
    itemsList.innerHTML += `<li><span>Front Carbon Splitter</span> <strong>+$${MOD_PRICES.splitter.toLocaleString()}</strong></li>`;
    total += MOD_PRICES.splitter;
  }
  if (appState.widebody) {
    itemsList.innerHTML += `<li><span>Widebody Fender Flares</span> <strong>+$${MOD_PRICES.widebody.toLocaleString()}</strong></li>`;
    total += MOD_PRICES.widebody;
  }

  if (total === 0) {
    itemsList.innerHTML = '<li style="color:#8d95a1;">No aftermarket upgrades selected yet.</li>';
  }

  document.getElementById('modalTotalPrice').innerText = `$${total.toLocaleString()}`;
  document.getElementById('cartModal').classList.add('active');
}

function closeCartModal() {
  document.getElementById('cartModal').classList.remove('active');
}

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
  init3D();
  setupUI();
  // Open first accordion item by default
  document.querySelector('.accordion-item').classList.add('active');
});
