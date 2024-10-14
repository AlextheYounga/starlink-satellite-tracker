import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loadAsync } from 'jszip';

let earthScene = null;

// Animation loop
function animate() {
	requestAnimationFrame(animate);

	// Rotate the Earth
	earthScene.earth.rotation.y += 1.21e-6;  // Adjust speed of rotation here
	earthScene.renderer.render(earthScene.scene, earthScene.camera); // Render the scene
	earthScene.controls.update();
}


function flatMapCoordinates(input) {
	const result = [];
	function flattenArray(arr) {
		return arr.reduce((acc, val) =>
			Array.isArray(val) ? acc.concat(flattenArray(val)) : acc.concat([val]),
			[]);
	}
	const flattened = flattenArray(input);

	for (let i = 0; i < flattened.length; i += 2) {
		const pair = flattened.slice(i, i + 2);
		if (pair.length === 2) {  // Ensure only valid pairs are included
			result.push(pair);
		}
	}

	return result;
}


function createEarth() {
	// Create the Earth geometry and material
	const paleBlueDot = new THREE.Group()

	// Load textures
	const textureLoader = new THREE.TextureLoader();
	const earthTexture = textureLoader.load('./images/8081_earthmap10k.jpg.webp');

	const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
	const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture });
	const earthSphere = new THREE.Mesh(earthGeometry, earthMaterial);
	earthSphere.rotateY(Math.PI)
	paleBlueDot.add(earthSphere)

	fetch('/data/geojson.zip').then((response) => {
		loadAsync(response.blob()).then(zip => {
			Object.keys(zip.files).forEach(filename => {
				if (filename.endsWith('.json') && !filename.startsWith('__')) {
					zip.files[filename].async('string').then(content => {
						const jsonContent = JSON.parse(content);

						jsonContent.features.forEach((feature) => {
							const coordinates = flatMapCoordinates(feature.geometry.coordinates);
							const points = coordinates.map(([lon, lat]) => {
								// Ensure valid longitude (-180 to 180) and latitude (-90 to 90)
								if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
									console.warn(`Invalid coordinate: [${lon}, ${lat}]`);
									return null;  // Skip invalid points
								}

								const phi = (90 - lat) * (Math.PI / 180);  // Latitude to radians
								const theta = (lon + 180) * (Math.PI / 180);  // Longitude to radians

								const x = Math.sin(phi) * Math.cos(theta);
								const y = Math.cos(phi);
								const z = -Math.sin(phi) * Math.sin(theta);

								return new THREE.Vector3(x, y, z);  // Valid Vector3 point
							}).filter(point => point !== null);  // Filter out null points

							// Create a Three.js line from the points
							const geometry = new THREE.BufferGeometry().setFromPoints(points);
							const material = new THREE.LineBasicMaterial({ color: 0xffffff });
							const line = new THREE.Line(geometry, material);

							// Add the line to the scene
							paleBlueDot.add(line);
						});
					});
				}
			})
		})
	})
	return paleBlueDot
}


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

	// Add directional light
	const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
	directionalLight.position.set(5, 3, 5).normalize();
	scene.add(directionalLight);

	// Add ambient light
	const ambientLight = new THREE.AmbientLight(0x333333); // Soft lighting
	scene.add(ambientLight);


	// Set up controls
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.screenSpacePanning = false;
	controls.minDistance = 1.1;
	controls.maxDistance = 20;

	// Camera positioning
	camera.position.z = 5;
	camera.lookAt(scene.position);  // Make sure the camera points at the scen

	// Add the Earth to the scene
	const earth = createEarth(scene);
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