import React, { useRef, useEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function Rocket({ onComplete }) {
    const rocketRef = useRef();
    const clock = useRef(new THREE.Clock());
    const { camera } = useThree();
    const gltf = useLoader(GLTFLoader, 'models/rocket.glb');
    const startPosition = useRef(new THREE.Vector3());
    const endPosition = useRef(new THREE.Vector3());

    useEffect(() => {
        if (rocketRef.current) {
            const box = new THREE.Box3().setFromObject(rocketRef.current);
            const min = box.min;
            const max = box.max;
            const offsetX = (max.x - min.x) / 2;
            const offsetY = min.y;

            const vectorBottom = new THREE.Vector3(-1, -1, 0.5);
            vectorBottom.unproject(camera);
            const directionBottom = vectorBottom.sub(camera.position).normalize();
            const distanceBottom = -camera.position.z / directionBottom.z;
            const worldBottom = camera.position.clone().add(directionBottom.multiplyScalar(distanceBottom));

            const vectorTop = new THREE.Vector3(-1, 1, 0.5);
            vectorTop.unproject(camera);
            const directionTop = vectorTop.sub(camera.position).normalize();
            const distanceTop = -camera.position.z / directionTop.z;
            const worldTop = camera.position.clone().add(directionTop.multiplyScalar(distanceTop));

            startPosition.current.copy(worldBottom);
            startPosition.current.x += offsetX;
            startPosition.current.y -= offsetY;

            endPosition.current.copy(worldTop);
            endPosition.current.x += offsetX;

            rocketRef.current.position.copy(startPosition.current);
        }
    }, [camera, gltf]);

    useFrame(() => {
        const elapsedTime = clock.current.getElapsedTime();
        const duration = 1; // Длительность полета в секундах
        if (elapsedTime < duration) {
            const progress = elapsedTime / duration;
            const currentPosition = new THREE.Vector3().lerpVectors(startPosition.current, endPosition.current, progress);
            rocketRef.current.position.copy(currentPosition);
            rocketRef.current.rotation.y += 0.1; // Вращение вокруг оси Y
        } else {
            if (onComplete) onComplete();
        }
    });

    return (
        <primitive
            ref={rocketRef}
            object={gltf.scene}
            scale={0.3}
            rotation={[0, 0, 0]}
        />
    );
}

export default Rocket;