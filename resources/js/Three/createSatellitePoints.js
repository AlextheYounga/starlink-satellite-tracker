import * as THREE from 'three';

// Kepler's Equation Solver (Newton-Raphson method)
function solveKepler(meanAnomaly, eccentricity, tolerance = 1e-6) {
	let E = meanAnomaly; // Initial guess for Eccentric Anomaly
	let delta;
	do {
		delta = E - eccentricity * Math.sin(E) - meanAnomaly;
		E -= delta / (1 - eccentricity * Math.cos(E)); // Newton-Raphson step
	} while (Math.abs(delta) > tolerance);
	return E;
}

// Convert mean anomaly to true anomaly
export function meanAnomalyToTrueAnomaly(meanAnomaly, eccentricity) {
	const E = solveKepler(meanAnomaly, eccentricity); // Solve for Eccentric Anomaly
	const trueAnomaly = 2 * Math.atan2(
		Math.sqrt(1 + eccentricity) * Math.sin(E / 2),
		Math.sqrt(1 - eccentricity) * Math.cos(E / 2)
	);
	return trueAnomaly;
}

export function createSatellitePoints(satellites) {
	const positions = [];
	const geometry = new THREE.BufferGeometry();
	const size = 0.003;
	const scaleFactor = 4 / 6371; // 0.000627; Scaling factor for my radius of Earth at 4 compared to true radius of Earth

	for (const satellite of satellites) {
		const semiMajorAxis = satellite.semimajor_axis * scaleFactor; // 4.09 units
		const eccentricity = satellite.eccentricity; // Nearly circular (no scaling needed)
		const inclination = THREE.MathUtils.degToRad(satellite.inclination); // Inclination in radians
		const raan = THREE.MathUtils.degToRad(satellite.ra_of_asc_node); // RAAN in radians
		const argOfPericenter = THREE.MathUtils.degToRad(satellite.arg_of_pericenter); // Argument of perigee
		const meanAnomaly = THREE.MathUtils.degToRad(satellite.mean_anomaly); // Mean anomaly from dataset
		const trueAnomaly = meanAnomalyToTrueAnomaly(meanAnomaly, eccentricity);
		const radius = semiMajorAxis * (1 - eccentricity ** 2) / (1 + eccentricity * Math.cos(trueAnomaly));

		// Compute Cartesian coordinates in the orbital plane
		const x = radius * Math.cos(trueAnomaly);
		const y = radius * Math.sin(trueAnomaly);
		const z = 0; // In the orbital plane
		const satellitePosition = new THREE.Vector3(x, y, z);

		// Apply orbital transformations: Inclination, RAAN, Perigee Argument
		satellitePosition.applyAxisAngle(new THREE.Vector3(1, 0, 0), inclination); // Tilt by inclination
		satellitePosition.applyAxisAngle(new THREE.Vector3(0, 0, 1), raan); // Rotate by RAAN
		satellitePosition.applyAxisAngle(new THREE.Vector3(0, 1, 0), argOfPericenter); // Rotate by argument of perigee
		// console.log(satellitePosition);
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
