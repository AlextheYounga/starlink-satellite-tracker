import * as THREE from 'three';
import { twoline2satrec, propagate } from 'satellite.js';
import { handleTime } from './sceneHelpers.js';

const satelliteMap = {}
const labels = {}
const badSatellites = [55394, 55424] // Corrupt data

function createTextElement(satelliteName) {
	const div = document.createElement('div');
	div.style.position = 'absolute';
	div.style.padding = '6px';
	div.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
	div.style.color = 'white';
	div.style.borderRadius = '3px';
	div.style.fontSize = '11px';
	div.style.cursor = 'default';
	div.style.overflow = 'hidden';
	div.innerHTML = satelliteName;
	div.style.display = 'none';
	document.body.appendChild(div);
	return div;
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

async function renderSatelliteDetails(ids, earthScene) {
    const positions = earthScene.satellitePoints.geometry.attributes.position.array;
    const frustum = new THREE.Frustum();
    const projScreenMatrix = new THREE.Matrix4();
    
    projScreenMatrix.multiplyMatrices(
        earthScene.camera.projectionMatrix,
        earthScene.camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(projScreenMatrix);

    for (let i = 0; i < ids.length; i++) {
        const noradId = ids[i];
        const label = labels[noradId];
        
        // Create vector for position
        const vector = new THREE.Vector3(
            positions[i * 3],
            positions[i * 3 + 1],
            positions[i * 3 + 2]
        );
        
        // Check if point is in view frustum
        if (!frustum.containsPoint(vector)) {
            label.style.display = 'none';
            continue;
        }

        // Calculate screen position
        vector.project(earthScene.camera);
        
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (vector.y * 0.5 + 0.5) * window.innerHeight;
        
        // Only show if in front of camera (z < 1)
        if (vector.z < 1) {
            label.style.display = 'block';
            label.style.left = `${x}px`;
            label.style.top = `${y}px`;
        } else {
            label.style.display = 'none';
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

	const geometryCenter = new THREE.Vector3(0,0,0);
	const distanceToCenter = earthScene.camera.position.distanceTo(geometryCenter);

    if (distanceToCenter < 5) {
        renderSatelliteDetails(ids, earthScene);
    } else {
        // Hide all labels when too far
        ids.forEach(id => {
            if (labels[id]) {
                labels[id].style.display = 'none';
            }
        });
    }
}

export function createSatellitePoints(satellites) {
	const ids = [];
	const positions = [];
	const geometry = new THREE.BufferGeometry();
	const size = 0.005;
	const limit = 10
	let i = 0;

	for (const satellite of satellites) {
		if (i++ >= limit) break; // Limit the number of satellites processed
		// const satellite = satellites[i];
		const noradId = parseInt(satellite.norad_cat_id)
		if (badSatellites.includes(noradId)) continue; // Skip bad satellites

		const satellitePosition = calculateSatellitePosition(satellite.tle_line1, satellite.tle_line2);
		if (!satellitePosition) continue;

		const label = createTextElement(satellite.object_name);
		labels[noradId] = label;

		ids.push(noradId);
		positions.push(satellitePosition.x, satellitePosition.y, satellitePosition.z);
		satelliteMap[noradId] = satellite; // Store satellite details by ID
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
	const points = new THREE.Points(geometry, material);

	return points
}

