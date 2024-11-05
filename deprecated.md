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

## Satellite Details
Render satellite details when close enough

```js
// Function to create and show text
function createTextElement(satellite) {
	const div = document.createElement('div');
	div.style.position = 'absolute';
	div.style.padding = '8px';
	div.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
	div.style.color = 'white';
	div.style.borderRadius = '4px';
	div.innerHTML = satellite.object_name;
	document.body.appendChild(div);
	return div;
}

// Helper function to compute the distance between two 3D vectors
function distanceTo(pointA, pointB) {
    return pointA.distanceTo(pointB); // Euclidean distance calculation
}

async function renderSatelliteDetails(earthScene, satelliteId, satellitePosition) {
	const { x, y, z } = satellitePosition;
	const pointPosition = new THREE.Vector3(x, y, z);

	// Compute the distance between the camera and the current point
	const distance = distanceTo(earthScene.camera.position, pointPosition);
	const labelElement = satelliteDetails[satelliteId];
	// Check if the distance is less than or equal to 0.2
	if (distance <= 0.45) {
		// Project the 3D point position to 2D screen space
		const screenPosition = pointPosition.clone().project(earthScene.camera);
		const screenX = (screenPosition.x + 1) / 2 * window.innerWidth;
		const screenY = (-screenPosition.y + 1) / 2 * window.innerHeight;

		// Position the label on the screen
		const labelElement = satelliteDetails[satelliteId];
		labelElement.style.left = `${screenX}px`;
		labelElement.style.top = `${screenY}px`;

		// Hide label if the point is not in front of the camera
		labelElement.style.display = 'block';
	} else {
		labelElement.style.display = 'none';
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

		renderSatelliteDetails(earthScene, noradId, satellitePosition);
	}

	earthScene.satellitePoints.geometry.attributes.position.needsUpdate = true; // Notify Three.js of the update
}
```

```js
// Create a canvas texture with text
function createTextTexture() {
	const index = appliedLabels.length; // Use the current length as the index
	const satellite = Object.values(satelliteMap)[index]; 
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');

	// Set canvas size (adjust as needed)
	canvas.width = 256;
	canvas.height = 64;

	// Style the text
	context.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Background
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.font = '24px Arial';
	context.fillStyle = 'white'; // Text color
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillText(satellite.object_name, canvas.width / 2, canvas.height / 2);

	// Create a texture from the canvas
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}
```

```js
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
```

```js
async function renderSatelliteDetails(ids, earthScene) {
	const positions = earthScene.satellitePoints.geometry.attributes.position.array;
	for (let i = 0; i < ids.length; i++) {
		const noradId = ids[i];
		const label = labels[noradId];
		label.style.display = 'block';
		const vector = new THREE.Vector3(
			positions[i * 3],
			positions[i * 3 + 1],
			positions[i * 3 + 2],
		);
		
		// Set the label position
		const width = window.innerWidth;
		const height = window.innerHeight;
		const widthHalf = width / 2;
		const heightHalf = height / 2;
		const vector2D = vector.project(earthScene.camera);
		const x = (vector2D.x * widthHalf) + widthHalf;
		const y = -(vector2D.y * heightHalf) + heightHalf;
		label.style.right = `${x}px`;
		label.style.top = `${y}px`;
		// Set label position to match 3D point's projection on the 2D screen
        labels.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        labels.style.display = vector.z < 1 ? 'block' : 'none'; // Hide label if behind the camera
	}
}
```

### More Label Attempts
```
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

// Method 1: Using Sprite Materials with Canvas
function createSpriteText(text, position) {
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
    sprite.position.copy(position);
    
    // Set to desired small size (0.1 width)
    sprite.scale.set(0.1, 0.1, 1);
    
    return sprite;
}

// Example usage
const sprite = createSpriteText("Label", new THREE.Vector3(0, 0, 0));
scene.add(sprite);

// Method 2: Using TextGeometry (3D Text)
// async function create3DText(text, position) {
//     const loader = new FontLoader();
    
//     // Load font (you'll need to provide the actual font path)
//     const font = await loader.loadAsync('/path/to/helvetiker_regular.typeface.json');
    
//     const geometry = new TextGeometry(text, {
//         font: font,
//         size: 0.5,
//         height: 0.1,
//         curveSegments: 12,
//         bevelEnabled: false
//     });
    
//     const material = new THREE.MeshStandardMaterial({
//         color: 0xffffff
//     });
    
//     const textMesh = new THREE.Mesh(geometry, material);
//     textMesh.position.copy(position);
    
//     // Center the text
//     geometry.computeBoundingBox();
//     const centerOffset = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
//     textMesh.position.x += centerOffset;
    
//     return textMesh;
// }

// Method 3: Using Texture-mapped Plane
// function createPlaneText(text, position) {
//     // Create canvas
//     const canvas = document.createElement('canvas');
//     const context = canvas.getContext('2d');
//     canvas.width = 256;
//     canvas.height = 256;
    
//     // Style and draw text
//     context.fillStyle = 'rgba(0, 0, 0, 0)';
//     context.fillRect(0, 0, canvas.width, canvas.height);
//     context.font = 'Bold 40px Arial';
//     context.fillStyle = 'white';
//     context.textAlign = 'center';
//     context.textBaseline = 'middle';
//     context.fillText(text, canvas.width/2, canvas.height/2);
    
//     // Create texture
//     const texture = new THREE.CanvasTexture(canvas);
//     texture.minFilter = THREE.LinearFilter;
//     texture.wrapS = THREE.ClampToEdgeWrapping;
//     texture.wrapT = THREE.ClampToEdgeWrapping;
    
//     // Create plane
//     const geometry = new THREE.PlaneGeometry(1, 1);
//     const material = new THREE.MeshBasicMaterial({
//         map: texture,
//         transparent: true,
//         side: THREE.DoubleSide
//     });
    
//     const mesh = new THREE.Mesh(geometry, material);
//     mesh.position.copy(position);
    
//     return mesh;
// }

// // Example usage with Points Geometry
// function createTextPoints(scene) {
//     // Create points geometry
//     const positions = new Float32Array([
//         1, 1, 1,
//         -1, -1, -1,
//         2, -2, 0,
//         -2, 2, 0
//     ]);
    
//     const geometry = new THREE.BufferGeometry();
//     geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
//     // Create points
//     const pointsMaterial = new THREE.PointsMaterial({ size: 0.1, color: 0xffffff });
//     const points = new THREE.Points(geometry, pointsMaterial);
//     scene.add(points);
    
//     // Add text labels using your preferred method
//     const positions3D = [];
//     for (let i = 0; i < positions.length; i += 3) {
//         positions3D.push(new THREE.Vector3(
//             positions[i],
//             positions[i + 1],
//             positions[i + 2]
//         ));
//     }
    
//     // Example using sprite method
//     positions3D.forEach((pos, i) => {
//         const label = createSpriteText(`Point ${i}`, pos);
//         scene.add(label);
//     });
    
//     return { points, positions3D };
// }

// // Example of updating text positions
// function updateTextPositions(textObjects, newPositions) {
//     textObjects.forEach((text, i) => {
//         if (newPositions[i]) {
//             text.position.copy(newPositions[i]);
//         }
//     });
// }

// // Billboard effect for sprites/planes (always face camera)
// function updateBillboards(textObjects, camera) {
//     textObjects.forEach(text => {
//         text.lookAt(camera.position);
//     });
// }
```