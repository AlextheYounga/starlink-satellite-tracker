import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createEarth } from './createEarth';
import { createSatellitePoints, calculateSatellitePosition } from './createSatellitePoints';

let earthScene = null;
const fps = 15; // We put satellite animation sloooow so we don't kill our CPUs
let fpsInterval, now, then, elapsed, start;

function createSun() {
	// Add directional light
	const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
	const ambientLight = new THREE.AmbientLight(0x333333); // Soft lighting
	directionalLight.position.set(5, 2, 0).normalize();

	return {
		directionalLight,
		ambientLight
	}
}

function setScene(satellites) {
	// Create the scene
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

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
	controls.minDistance = 4.7;
	controls.maxDistance = 100;

	// Camera positioning
	camera.position.z = 10;

	// Add the Earth to the scene
	const earth = createEarth();
	scene.add(earth);

	// Add the satellite points to the scene
	const satellitePoints = createSatellitePoints(satellites);
	scene.add(satellitePoints);

	// Add the Sun to the scene
	const sun = createSun();
	scene.add(sun.directionalLight);
	scene.add(sun.ambientLight);

	return {
		earth,
		satellitePoints,
		satellites,
		scene,
		renderer,
		camera,
		controls
	}
}

async function updateSatellitePositions() {
	// Update each particle's position
	const positions = earthScene.satellitePoints.geometry.attributes.position.array;
	for (let i = 0; i < earthScene.satellites.length; i++) {
		const satellite = earthScene.satellites[i]
		const satellitePosition = calculateSatellitePosition(satellite)
		if (!satellitePosition) continue

		positions[i * 3] = satellitePosition.x;
		positions[i * 3 + 1] = satellitePosition.y;
		positions[i * 3 + 2] = satellitePosition.z;
	}

	earthScene.satellitePoints.geometry.attributes.position.needsUpdate = true; // Notify Three.js of the update
}

// Animation loop
function animate() {
	requestAnimationFrame(animate);

	now = Date.now();
	elapsed = now - then;

	// Rotate the Earth
	earthScene.earth.rotation.y += 1.21e-6;  // Adjust speed of rotation here
	earthScene.renderer.render(earthScene.scene, earthScene.camera); // Render the scene
	earthScene.controls.update();

	// if enough time has elapsed, draw the next frame
	if (elapsed > fpsInterval) {
		// Let's give it a couple seconds before we worry about animating satellites
		if ((now - start) > 2000) {
			// Get ready for next frame by setting then=now, but also adjust for your
			// specified fpsInterval not being a multiple of RAF's interval (16.7ms)
			then = now - (elapsed % fpsInterval);
			updateSatellitePositions()
		}
	}
}

function startAnimating() {
	fpsInterval = 1000 / fps;
	then = Date.now();
	start = then;
	animate();
}

export const renderEarthScene = async (satellites) => {
	earthScene = setScene(satellites)
	startAnimating(); // Start the animation
}