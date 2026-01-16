// Klasa tworząca wizualne koło zębate (geometria + zęby + kropka)
// Eksportuje klasę Gear
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.156.1/build/three.module.js';

export class Gear {
  // teeth: liczba zębów (integer)
  // module: rozmiar modułu zęba (skaluje promień)
  // width: grubość koła
  constructor(teeth = 24, module = 1, width = 0.6, material = null) {
    this.teeth = Math.max(4, Math.floor(teeth));
    this.module = module;
    this.width = width;
    // Przyjmujemy promień wprost proporcjonalny do liczby zębów
    this.radius = this.teeth * this.module * 0.06 + 0.2; // skalowanie estetyczne

    this.group = new THREE.Group();
    this.group.userData.gear = this; // odwołanie w raycastingu

    // Materiał domyślny
    this.material = material || new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x8899ff),
      metalness: 0.6,
      roughness: 0.4,
    });

    this._buildBody();
    this.rotationAngle = 0; // w radianach
  }

  _buildBody() {
    // Rdzeń koła - cylinder
    const bodyGeom = new THREE.CylinderGeometry(this.radius * 0.82, this.radius * 0.82, this.width, 64);
    const body = new THREE.Mesh(bodyGeom, this.material);
    body.rotation.x = Math.PI / 2;
    this.group.add(body);

    // Piasta (środek)
    const hubGeom = new THREE.CylinderGeometry(this.radius * 0.18, this.radius * 0.18, this.width + 0.02, 32);
    const hub = new THREE.Mesh(hubGeom, new THREE.MeshStandardMaterial({ color: 0x222233, metalness: 0.5, roughness: 0.6 }));
    hub.rotation.x = Math.PI / 2;
    this.group.add(hub);

    // Zęby - małe prostopadłościany rozmieszczone dookoła
    const toothCount = this.teeth;
    const toothDepth = this.module * 0.16 + 0.04;
    const toothWidth = (2 * Math.PI * this.radius) / (toothCount * 1.6); // trochę wolnego miejsca
    const toothHeight = this.width * 0.95;
    const toothGeom = new THREE.BoxGeometry(toothWidth, toothHeight, toothDepth);
    const toothMat = new THREE.MeshStandardMaterial({ color: 0xd9d9e6, metalness: 0.5, roughness: 0.45 });

    for (let i = 0; i < toothCount; i++) {
      const t = new THREE.Mesh(toothGeom, toothMat);
      const angle = (i / toothCount) * Math.PI * 2;
      const r = this.radius + toothDepth / 2;
      t.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      t.rotation.y = -angle;
      this.group.add(t);
    }

    // Kropka informacyjna — mała kulka na obwodzie, żeby było widać obrót
    const dotGeom = new THREE.SphereGeometry(this.radius * 0.06, 12, 12);
    const dotMat = new THREE.MeshStandardMaterial({ color: 0xffcc33, emissive: 0x442200, metalness: 0.3, roughness: 0.5 });
    const dot = new THREE.Mesh(dotGeom, dotMat);
    // ustawiamy kropkę na kącie zero (na +X)
    dot.position.set(this.radius * 0.98, 0, 0);
    dot.name = "dot";
    this.group.add(dot);

    // Kolizje / raycasting: używamy jednego obiektu do szybkiego wykrywania - niewidoczny cylinder
    const pickGeom = new THREE.CylinderGeometry(this.radius * 0.95, this.radius * 0.95, this.width * 1.05, 32);
    const pickMat = new THREE.MeshBasicMaterial({ visible: false });
    this.pickMesh = new THREE.Mesh(pickGeom, pickMat);
    this.pickMesh.rotation.x = Math.PI / 2;
    this.group.add(this.pickMesh);
  }

  // Ustaw rotację koła (globalnie względem osi Y obiektu)
  setRotation(angleRad) {
    this.rotationAngle = angleRad;
    this.group.rotation.y = this.rotationAngle;
  }

  // Dodaj obrót (delta w radianach)
  rotateBy(deltaRad) {
    this.setRotation(this.rotationAngle + deltaRad);
  }

  // Zwraca aktualną rotację w radianach
  getRotation() {
    return this.rotationAngle;
  }

  // Zwraca promień (używane do ustalania pozycji i powiązań)
  getRadius() {
    return this.radius;
  }

  // Zwraca obiekt THREE.Group z geometrią
  getMesh() {
    return this.group;
  }
}
