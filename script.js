// --- MODS NATION - REALISTIC 3D CAR CONFIGURATOR ---

// რეალური 3D ავტომობილების GLTF/GLB მოდელები
const CAR_MODELS = {
  porsche: {
    name: "Porsche 911 GT3 RS",
    url: "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Ferrari458/ferrari.glb"
  },
  mustang: {
    name: "Ford Mustang Dark Horse",
    url: "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Ferrari458/ferrari.glb"
  },
  m4: {
    name: "BMW M4 Competition",
    url: "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Ferrari458/ferrari.glb"
  },
  gtr: {
    name: "Nissan GT-R Nismo",
    url: "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Ferrari458/ferrari.glb"
  }
};

const appState = {
  currentModel: 'porsche',
  paintColor: 0x555555,
  paintFinish: 'metallic',
  rimColor: 0xdddddd,
  rimsPrice: 0,
  wingPrice: 0,
  underglow: false,
  underglowColor: 0x00e676,
  engineRunning: false
};

let scene, camera, renderer, controls, gltfLoader;
let currentCarModel = null;
let carBodyMeshes = [];
let rimMeshes = [];
let underglowLight = null;

function init3D() {
  const container = document.getElementById('canvas-container');

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0b0d);
  scene.fog = new THREE.FogExp2(0x0a0b0d, 0.012);

  // Camera
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(4.2, 1.6, 4.5);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // Orbit Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.02;
  controls.minDistance = 2.0;
  controls.maxDistance = 8.0;

  // GLTF Loader
  gltfLoader = new THREE.GLTFLoader();

  setupStudioEnvironment();
  loadCarModel(appState.currentModel);
  animate();

  window.addEventListener('resize', onWindowResize);
}

function setupStudioEnvironment() {
  // Ambient Soft Light
  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);

  // Directional Shadow Light
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  scene.add(keyLight);

  // Fill Light (Cyber Blue Side Highlight)
  const fillLight = new THREE.DirectionalLight(0x3a86ff, 1.2);
  fillLight.position.set(-6, 4, -5);
  scene.add(fillLight);

  // Reflective Metallic Studio Floor
  const floorGeo = new THREE.PlaneGeometry(50, 50);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x0e1014,
    roughness: 0.15,
    metalness: 0.85
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Floor Grid
  const grid = new THREE.GridHelper(50, 50, 0xe63946, 0x222630);
  grid.position.y = 0.005;
  scene.add(grid);

  // Neon Underglow Light
  underglowLight = new THREE.PointLight(appState.underglowColor, 0, 6);
  underglowLight.position.set(0, 0.15, 0);
  scene.add(underglowLight);
}

// რეალური 3D GLTF მოდელის ჩატვირთვა
function loadCarModel(modelKey) {
  const modelInfo = CAR_MODELS[modelKey];
  if (!modelInfo) return;

  if (currentCarModel) {
    scene.remove(currentCarModel);
    currentCarModel = null;
  }

  carBodyMeshes = [];
  rimMeshes = [];

  gltfLoader.load(
    modelInfo.url,
    (gltf) => {
      currentCarModel = gltf.scene;

      // მოდელის ზომის და პოზიციის ავტომატური კორექტირება
      const box = new THREE.Box3().setFromObject(currentCarModel);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 4.2 / maxDim;
      currentCarModel.scale.set(scale, scale, scale);

      box.setFromObject(currentCarModel);
      currentCarModel.position.x = -box.getCenter(new THREE.Vector3()).x;
      currentCarModel.position.y = -box.min.y;
      currentCarModel.position.z = -box.getCenter(new THREE.Vector3()).z;

      // 3D მოდელის დეტალებისა და მასალების დამუშავება
      currentCarModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          const matName = child.material.name ? child.material.name.toLowerCase() : '';
          const meshName = child.name ? child.name.toLowerCase() : '';

          // ავტომობილის კორპუსის საღებავის PBR მასალით ჩანაცვლება
          if (matName.includes('body') || matName.includes('paint') || matName.includes('car_body') || matName.includes('red') || meshName.includes('body')) {
            child.material = getRealisticCarPaintMaterial();
            carBodyMeshes.push(child);
          } else if (matName.includes('glass') || meshName.includes('glass')) {
            child.material = new THREE.MeshPhysicalMaterial({
              color: 0x111111,
              metalness: 0.1,
              roughness: 0.05,
              transmission: 0.85,
              opacity: 0.8,
              transparent: true
            });
          } else if (matName.includes('rim') || matName.includes('wheel') || meshName.includes('rim')) {
            rimMeshes.push(child);
          }
        }
      });

      scene.add(currentCarModel);
      controls.target.set(0, 0.6, 0);
    },
    undefined,
    (error) => {
      console.error('Error loading 3D GLTF model:', error);
    }
  );
}

// რეალისტური ლაქ-საღებავის მასალა (Clearcoat & Metallic)
function getRealisticCarPaintMaterial() {
  let roughness = 0.15;
  let metalness = 0.85;
  let clearcoat = 1.0;
  let clearcoatRoughness = 0.03;

  if (appState.paintFinish === 'matte') {
    roughness = 0.75;
    metalness = 0.2;
    clearcoat = 0.0;
  } else if (appState.paintFinish === 'chrome') {
    roughness = 0.02;
    metalness = 1.0;
    clearcoat = 1.0;
  } else if (appState.paintFinish === 'gloss') {
    roughness = 0.05;
    metalness = 0.3;
    clearcoat = 1.0;
  }

  return new THREE.MeshPhysicalMaterial({
    color: appState.paintColor,
    metalness: metalness,
    roughness: roughness,
    clearcoat: clearcoat,
    clearcoatRoughness: clearcoatRoughness,
    reflectivity: 1.0
  });
}

function updatePaintColor() {
  carBodyMeshes.forEach(mesh => {
    mesh.material = getRealisticCarPaintMaterial();
  });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  if (appState.engineRunning && currentCarModel) {
    currentCarModel.position.y = (Math.sin(Date.now() * 0.08) * 0.002);
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  const container = document.getElementById('canvas-container');
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

// UI EVENTS
function setupUI() {
  document.querySelectorAll('.acc-header').forEach(header => {
    header.addEventListener('click', () => {
      header.parentElement.classList.toggle('active');
    });
  });

  document.getElementById('btn-3d-lab').addEventListener('click', () => switchView('view-3d-lab'));
  document.getElementById('btn-community').addEventListener('click', () => switchView('view-community'));

  // Car model selection
  document.querySelectorAll('.car-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.car-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const modelKey = card.dataset.model;
      appState.currentModel = modelKey;
      loadCarModel(modelKey);
    });
  });

  document.getElementById('carModelSelect').addEventListener('change', (e) => {
    const modelKey = e.target.value;
    appState.currentModel = modelKey;
    loadCarModel(modelKey);
  });

  // Color Swatches
  document.querySelectorAll('.swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      appState.paintColor = parseInt(swatch.dataset.color.replace('#', '0x'));
      updatePaintColor();
    });
  });

  document.getElementById('customColorPicker').addEventListener('input', (e) => {
    appState.paintColor = parseInt(e.target.value.replace('#', '0x'));
    updatePaintColor();
  });

  // Finish Types
  document.querySelectorAll('#finishTypeGroup .group-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#finishTypeGroup .group-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.paintFinish = btn.dataset.finish;
      updatePaintColor();
    });
  });

  // Wheels Rims
  document.querySelectorAll('[data-rim]').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('[data-rim]').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      appState.rimsPrice = parseInt(card.dataset.price);

      const color = card.dataset.rim === 'bbs' ? 0xffd700 : 0xdddddd;
      rimMeshes.forEach(mesh => {
        if (mesh.material) mesh.material.color.setHex(color);
      });
      updateTotalPrice();
    });
  });

  // Neon Underglow
  document.getElementById('toggleUnderglow').addEventListener('change', (e) => {
    appState.underglow = e.target.checked;
    underglowLight.intensity = appState.underglow ? 5 : 0;
  });

  document.getElementById('underglowPicker').addEventListener('input', (e) => {
    appState.underglowColor = parseInt(e.target.value.replace('#', '0x'));
    underglowLight.color.setHex(appState.underglowColor);
  });

  // Engine Start Toggle
  const engineBtn = document.getElementById('btnEngineSound');
  engineBtn.addEventListener('click', () => {
    appState.engineRunning = !appState.engineRunning;
    engineBtn.classList.toggle('running', appState.engineRunning);
    engineBtn.querySelector('span').innerText = appState.engineRunning ? 'ENGINE ON' : 'ENGINE START';
  });

  document.getElementById('btnResetView').addEventListener('click', () => {
    camera.position.set(4.2, 1.6, 4.5);
    controls.target.set(0, 0.6, 0);
  });

  document.getElementById('openCartBtn').addEventListener('click', openCartModal);
  document.getElementById('closeCartBtn').addEventListener('click', closeCartModal);
  document.getElementById('closeCartBtn2').addEventListener('click', closeCartModal);
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
