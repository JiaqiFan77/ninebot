const archiveSpace = document.getElementById("archiveSpace");
const issue06Book = document.getElementById("issue06Book");
const issue06Position = document.getElementById("issue06Position");

let isOpeningIssue = false;

function openIssue06() {
  if (isOpeningIssue) {
    return;
  }

  isOpeningIssue = true;

  archiveSpace.classList.add("is-opening");
  issue06Position.classList.add("is-opening-book");

  window.setTimeout(() => {
    window.location.href = "issue6.html";
  }, 1050);
}

issue06Book.addEventListener("click", openIssue06);

issue06Book.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openIssue06();
  }
});

document.addEventListener("mousemove", (event) => {
  if (isOpeningIssue) {
    return;
  }

  const horizontal =
    event.clientX / window.innerWidth - 0.5;

  const vertical =
    event.clientY / window.innerHeight - 0.5;

  const rotateY = horizontal * 7;
  const rotateX = vertical * -5;

  archiveSpace.style.transform =
    `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

document.documentElement.addEventListener("mouseleave", () => {
  if (isOpeningIssue) {
    return;
  }

  archiveSpace.style.transform =
    "rotateX(0deg) rotateY(0deg)";
});
