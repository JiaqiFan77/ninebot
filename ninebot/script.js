const issue=document.querySelector(".cover06");


function openIssue(){


issue.classList.add("open");



setTimeout(()=>{


window.location.href="issue6.html";


},1200);



}




// 鼠标空间移动


document.addEventListener(
"mousemove",
(e)=>{


let x =
(e.clientX /
window.innerWidth
-0.5)*20;



let y =
(e.clientY /
window.innerHeight
-0.5)*20;



document.querySelector(".space")
.style.transform=
`
rotateX(${-y}deg)
rotateY(${x}deg)
`;



});