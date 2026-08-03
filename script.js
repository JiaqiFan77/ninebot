const archive =
  document.getElementById("archive");

const carousel =
  document.getElementById("carousel");

const cards =
  Array.from(
    document.querySelectorAll(".magazine-card")
  );

const closeSelectionButton =
  document.getElementById("closeSelection");

let rotationY = 0;
let targetRotationY = 0;

let rotationX = -8;
let targetRotationX = -8;

let zoom = 1;
let targetZoom = 1;

let isDragging = false;
let hasDragged = false;

let dragStartX = 0;
let dragStartY = 0;

let dragStartRotationY = 0;
let dragStartRotationX = 0;

let selectedCard = null;
let autoRotationEnabled = true;

let lastFrameTime = performance.now();

/* =========================
   更新 3D 展示墙
========================= */

function updateCarousel(time) {
  const delta =
    Math.min(
      (time - lastFrameTime) / 16.67,
      3
    );

  lastFrameTime = time;

  if (
    autoRotationEnabled &&
    !isDragging &&
    !selectedCard
  ) {
    targetRotationY += 0.055 * delta;
  }

  rotationY +=
    (targetRotationY - rotationY) * 0.075;

  rotationX +=
    (targetRotationX - rotationX) * 0.075;

  zoom +=
    (targetZoom - zoom) * 0.08;

  carousel.style.transform = `
    scale(${zoom})
    rotateX(${rotationX}deg)
    rotateY(${rotationY}deg)
  `;

  requestAnimationFrame(updateCarousel);
}

requestAnimationFrame(updateCarousel);

/* =========================
   鼠标拖动旋转
========================= */

archive.addEventListener(
  "pointerdown",
  (event) => {
    if (selectedCard) {
      return;
    }

    isDragging = true;
    hasDragged = false;

    dragStartX = event.clientX;
    dragStartY = event.clientY;

    dragStartRotationY =
      targetRotationY;

    dragStartRotationX =
      targetRotationX;

    archive.classList.add(
      "is-dragging"
    );

    archive.setPointerCapture(
      event.pointerId
    );
  }
);

archive.addEventListener(
  "pointermove",
  (event) => {
    if (!isDragging || selectedCard) {
      return;
    }

    const differenceX =
      event.clientX - dragStartX;

    const differenceY =
      event.clientY - dragStartY;

    if (
      Math.abs(differenceX) > 4 ||
      Math.abs(differenceY) > 4
    ) {
      hasDragged = true;
    }

    targetRotationY =
      dragStartRotationY +
      differenceX * 0.22;

    targetRotationX =
      dragStartRotationX -
      differenceY * 0.12;

    targetRotationX =
      Math.max(
        -24,
        Math.min(15, targetRotationX)
      );
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
    archive.releasePointerCapture(
      event.pointerId
    );
  } catch (error) {
    /* Pointer capture may already be released. */
  }
}

archive.addEventListener(
  "pointerup",
  stopDragging
);

archive.addEventListener(
  "pointercancel",
  stopDragging
);

/* =========================
   滚轮改变空间距离
========================= */

archive.addEventListener(
  "wheel",
  (event) => {
    if (selectedCard) {
      return;
    }

    event.preventDefault();

    targetZoom -=
      event.deltaY * 0.00035;

    targetZoom =
      Math.max(
        0.78,
        Math.min(1.18, targetZoom)
      );
  },
  { passive: false }
);

/* =========================
   选中封面
========================= */

function selectCard(card) {
  if (hasDragged) {
    hasDragged = false;
    return;
  }

  if (selectedCard === card) {
    const issue =
      Number(card.dataset.issue);

    if (issue === 6) {
      enterIssue06(card);
    }

    return;
  }

  if (selectedCard) {
    clearSelection(false);
  }

  selectedCard = card;
  autoRotationEnabled = false;

  archive.classList.add(
    "has-selection"
  );

  card.classList.add(
    "is-selected"
  );

  /*
    将被选卡片当前视觉宽高锁住，
    避免 fixed 后尺寸突然变化。
  */

  const rect =
    card.getBoundingClientRect();

  card.style.width =
    `${rect.width}px`;

  /*
    旋转展示墙，让该封面先朝向正面。
  */

  const index =
    Number(card.dataset.index);

  const cardAngle =
    index * 60;

  targetRotationY =
    -cardAngle;

  targetRotationX = -3;
  targetZoom = 0.92;
}

/* =========================
   返回展示墙
========================= */

function clearSelection(
  restartRotation = true
) {
  if (!selectedCard) {
    return;
  }

  selectedCard.classList.remove(
    "is-selected",
    "is-entering"
  );

  selectedCard.style.width = "";

  archive.classList.remove(
    "has-selection"
  );

  selectedCard = null;

  targetRotationX = -8;
  targetZoom = 1;

  if (restartRotation) {
    window.setTimeout(() => {
      autoRotationEnabled = true;
    }, 350);
  }
}

/* =========================
   进入第六期
========================= */

function enterIssue06(card) {
  card.classList.add(
    "is-entering"
  );

  closeSelectionButton.style.opacity =
    "0";

  window.setTimeout(() => {
    window.location.href =
      "issue6.html";
  }, 720);
}

/* =========================
   绑定封面点击
========================= */

cards.forEach((card) => {
  card.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();
      selectCard(card);
    }
  );

  card.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        selectCard(card);
      }
    }
  );
});

/* 点击黑色空白返回 */

archive.addEventListener(
  "click",
  (event) => {
    if (
      selectedCard &&
      event.target === archive
    ) {
      clearSelection();
    }
  }
);

closeSelectionButton.addEventListener(
  "click",
  (event) => {
    event.stopPropagation();
    clearSelection();
  }
);

/* Esc 返回 */

document.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Escape" &&
      selectedCard
    ) {
      clearSelection();
    }
  }
);
