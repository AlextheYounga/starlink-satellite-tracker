import * as THREE from 'three';


export function createSatellitePoints() {
    const geometry = new THREE.BufferGeometry();
	const size = 0.003;
	const count = 7010;
    const positions = [];

    for (let i = 0; i < count; i++) {
		const phi = Math.acos(2 * Math.random() - 1);
		const theta = 2 * Math.PI * Math.random();
		const radius = 4.344; 

		const x = radius * Math.sin(phi) * Math.cos(theta);
		const y = radius * Math.sin(phi) * Math.sin(theta);
		const z = radius * Math.cos(phi);

		positions.push(x, y, z);
    }


	const colors = new Float32Array(count * 3).fill(1.0);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({size: size});
    const satellites = new THREE.Points(geometry, material);

    return satellites
}
