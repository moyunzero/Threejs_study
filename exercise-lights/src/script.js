import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'; 

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)
gui.add(ambientLight,'intensity').min(0).max(1).step(0.01).name('环境光强度')

const directionLight = new THREE.DirectionalLight(0x00fffc,0.3)
scene.add(directionLight)
gui.add(directionLight,'intensity').min(0).max(1).step(0.01).name('平行光强度')

const hemisphereLight = new THREE.HemisphereLight(0xff0000,0x0000ff,0.3)
scene.add(hemisphereLight)
gui.add(hemisphereLight,'intensity').min(0).max(1).step(0.01).name('半球光强度')

const pointLight = new THREE.PointLight(0xffffff, 0.5)
scene.add(pointLight)
gui.add(pointLight,'intensity').min(0).max(1).step(0.01).name('点光源强度')
gui.add(pointLight.position, 'x', -5, 5).name('X 位置');
gui.add(pointLight.position, 'y', -5, 5).name('Y 位置');
gui.add(pointLight.position, 'z', -5, 5).name('Z 位置');

const rectAreaLight = new THREE.RectAreaLight(0x4e00ff,1,1,1)
scene.add(rectAreaLight)
gui.add(rectAreaLight,'intensity').min(0).max(1).step(0.01).name('矩形光强度')

const spotLight = new THREE.SpotLight(0x78ff00,0.5,10,Math.PI * 0.1,0.25,1)
scene.add(spotLight)
scene.add(spotLight.target)
gui.add(spotLight,'intensity').min(0).max(1).step(0.01).name('聚光灯强度')
gui.add(spotLight.target.position, 'x', -5, 5, 0.1).name('target.x');
gui.add(spotLight.target.position, 'y', -5, 5, 0.1).name('target.y');
gui.add(spotLight.target.position, 'z', -5, 5, 0.1).name('target.z');


/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4

// Objects
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.position.x = - 1.5

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    material
)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 64),
    material
)
torus.position.x = 1.5

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.65

scene.add(sphere, cube, torus, plane)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)


// const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2)
// scene.add(pointLightHelper)
// const axesHelper = new THREE.AxesHelper(2) // 长度为2的坐标轴
// scene.add(axesHelper)
// const gridHelper = new THREE.GridHelper(5, 10) // 5x5 大小，10格
// scene.add(gridHelper)
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime
    cube.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = 0.15 * elapsedTime
    cube.rotation.x = 0.15 * elapsedTime
    torus.rotation.x = 0.15 * elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()