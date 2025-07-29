import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js' 
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
// import GUI from 'lil-gui'; 


/**
 * Base
 */
// Debug
// const gui = new GUI();
// gui.add( document, 'title' );
// const gui = new dat.GUI()
// gui.add( document, 'title' );

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// axes helper
// const axesHelper = new THREE.AxesHelper()
// scene.add(axesHelper)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const matcapTexture = textureLoader.load('/textures/matcaps/8.png')

/**
 * Fonts
 */
const fontLoader = new FontLoader();
fontLoader.load(
    '/fonts/FangSong_Regular.json',
    (font) =>{
        const lines = [
            '为天地立心',
            '为生民立命',
            '为往圣继绝学',
            '为万世开太平'
        ];
        const lineHeight = 0.8;
        const material  = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
        // 创建一个 Group 来容纳所有文字
        const textGroup = new THREE.Group();

        lines.forEach((text, idx) => {
            const geo = new TextGeometry(text, {
                font,
                size: 0.5,
                depth: 0.2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            });
            geo.center(); 
            geo.translate(0, -idx * lineHeight, 0);
            const mesh = new THREE.Mesh(geo, material);
            textGroup.add(mesh); // 加入组
        });

        // 计算整体高度并居中
        const totalHeight = (lines.length - 1) * lineHeight;
        textGroup.position.y = totalHeight / 2; // 把整个组向上移一半高度，使其中心在世界原点

        scene.add(textGroup); // 添加到场景

        const donutGeometry = new THREE.TorusGeometry(0.3,0.2,20,45);

        for(let i =0 ;i<1000;i++){
            const donut = new THREE.Mesh(donutGeometry,material);
            donut.position.x = (Math.random() - 0.5) * 60;
            donut.position.y = (Math.random() - 0.5) * 60;
            donut.position.z = (Math.random() - 0.5) * 60;

            donut.rotation.x= Math.random() * Math.PI
            donut.rotation.y= Math.random() * Math.PI
            donut.rotation.z= Math.random() * Math.PI

            const scale = Math.random();
            donut.scale.set(scale,scale,scale)

            scene.add(donut);
        }
    }
)

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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 60)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 6
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
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()