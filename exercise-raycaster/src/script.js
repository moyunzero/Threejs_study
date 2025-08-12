import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
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
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

// sphere
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5,32,32),
    new THREE.MeshStandardMaterial({
        metalness: 0.5,
        roughness: 0.1,
    })
)
const sphere1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5,32,32),
    new THREE.MeshStandardMaterial({
        metalness: 0.5,
        roughness: 0.1,
    })
)   
const sphere2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5,32,32),
    new THREE.MeshStandardMaterial({
        metalness: 0.5,
        roughness: 0.1,
    })
)   

sphere.castShadow = true
sphere1.position.x = -2
sphere2.position.x = 2
scene.add(sphere,sphere1,sphere2)


// Light
const ambientLight = new THREE.AmbientLight(0xffffff,0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff,0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024,1024)
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = -7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.bottom = -7
directionalLight.position.set(5,5,5)

scene.add(directionalLight)

// const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(cameraHelper)

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
camera.position.set(0,4,9)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled =true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))




/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = clock.getDelta()  // 实际上一帧到这一帧的时间


    //Update particles
    controls.update()


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
