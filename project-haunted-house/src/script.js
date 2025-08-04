import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

//================================================================================
// 1. 基础设置 (Base Setup)
//================================================================================
const gui = new dat.GUI({ width: 360 })
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

// 调整雾效，使其更浓，氛围更强
const fog = new THREE.Fog('#262837', 1, 10) // 结束距离从 15 缩短到 10
scene.fog = fog

//================================================================================
// 2. 纹理加载 (Texture Loading)
//================================================================================
const textureLoader = new THREE.TextureLoader()

// 门
const doorColorTexture = textureLoader.load('/textures/door/color.jpg')
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg')
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg')
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg')

// 墙体
const wallsColorTexture = textureLoader.load('/textures/walls/sloppy-mortar-stone-wall_albedo.png')
const wallsAmbientOcclusionTexture = textureLoader.load('/textures/walls/sloppy-mortar-stone-wall_ao.png')
const wallsNormalTexture = textureLoader.load('/textures/walls/sloppy-mortar-stone-wall_normal-dx.png')
const wallsRoughnessTexture = textureLoader.load('/textures/walls/sloppy-mortar-stone-wall_roughness.png')

// 草地 (新增地面起伏纹理)
const grassColorTexture = textureLoader.load('/textures/grass/color.jpg')
const grassAmbientOcclusionTexture = textureLoader.load('/textures/grass/ambientOcclusion.jpg')
const grassNormalTexture = textureLoader.load('/textures/grass/normal.jpg')
const grassRoughnessTexture = textureLoader.load('/textures/grass/roughness.jpg')

grassColorTexture.repeat.set(8, 8)
grassAmbientOcclusionTexture.repeat.set(8, 8)
grassNormalTexture.repeat.set(8, 8)
grassRoughnessTexture.repeat.set(8, 8)

grassColorTexture.wrapS = THREE.RepeatWrapping
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping
grassNormalTexture.wrapS = THREE.RepeatWrapping
grassRoughnessTexture.wrapS = THREE.RepeatWrapping

grassColorTexture.wrapT = THREE.RepeatWrapping
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping
grassNormalTexture.wrapT = THREE.RepeatWrapping
grassRoughnessTexture.wrapT = THREE.RepeatWrapping

//================================================================================
// 3. 场景物体 (Scene Objects)
//================================================================================
// --- 房屋 ---
const house = new THREE.Group()
scene.add(house)

// 墙体
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial({
        map: wallsColorTexture,
        aoMap: wallsAmbientOcclusionTexture,
        normalMap: wallsNormalTexture,
        roughnessMap: wallsRoughnessTexture
    })
)
walls.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2))
walls.position.y = 1.25
house.add(walls)

// 屋顶
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1, 4),
    new THREE.MeshStandardMaterial({ color: '#b35f45' })
)
roof.position.y = 2.5 + 0.5
roof.rotation.y = Math.PI / 4
house.add(roof)

// 门
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
    new THREE.MeshStandardMaterial({
        map: doorColorTexture,
        transparent: true,
        alphaMap: doorAlphaTexture,
        aoMap: doorAmbientOcclusionTexture,
        displacementMap: doorHeightTexture,
        displacementScale: 0.1,
        normalMap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture
    })
)
door.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2))
door.position.y = 1
door.position.z = 2 + 0.01
house.add(door)

// --- 烟囱和烟雾 ---
const chimney = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 1.5, 0.5),
    new THREE.MeshStandardMaterial({ color: '#4d4d4d'})
)
chimney.position.set(-1.5, 3.2, -1.5)
house.add(chimney)

const smokeParticles = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        size: 0.2, // 使用较小的尺寸
        sizeAttenuation: true,
        color: '#888888', // 灰色烟雾
        opacity: 0.6
    })
)
const smokePositions = new Float32Array(50 * 3)
for(let i = 0; i < 50; i++) {
    smokePositions[i * 3 + 0] = chimney.position.x + (Math.random() - 0.5) * 0.4
    smokePositions[i * 3 + 1] = chimney.position.y + 0.75 + Math.random() * 1.5
    smokePositions[i * 3 + 2] = chimney.position.z + (Math.random() - 0.5) * 0.4
}
smokeParticles.geometry.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3))
scene.add(smokeParticles)

// --- 墓地 ---
const graves = new THREE.Group()
scene.add(graves)
const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({ color: '#727272' })

for (let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = 3 + Math.random() * 6
    const x = Math.sin(angle) * radius
    const z = Math.cos(angle) * radius

    const grave = new THREE.Mesh(graveGeometry, graveMaterial)
    grave.position.set(x, 0.3, z)
    grave.rotation.y = (Math.random() - 0.5) * 0.8
    grave.rotation.z = (Math.random() - 0.5) * 0.6
    grave.castShadow = true
    graves.add(grave)
}

const swordBladeGeo = new THREE.BoxGeometry(0.05, 0.8, 0.02) // 剑刃做得更薄更细
const swordGuardGeo = new THREE.BoxGeometry(0.15, 0.04, 0.02) // 护手
const swordHandleGeo = new THREE.BoxGeometry(0.03, 0.2, 0.02) // 剑柄

// 使用和墓碑一样的材质，让它们看起来像被遗弃的旧物
const swordMaterial = new THREE.MeshStandardMaterial({ color: '#888888' }) // 稍微亮一点的灰色

const swords = new THREE.Group()
scene.add(swords)

for (let i = 0; i < 30; i++) { // 数量可以减少一些，让场景不那么拥挤
    const angle = Math.random() * Math.PI * 2
    const radius = 3 + Math.random() * 6
    const x = Math.sin(angle) * radius
    const z = Math.cos(angle) * radius

    // 为每把剑创建一个独立的 Group
    const sword = new THREE.Group()

    const blade = new THREE.Mesh(swordBladeGeo, swordMaterial)
    blade.position.y = 0.4
    sword.add(blade)

    const guard = new THREE.Mesh(swordGuardGeo, swordMaterial)
    guard.position.y = 0.8
    sword.add(guard)

    const handle = new THREE.Mesh(swordHandleGeo, swordMaterial)
    handle.position.y = 0.92
    sword.add(handle)

    // 让整把剑能投射阴影
    sword.children.forEach(part => part.castShadow = true)

    // 将整把剑插入地面，并随机倾斜
    sword.position.set(x, 0, z) // y=0.35 让剑尖稍微插入地下
    sword.rotation.y = Math.random() * Math.PI * 2 // 随机朝向
    sword.rotation.z = (Math.random() - 0.5) * 1.5 
    sword.rotation.x = (Math.random() - 0.5) * 0.4

    swords.add(sword)
}

// --- 地面---
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
        map: grassColorTexture,
        aoMap: grassAmbientOcclusionTexture,
        normalMap: grassNormalTexture,
        roughnessMap: grassRoughnessTexture
    })
)
floor.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2))
floor.rotation.x = -Math.PI * 0.5
floor.position.y = 0
scene.add(floor)

//================================================================================
// 4. 灯光 (Lights) - 调整光照以增强恐怖感
//================================================================================
// 环境光: 大幅降低，让暗部更暗，增加对比度
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.03)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001).name('环境光强度')
scene.add(ambientLight)

// 月光: 调暗并增加阴影的戏剧性
const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.08)
moonLight.position.set(4, 5, -2)
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001).name('月光强度')
gui.add(moonLight.position, 'x').min(-5).max(5).step(0.001)
gui.add(moonLight.position, 'y').min(-5).max(5).step(0.001)
gui.add(moonLight.position, 'z').min(-5).max(5).step(0.001)
scene.add(moonLight)

// 门灯: 会在动画循环中闪烁
const doorLight = new THREE.PointLight('#ff7d46', 1, 7)
doorLight.position.set(0, 2.2, 2.7)
house.add(doorLight)

// 幽灵
const ghost1 = new THREE.PointLight('#ff00ff', 3, 4) // 增加强度和范围
scene.add(ghost1)
const ghost2 = new THREE.PointLight('#00ffff', 3, 4)
scene.add(ghost2)
const ghost3 = new THREE.PointLight('#ffff00', 3, 4)
scene.add(ghost3)

//================================================================================
// 5. 阴影 (Shadows)
//================================================================================

moonLight.castShadow = true
doorLight.castShadow = true
ghost1.castShadow = true
ghost2.castShadow = true
ghost3.castShadow = true

walls.castShadow = true
chimney.castShadow = true;
// bushs.castShadow = true (原代码中bush没有统一添加，此处省略)
graves.children.forEach(grave => { grave.castShadow = true })

floor.receiveShadow = true

// 优化阴影贴图大小
moonLight.shadow.mapSize.width = 1024
moonLight.shadow.mapSize.height = 1024
doorLight.shadow.mapSize.width = 256
doorLight.shadow.mapSize.height = 256
doorLight.shadow.camera.far = 7

ghost1.shadow.mapSize.width = 256
ghost1.shadow.mapSize.height = 256
ghost1.shadow.camera.far = 7
// ... ghost2, ghost3 shadow maps ...

//================================================================================
// 6. 尺寸、相机和渲染器 (Sizes, Camera, Renderer)
//================================================================================
const sizes = { width: window.innerWidth, height: window.innerHeight }
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 2, 6)
scene.add(camera)

// 新增: 将相机放入一个组，用于实现镜头晃动而不影响OrbitControls
const cameraGroup = new THREE.Group()
cameraGroup.add(camera)
scene.add(cameraGroup)


const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.maxPolarAngle = Math.PI * 0.48 // 限制相机向下看的角度，防止穿地

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(scene.fog.color) // 背景色与雾色一致

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap // 更柔和的阴影

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

//================================================================================
// 7. 音效 (Sound) - 巨大地提升氛围
//================================================================================
const listener = new THREE.AudioListener()
camera.add(listener)
const sound = new THREE.Audio(listener)
const audioLoader = new THREE.AudioLoader()

window.addEventListener('click', () => {
    if(!sound.isPlaying) {
        audioLoader.load('/horror-background-atmosphere-156462.mp3', (buffer) => {
            sound.setBuffer(buffer)
            sound.setLoop(true)
            sound.setVolume(0.3)
            sound.play()
        })
    }
}, { once: true })


//================================================================================
// 8. 动画循环 (Animate)
//================================================================================
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // --- 动态效果 ---
    // 1. 门灯闪烁
    const doorLightFlicker = Math.random()
    doorLight.intensity = doorLightFlicker > 0.1 ? 1 + Math.sin(elapsedTime * 5) * 0.5 : 0

    // 2. 幽灵动画 (更诡异的移动)
    const ghost1Angle = elapsedTime * 0.5
    ghost1.position.x = Math.cos(ghost1Angle) * 4
    ghost1.position.z = Math.sin(ghost1Angle) * 4
    ghost1.position.y = Math.sin(elapsedTime * 3) + Math.sin(elapsedTime * 2.1) * 0.5

    const ghost2Angle = -elapsedTime * 0.32
    ghost2.position.x = Math.cos(ghost2Angle) * 5
    ghost2.position.z = Math.sin(ghost2Angle) * 5
    ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

    const ghost3Angle = elapsedTime * 0.18
    const ghost3Radius = 6 + Math.sin(elapsedTime * 0.5)
    ghost3.position.x = Math.cos(ghost3Angle) * ghost3Radius
    ghost3.position.z = Math.sin(ghost3Angle) * ghost3Radius
    ghost3.position.y = Math.sin(elapsedTime * 5) + Math.sin(elapsedTime * 2)

    // 3. 镜头轻微晃动 (模拟呼吸或紧张感)
    cameraGroup.position.x = (Math.sin(elapsedTime * 0.2)) * 0.02
    cameraGroup.position.y = (Math.cos(elapsedTime * 0.2)) * 0.02

    // 4. 烟雾粒子上升
    const positions = smokeParticles.geometry.attributes.position.array;
    for (let i = 0; i < 50; i++) {
        positions[i * 3 + 1] += 0.01; // Y轴上升
        if (positions[i * 3 + 1] > chimney.position.y + 3) {
            positions[i * 3 + 1] = chimney.position.y + 0.75; // 回到烟囱口
        }
    }
    smokeParticles.geometry.attributes.position.needsUpdate = true;


    // 更新控制器
    controls.update()

    // 渲染
    renderer.render(scene, camera)

    // 下一帧
    window.requestAnimationFrame(tick)
}

tick()