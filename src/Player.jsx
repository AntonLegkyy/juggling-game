import React, { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

function Player() {
    const gltf = useLoader(GLTFLoader, 'models/player.glb');
    const { camera, size } = useThree();

    useLayoutEffect(() => {
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material.depthWrite = true;
                child.material.depthTest = true;
                child.renderOrder = 0;
                child.material.side = THREE.DoubleSide;
                child.material.opacity = 1;
                child.material.transparent = false;
            }
        });

        const fovRad = (camera.fov * Math.PI) / 180;
        const distance = camera.position.z - (-40);
        const visibleHeight = 2 * Math.tan(fovRad / 2) * distance;
        const visibleWidth = visibleHeight * (size.width / size.height);

        const box = new THREE.Box3().setFromObject(gltf.scene);
        const modelSize = box.getSize(new THREE.Vector3());
        const modelWidth = modelSize.x;
        const modelHeight = modelSize.y;

        const scaleX = visibleWidth / modelWidth;
        const scaleY = visibleHeight / modelHeight;
        const baseScale = Math.max(scaleX, scaleY) * 1.1;
        const scale = baseScale / 3;
        gltf.scene.scale.set(scale, scale, scale);

        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.set(-center.x * scale, -center.y * scale, -40);

        gltf.scene.rotation.set(0,0, 0);

        console.log('Player Scale:', scale);
        console.log('Player Position:', gltf.scene.position);
        console.log('Model Size:', modelSize);
    }, [gltf, camera, size]);

    return (
        <group position={[0, -15, -40]} rotation={[0, 0, 0]}>
            <ambientLight intensity={0.8} />
            <pointLight position={[0, 0, 10]} intensity={1} />
            <primitive object={gltf.scene} receiveShadow={false} castShadow={false} />
        </group>
    );
}

export default Player;