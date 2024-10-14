
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export async function createStarlinkSatellite(scene) {
    const loader = new GLTFLoader();
    const x = 2.7
    const y = 2.7
    const z = 2.7

    return loader.load('./gltf/starlink_spacex_satellite/scene.gltf', function (starlink) {
        starlink.scene.name = 'starlink'
        starlink.scene.scale.set(0.01, 0.01, 0.01)
        starlink.scene.position.set(x, y, z);
		starlink.scene.lookAt(0, 0, 0)
		starlink.scene.rotateX(Math.PI / 2)
		starlink.scene.rotateY(Math.PI / 2)
		starlink.scene.rotateZ(Math.PI)

		scene.add(starlink.scene)
    }, undefined, function (error) {
        console.error(error);
    });
}