const space = document.getElementById("space");
const issueCover = document.querySelector(".cover06");

let isOpening = false;

function openIssue() {
  if (isOpening) {
    return;
  }

  isOpening = true;

  space.classList.add("is-opening");
  issueCover.classList.add("open");

  window.setTimeout(() => {
    window.location.href = "issue6.html";
  }, 1050);
}

document.addEventListener("mousemove", (event) => {
  if (isOpening || !space) {
    return;
  }

  const rotateY =
    (event.clientX / window.innerWidth - 0.5) * 14;

  const rotateX =
    (event.clientY / window.innerHeight - 0.5) * -10;

  space.style.transform =
    `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

document.addEventListener("mouseleave", () => {
  if (!space || isOpening) {
    return;
  }

  space.style.transform = "rotateX(0deg) rotateY(0deg)";
});
