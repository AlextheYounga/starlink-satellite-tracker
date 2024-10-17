import * as THREE from 'three';
import { twoline2satrec, propagate } from 'satellite.js';


function calculateTelemetry(satellite) {
	const tleLine1 = satellite.tle_line1
	const tleLine2 = satellite.tle_line2

	// Initialize a satellite record
	const satrec = twoline2satrec(tleLine1, tleLine2);
	return propagate(satrec, new Date());
}

export function calculateSatellitePosition(satellite) {
	// The x, y, z coordinates are swapped in the telemetry data
	const toThree = (v) => { return { x: v.x, y: v.z, z: -v.y } };
	const scaleFactor = 4 / 6371; // 0.000627; Scaling factor for my radius of Earth at 4 compared to true radius of Earth
	const telemetry = calculateTelemetry(satellite);
	
	if (!telemetry?.position) return false;
	// console.log('Error calculating telemetry for satellite', satellite.norad_cat_id)

	let { x, y, z } = toThree(telemetry.position);

	// Compute Cartesian coordinates in the orbital plane
	x *= scaleFactor;
	y *= scaleFactor;
	z *= scaleFactor;

	return { x, y, z }
}

export function createSatellitePoints(satellites) {
	const positions = [];
	const geometry = new THREE.BufferGeometry();
	const size = 0.005;

	for (const satellite of satellites) {
		const satellitePosition = calculateSatellitePosition(satellite);
		positions.push(
			satellitePosition.x,
			satellitePosition.y,
			satellitePosition.z
		);
	}

	const colors = new Float32Array(positions.length).fill(1.0);
	geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

	const material = new THREE.PointsMaterial({ size: size });
	const particles = new THREE.Points(geometry, material);

	return particles
}

