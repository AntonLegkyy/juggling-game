import React, { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

function Stage() {
    const gltf = useLoader(GLTFLoader, 'models/stage.glb');
    const { camera, size } = useThree();

    useLayoutEffect(() => {
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.material.depthWrite = true;
                child.material.depthTest = true;
                child.renderOrder = 0;
                child.material.side = THREE.DoubleSide;
                console.log('Mesh:', child.name, 'Material:', child.material);
            }
        });

        const fovRad = (camera.fov * Math.PI) / 180;
        const distance = camera.position.z - (-70);
        const visibleHeight = 2 * Math.tan(fovRad / 2) * distance;
        const visibleWidth = visibleHeight * (size.width / size.height);

        // Вычисляем размеры модели
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const modelSize = box.getSize(new THREE.Vector3());
        const modelWidth = modelSize.x;
        const modelHeight = modelSize.y;

        const scaleX = visibleWidth / modelWidth;
        const scaleY = visibleHeight / modelHeight;
        const scale = Math.max(scaleX, scaleY) * 1.1;
        gltf.scene.scale.set(scale, scale, scale);

        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.set(-center.x * scale, -center.y * scale, -70);

        gltf.scene.rotation.set(0, -Math.PI / 2, 0);

        console.log('Model Size:', modelSize);
        console.log('Visible Area:', { width: visibleWidth, height: visibleHeight });
    }, [gltf, camera, size]);

    return (
        <group position={[0, 0, -120]} rotation={[0, 0, 0]}>
            <ambientLight intensity={0.8} />
            <pointLight position={[0, 0, 0]} intensity={1} />
            <primitive object={gltf.scene} receiveShadow={false} castShadow={false} />
        </group>
    );
}

export default Stage;