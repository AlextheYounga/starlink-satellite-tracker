import * as THREE from 'three';
import { twoline2satrec, propagate } from 'satellite.js';


function calculateTelemetry(satellite) {
	const tleLine1 = satellite.tle_line1
	const tleLine2 = satellite.tle_line2

	// Initialize a satellite record
	const satrec = twoline2satrec(tleLine1, tleLine2);
	return propagate(satrec, new Date());
}

const toThree = (v) => {
	// The x, y, z coordinates are swapped in the telemetry data
    return { x: v.x, y: v.z, z: -v.y };
}

// TODO: Add velocity to the satellite points

export function createSatellitePoints(satellites) {
	const positions = [];
	const geometry = new THREE.BufferGeometry();
	const size = 0.005;
	const scaleFactor = 4 / 6371; // 0.000627; Scaling factor for my radius of Earth at 4 compared to true radius of Earth

	for (const satellite of satellites) {
		const telemetry = calculateTelemetry(satellite);
		if (!telemetry?.position) {
			console.log('Error calculating telemetry for satellite', satellite.norad_cat_id)
			continue;
		} 

		let { x, y, z} = toThree(telemetry.position);

		// Compute Cartesian coordinates in the orbital plane
		x *= scaleFactor;
		y *= scaleFactor;
		z *= scaleFactor;

		const satellitePosition = new THREE.Vector3(x, y, z);

		positions.push(
			satellitePosition.x,
			satellitePosition.y,
			satellitePosition.z
		);
	}

	const colors = new Float32Array(satellites.length * 3).fill(1.0);
	geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

	const material = new THREE.PointsMaterial({ size: size });
	const satellitePoints = new THREE.Points(geometry, material);
	return satellitePoints
}

