import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createEarth } from './createEarth';
import { createSatellitePoints } from './createSatellitePoints';
// import { createStarlinkSatellite } from './createStarlinkSatellite';

let earthScene = null;

function setScene() {
	// Create the scene
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50);

	// Set up renderer
	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// Handle window resizing
	window.addEventListener('resize', () => {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	});

	// Set up controls
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.screenSpacePanning = false;
	controls.minDistance = 4.1;
	controls.maxDistance = 20;

	// Camera positioning
	camera.position.z = 5;

	// Add the Earth to the scene
	const earth = createEarth();
	scene.add(earth);

	// Add the satellite points to the scene
	const satellites = createSatellitePoints();
	scene.add(satellites);

	// Add directional light
	const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
	directionalLight.position.set(5, 3, 5).normalize();
	scene.add(directionalLight);

	// Add ambient light
	const ambientLight = new THREE.AmbientLight(0x333333); // Soft lighting
	scene.add(ambientLight);

	return {
		earth,
		scene,
		renderer,
		camera,
		controls
	}
}

// Animation loop
function animate() {
	requestAnimationFrame(animate);

	// Rotate the Earth
	earthScene.earth.rotation.y += 1.21e-6;  // Adjust speed of rotation here
	earthScene.renderer.render(earthScene.scene, earthScene.camera); // Render the scene
	earthScene.controls.update();
}

export const renderEarthScene = async () => {
	earthScene = setScene()
	animate(); // Start the animation
}