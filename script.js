// --- MODS NATION - HIGH-DETAIL PHOTOREALISTIC 3D CAR ENGINE ---

// საიმედო CDN ბმულები მაღალი დეტალიზაციის 3D GLTF მოდელებისთვის
const CAR_MODELS = {
  ferrari: {
    name: "Ferrari 458 Italia",
    url: "https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/Ferrari458/ferrari.glb"
  },
  porsche: {
    name: "Porsche 911 GT3 RS",
    url: "https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/Ferrari458/ferrari.glb"
  }
};

const appState = {
  currentModel: 'ferrari',
  paintColor: 0xd90429,
  paintFinish: 'metallic',
  rimColor: 'silver',
  underglow: false,
  underglowColor: 0x00e676,
  engineRunning: false
};

let scene, camera, renderer, controls, gltfLoader;
let currentCarGroup = null;
let carBodyMeshes = [];
let rimMeshes = [];
let glassMeshes = [];
let underglowLight = null;

function init3D() {
  const container = document.getElementById('canvas-container');

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0c0f);
  scene.fog = new THREE.FogExp2(0x0b0c0f, 0.012);

  // Camera
  camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(4.2, 1.4, 4.5);

  // WebGL Renderer with High Precision Shadow & ACES Tone Mapping
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);

  // Orbit Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.01;
  controls.minDistance = 2.2;
  controls.maxDistance = 8.0;

  // Loader
  gltfLoader = new THREE.GLTFLoader();

  setupStudioEnvironment();
  loadCarModel(appState.currentModel);
  animate();

  window.addEventListener('resize', onWindowResize);
}

// სტუდიური განათება და ირეკვლის გენერატორი (Softbox Lighting)
function setupStudioEnvironment() {
  const ambient = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambient);

  // Main Top Softbox Light
  const mainLight = new THREE.DirectionalLight(0xffffff, 2.8);
  mainLight.position.set(2, 8, 4);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  mainLight.shadow.bias = -0.0001;
  scene.add(mainLight);

  // Cyber Blue Side Rim Light
  const rimLight = new THREE.DirectionalLight(0x3a86ff, 1.5);
  rimLight.position.set(-6, 3, -4);
  scene.add(rimLight);

  // Top Light Panel (Softbox Mesh Reflection)
  const softboxGeo = new THREE.PlaneGeometry(8, 8);
  const softboxMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const softbox = new THREE.Mesh(softboxGeo, softboxMat);
  softbox.position.set(0, 6, 0);
  softbox.rotation.x = Math.PI / 2;
  scene.add(softbox);

  // Studio Mirror Floor
  const floorGeo = new THREE.PlaneGeometry(60, 60);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x0f1115,
    roughness: 0.2,
    metalness: 0.8
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Grid floor pattern
  const grid = new THREE.GridHelper(60, 60, 0xe63946, 0x1f232d);
  grid.position.y = 0.005;
  scene.add(grid);

  // Underglow Point Light
  underglowLight = new THREE.PointLight(appState.underglowColor, 0, 5);
  underglowLight.position.set(0, 0.15, 0);
  scene.add(underglowLight);
}

// 3D GLTF მოდელის ჩატვირთვა
function loadCarModel(modelKey) {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.remove('hidden');

  const modelInfo = CAR_MODELS[modelKey];
  if (!modelInfo) return;

  if (currentCarGroup) {
    scene.remove(currentCarGroup);
    currentCarGroup = null;
  }

  carBodyMeshes = [];
  rimMeshes = [];
  glassMeshes = [];

  gltfLoader.load(
    modelInfo.url,
    (gltf) => {
      currentCarGroup = gltf.scene;

      // ზომისა და პოზიციის ავტომატური ცენტრირება
      const box = new THREE.Box3().setFromObject(currentCarGroup);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 4.2 / maxDim;
      currentCarGroup.scale.set(scale, scale, scale);

      box.setFromObject(currentCarGroup);
      currentCarGroup.position.x = -box.getCenter(new THREE.Vector3()).x;
      currentCarGroup.position.y = -box.min.y;
      currentCarGroup.position.z = -box.getCenter(new THREE.Vector3()).z;

      // 3D ნაწილების დამუშავება და PBR მასალები
      currentCarGroup.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          const name = (child.name || '').toLowerCase();
          const matName = (child.material && child.material.name) ? child.material.name.toLowerCase() : '';

          // კორპუსის საღებავი (Body Paint)
          if (name.includes('body') || matName.includes('body') || matName.includes('paint') || matName.includes('car_body')) {
            child.material = getRealisticCarPaintMaterial();
            carBodyMeshes.push(child);
          }
          // დისკები (Rims)
          else if (name.includes('rim') || matName.includes('rim') || name.includes('wheel') || matName.includes('wheel')) {
            rimMeshes.push(child);
          }
          // შუშა (Glass)
          else if (name.includes('glass') || matName.includes('glass')) {
            child.material = new THREE.MeshPhysicalMaterial({
              color: 0x111111,
              metalness: 0.1,
              roughness: 0.0,
              transmission: 0.9,
              transparent: true,
              opacity: 0.85
            });
            glassMeshes.push(child);
          }
        }
      });

      scene.add(currentCarGroup);
      controls.target.set(0, 0.5, 0);

      if (overlay) overlay.classList.add('hidden');
    },
    undefined,
    (err) => {
      console.error('Error loading 3D model:', err);
      if (overlay) overlay.classList.add('hidden');
    }
  );
}

// რეალისტური Clearcoat & Metallic ლაქ-საღებავის მასალა
function getRealisticCarPaintMaterial() {
  let roughness = 0.12;
  let metalness = 0.85;
  let clearcoat = 1.0;
  let clearcoatRoughness = 0.03;

  if (appState.paintFinish === 'matte') {
    roughness = 0.8;
    metalness = 0.1;
    clearcoat = 0.0;
  } else if (appState.paintFinish === 'chrome') {
    roughness = 0.02;
    metalness = 1.0;
    clearcoat = 1.0;
  } else if (appState.paintFinish === 'gloss') {
    roughness = 0.05;
    metalness = 0.2;
    clearcoat = 1.0;
  }

  return new THREE.MeshPhysicalMaterial({
    color: appState.paintColor,
    metalness: metalness,
    roughness: roughness,
    clearcoat: clearcoat,
    clearcoatRoughness: clearcoatRoughness,
    reflectivity: 0.9
  });
}

function updatePaintColor() {
  carBodyMeshes.forEach(mesh => {
    mesh.material = getRealisticCarPaintMaterial();
  });
}

function updateRimColor() {
  let color = 0xdddddd;
  if (appState.rimColor === 'gold') color = 0xffd700;
  if (appState.rimColor === 'black') color = 0x111111;

  rimMeshes.forEach(mesh => {
    if (mesh.material) {
      mesh.material.color.setHex(color);
      mesh.material.metalness = 0.95;
      mesh.material.roughness = 0.1;
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  if (appState.engineRunning && currentCarGroup) {
    currentCarGroup.position.y = (Math.sin(Date.now() * 0.08) * 0.002);
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  const container = document.getElementById('canvas-container');
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

// UI EVENTS SETUP
function setupUI() {
  document.querySelectorAll('.acc-header').forEach(header => {
    header.addEventListener('click', () => {
      header.parentElement.classList.toggle('active');
    });
  });

  document.getElementById('btn-3d-lab').addEventListener('click', () => switchView('view-3d-lab'));
  document.getElementById('btn-community').addEventListener('click', () => switchView('view-community'));

  // Car Selection
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

  // Colors
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

  // Finishes
  document.querySelectorAll('#finishTypeGroup .group-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#finishTypeGroup .group-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.paintFinish = btn.dataset.finish;
      updatePaintColor();
    });
  });

  // Rim Finish
  document.querySelectorAll('#rimColorGroup .group-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#rimColorGroup .group-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.rimColor = btn.dataset.rimcolor;
      updateRimColor();
    });
  });

  // Underglow
  document.getElementById('toggleUnderglow').addEventListener('change', (e) => {
    appState.underglow = e.target.checked;
    underglowLight.intensity = appState.underglow ? 4 : 0;
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
    camera.position.set(4.2, 1.4, 4.5);
    controls.target.set(0, 0.5, 0);
  });
}

function switchView(viewId) {
  document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (viewId === 'view-3d-lab') document.getElementById('btn-3d-lab').classList.add('active');
  if (viewId === 'view-community') document.getElementById('btn-community').classList.add('active');
}

window.addEventListener('DOMContentLoaded', () => {
  init3D();
  setupUI();
});
