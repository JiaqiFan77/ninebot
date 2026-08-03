const totalPages = 5;

let currentPage = 1;
let isTurning = false;

const turningPage =
  document.getElementById("turningPage");

const magazineImage =
  document.getElementById("magazineImage");

const pageNumber =
  document.getElementById("pageNumber");

function formatPageNumber(number) {
  return String(number).padStart(2, "0");
}

function getPageSource(number) {
  return `images/issue06-page${formatPageNumber(number)}.jpg`;
}

function setPage(number) {
  const formattedPage = formatPageNumber(number);

  magazineImage.src = getPageSource(number);
  magazineImage.alt = `Issue 06 page ${number}`;

  pageNumber.textContent =
    `${formattedPage} / ${formatPageNumber(totalPages)}`;
}

function turnToPage(targetPage, direction) {
  if (
    isTurning ||
    targetPage < 1 ||
    targetPage > totalPages
  ) {
    return;
  }

  isTurning = true;

  turningPage.classList.remove(
    "turn-out-next",
    "turn-out-previous",
    "turn-in-next",
    "turn-in-previous"
  );

  const outgoingClass =
    direction === "next"
      ? "turn-out-next"
      : "turn-out-previous";

  turningPage.classList.add(outgoingClass);

  window.setTimeout(() => {
    currentPage = targetPage;
    setPage(currentPage);

    turningPage.classList.remove(outgoingClass);

    const incomingClass =
      direction === "next"
        ? "turn-in-next"
        : "turn-in-previous";

    turningPage.classList.add(incomingClass);

    window.setTimeout(() => {
      turningPage.classList.remove(incomingClass);
      isTurning = false;
    }, 460);
  }, 360);
}

function nextPage() {
  turnToPage(currentPage + 1, "next");
}

function previousPage() {
  turnToPage(currentPage - 1, "previous");
}

/* 键盘操作 */

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    nextPage();
  }

  if (event.key === "ArrowLeft") {
    previousPage();
  }

  if (event.key === "Escape") {
    window.location.href = "index.html";
  }
});

/* 手机左右滑动 */

let touchStartX = 0;

document.addEventListener(
  "touchstart",
  (event) => {
    touchStartX = event.changedTouches[0].clientX;
  },
  { passive: true }
);

document.addEventListener(
  "touchend",
  (event) => {
    const touchEndX =
      event.changedTouches[0].clientX;

    const distance =
      touchEndX - touchStartX;

    if (Math.abs(distance) < 50) {
      return;
    }

    if (distance < 0) {
      nextPage();
    } else {
      previousPage();
    }
  },
  { passive: true }
);
