import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let earthScene = null;

// Animation loop
function animate() {
	requestAnimationFrame(animate);

	// Rotate the Earth
	earthScene.earth.rotation.y += 1.21e-6;  // Adjust speed of rotation here
	earthScene.renderer.render(earthScene.scene, earthScene.camera); // Render the scene
	earthScene.controls.update();
}

function createEarth() {
	// Load textures
	const textureLoader = new THREE.TextureLoader();
	const earthTexture = textureLoader.load('./images/2k_earth_daymap.jpg');

	// Create the Earth geometry and material
	const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
	const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture });
	const earth = new THREE.Mesh(earthGeometry, earthMaterial);

	return earth;
}

function setScene() {
	// Create the scene
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	// Set up renderer
	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// Handle window resizing
	// window.addEventListener('resize', () => {
	// 	renderer.setSize(window.innerWidth, window.innerHeight);
	// 	camera.aspect = window.innerWidth / window.innerHeight;
	// 	camera.updateProjectionMatrix();
	// });

	// Add directional light
	const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	directionalLight.position.set(5, 3, 5).normalize();
	scene.add(directionalLight);

	// Add ambient light
	const ambientLight = new THREE.AmbientLight(0x333333); // Soft lighting
	scene.add(ambientLight);


	// Set up controls
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.screenSpacePanning = false;
	controls.minDistance = 0;
	controls.maxDistance = 1000;

	// Camera positioning
	camera.position.z = 5;
	console.log(camera.position);  // Ensure it’s positioned in front of the object
	camera.lookAt(scene.position);  // Make sure the camera points at the scen

	// Add the Earth to the scene
	const earth = createEarth();
	scene.add(earth);
	return {
		earth,
		scene,
		renderer,
		camera,
		controls
	}
}

export const renderEarth = async () => {
	earthScene = setScene()
	animate(); // Start the animation
}