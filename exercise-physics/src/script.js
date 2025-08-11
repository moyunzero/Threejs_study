import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui';
import CANNON from 'cannon'


/**
 * Base
 */
// Debug
const gui = new GUI();
const debugObject = {};
debugObject.createSphere = () => {
    createSphere(
        Math.random(),
        {
            x:(Math.random() - 0.5) * 3,
            y: Math.random() * 3,
            z:(Math.random() - 0.5) * 3
        }
    )
}
gui.add(debugObject,'createSphere')

debugObject.createBox = () => {
    createBox(
        Math.random(),
        Math.random(),
        Math.random(),
        {
            x:(Math.random() - 0.5) * 3,
            y: Math.random() * 3,
            z:(Math.random() - 0.5) * 3
        }
    )
}
gui.add(debugObject,'createBox')

debugObject.reset = () => {
    for(const object of objectsToUpdate){
        //remove body
        world.removeBody(object.body)
        //remove mesh
        scene.remove(object.mesh)
    }
}
gui.add(debugObject,'reset')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//sounds
const hitSound = new Audio('/sounds/box-crash.mp3')
const playHitSound = (collision) => {
    const impactStrength = collision.contact.getImpactVelocityAlongNormal()
    if(impactStrength > 1.5){
        hitSound.volume = 0.5
    }
    else if(impactStrength > 1){
        hitSound.volume = 0.3
    }
    else{
        hitSound.volume = 0.1
    }
    hitSound.pitch = Math.random() * 0.2 + 0.9
    hitSound.currentTime = 0
    hitSound.play()
}

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg'
])

/**
 * Physics
 */
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
world.gravity.set(0,-9.82,0)

// 材料
// const concreteMaterial = new CANNON.Material('concrete')
// const plasticMaterial = new CANNON.Material('plastic')

const defaultMaterial = new CANNON.Material('default')

const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction:0.1, // 摩擦系数
        restitution:0.7 // 弹性系数
    }
)

world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial

// //物体-球
// const sphereShape = new CANNON.Sphere(0.5);
// const sphereBody = new CANNON.Body({
//     mass:1,
//     position:new CANNON.Vec3(0,3,0),
//     shape:sphereShape,
//     material:defaultMaterial
// })
// sphereBody.applyLocalForce(new CANNON.Vec3(30,0,0),new CANNON.Vec3(0,0,0)) // 施加一个力

//物体-地板
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body({
    mass:0,
    shape:floorShape,
    material:defaultMaterial
})
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI * 0.5)

// world.addBody(sphereBody)
world.addBody(floorBody)

// sphere
// const sphere = new THREE.Mesh(
//     new THREE.SphereGeometry(0.5,32,32),
//     new THREE.MeshStandardMaterial({
//         metalness: 0.5,
//         roughness: 0.1,
//         envMap: environmentMapTexture
//     })
// )   

// sphere.castShadow = true
// sphere.position.y = 0.5
// scene.add(sphere)

//floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10,10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness:0.3,
        roughness:0.4,
        envMap:environmentMapTexture
    })
)
floor.receiveShadow = true
floor.rotation.x = -Math.PI * 0.5
scene.add(floor)


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
 * 工具函数utils
 */

const objectsToUpdate = [];
// 创建球体
const sphereGeometry = new THREE.SphereGeometry(1,32,32)
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.5,
    roughness: 0.1,
    envMap: environmentMapTexture
})

const createSphere = (radius,position) =>{
    const mesh = new THREE.Mesh(
        sphereGeometry,
        sphereMaterial
    )
    mesh.scale.set(radius,radius,radius)
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh)
    // 物理世界中的物体
    const shape = new CANNON.Sphere(radius)
    const body = new CANNON.Body({
        mass:1,
        position:new CANNON.Vec3(0,3,0),
        shape,
        material:defaultMaterial
    })
    body.position.copy(position)
    world.addBody(body)

    // 物体添加到数组中
    objectsToUpdate.push({
        mesh,
        body
    })
}

createSphere(0.5,new THREE.Vector3(0,3,0))

// box
const boxGeometry = new THREE.BoxGeometry(1,1,1)
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.5,
    roughness: 0.1,
    envMap: environmentMapTexture
})

const createBox = (width,height,depth,position) =>{
    const mesh = new THREE.Mesh(
        boxGeometry,
        boxMaterial
    )
    mesh.scale.set(width,height,depth)
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh)
    // 物理世界中的物体
    const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5,height * 0.5,depth * 0.5))
    const body = new CANNON.Body({
        mass:1,
        position:new CANNON.Vec3(3,3,0),
        shape,
        material:defaultMaterial
    })
    body.position.copy(position)
    body.addEventListener('collide',playHitSound) // 监听碰撞事件
    world.addBody(body)

    // 物体添加到数组中
    objectsToUpdate.push({
        mesh,
        body
    })
}

createBox(0.5,0.5,0.5,new THREE.Vector3(3,3,0))


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = clock.getDelta()  // 实际上一帧到这一帧的时间

    // sphereBody.applyForce(new CANNON.Vec3(-0.5,0,0),sphereBody.position)

    // 物理世界向前推进 deltaTime 秒
    world.step(1/60, deltaTime, 3)
    for(const object of objectsToUpdate){
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
    }

    // 更新物体位置
    // sphere.position.copy(sphereBody.position)


    //Update particles
    controls.update()


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
