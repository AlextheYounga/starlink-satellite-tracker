import * as THREE from 'three';
import { loadAsync } from 'jszip';
import { handleTime } from './sceneHelpers.js';

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

export function createEarth() {
	// Create the Earth geometry and material
	const paleBlueDot = new THREE.Group()

	// Load textures
	const textureLoader = new THREE.TextureLoader();
	const earthTexture = textureLoader.load('./images/8081_earthmap10k.jpg.webp');
	const radius = 4;
	const earthGeometry = new THREE.SphereGeometry(radius, 64, 64);
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

								const x = radius * Math.sin(phi) * Math.cos(theta);
								const y = radius * Math.cos(phi);
								const z = radius * -Math.sin(phi) * Math.sin(theta);

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
	
	const timeRadians = handleTime();
	paleBlueDot.rotateY(timeRadians) // Put the earth at noon at UTC time.

	const axesHelper = new THREE.AxesHelper(5); // Adjust size to fit your scene
	paleBlueDot.add(axesHelper); // Add axes helper to the Earth


	return paleBlueDot
}