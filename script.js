import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js";

/* ========================================
   DOM
======================================== */

const archive =
  document.getElementById("archive");

const canvas =
  document.getElementById("webgl");

const loadingScreen =
  document.getElementById("loadingScreen");

const loadingProgress =
  document.getElementById("loadingProgress");

const closeButton =
  document.getElementById("closeButton");

const selectedIssueLabel =
  document.getElementById("selectedIssue");

const selectedAction =
  document.getElementById("selectedAction");

/* ========================================
   Three.js 基础
======================================== */

const scene = new THREE.Scene();

scene.background =
  new THREE.Color(0x000000);

scene.fog =
  new THREE.FogExp2(
    0x000000,
    0.032
  );

const camera =
  new THREE.PerspectiveCamera(
    42,
    window.innerWidth /
      window.innerHeight,
    0.1,
    100
  );

camera.position.set(
  0,
  0,
  11
);

const renderer =
  new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference:
      "high-performance"
  });

renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio,
    2
  )
);

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

/* ========================================
   中心装置
======================================== */

const installation =
  new THREE.Group();

scene.add(installation);

/*
每一个封面都有一个 pivot。
pivot 的中心都在装置中心附近，
封面本身向外延伸。
*/

const cards = [];

const coverFiles = [
  "images/cover01.jpg",
  "images/cover02.jpg",
  "images/cover03.jpg",
  "images/cover04.jpg",
  "images/cover05.jpg",
  "images/cover06.jpg"
];

/*
六张封面的空间方向。

rotation：
每个 pivot 在 XYZ 三个方向上的角度。

distance：
封面从中心向外伸出的长度。

roll：
封面自身轻微旋转。
*/

const configurations = [
  {
    rotation: [-0.38, -0.82, -0.25],
    distance: 2.25,
    roll: -0.12
  },
  {
    rotation: [0.54, -0.15, 0.55],
    distance: 2.15,
    roll: 0.09
  },
  {
    rotation: [-0.18, 0.72, -0.48],
    distance: 2.3,
    roll: 0.13
  },
  {
    rotation: [0.58, 1.62, 0.22],
    distance: 2.2,
    roll: -0.1
  },
  {
    rotation: [-0.58, 2.68, 0.42],
    distance: 2.3,
    roll: 0.08
  },
  {
    rotation: [0.28, 3.65, -0.52],
    distance: 2.18,
    roll: -0.04
  }
];

/* ========================================
   纹理加载
======================================== */

const loadingManager =
  new THREE.LoadingManager();

loadingManager.onProgress =
  (
    url,
    itemsLoaded,
    itemsTotal
  ) => {
    const percentage =
      itemsTotal === 0
        ? 0
        : (
          itemsLoaded /
          itemsTotal
        ) * 100;

    loadingProgress.style.width =
      `${percentage}%`;
  };

loadingManager.onLoad = () => {
  loadingProgress.style.width =
    "100%";

  window.setTimeout(() => {
    loadingScreen.classList.add(
      "is-hidden"
    );

    startEntranceAnimation();
  }, 350);
};

loadingManager.onError = (url) => {
  console.error(
    `Could not load texture: ${url}`
  );
};

const textureLoader =
  new THREE.TextureLoader(
    loadingManager
  );

/* ========================================
   创建封面
======================================== */

function createMagazine(
  file,
  issueNumber,
  configuration
) {
  const pivot =
    new THREE.Group();

  pivot.rotation.set(
    configuration.rotation[0],
    configuration.rotation[1],
    configuration.rotation[2]
  );

  installation.add(pivot);

  const texture =
    textureLoader.load(file);

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.anisotropy =
    renderer.capabilities
      .getMaxAnisotropy();

  const geometry =
    new THREE.PlaneGeometry(
      1,
      1
    );

  const material =
    new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1
    });

  const mesh =
    new THREE.Mesh(
      geometry,
      material
    );

  mesh.userData.issue =
    issueNumber;

  mesh.userData.file =
    file;

  mesh.userData.pivot =
    pivot;

  mesh.userData.configuration =
    configuration;

  mesh.userData.baseScale =
    new THREE.Vector3(1, 1, 1);

  /*
  平面的一侧靠近中心，
  封面向外延伸。
  */

  mesh.position.set(
    configuration.distance,
    0,
    0
  );

  mesh.rotation.y =
    -Math.PI / 2;

  mesh.rotation.x =
    configuration.roll;

  mesh.scale.set(
    0.001,
    0.001,
    0.001
  );

  pivot.add(mesh);

  texture.addEventListener(
    "update",
    () => {
      if (!texture.image) {
        return;
      }

      const aspect =
        texture.image.width /
        texture.image.height;

      /*
      保持上传图片的完整比例。
      横图和竖图都会完整显示。
      */

      const longSide = 3.4;

      let width;
      let height;

      if (aspect >= 1) {
        width = longSide;
        height = longSide / aspect;
      } else {
        height = longSide;
        width = longSide * aspect;
      }

      mesh.geometry.dispose();

      mesh.geometry =
        new THREE.PlaneGeometry(
          width,
          height
        );

      /*
      让平面的左侧靠近中心，
      而不是平面中心围绕中心。
      */

      mesh.position.x =
        configuration.distance +
        width * 0.5;

      mesh.userData.width =
        width;

      mesh.userData.height =
        height;
    }
  );

  cards.push(mesh);
}

/* 创建六张 */

coverFiles.forEach(
  (
    file,
    index
  ) => {
    createMagazine(
      file,
      index + 1,
      configurations[index]
    );
  }
);

/* ========================================
   入场动画
======================================== */

let entranceStart = null;
let entranceFinished = false;

function easeOutExpo(value) {
  if (value >= 1) {
    return 1;
  }

  return (
    1 -
    Math.pow(
      2,
      -10 * value
    )
  );
}

function startEntranceAnimation() {
  entranceStart =
    performance.now();

  entranceFinished = false;
}

function updateEntrance(time) {
  if (
    entranceFinished ||
    entranceStart === null
  ) {
    return;
  }

  const duration = 1450;

  const progress =
    Math.min(
      (
        time -
        entranceStart
      ) / duration,
      1
    );

  const eased =
    easeOutExpo(progress);

  cards.forEach(
    (
      card,
      index
    ) => {
      const delay =
        index * 0.055;

      const localProgress =
        THREE.MathUtils.clamp(
          (
            eased -
            delay
          ) /
          (1 - delay),
          0,
          1
        );

      const scale =
        THREE.MathUtils.lerp(
          0.001,
          1,
          localProgress
        );

      card.scale.setScalar(scale);

      card.material.opacity =
        localProgress;
    }
  );

  installation.scale.setScalar(
    THREE.MathUtils.lerp(
      0.18,
      1,
      eased
    )
  );

  installation.rotation.y =
    THREE.MathUtils.lerp(
      -1.2,
      0,
      eased
    );

  if (progress >= 1) {
    entranceFinished = true;

    cards.forEach((card) => {
      card.scale.setScalar(1);
      card.material.opacity = 1;
    });
  }
}

/* ========================================
   拖动控制
======================================== */

let isDragging = false;
let hasDragged = false;

let pointerStartX = 0;
let pointerStartY = 0;

let rotationStartX = 0;
let rotationStartY = 0;

let targetRotationX = 0;
let targetRotationY = 0;

let currentRotationX = 0;
let currentRotationY = 0;

let rotationVelocityY = 0.0014;

let autoRotate = true;

canvas.addEventListener(
  "pointerdown",
  (event) => {
    if (selectedCard) {
      return;
    }

    isDragging = true;
    hasDragged = false;

    pointerStartX =
      event.clientX;

    pointerStartY =
      event.clientY;

    rotationStartX =
      targetRotationX;

    rotationStartY =
      targetRotationY;

    autoRotate = false;

    archive.classList.add(
      "is-dragging"
    );

    canvas.setPointerCapture(
      event.pointerId
    );
  }
);

canvas.addEventListener(
  "pointermove",
  (event) => {
    updatePointer(event);

    if (
      !isDragging ||
      selectedCard
    ) {
      return;
    }

    const differenceX =
      event.clientX -
      pointerStartX;

    const differenceY =
      event.clientY -
      pointerStartY;

    if (
      Math.abs(differenceX) > 4 ||
      Math.abs(differenceY) > 4
    ) {
      hasDragged = true;
    }

    targetRotationY =
      rotationStartY +
      differenceX * 0.006;

    targetRotationX =
      rotationStartX +
      differenceY * 0.004;

    targetRotationX =
      THREE.MathUtils.clamp(
        targetRotationX,
        -0.8,
        0.8
      );

    rotationVelocityY =
      differenceX * 0.00002;
  }
);

function stopDragging(event) {
  if (!isDragging) {
    return;
  }

  isDragging = false;

  archive.classList.remove(
    "is-dragging"
  );

  try {
    canvas.releasePointerCapture(
      event.pointerId
    );
  } catch (error) {
    /* Pointer may already be released. */
  }

  window.setTimeout(() => {
    if (!selectedCard) {
      autoRotate = true;
    }
  }, 850);
}

canvas.addEventListener(
  "pointerup",
  (event) => {
    stopDragging(event);

    if (!hasDragged) {
      handleClick(event);
    }
  }
);

canvas.addEventListener(
  "pointercancel",
  stopDragging
);

/* ========================================
   Raycaster 点击检测
======================================== */

const raycaster =
  new THREE.Raycaster();

const pointer =
  new THREE.Vector2();

function updatePointer(event) {
  const rect =
    canvas.getBoundingClientRect();

  pointer.x =
    (
      (
        event.clientX -
        rect.left
      ) /
      rect.width
    ) * 2 - 1;

  pointer.y =
    -(
      (
        event.clientY -
        rect.top
      ) /
      rect.height
    ) * 2 + 1;
}

function getIntersectedCard() {
  raycaster.setFromCamera(
    pointer,
    camera
  );

  const intersections =
    raycaster.intersectObjects(
      cards,
      false
    );

  if (
    intersections.length === 0
  ) {
    return null;
  }

  return intersections[0].object;
}

/* ========================================
   Hover
======================================== */

let hoveredCard = null;

canvas.addEventListener(
  "pointermove",
  (event) => {
    if (
      isDragging ||
      selectedCard
    ) {
      hoveredCard = null;
      canvas.style.cursor = "grab";
      return;
    }

    updatePointer(event);

    const intersected =
      getIntersectedCard();

    hoveredCard = intersected;

    canvas.style.cursor =
      intersected
        ? "pointer"
        : "grab";
  }
);

/* ========================================
   选中和抽出
======================================== */

let selectedCard = null;
let selectionProgress = 0;
let selectionDirection = 0;

const selectedStartPosition =
  new THREE.Vector3();

const selectedStartQuaternion =
  new THREE.Quaternion();

const selectedStartScale =
  new THREE.Vector3();

const selectedTargetPosition =
  new THREE.Vector3(
    0,
    0,
    4.6
  );

const selectedTargetQuaternion =
  new THREE.Quaternion();

const selectedTargetScale =
  new THREE.Vector3(
    1.28,
    1.28,
    1.28
  );

function selectCard(card) {
  if (selectedCard) {
    if (
      selectedCard === card &&
      card.userData.issue === 6
    ) {
      enterIssue06();
    }

    return;
  }

  selectedCard = card;

  autoRotate = false;
  selectionProgress = 0;
  selectionDirection = 1;

  archive.classList.add(
    "has-selection"
  );

  selectedIssueLabel.textContent =
    `ISSUE ${String(
      card.userData.issue
    ).padStart(2, "0")}`;

  selectedAction.textContent =
    card.userData.issue === 6
      ? "CLICK AGAIN TO OPEN"
      : "PRESS × TO RETURN";

  /*
  保存当前世界变换。
  然后将封面重新挂到 scene，
  避免父组旋转影响抽出动画。
  */

  card.getWorldPosition(
    selectedStartPosition
  );

  card.getWorldQuaternion(
    selectedStartQuaternion
  );

  card.getWorldScale(
    selectedStartScale
  );

  scene.attach(card);

  card.position.copy(
    selectedStartPosition
  );

  card.quaternion.copy(
    selectedStartQuaternion
  );

  card.scale.copy(
    selectedStartScale
  );

  selectedTargetQuaternion.setFromEuler(
    new THREE.Euler(
      0,
      0,
      0
    )
  );
}

function closeSelection() {
  if (!selectedCard) {
    return;
  }

  selectionDirection = -1;
  selectionProgress = 1;
}

function finishClosingSelection() {
  if (!selectedCard) {
    return;
  }

  const card =
    selectedCard;

  const pivot =
    card.userData.pivot;

  pivot.attach(card);

  const configuration =
    card.userData.configuration;

  card.rotation.set(
    configuration.roll,
    -Math.PI / 2,
    0
  );

  card.position.x =
    configuration.distance +
    (
      card.userData.width || 3.4
    ) * 0.5;

  card.position.y = 0;
  card.position.z = 0;

  card.scale.setScalar(1);

  selectedCard = null;

  archive.classList.remove(
    "has-selection"
  );

  selectionDirection = 0;

  window.setTimeout(() => {
    autoRotate = true;
  }, 450);
}

/* ========================================
   点击逻辑
======================================== */

function handleClick(event) {
  updatePointer(event);

  if (selectedCard) {
    const intersected =
      getIntersectedCard();

    if (
      intersected === selectedCard &&
      selectedCard.userData.issue === 6
    ) {
      enterIssue06();
    }

    return;
  }

  const intersected =
    getIntersectedCard();

  if (intersected) {
    selectCard(intersected);
  }
}

/* ========================================
   进入第六期
======================================== */

let isEnteringIssue = false;
let enteringProgress = 0;

function enterIssue06() {
  if (
    !selectedCard ||
    selectedCard.userData.issue !== 6 ||
    isEnteringIssue
  ) {
    return;
  }

  isEnteringIssue = true;
  enteringProgress = 0;

  closeButton.style.pointerEvents =
    "none";

  selectedAction.textContent =
    "OPENING ISSUE";
}

/* ========================================
   关闭按钮和键盘
======================================== */

closeButton.addEventListener(
  "click",
  (event) => {
    event.stopPropagation();
    closeSelection();
  }
);

document.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Escape" &&
      selectedCard
    ) {
      closeSelection();
    }

    if (
      event.key === "Enter" &&
      selectedCard &&
      selectedCard.userData.issue === 6
    ) {
      enterIssue06();
    }
  }
);

/* ========================================
   动画更新
======================================== */

const clock =
  new THREE.Clock();

function smoothStep(value) {
  return (
    value *
    value *
    (3 - 2 * value)
  );
}

function updateSelection(delta) {
  if (
    !selectedCard ||
    selectionDirection === 0 ||
    isEnteringIssue
  ) {
    return;
  }

  selectionProgress +=
    selectionDirection *
    delta * 1.45;

  selectionProgress =
    THREE.MathUtils.clamp(
      selectionProgress,
      0,
      1
    );

  const eased =
    smoothStep(selectionProgress);

  selectedCard.position.lerpVectors(
    selectedStartPosition,
    selectedTargetPosition,
    eased
  );

  selectedCard.quaternion.slerpQuaternions(
    selectedStartQuaternion,
    selectedTargetQuaternion,
    eased
  );

  selectedCard.scale.lerpVectors(
    selectedStartScale,
    selectedTargetScale,
    eased
  );

  cards.forEach((card) => {
    if (card === selectedCard) {
      card.material.opacity = 1;
      return;
    }

    card.material.opacity =
      THREE.MathUtils.lerp(
        1,
        0.07,
        eased
      );
  });

  if (
    selectionDirection < 0 &&
    selectionProgress <= 0
  ) {
    cards.forEach((card) => {
      card.material.opacity = 1;
    });

    finishClosingSelection();
  }

  if (
    selectionDirection > 0 &&
    selectionProgress >= 1
  ) {
    selectionDirection = 0;
  }
}

function updateEntering(delta) {
  if (
    !isEnteringIssue ||
    !selectedCard
  ) {
    return;
  }

  enteringProgress +=
    delta * 1.55;

  const progress =
    THREE.MathUtils.clamp(
      enteringProgress,
      0,
      1
    );

  const eased =
    smoothStep(progress);

  const scale =
    THREE.MathUtils.lerp(
      1.28,
      4.2,
      eased
    );

  selectedCard.scale.setScalar(scale);

  selectedCard.position.z =
    THREE.MathUtils.lerp(
      4.6,
      8.6,
      eased
    );

  selectedCard.material.opacity =
    THREE.MathUtils.lerp(
      1,
      0,
      Math.max(
        0,
        (progress - 0.55) / 0.45
      )
    );

  if (progress >= 1) {
    window.location.href =
      "issue6.html";
  }
}

function updateHover(delta) {
  cards.forEach((card) => {
    if (
      card === selectedCard
    ) {
      return;
    }

    const target =
      card === hoveredCard
        ? 1.06
        : 1;

    const current =
      card.scale.x;

    const next =
      THREE.MathUtils.lerp(
        current,
        target,
        1 - Math.pow(
          0.001,
          delta
        )
      );

    card.scale.setScalar(next);
  });
}

/* ========================================
   渲染循环
======================================== */

function animate(time) {
  requestAnimationFrame(animate);

  const delta =
    Math.min(
      clock.getDelta(),
      0.05
    );

  updateEntrance(time);

  if (
    autoRotate &&
    !isDragging &&
    !selectedCard &&
    entranceFinished
  ) {
    targetRotationY +=
      rotationVelocityY;
  }

  currentRotationX =
    THREE.MathUtils.lerp(
      currentRotationX,
      targetRotationX,
      0.075
    );

  currentRotationY =
    THREE.MathUtils.lerp(
      currentRotationY,
      targetRotationY,
      0.075
    );

  installation.rotation.x =
    currentRotationX;

  installation.rotation.y =
    currentRotationY;

  updateHover(delta);
  updateSelection(delta);
  updateEntering(delta);

  renderer.render(
    scene,
    camera
  );
}

requestAnimationFrame(animate);

/* ========================================
   响应式
======================================== */

function handleResize() {
  camera.aspect =
    window.innerWidth /
    window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  /*
  手机屏幕稍微拉远。
  */

  camera.position.z =
    window.innerWidth < 800
      ? 14.5
      : 11;
}

window.addEventListener(
  "resize",
  handleResize
);

handleResize();
