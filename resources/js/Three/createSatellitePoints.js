import * as THREE from 'three';
import { twoline2satrec, propagate } from 'satellite.js';
import { handleTime } from './sceneHelpers.js';

const satelliteMap = {}
const badSatellites = [55394, 55424] // Corrupt data


export async function updateSatellitePositions(earthScene) {
	// Update each particle's position
	const positions = earthScene.satellitePoints.geometry.attributes.position.array;
	const ids = earthScene.satellitePoints.geometry.attributes.id.array;
	const newPositions = []
	for (let i = 0; i < ids.length; i++) {
		const noradId = ids[i];
		const satellite = satelliteMap[noradId];
		const satellitePosition = calculateSatellitePosition(satellite.tle_line1, satellite.tle_line2);
		newPositions.push(satellitePosition)
		positions[i * 3] = satellitePosition.x;
		positions[i * 3 + 1] = satellitePosition.y;
		positions[i * 3 + 2] = satellitePosition.z;
	}
	// const earthRotationAngle = handleTime(); // Get the current rotation angle
	// const rotationMatrix = new THREE.Matrix4().makeRotationY(-earthRotationAngle); // Negative to sync
	// earthScene.satellitePoints.geometry.rotateY(Math.PI)
	// earthScene.satellitePoints.geometry.applyMatrix4(rotationMatrix);
	earthScene.satellitePoints.geometry.attributes.position.needsUpdate = true; // Notify Three.js of the update

	const geometryCenter = new THREE.Vector3(0,0,0);
	const distanceToCenter = earthScene.camera.position.distanceTo(geometryCenter);

	// Update satellite labels
    if (distanceToCenter < 6) {
		for (let i = 0; i < newPositions.length; i++) {
			const position = newPositions[i];
			earthScene.labels[i].visible = true;
			earthScene.labels[i].position.set(position.x, position.y + 0.01, position.z + 0.01);
		}
    } else {
        // Hide all labels when too far
		for (let i = 0; i < ids.length; i++) {
			earthScene.labels[i].visible = false;
		}
    }
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

function createSpriteTextLabel(text, position) {
    // Create canvas for text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;
    
    // Style text - make font smaller to accommodate smaller sprite size
    context.font = 'Bold 24px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width/2, canvas.height/2);
    
    // Create sprite with smaller scale
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        sizeAttenuation: true
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(position.x, position.y + 0.01, position.z + 0.01);
    sprite.scale.set(0.1, 0.1, 0.1);
	sprite.visible = false;
    
    return sprite;
}


export function createSatellitePoints(satellites) {
	const ids = [];
	const positions = [];
	const labels = [];
	const geometry = new THREE.BufferGeometry();
	const size = 0.005;
	const limit = 10
	let i = 0;

	for (const satellite of satellites) {
		if (i++ >= limit) break; // Limit the number of satellites processed
		const noradId = parseInt(satellite.norad_cat_id)
		if (badSatellites.includes(noradId)) continue; // Skip bad satellites

		const satellitePosition = calculateSatellitePosition(satellite.tle_line1, satellite.tle_line2);
		if (!satellitePosition) continue;

		const label = createSpriteTextLabel(satellite.object_name, satellitePosition);
		labels.push(label)

		ids.push(noradId);
		positions.push(satellitePosition.x, satellitePosition.y, satellitePosition.z);
		satelliteMap[noradId] = satellite; // Store satellite details by ID
	}

	const colors = new Float32Array(positions.length).fill(1.0);
	geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
	geometry.setAttribute('id', new THREE.Int32BufferAttribute(ids, 1)); // Add custom 'id' attribute
	
	
	// geometry.rotateY(Math.PI)
	// const earthRotationAngle = handleTime(); // Get the current rotation angle
	// const rotationMatrix = new THREE.Matrix4().makeRotationY(-earthRotationAngle); // Negative to sync
	// geometry.applyMatrix4(rotationMatrix);

	const material = new THREE.PointsMaterial({ size: size });
	const points = new THREE.Points(geometry, material);

	return {
		points, 
		labels
	}
}

