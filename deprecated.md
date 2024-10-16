# Deprecated

## Earth
Possibly giving up
```js
// Colors:
function createEarth(scene) {
	// Create the Earth geometry and material
	const paleBlueDot = new THREE.Group()
	const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
	const earthMaterial = new THREE.MeshPhongMaterial({ color: 0x11205B });
	const earthSphere = new THREE.Mesh(earthGeometry, earthMaterial);
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
```

Weird o1 preview version
```js
function createEarth() {
    // Create the Earth geometry and material
    const paleBlueDot = new THREE.Group();
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
    const earthSphere = new THREE.Mesh(earthGeometry, earthMaterial);
    paleBlueDot.add(earthSphere);

    fetch('/data/geojson.zip').then((response) => {
        loadAsync(response.blob()).then(zip => {
            Object.keys(zip.files).forEach(filename => {
                if (filename.endsWith('.json') && !filename.startsWith('__')) {
                    zip.files[filename].async('string').then(content => {
                        const jsonContent = JSON.parse(content);

                        jsonContent.features.forEach((feature) => {
                            const geometry = feature.geometry;
                            const type = geometry.type;
                            const coordinates = geometry.coordinates;

                            if (type === "Polygon" || type === "MultiPolygon") {
                                const polygons = (type === "Polygon") ? [coordinates] : coordinates;

                                polygons.forEach(polygon => {
                                    const shape = new THREE.Shape();
                                    const holes = [];

                                    polygon.forEach((ring, index) => {
                                        const points2D = ring.map(coord => {
                                            const [lon, lat] = coord;

                                            // Ensure valid longitude (-180 to 180) and latitude (-90 to 90)
                                            if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                                                console.warn(`Invalid coordinate: [${lon}, ${lat}]`);
                                                return null;  // Skip invalid points
                                            }

                                            // Use lon and lat as x and y for 2D projection
                                            return new THREE.Vector2(lon, lat);
                                        }).filter(point => point !== null);  // Filter out null points

                                        if (index === 0) {
                                            shape.setFromPoints(points2D);
                                        } else {
                                            const hole = new THREE.Path(points2D);
                                            holes.push(hole);
                                        }
                                    });

                                    shape.holes = holes;

                                    // Triangulate the shape
                                    const geometry2D = new THREE.ShapeGeometry(shape);
                                    const positions2D = geometry2D.attributes.position.array;

                                    // Map the 2D positions to 3D positions on the sphere
                                    const positions3D = new Float32Array(positions2D.length);

                                    for (let i = 0; i < positions2D.length; i += 3) {
                                        const lon = positions2D[i];
                                        const lat = positions2D[i + 1];

                                        const phi = (90 - lat) * (Math.PI / 180);  // Latitude to radians
                                        const theta = (lon + 180) * (Math.PI / 180);  // Longitude to radians

                                        const x = Math.sin(phi) * Math.cos(theta);
                                        const y = Math.cos(phi);
                                        const z = -Math.sin(phi) * Math.sin(theta);

                                        positions3D[i] = x;
                                        positions3D[i + 1] = y;
                                        positions3D[i + 2] = z;
                                    }

                                    // Create a new geometry with 3D positions
                                    const geometry3D = new THREE.BufferGeometry();
                                    geometry3D.setAttribute('position', new THREE.BufferAttribute(positions3D, 3));
                                    geometry3D.setIndex(geometry2D.getIndex());

                                    // Create a mesh with a basic material
                                    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
                                    const mesh = new THREE.Mesh(geometry3D, material);

                                    // Add the mesh to the group
                                    paleBlueDot.add(mesh);
                                });
                            }
                        });
                    });
                }
            });
        });
    });

    return paleBlueDot;
}
```

Working
```js
function drawGeoJsonTopology(scene) {
	fetch('/data/geojson.zip').then((response) => {
		loadAsync(response.blob()).then(zip => {
			Object.keys(zip.files).forEach(filename => {
				if (filename.endsWith('.json') && !filename.startsWith('__')) {
					zip.files[filename].async('string').then(content => {
						const jsonContent = JSON.parse(content);

						jsonContent.features.forEach((feature) => {
							const coordinates = unwrapArrayPairs(feature.geometry.coordinates);
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
							const material = new THREE.LineBasicMaterial({ color: 0x00ff00 }); // Green borders
							const line = new THREE.Line(geometry, material);

							// Add the line to the scene
							scene.add(line);
						});
					});
				}
			})
		})
	})
}

```

Nearly working
```js
function createEarth(earth) {
	// Create the Earth geometry and material
	const paleBlueDot = new THREE.Group()
	const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
	const earthMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
	const earthSphere = new THREE.Mesh(earthGeometry, earthMaterial);
	paleBlueDot.add(earthSphere)

	fetch('/data/geojson.zip').then((response) => {
		loadAsync(response.blob()).then(zip => {
			Object.keys(zip.files).forEach(filename => {
				if (filename.endsWith('.json') && !filename.startsWith('__')) {
					zip.files[filename].async('string').then(content => {
						const jsonContent = JSON.parse(content);

						jsonContent.features.forEach((feature) => {
							const shape = new THREE.Shape();
							const coordinates = flatMapCoordinates(feature.geometry.coordinates);

							// Create the shape
							for (let i = 0; i < coordinates.length; i++) {
								const [lon, lat] = coordinates[i];
								if (i === 0) {
									shape.moveTo(lon, lat);
								} else {
									shape.lineTo(lon, lat);
								}
							}

							const geometry = new THREE.ShapeGeometry(shape);
							const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
							geometry.computeBoundingBox();

							// Function to map 2D vertices to the sphere's surface
							geometry.attributes.position.array.forEach((_, idx) => {
								const x = geometry.attributes.position.getX(idx);
								const y = geometry.attributes.position.getY(idx);

								// Convert (x, y) to spherical coordinates (theta, phi)
								const phi = (90 - y) * (Math.PI / 180);  // Latitude to radians
								const theta = (x + 180) * (Math.PI / 180);  // Longitude to radians

								// Compute the new 3D coordinates on the sphere's surface
								const newX = Math.sin(phi) * Math.cos(theta);
								const newY = Math.cos(phi);
								const newZ = -Math.sin(phi) * Math.sin(theta);

								// Update the vertex position to match the sphere's surface
								geometry.attributes.position.setXYZ(idx, newX, newY, newZ);
							});

							geometry.attributes.position.needsUpdate = true;
							geometry.computeVertexNormals(); // Recompute normals
							const mesh = new THREE.Mesh(geometry, material);

							// Add the shapes to the scene
							paleBlueDot.add(mesh);
						});
					});
				}
			})
		})
	})

	return paleBlueDot
}
```

More attempts with shapez
```js
function drawBorders(earth) {
	fetch('/data/geojson.zip').then((response) => {
		loadAsync(response.blob()).then(zip => {
			Object.keys(zip.files).forEach(filename => {
				if (filename.endsWith('.json') && !filename.startsWith('__')) {
					zip.files[filename].async('string').then(content => {
						const jsonContent = JSON.parse(content);

						jsonContent.features.forEach((feature) => {
							const shape = new THREE.Shape();
							const coordinates = flatMapCoordinates(feature.geometry.coordinates);

							// Create the shape
							for (let i = 0; i < coordinates.length; i++) {
								const [lon, lat] = coordinates[i];
								if (i === 0) {
									shape.moveTo(lon, lat);
								} else {
									shape.lineTo(lon, lat);
								}
							}

							const geometry = new THREE.ShapeGeometry(shape);
							const material = new THREE.MeshBasicMaterial({ color: 0x800000 });

							// Function to map 2D vertices to the sphere's surface
							geometry.attributes.position.array.forEach((_, idx) => {
								const x = geometry.attributes.position.getX(idx);
								const y = geometry.attributes.position.getY(idx);

								// Convert (x, y) to spherical coordinates (theta, phi)
								const theta = (x / geometry.boundingBox.max.x) * Math.PI; // longitude
								const phi = (y / geometry.boundingBox.max.y) * Math.PI;   // latitude

								// Compute the new 3D coordinates on the sphere's surface
								const newX = 1 * Math.sin(phi) * Math.cos(theta);
								const newY = 1 * Math.cos(phi);
								const newZ = 1 * Math.sin(phi) * Math.sin(theta);

								// Update the vertex position to match the sphere's surface
								geometry.attributes.position.setXYZ(idx, newX, newY, newZ);
							});

							geometry.attributes.position.needsUpdate = true;
							geometry.computeVertexNormals(); // Recompute normals
							const mesh = new THREE.Mesh(geometry, material);
							
							// Add the shapes to the scene
							earth.add(mesh);
						});
					});
				}
			})
		})
	})
}
```

```js
const shape = new THREE.Shape();  // Create a new shape for each feature
const coordinates = unwrapArrayPairs(feature.geometry.coordinates)
// Convert GeoJSON coordinates to 3D points on the sphere's surface
coordinates.forEach(([lon, lat], index) => {
	const phi = (90 - lat) * (Math.PI / 180);  // Latitude to radians
	const theta = (lon + 180) * (Math.PI / 180);  // Longitude to radians

	const x = Math.sin(phi) * Math.cos(theta);
	const y = Math.cos(phi);
	const z = -Math.sin(phi) * Math.sin(theta);

	if (index === 0) {
		shape.moveTo(x, z);  // Start the shape at the first point
	} else {
		shape.lineTo(x, z);  // Draw lines between subsequent points
	}
});

// Create the 3D geometry from the shape
const extrudeSettings = {
	depth: 0.3,   // Slight extrusion for visibility
	bevelEnabled: false
};
const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

// Create a material for the polygons
const material = new THREE.MeshPhongMaterial({
	color: 0x228B22,  // Forest green for land
	side: THREE.DoubleSide,  // Render both sides to avoid issues
	flatShading: true
});

// Create a mesh and add it to the scene
const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);
```

```js

const vertices = [];  // Store the 3D vertices for the polygon
const coordinates = unwrapArrayPairs(feature.geometry.coordinates)

coordinates.forEach(([lon, lat]) => {
	const phi = (90 - lat) * (Math.PI / 180);  // Latitude to radians
	const theta = (lon + 180) * (Math.PI / 180);  // Longitude to radians

	// Convert lat/lon to 3D coordinates on the sphere surface
	const x = Math.sin(phi) * Math.cos(theta);
	const y = Math.cos(phi);
	const z = -Math.sin(phi) * Math.sin(theta);

	vertices.push(x, y, z);
});

// Create geometry from the vertices
const geometry = new THREE.BufferGeometry();
const verticesArray = new Float32Array(vertices);
geometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));

// Compute the normal vectors to ensure correct lighting
geometry.computeVertexNormals();

// Create a material for the filled polygon
const material = new THREE.MeshPhongMaterial({
	color: 0x228B22,  // Forest green for land areas
	side: THREE.DoubleSide,  // Render both sides to avoid issues
	flatShading: true
});

// Create a mesh and add it to the scene
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

```js
const shape = new THREE.Shape();
const coordinates = unwrapArrayPairs(feature.geometry.coordinates)
const points = coordinates.map(([lon, lat], index) => {


	const phi = (90 - lat) * (Math.PI / 180);  // Latitude to radians
	const theta = (lon + 180) * (Math.PI / 180);  // Longitude to radians

	const x = Math.sin(phi) * Math.cos(theta);
	const y = Math.cos(phi);
	const z = -Math.sin(phi) * Math.sin(theta);

	if (index === 0) {
		shape.moveTo(x, z);  // Start the shape
	} else {
		shape.lineTo(x, z);  // Draw lines to create the shape
	}

	return new THREE.Vector3(x, y, z);  // Valid Vector3 point
}).filter(point => point !== null);  // Filter out null points

// Create a Three.js line from the points
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const material = new THREE.LineBasicMaterial({ color: 0x00ff00 }); // Green borders
const line = new THREE.Line(geometry, material);

// Add the line to the scene
scene.add(line);
```

```js
const vertices = [];  // Store the 3D vertices
const positionArray = [];  // Store flat array for BufferGeometry
const holes = [];  // Track holes for polygons, if any

const coordinates = unwrapArrayPairs(feature.geometry.coordinates)

// Loop through the coordinates of the GeoJSON feature
coordinates.forEach((ring, i) => {
	if (i > 0) holes.push(vertices.length / 3);  // Track where the holes start

	ring.forEach(([lon, lat]) => {
		// Convert lat/lon to spherical coordinates on the sphere surface
		const phi = (90 - lat) * (Math.PI / 180);  // Latitude to radians
		const theta = (lon + 180) * (Math.PI / 180);  // Longitude to radians

		const x = Math.sin(phi) * Math.cos(theta);
		const y = Math.cos(phi);
		const z = -Math.sin(phi) * Math.sin(theta);

		vertices.push(new THREE.Vector3(x, y, z));  // Store Vector3
		positionArray.push(x, y, z);  // Store flat for BufferGeometry
	});
});

// Use Earcut to triangulate the polygon for rendering
const indices = earcut(positionArray, holes, 3);

// Create BufferGeometry and set attributes
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3));
geometry.setIndex(indices);  // Set triangulated indices
geometry.computeVertexNormals();  // Ensure correct lighting

// Create a material for the mesh
const material = new THREE.MeshPhongMaterial({
	color: 0x228B22,  // Forest green for land
	side: THREE.DoubleSide,  // Render both sides to avoid issues
	flatShading: true,  // Optional: Use flat shading for distinct look
});

// Create a mesh from the geometry and material
const mesh = new THREE.Mesh(geometry, material);

// Slightly push the shape outward to avoid z-fighting with the sphere
mesh.position.multiplyScalar(1.01);  // Push outward slightly

// Add the mesh to the scene
scene.add(mesh);
```

## Satellites 
First attempt; doesn't seem complex enough

```js
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
```