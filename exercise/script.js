import * as THREE from 'three';
import './style.css';
import gsap from 'gsap';

const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene();

// Group
// const group = new THREE.Group()
// scene.add(group)

// const cube1 = new THREE.Mesh(
//   new THREE.BoxGeometry(1,1,1),
//   new THREE.MeshBasicMaterial({color:'red'})
// )
// const cube2 = new THREE.Mesh(
//   new THREE.BoxGeometry(1,1,1),
//   new THREE.MeshBasicMaterial({color:'green'})
// )
// cube2.position.set(2,0,0);

// const cube3 = new THREE.Mesh(
//   new THREE.BoxGeometry(1,1,1),
//   new THREE.MeshBasicMaterial({color:'blue'})
// )
// cube3.position.set(-2,0,0);

// group.add(cube1,cube2,cube3)

const geometry = new THREE.BoxGeometry(1,1,1);
const material = new THREE.MeshBasicMaterial({ color:'red' });
const mesh = new THREE.Mesh(geometry,material);

// 移动mesh
// mesh.position.set(0.7,-0.6,0)

// 缩放mesh
// mesh.scale.set(1,1,1)

// 旋转顺序是根据旋转轴的顺序来确定的
// mesh.rotation.reorder('YXZ')
// 旋转mesh
// mesh.rotation.y = Math.PI * 0.25;
scene.add(mesh);

//axes helper
const axesHelper = new THREE.AxesHelper(3);


scene.add(axesHelper);

const sizes = {
  width: 800,
  height: 600
}

// 相机
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;

scene.add(camera);

// camera.lookAt(new THREE.Vector3(0,1,0));

const renderer = new THREE.WebGLRenderer({
    canvas
});

renderer.setSize(sizes.width,sizes.height);

// let time = Date.now()

// Clock
const clock = new THREE.Clock();

gsap.to(mesh.position,{
  duration:10,
  x:2
})

const tick = ()=>{
  // time
  // const currentTime = Date.now();
  // const deltaTime = currentTime - time;
  // time = currentTime;

  //Clock 
  const elapsedTime = clock.getElapsedTime();

  mesh.rotation.y = elapsedTime;

  renderer.render(scene,camera);
  window.requestAnimationFrame(tick)
};

tick();

// renderer.render(scene,camera);

