import * as THREE from 
"https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js";



const container =
document.querySelector("#archive");


// =================
// Scene
// =================

const scene =
new THREE.Scene();


scene.background =
new THREE.Color(0x000000);



const camera =
new THREE.PerspectiveCamera(
45,
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



// Renderer

const renderer =
new THREE.WebGLRenderer({
antialias:true
});


renderer.setPixelRatio(
window.devicePixelRatio
);


renderer.setSize(
window.innerWidth,
window.innerHeight
);


container.appendChild(
renderer.domElement
);



// =================
// Light
// =================


scene.add(
new THREE.AmbientLight(
0xffffff,
2
)
);



// =================
// 六本杂志
// =================


const images=[

"cover01.jpg",
"cover02.jpg",
"cover03.jpg",
"cover04.jpg",
"cover05.jpg",
"cover06.jpg"

];



// 紧凑堆叠参数

const layouts=[


{
x:-1.4,
y:0.35,
z:-1,
rx:-0.08,
ry:-0.12,
rz:-0.04
},


{
x:-0.9,
y:0.22,
z:-0.5,
rx:-0.06,
ry:-0.08,
rz:0.03
},


{
x:-0.35,
y:0.1,
z:0,
rx:-0.05,
ry:-0.04,
rz:-0.02
},


{
x:0.35,
y:-0.05,
z:0.5,
rx:-0.04,
ry:0.05,
rz:0.02
},


{
x:0.85,
y:-0.15,
z:1,
rx:-0.06,
ry:0.08,
rz:-0.03
},


{
x:0,
y:0,
z:1.5,
rx:0,
ry:0,
rz:0
}

];



const magazines=[];



const loader=
new THREE.TextureLoader();



images.forEach(
(src,index)=>{


const texture=
loader.load(
"images/"+src
);



const geometry=
new THREE.PlaneGeometry(
1.5,
1
);



const material=
new THREE.MeshBasicMaterial({

map:texture,

side:
THREE.DoubleSide

});



const mesh=
new THREE.Mesh(
geometry,
material
);



const p=
layouts[index];



mesh.position.set(
p.x,
p.y,
p.z
);



mesh.rotation.set(
p.rx,
p.ry,
p.rz
);



mesh.userData={
issue:index+1
};



scene.add(mesh);



magazines.push(mesh);



});




// =================
// 鼠标互动
// =================


let mouseX=0;
let mouseY=0;


window.addEventListener(
"mousemove",
(e)=>{


mouseX=
(e.clientX /
window.innerWidth -
0.5);



mouseY=
(e.clientY /
window.innerHeight -
0.5);



});




// =================
// 动画
// =================


function animate(){


requestAnimationFrame(
animate
);



magazines.forEach(
(mesh)=>{


mesh.rotation.y +=
mouseX*0.002;


mesh.rotation.x +=
mouseY*0.002;


});



renderer.render(
scene,
camera
);



}



animate();




// =================
// resize
// =================


window.addEventListener(
"resize",
()=>{


camera.aspect =
window.innerWidth /
window.innerHeight;


camera.updateProjectionMatrix();


renderer.setSize(
window.innerWidth,
window.innerHeight
);


});
