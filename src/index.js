import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Добавление OrbitControls для управления камерой с помощью мыши
const controls = new OrbitControls(camera, renderer.domElement);

// Загрузка текстур WebGL
const textureLoader = new THREE.TextureLoader();
const textures = {
    'brick': textureLoader.load('https://threejs.org/examples/textures/brick_diffuse.jpg'),
    'concrete': textureLoader.load('https://threejs.org/examples/textures/uv_grid_opengl.jpg')
};

// Определение шейдера с поддержкой освещения и текстур
const phongShader = {
    uniforms: {
        uTexture: { value: null }, // Текстура куба
        lightPosition: { value: new THREE.Vector3(5, 5, 5) },
        ambientLight: { value: new THREE.Color(0x404040) },
        lightColor: { value: new THREE.Color(0xffffff) },
        specularStrength: { value: 0.5 },
        shininess: { value: 30.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D uTexture;
        uniform vec3 lightPosition;
        uniform vec3 ambientLight;
        uniform vec3 lightColor;
        uniform float specularStrength;
        uniform float shininess;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
            vec3 baseColor = texture2D(uTexture, vUv).rgb;

            // Ambient lighting
            vec3 ambient = ambientLight * baseColor;

            // Diffuse lighting
            vec3 lightDir = normalize(lightPosition - vPosition);
            float diff = max(dot(vNormal, lightDir), 0.0);
            vec3 diffuse = diff * lightColor * baseColor;

            // Specular lighting
            vec3 viewDir = normalize(-vPosition);
            vec3 reflectDir = reflect(-lightDir, vNormal);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
            vec3 specular = specularStrength * spec * lightColor;

            vec3 finalColor = ambient + diffuse + specular;

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
};

let cubeGeometry = new THREE.BoxGeometry(3, 3, 3);
let cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

// Добавление источников света
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040); // Фоновый свет
scene.add(ambientLight);

function animate() {
    requestAnimationFrame(animate);
    controls.update();  // Обновляем управление камерой
    renderer.render(scene, camera);
}
animate();

// Применение настроек
document.getElementById("applySettings").addEventListener("click", function() {
    const newSize = document.getElementById("sizeRange").value;
    const newColor = document.getElementById("colorPicker").value;
    const newTexture = document.getElementById("textureSelect").value;
    const enableShader = document.getElementById("shaderCheckbox").checked;

    scene.remove(cube);

    cubeGeometry = new THREE.BoxGeometry(newSize, newSize, newSize);

    if (enableShader) {
        // Применяем шейдерный материал с учетом освещения и текстур
        phongShader.uniforms.uTexture.value = textures[newTexture];
        cubeMaterial = new THREE.ShaderMaterial({
            uniforms: phongShader.uniforms,
            vertexShader: phongShader.vertexShader,
            fragmentShader: phongShader.fragmentShader
        });
    } else {
        const selectedTexture = textures[newTexture];
        cubeMaterial = new THREE.MeshLambertMaterial({
            color: newColor,
            map: selectedTexture || null
        });
    }

    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    scene.add(cube);

    document.getElementById("settingsPopup").classList.add("hidden");
});

// Интерактивность
document.getElementById("startButton").addEventListener("click", function() {
    document.getElementById("popup").classList.remove("hidden");
});

document.getElementById("settingsButton").addEventListener("click", function() {
    document.getElementById("settingsPopup").classList.remove("hidden");
});

document.getElementById("closeSettings").addEventListener("click", function() {
    document.getElementById("settingsPopup").classList.add("hidden");
});

// Обновление размеров рендерера при изменении размеров окна
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
