// Główny skrypt — tworzy scenę, koła, obsługuje interakcje i renderowanie
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.156.1/build/three.module.js';
import { Gear } from './gear.js';
import { createStatsPanel } from './ui.js';

// Ustawienia początkowe
const canvas = document.getElementById('glcanvas');
const sidebarStats = document.getElementById('stats');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setClearColor(0x0b0c10);

const scene = new THREE.Scene();
const sceneGroup = new THREE.Group(); // to będzie przesuwane przy panowaniu
scene.add(sceneGroup);

// Kamera
const fov = 60;
const aspect = canvas.clientWidth / canvas.clientHeight;
const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);

// Światło
const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 0.8);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 0.6);
dir.position.set(5, 10, 7);
scene.add(dir);

// Siatka pomocnicza
const gridMat = new THREE.LineBasicMaterial({ color: 0x1e2230 });
const grid = new THREE.GridHelper(40, 40, 0x2a3240, 0x151821);
grid.position.y = -1.2;
scene.add(grid);

// Gears array (instancje Gear)
const gears = [];

// Funkcja tworząca domyślne 3 koła różnej wielkości
function createInitialGears() {
  // Przykładowe liczby zębów
  const teeth = [20, 36, 48];
  const modules = [1, 1, 1];

  // Tworzenie kół
  for (let i = 0; i < teeth.length; i++) {
    const g = new Gear(teeth[i], modules[i], 0.8);
    gears.push(g);
    sceneGroup.add(g.getMesh());
  }

  // Ustawiamy je tak, aby stykały się (zgranie)
  // Umieszczamy środkowe koło w 0,0,0
  // Left: negative X, Right: positive X
  const center = gears[1];
  center.getMesh().position.set(0, 0, 0);
  const left = gears[0];
  const right = gears[2];

  left.getMesh().position.set(-(left.getRadius() + center.getRadius()), 0, 0);
  right.getMesh().position.set(center.getRadius() + right.getRadius(), 0, 0);

  // Ustaw domyślne rotacje na 0
  for (const g of gears) g.setRotation(0);
}

createInitialGears();

// Ustalamy powiązania (sąsiedztwo) jeśli odległość ≈ suma promieni
const adjacency = new Map(); // gear -> [neighbors]
function buildAdjacency() {
  adjacency.clear();
  for (let i = 0; i < gears.length; i++) adjacency.set(gears[i], []);
  for (let i = 0; i < gears.length; i++) {
    for (let j = i + 1; j < gears.length; j++) {
      const A = gears[i];
      const B = gears[j];
      const posA = A.getMesh().position;
      const posB = B.getMesh().position;
      const dist = posA.distanceTo(posB);
      const sumR = A.getRadius() + B.getRadius();
      if (Math.abs(dist - sumR) < 0.01 + Math.max(A.getRadius(), B.getRadius()) * 0.02) {
        adjacency.get(A).push(B);
        adjacency.get(B).push(A);
      }
    }
  }
}
buildAdjacency();

// Kamera i początkowe ustawienia widoku
function placeCamera() {
  // ustawiamy kamerę tak, by objąć wszystkie koła
  let maxR = 0;
  for (const g of gears) maxR = Math.max(maxR, g.getRadius());
  const distance = maxR * 6 + 2;
  camera.position.set(0, distance * 0.4, distance);
  camera.lookAt(0, 0, 0);
}
placeCamera();

// UI panel
const stats = createStatsPanel(sidebarStats);
stats.update(gears);

// Raycaster do wykrywania kliknięć na koła
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Interakcje
let isPanning = false;
let isMiddlePanning = false;
let panStart = { x: 0, y: 0 };
let prevPointer = { x: 0, y: 0 };

// Do obracania koła prawym przyciskiem
let rotatingGear = null;
let rotating = false;
let rotatePrevX = 0;

// Pomocnicze: przesuwamy scenę (a nie kamerę), żeby "kamera zawsze wycentrowana na środku sceny"
function panScene(deltaX, deltaY) {
  // delta w piks -> przeliczamy na świat
  const factor = 0.002 * (camera.position.y + 1);
  sceneGroup.position.x += -deltaX * factor;
  sceneGroup.position.y += deltaY * factor;
}

function onPointerDown(e) {
  // ustawienie pointera
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  if (e.button === 0) { // LPM - przesuwanie sceny
    isPanning = true;
    panStart.x = e.clientX;
    panStart.y = e.clientY;
  } else if (e.button === 1) { // środkowy przycisk - też przesuwanie sceny
    isMiddlePanning = true;
    panStart.x = e.clientX;
    panStart.y = e.clientY;
  } else if (e.button === 2) { // PPM - obracanie koła (jeśli na kole)
    // sprawdź kolizję
    raycaster.setFromCamera(pointer, camera);
    // bierzemy pickMesh'ie (niewidoczne) do szybkiego wykrycia
    const pickMeshes = [];
    for (const g of gears) pickMeshes.push(g.pickMesh);
    const intersects = raycaster.intersectObjects(pickMeshes, true);
    if (intersects.length > 0) {
      const mesh = intersects[0].object;
      // mesh.parent to grupa koła
      let grp = mesh.parent;
      // sprawdź czy user kliknął w grupę z przypisanym gearem
      while (grp && !grp.userData.gear) grp = grp.parent;
      if (grp && grp.userData.gear) {
        rotatingGear = grp.userData.gear;
        rotating = true;
        rotatePrevX = e.clientX;
      }
    }
  }
}

function onPointerMove(e) {
  if (isPanning || isMiddlePanning) {
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    panStart.x = e.clientX;
    panStart.y = e.clientY;
    panScene(dx, dy);
  }

  if (rotating && rotatingGear) {
    const dx = e.clientX - rotatePrevX;
    rotatePrevX = e.clientX;
    const rotateFactor = 0.01; // czułość
    const deltaAngle = dx * rotateFactor;

    // Obracamy wybrane koło i propagujemy obrót
    propagateRotation(rotatingGear, deltaAngle);
  }
}

function onPointerUp(e) {
  if (e.button === 0) isPanning = false;
  if (e.button === 1) isMiddlePanning = false;
  if (e.button === 2) {
    rotating = false;
    rotatingGear = null;
  }
}

// Propagacja obrotu przez graf sąsiedztwa (BFS) — kinematyczne sprzężenie zębów
function propagateRotation(sourceGear, deltaAngle) {
  // deltaAngle dotyczy sourceGear (w radianach)
  const queue = [{ gear: sourceGear, delta: deltaAngle }];
  const visited = new Set();

  while (queue.length > 0) {
    const node = queue.shift();
    const g = node.gear;
    const d = node.delta;
    if (visited.has(g)) continue;
    visited.add(g);
    g.rotateBy(d);

    const neighs = adjacency.get(g) || [];
    for (const nb of neighs) {
      if (visited.has(nb)) continue;
      // przy zębach: kąt obrotu nb = - d * (teeth_g / teeth_nb)
      const nbDelta = -d * (g.teeth / nb.teeth);
      queue.push({ gear: nb, delta: nbDelta });
    }
  }
}

// Zoom przy scrollu
function onWheel(e) {
  e.preventDefault();
  const delta = e.deltaY;
  // przyrost odległości kamery od środka sceny
  const sign = Math.sign(delta);
  const pow = Math.min(2.5, Math.abs(delta) * 0.002);
  const camDir = new THREE.Vector3();
  camera.getWorldDirection(camDir);
  camera.position.addScaledVector(camDir, sign * pow);
  // ograniczenia
  const minY = 1.2;
  const maxY = 200;
  camera.position.y = THREE.MathUtils.clamp(camera.position.y, minY, maxY);
}

// Zmiana rozmiaru
function onWindowResize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', onWindowResize);

// Pointer events
canvas.addEventListener('pointerdown', onPointerDown);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);
canvas.addEventListener('wheel', onWheel, { passive: false });

// Blokuj menu kontekstowe na canvas (wygodne przy używaniu PPM)
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// Animacja
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update(gears);
}
animate();

// Eksport / global (przydatne do debugowania)
window.__GEARS__ = gears;
window.__ADJ__ = adjacency;
