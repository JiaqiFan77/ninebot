import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js";

const archive = document.getElementById("archive");
const canvas = document.getElementById("webgl");
const loading = document.getElementById("loading");
const loadingBar = document.getElementById("loadingBar");
const closeButton = document.getElementById("closeSelection");
const selectionIssue = document.getElementById("selectionIssue");
const selectionAction = document.getElementById("selectionAction");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x000000, 0.028);

const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 12);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance"
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const installation = new THREE.Group();
scene.add(installation);

const manager = new THREE.LoadingManager();
manager.onProgress = (_url, loaded, total) => {
  loadingBar.style.width = `${Math.round((loaded / total) * 100)}%`;
};
manager.onLoad = () => {
  loadingBar.style.width = "100%";
  setTimeout(() => {
    loading.classList.add("is-hidden");
    entranceStart = performance.now();
  }, 250);
};
manager.onError = (url) => console.error("Image failed to load:", url);

const loader = new THREE.TextureLoader(manager);
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

const files = [
  "images/cover01.jpg",
  "images/cover02.jpg",
  "images/cover03.jpg",
  "images/cover04.jpg",
  "images/cover05.jpg",
  "images/cover06.jpg"
];

/*
  Six shared-centre pivots. Each cover extends away from the centre like
  a blade in the reference installation, rather than forming a cylinder.
*/
const layouts = [
  { euler: [-0.38, -0.82, -0.22], radius: 1.22, roll: -0.09 },
  { euler: [ 0.52, -0.12,  0.58], radius: 1.18, roll:  0.08 },
  { euler: [-0.16,  0.76, -0.47], radius: 1.22, roll:  0.10 },
  { euler: [ 0.56,  1.68,  0.20], radius: 1.20, roll: -0.08 },
  { euler: [-0.58,  2.72,  0.40], radius: 1.24, roll:  0.07 },
  { euler: [ 0.26,  3.72, -0.50], radius: 1.18, roll: -0.04 }
];

const cards = [];

function buildCard(file, issue, layout) {
  const pivot = new THREE.Group();
  pivot.rotation.set(...layout.euler);
  installation.add(pivot);

  const material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  mesh.rotation.set(layout.roll, -Math.PI / 2, 0);
  mesh.scale.setScalar(0.001);
  pivot.add(mesh);

  mesh.userData = {
    issue,
    pivot,
    layout,
    width: 3,
    height: 2,
    localPosition: new THREE.Vector3()
  };

  loader.load(
    file,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = maxAnisotropy;
      material.map = texture;
      material.needsUpdate = true;

      const image = texture.image;
      const aspect = image.width / image.height;
      const longSide = innerWidth < 800 ? 2.7 : 3.5;

      const width = aspect >= 1 ? longSide : longSide * aspect;
      const height = aspect >= 1 ? longSide / aspect : longSide;

      mesh.geometry.dispose();
      mesh.geometry = new THREE.PlaneGeometry(width, height);

      // The near edge remains close to the shared centre.
      mesh.position.set(layout.radius + width / 2, 0, 0);
      mesh.userData.width = width;
      mesh.userData.height = height;
      mesh.userData.localPosition.copy(mesh.position);
    },
    undefined,
    (error) => console.error(`Unable to load ${file}`, error)
  );

  cards.push(mesh);
}

files.forEach((file, index) => buildCard(file, index + 1, layouts[index]));

let entranceStart = null;
let entranceDone = false;

function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function updateEntrance(now) {
  if (entranceDone || entranceStart === null) return;

  const duration = 1450;
  const t = Math.min((now - entranceStart) / duration, 1);
  const eased = easeOutExpo(t);

  installation.scale.setScalar(THREE.MathUtils.lerp(0.08, 1, eased));
  installation.rotation.z = THREE.MathUtils.lerp(-0.7, 0, eased);

  cards.forEach((card, index) => {
    const delayed = THREE.MathUtils.clamp((t - index * 0.055) / 0.72, 0, 1);
    const local = easeOutExpo(delayed);
    card.scale.setScalar(THREE.MathUtils.lerp(0.001, 1, local));
    card.material.opacity = local;
  });

  if (t >= 1) {
    entranceDone = true;
    cards.forEach((card) => {
      card.scale.setScalar(1);
      card.material.opacity = 1;
    });
  }
}

/* Rotation and dragging */
let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let autoRotate = true;
let dragging = false;
let dragged = false;
let startPointerX = 0;
let startPointerY = 0;
let startRotationX = 0;
let startRotationY = 0;

canvas.addEventListener("pointerdown", (event) => {
  if (selected) return;

  dragging = true;
  dragged = false;
  autoRotate = false;
  startPointerX = event.clientX;
  startPointerY = event.clientY;
  startRotationX = targetX;
  startRotationY = targetY;
  archive.classList.add("is-dragging");
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  setPointer(event);

  if (!dragging || selected) return;

  const dx = event.clientX - startPointerX;
  const dy = event.clientY - startPointerY;
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragged = true;

  targetY = startRotationY + dx * 0.006;
  targetX = THREE.MathUtils.clamp(startRotationX + dy * 0.004, -0.9, 0.9);
});

function finishDrag(event) {
  if (!dragging) return;
  dragging = false;
  archive.classList.remove("is-dragging");

  try {
    canvas.releasePointerCapture(event.pointerId);
  } catch {}

  setTimeout(() => {
    if (!selected) autoRotate = true;
  }, 900);
}

canvas.addEventListener("pointerup", (event) => {
  finishDrag(event);
  if (!dragged) clickScene(event);
});
canvas.addEventListener("pointercancel", finishDrag);

/* Raycasting */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered = null;

function setPointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function hitCard() {
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObjects(cards, false)[0]?.object ?? null;
}

canvas.addEventListener("pointermove", (event) => {
  if (dragging || selected) {
    hovered = null;
    canvas.style.cursor = dragging ? "grabbing" : "grab";
    return;
  }
  setPointer(event);
  hovered = hitCard();
  canvas.style.cursor = hovered ? "pointer" : "grab";
});

/* Selection */
let selected = null;
let selectedPivot = null;
let selectT = 0;
let selectDirection = 0;
let entering = false;
let enterT = 0;

const startWorldPosition = new THREE.Vector3();
const startWorldQuaternion = new THREE.Quaternion();
const startWorldScale = new THREE.Vector3();
const targetPosition = new THREE.Vector3(0, 0, 5.15);
const targetQuaternion = new THREE.Quaternion();
const targetScale = new THREE.Vector3(1.22, 1.22, 1.22);

function selectCard(card) {
  if (selected) {
    if (selected === card && card.userData.issue === 6) enterIssue();
    return;
  }

  selected = card;
  selectedPivot = card.userData.pivot;
  autoRotate = false;
  selectT = 0;
  selectDirection = 1;

  archive.classList.add("has-selection");
  selectionIssue.textContent = `ISSUE ${String(card.userData.issue).padStart(2, "0")}`;
  selectionAction.textContent = card.userData.issue === 6
    ? "CLICK AGAIN TO OPEN"
    : "PRESS × TO RETURN";

  card.getWorldPosition(startWorldPosition);
  card.getWorldQuaternion(startWorldQuaternion);
  card.getWorldScale(startWorldScale);

  scene.attach(card);
  card.position.copy(startWorldPosition);
  card.quaternion.copy(startWorldQuaternion);
  card.scale.copy(startWorldScale);
  targetQuaternion.identity();
}

function closeSelection() {
  if (!selected || entering) return;
  selectDirection = -1;
  selectT = 1;
}

function restoreSelected() {
  const card = selected;
  selectedPivot.attach(card);

  card.rotation.set(card.userData.layout.roll, -Math.PI / 2, 0);
  card.position.copy(card.userData.localPosition);
  card.scale.setScalar(1);

  selected = null;
  selectedPivot = null;
  selectDirection = 0;
  archive.classList.remove("has-selection");

  cards.forEach((item) => {
    item.material.opacity = 1;
  });

  setTimeout(() => {
    autoRotate = true;
  }, 400);
}

function clickScene(event) {
  setPointer(event);

  if (selected) {
    const hit = hitCard();
    if (hit === selected && selected.userData.issue === 6) enterIssue();
    return;
  }

  const hit = hitCard();
  if (hit) selectCard(hit);
}

function enterIssue() {
  if (!selected || selected.userData.issue !== 6 || entering) return;
  entering = true;
  enterT = 0;
  selectionAction.textContent = "OPENING ISSUE";
  closeButton.disabled = true;
}

closeButton.addEventListener("click", (event) => {
  event.stopPropagation();
  closeSelection();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeSelection();
  if (event.key === "Enter" && selected?.userData.issue === 6) enterIssue();
});

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function updateSelection(delta) {
  if (!selected || selectDirection === 0 || entering) return;

  selectT = THREE.MathUtils.clamp(selectT + selectDirection * delta * 1.45, 0, 1);
  const t = smoothstep(selectT);

  selected.position.lerpVectors(startWorldPosition, targetPosition, t);
  selected.quaternion.slerpQuaternions(startWorldQuaternion, targetQuaternion, t);
  selected.scale.lerpVectors(startWorldScale, targetScale, t);

  cards.forEach((card) => {
    if (card !== selected) card.material.opacity = THREE.MathUtils.lerp(1, 0.06, t);
  });

  if (selectDirection > 0 && selectT >= 1) selectDirection = 0;
  if (selectDirection < 0 && selectT <= 0) restoreSelected();
}

function updateEntering(delta) {
  if (!entering || !selected) return;

  enterT = Math.min(enterT + delta * 1.5, 1);
  const t = smoothstep(enterT);
  const scale = THREE.MathUtils.lerp(1.22, 4.1, t);

  selected.scale.setScalar(scale);
  selected.position.z = THREE.MathUtils.lerp(5.15, 8.8, t);
  selected.material.opacity = THREE.MathUtils.lerp(1, 0, Math.max(0, (t - 0.58) / 0.42));

  if (enterT >= 1) location.href = "issue6.html";
}

function updateHover(delta) {
  cards.forEach((card) => {
    if (card === selected) return;
    const target = card === hovered ? 1.055 : 1;
    const factor = 1 - Math.pow(0.001, delta);
    const value = THREE.MathUtils.lerp(card.scale.x, target, factor);
    card.scale.setScalar(value);
  });
}

const clock = new THREE.Clock();

function animate(now) {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);
  updateEntrance(now);

  if (autoRotate && !dragging && !selected && entranceDone) {
    targetY += delta * 0.13;
    targetX += (0.06 - targetX) * 0.002;
  }

  currentX = THREE.MathUtils.lerp(currentX, targetX, 0.075);
  currentY = THREE.MathUtils.lerp(currentY, targetY, 0.075);
  installation.rotation.x = currentX;
  installation.rotation.y = currentY;

  updateHover(delta);
  updateSelection(delta);
  updateEntering(delta);

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  camera.position.z = innerWidth < 800 ? 15 : 12;
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
}

addEventListener("resize", resize);
resize();
