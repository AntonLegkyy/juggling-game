import React, { useRef, useState } from 'react';
import { RigidBody, Physics } from '@react-three/rapier';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useLoader } from '@react-three/fiber';
import Rocket from './Rocket';

function Ball({ onBallLand, setBallPos, ballRigidBody }) {
    const gltf = useLoader(GLTFLoader, 'models/ball.glb');

    useFrame(() => {
        if (ballRigidBody.current) {
            const currentPos = ballRigidBody.current.translation();
            currentPos.z = 0;
            ballRigidBody.current.setTranslation(currentPos, true);
            const vel = ballRigidBody.current.linvel();
            vel.z = 0;
            ballRigidBody.current.setLinvel(vel, true);
            setBallPos(currentPos);
        }
    });

    const handleCollisionEnter = ({ other }) => {
        if (other.rigidBody.userData?.isGround) {
            console.log('Ball hit the ground');
            onBallLand();
        }
    };

    return (
        <RigidBody
            ref={ballRigidBody}
            colliders="ball"
            restitution={0.5}
            mass={1}
            lockTranslationsZ
            enabledTranslations={[true, true, false]}
            ccd={true}
            onCollisionEnter={handleCollisionEnter}
            position={[0, 10, 0]}
        >
            <primitive object={gltf.scene} scale={2} />
        </RigidBody>
    );
}

function Leg({ onCircleComplete, ballPos, ballRigidBody, onHit }) {
    const rigidBody = useRef();
    const { camera } = useThree();
    const gltf = useLoader(GLTFLoader, 'models/boots.glb');
    const prevAngle = useRef(null);
    const totalAngle = useRef(0);
    const lastHitTime = useRef(0);
    const isColliding = useRef(false);
    const isHitBeforeCircle = useRef(false);
    const isCircleInProgress = useRef(false);

    const handleCollisionEnter = ({ other }) => {
        if (other.rigidBody === ballRigidBody.current && !isColliding.current) {
            isColliding.current = true;
            const currentTime = performance.now();
            if ((currentTime - lastHitTime.current) >= 300) {
                setTimeout(() => {
                    const ballVel = ballRigidBody.current.linvel();
                    if (ballVel.y > 0) {
                        if (!isCircleInProgress.current) {
                            isHitBeforeCircle.current = true;
                            isCircleInProgress.current = true;
                            totalAngle.current = 0;
                            prevAngle.current = null;
                            console.log('Trick started: first hit');
                        } else if (isCircleInProgress.current && Math.abs(totalAngle.current) >= (320 * Math.PI / 180)) {
                            onCircleComplete();
                            isCircleInProgress.current = false;
                            isHitBeforeCircle.current = false;
                            console.log('Trick completed: second hit after rotation');
                        }
                        onHit();
                        lastHitTime.current = currentTime;
                    }
                }, 50);
            }
        }
    };

    const handleCollisionExit = ({ other }) => {
        if (other.rigidBody === ballRigidBody.current) {
            isColliding.current = false;
        }
    };

    useFrame(({ mouse }) => {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const intersection = new THREE.Vector3();

        if (raycaster.ray.intersectPlane(plane, intersection)) {
            intersection.z = 0;
            rigidBody.current.setNextKinematicTranslation(intersection);

            if (ballPos && ballRigidBody.current && ballPos.y > -7 && isHitBeforeCircle.current) {
                const legPos = rigidBody.current.translation();
                const vec = new THREE.Vector3().subVectors(legPos, ballPos);
                const angle = Math.atan2(vec.y, vec.x);

                if (prevAngle.current !== null) {
                    let deltaAngle = angle - prevAngle.current;

                    if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
                    if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

                    totalAngle.current += deltaAngle;

                    if (Math.abs(totalAngle.current) >= (320 * Math.PI / 180)) {
                        console.log('Rotation of 320 degrees completed, awaiting second hit');
                    }
                }
                prevAngle.current = angle;
            } else {
                prevAngle.current = null;
                totalAngle.current = 0;
            }
        }
    });

    return (
        <RigidBody
            ref={rigidBody}
            colliders="hull"
            type="kinematicPosition"
            restitution={0.1}
            lockRotations
            enabledTranslations={[true, true, false]}
            ccd={true}
            onCollisionEnter={handleCollisionEnter}
            onCollisionExit={handleCollisionExit}
        >
            <primitive position={[0, 0, -1]} object={gltf.scene} scale={10} />
        </RigidBody>
    );
}

function TrickCounter({ tricks, hits }) {
    return (
        <>
            <group position={[-20, 11, -5]}>
                <Text
                    fontSize={1}
                    color="gold"
                    anchorX="left"
                    anchorY="top"
                    outlineColor="black"
                    outlineWidth={0.1}
                >
                    {`Tricks: ${tricks} Hits: ${hits} `}
                </Text>
            </group>
        </>
    );
}

export default function Scene() {
    const [tricksCount, setTricksCount] = useState(0);
    const [hitsCount, setHitsCount] = useState(0);
    const [ballPos, setBallPos] = useState(new THREE.Vector3());
    const ballRigidBody = useRef();
    const [rocketActive, setRocketActive] = useState(false);

    const handleCircleComplete = () => {
        setTricksCount(prev => prev + 1);
        console.log('Trick completed: circle performed');
        setRocketActive(true);
    };

    const handleHit = () => {
        setHitsCount(prev => prev + 1);
        console.log('Hit registered');
    };

    const onBallLand = () => {
        console.log('Ball touched the ground');
    };

    const onRocketComplete = () => {
        setRocketActive(false);
    };

    return (
        <>
            <TrickCounter tricks={tricksCount} hits={hitsCount}/>
            {rocketActive && (
                <Rocket onComplete={onRocketComplete} />
            )}
            <Physics gravity={[0, -25, 0]} solverIterations={30}>
                <ambientLight intensity={0.8}/>
                <pointLight position={[10, 10, 10]} intensity={1}/>
                <Ball
                    onBallLand={onBallLand}
                    setBallPos={setBallPos}
                    ballRigidBody={ballRigidBody}
                />
                <Leg
                    onCircleComplete={handleCircleComplete}
                    ballPos={ballPos}
                    ballRigidBody={ballRigidBody}
                    onHit={handleHit}
                />
                <RigidBody
                    type="fixed"
                    position={[0, -10, 0]}
                    lockRotations
                    lockTranslationsZ
                    userData={{isGround: true}}
                >
                    <mesh>
                        <boxGeometry args={[40, 3, 1]}/>
                        <meshBasicMaterial color="black"/>
                    </mesh>
                </RigidBody>
                <RigidBody
                    type="fixed"
                    position={[-20, 0, 0]}
                    lockRotations
                    lockTranslationsZ
                >
                    <mesh>
                        <boxGeometry args={[9, 20, 1]}/>
                        <meshBasicMaterial color="transparent" opacity={0} transparent/>
                    </mesh>
                </RigidBody>
                <RigidBody
                    type="fixed"
                    position={[20, 0, 0]}
                    lockRotations
                    lockTranslationsZ
                >
                    <mesh>
                        <boxGeometry args={[9, 20, 1]}/>
                        <meshBasicMaterial color="transparent" opacity={0} transparent/>
                    </mesh>
                </RigidBody>
            </Physics>
        </>
    );
}