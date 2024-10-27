import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createEarth } from './createEarth';
import { createSatellitePoints, updateSatellitePositions } from './createSatellitePoints';

let isAnimating = true; // Track if animation is running
let earthScene = null;
const fps = 15; // We put satellite animation sloooow so we don't kill our CPUs
let fpsInterval, now, then, elapsed, start;

function createSun() {
	// Add directional light
	const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
	const ambientLight = new THREE.AmbientLight(0x333333); // Soft lighting
	directionalLight.position.set(5, -1, 0).normalize();

	return {
		directionalLight,
		ambientLight
	}
}

function createPlayButton() {
	// Create Play/Stop Button
	const button = document.createElement('button');
	button.innerHTML = isAnimating ? 'Stop' : 'Play'; // Update button text
	button.style.position = 'absolute';
	button.style.top = '8px';
	button.style.left = '8px';
	button.style.padding = '8px 20px';
	button.style.fontSize = '8px';
	button.style.backgroundColor = '#fff';
	button.style.zIndex = '1000'; // Ensure button is on top
	document.body.appendChild(button);

	// Toggle animation on button click
	button.addEventListener('click', () => {
		isAnimating = !isAnimating; // Toggle the animation state
		button.innerHTML = isAnimating ? 'Stop' : 'Play'; // Update button text
	});
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

	// Add the Sun to the scene
	const sun = createSun();
	scene.add(sun.directionalLight);
	scene.add(sun.ambientLight);

	// Add the Earth to the scene, with satellite points 
	const earth = createEarth(satellites);

	// Add the satellite points to the earth scene
	const satellitePoints = createSatellitePoints(satellites);
	earth.add(satellitePoints);

	scene.add(earth)


	return {
		earth,
		satellites,
		satellitePoints,
		scene,
		renderer,
		camera,
		controls,
	}
}



// Animation loop
function animate() {
	requestAnimationFrame(animate); // Only continue animation if allowed

	now = Date.now();
	elapsed = now - then;

	// Rotate the Earth
	earthScene.earth.rotation.y += 1.21e-6;  // Adjust speed of rotation here
	earthScene.renderer.render(earthScene.scene, earthScene.camera); // Render the scene
	earthScene.controls.update();

	if (!isAnimating) return; // If not animating, skip satellite updates

	// if enough time has elapsed, draw the next frame
	if (elapsed > fpsInterval) {
		// Let's give it a couple seconds before we worry about animating satellites
		if ((now - start) > 2000) {
			// Get ready for next frame by setting then=now, but also adjust for your
			// specified fpsInterval not being a multiple of RAF's interval (16.7ms)
			then = now - (elapsed % fpsInterval);
			updateSatellitePositions(earthScene);
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
	createPlayButton(); // Create the play button
	startAnimating(); // Start the animation
}