const totalPages = 5;

let currentPage = 1;
let isAnimating = false;

const magazinePage = document.getElementById("magazinePage");
const pageCounter = document.getElementById("pageCounter");
const pageStage = document.getElementById("pageStage");

function getPageFile(pageNumber) {
  const formattedNumber = String(pageNumber).padStart(2, "0");

  return `images/issue06-page${formattedNumber}.jpg`;
}

function updatePage(direction) {
  if (isAnimating) {
    return;
  }

  isAnimating = true;

  pageStage.classList.remove("slide-left", "slide-right");
  pageStage.classList.add(
    direction === "next" ? "page-exit-left" : "page-exit-right"
  );

  window.setTimeout(() => {
    const formattedNumber = String(currentPage).padStart(2, "0");

    magazinePage.src = getPageFile(currentPage);
    magazinePage.alt = `Issue 06 page ${currentPage}`;
    pageCounter.textContent = `${formattedNumber} / 05`;

    pageStage.classList.remove("page-exit-left", "page-exit-right");
    pageStage.classList.add(
      direction === "next" ? "slide-right" : "slide-left"
    );

    window.setTimeout(() => {
      pageStage.classList.remove("slide-left", "slide-right");
      isAnimating = false;
    }, 420);
  }, 240);
}

function nextPage() {
  if (currentPage >= totalPages || isAnimating) {
    return;
  }

  currentPage += 1;
  updatePage("next");
}

function previousPage() {
  if (currentPage <= 1 || isAnimating) {
    return;
  }

  currentPage -= 1;
  updatePage("previous");
}

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
    const touchEndX = event.changedTouches[0].clientX;
    const distance = touchEndX - touchStartX;

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
