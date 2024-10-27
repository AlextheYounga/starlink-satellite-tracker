import * as THREE from 'three';
import { twoline2satrec, propagate } from 'satellite.js';
import { handleTime } from './sceneHelpers.js';

const satelliteMap = {}
const satelliteDetails = {};
const badSatellites = [55394, 55424] // Corrupt data

// Function to create and show text
function createTextElement(satelliteName) {
	const div = document.createElement('div');
	div.style.position = 'absolute';
	div.style.padding = '6px';
	div.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
	div.style.color = 'white';
	div.style.borderRadius = '3px';
	div.style.fontSize = '11px';
	div.innerHTML = satelliteName;
	div.style.display = 'none';
	document.body.appendChild(div);
	return div;
}

async function renderSatelliteDetails(ids, earthScene) {
	const positions = earthScene.satellitePoints.geometry.attributes.position.array;
	for (let i = 0; i < ids.length; i++) {
		const noradId = ids[i];
		const labelElement = satelliteDetails[noradId];
		const pointPosition = new THREE.Vector3(
			positions[i * 3],
			positions[i * 3 + 1],
			positions[i * 3 + 2]
		);
		const distanceFromSat = earthScene.camera.position.distanceTo(pointPosition);
		if (distanceFromSat <= 1) {
			console.log(noradId, distanceFromSat);
			// Project the 3D point position to 2D screen space
			const screenPosition = pointPosition.clone().project(earthScene.camera);
			const screenX = ((screenPosition.x) * window.innerWidth) / 2;
			const screenY = ((-screenPosition.y) * window.innerHeight) / 2;

			// Position the label on the screen
			labelElement.style.left = `${screenX}px`;
			labelElement.style.top = `${screenY}px`;

			// Hide label if the point is not in front of the camera
			labelElement.style.display = 'block';
		} else {
			labelElement.style.display = 'none';
		}
	}
}

export async function updateSatellitePositions(earthScene) {
	// Update each particle's position
	const positions = earthScene.satellitePoints.geometry.attributes.position.array;
	const ids = earthScene.satellitePoints.geometry.attributes.id.array;

	for (let i = 0; i < ids.length; i++) {
		const noradId = ids[i];
		const satellite = satelliteMap[noradId];
		const satellitePosition = calculateSatellitePosition(satellite.tle_line1, satellite.tle_line2);
		positions[i * 3] = satellitePosition.x;
		positions[i * 3 + 1] = satellitePosition.y;
		positions[i * 3 + 2] = satellitePosition.z;
	}

	const earthRotationAngle = handleTime(); // Get the current rotation angle
	const rotationMatrix = new THREE.Matrix4().makeRotationY(-earthRotationAngle); // Negative to sync

	earthScene.satellitePoints.geometry.rotateY(Math.PI)
	earthScene.satellitePoints.geometry.applyMatrix4(rotationMatrix);
	earthScene.satellitePoints.geometry.attributes.position.needsUpdate = true; // Notify Three.js of the update
	renderSatelliteDetails(ids, earthScene);
}

function calculateSatellitePosition(tleLine1, tleLine2) {
	// The x, y, z coordinates are swapped in the telemetry data
	const toThree = (v) => { return { x: v.x, y: v.z, z: -v.y } };
	const scaleFactor = 4 / 6371; // 0.000627; Scaling factor for my radius of Earth at 4 compared to true radius of Earth
	const satrec = twoline2satrec(tleLine1, tleLine2);
	const telemetry = propagate(satrec, new Date());

	if (!telemetry?.position) return false;

	let { x, y, z } = toThree(telemetry.position);

	// Compute Cartesian coordinates in the orbital plane
	x *= scaleFactor;
	y *= scaleFactor;
	z *= scaleFactor;

	return { x, y, z };
}

export function createSatellitePoints(satellites) {
	const positions = [];

	const ids = [];
	const geometry = new THREE.BufferGeometry();
	const size = 0.005;
	// const size = 0.01
	const limit = 10
	let i = 0;
	for (const satellite of satellites) {
		if (i++ >= limit) break; // Limit the number of satellites processed
		// const satellite = satellites[i];
		const noradId = parseInt(satellite.norad_cat_id)
		if (badSatellites.includes(noradId)) continue; // Skip bad satellites

		const satellitePosition = calculateSatellitePosition(satellite.tle_line1, satellite.tle_line2);
		if (!satellitePosition) continue;

		ids.push(noradId);
		satelliteMap[noradId] = satellite; // Store satellite details by ID
		satelliteDetails[noradId] = createTextElement(satellite.object_name); // Store satellite details by ID
		positions.push(
			satellitePosition.x,
			satellitePosition.y,
			satellitePosition.z
		);
	}

	const colors = new Float32Array(positions.length).fill(1.0);
	geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
	geometry.setAttribute('id', new THREE.Int32BufferAttribute(ids, 1)); // Add custom 'id' attribute
	geometry.rotateY(Math.PI)

	const earthRotationAngle = handleTime(); // Get the current rotation angle
	const rotationMatrix = new THREE.Matrix4().makeRotationY(-earthRotationAngle); // Negative to sync
	geometry.applyMatrix4(rotationMatrix);

	const material = new THREE.PointsMaterial({ size: size });
	const particles = new THREE.Points(geometry, material);
	const axesHelper = new THREE.AxesHelper(7); // Adjust size to fit your scene
	particles.add(axesHelper); // Add axes helper to particles
	return particles
}

