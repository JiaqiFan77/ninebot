const archiveScene =
  document.getElementById("archiveScene");

const issue06Stack =
  document.getElementById("issue06Stack");

const issue06Position =
  document.getElementById("issue06Position");

let isOpening = false;

function openIssue06() {
  if (isOpening) {
    return;
  }

  isOpening = true;

  archiveScene.classList.add("is-opening");
  issue06Position.classList.add("is-opening-stack");

  window.setTimeout(() => {
    window.location.href = "issue6.html";
  }, 900);
}

issue06Stack.addEventListener(
  "click",
  openIssue06
);

issue06Stack.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      openIssue06();
    }
  }
);

document.addEventListener(
  "mousemove",
  (event) => {
    if (isOpening) {
      return;
    }

    const x =
      event.clientX / window.innerWidth - 0.5;

    const y =
      event.clientY / window.innerHeight - 0.5;

    const rotateY = x * 5;
    const rotateX = y * -3.5;

    archiveScene.style.transform =
      `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }
);

document.documentElement.addEventListener(
  "mouseleave",
  () => {
    if (isOpening) {
      return;
    }

    archiveScene.style.transform =
      "rotateX(0deg) rotateY(0deg)";
  }
);
