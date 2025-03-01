import React, { useRef, useState, useEffect } from 'react'
import { RigidBody, Physics } from '@react-three/rapier'
import { useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

function Ball({ onHit, onHoldUpdate }) {
    const rigidBody = useRef()
    const [isHolding, setIsHolding] = useState(false)
    const holdTimer = useRef(null)
    const holdStartTime = useRef(0)
    const isHoldingRef = useRef(isHolding)

    useEffect(() => {
        isHoldingRef.current = isHolding
    }, [isHolding])

    const handleCollisionEnter = ({ other }) => {
        if (other.rigidBody.userData?.isLeg && !isHoldingRef.current) {
            setIsHolding(true)
            holdStartTime.current = Date.now()

            holdTimer.current = setInterval(() => {
                if (isHoldingRef.current) {
                    const holdDuration = (Date.now() - holdStartTime.current) / 1000
                    onHoldUpdate(holdDuration)
                } else {
                    clearInterval(holdTimer.current)
                    holdTimer.current = null
                }
            }, 100)
        }
    }

    const handleCollisionExit = ({ other }) => {
        if (other.rigidBody.userData?.isLeg) {
            // Если удержание не началось - считаем это ударом
            if (!isHoldingRef.current) {
                onHit()
            }

            setIsHolding(false)
            if (holdTimer.current) {
                clearInterval(holdTimer.current)
                holdTimer.current = null
            }
            onHoldUpdate(0)
        }
    }

    useEffect(() => {
        return () => {
            if (holdTimer.current) clearInterval(holdTimer.current)
        }
    }, [])

    return (
        <RigidBody
            ref={rigidBody}
            colliders="ball"
            restitution={0.8}
            mass={1}
            lockRotations
            lockTranslationsZ
            enabledTranslations={[true, true, false]}
            ccd={true}
            onCollisionEnter={handleCollisionEnter}
            onCollisionExit={handleCollisionExit}
            position={[0, 10, 0]}
        >
            <mesh>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshBasicMaterial color="yellow" />
            </mesh>
        </RigidBody>
    )
}

function Leg() {
    const rigidBody = useRef()
    const { camera } = useThree()
    const legRadius = 0.8
    const prevPos = useRef(new THREE.Vector3())

    const [movementBounds, setMovementBounds] = useState({ minY: -10, maxY: -7 })

    useEffect(() => {
        const cameraDistance = camera.position.z
        const fov = camera.fov * Math.PI / 180
        const visibleHeight = 2 * Math.tan(fov/2) * cameraDistance
        const fortyPercentHeight = visibleHeight * 0.65

        setMovementBounds({
            minY: -10,
            maxY: -10 + fortyPercentHeight
        })
    }, [camera])

    useFrame(({ mouse }) => {
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(mouse, camera)

        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
        const intersection = new THREE.Vector3()
        raycaster.ray.intersectPlane(plane, intersection)

        intersection.y = THREE.MathUtils.clamp(
            intersection.y,
            movementBounds.minY,
            movementBounds.maxY
        )

        const newPos = new THREE.Vector3().lerpVectors(
            prevPos.current,
            intersection,
            0.3
        )

        const velocity = new THREE.Vector3(
            (newPos.x - prevPos.current.x) * 45,
            (newPos.y - prevPos.current.y) * 45,
            0
        )

        rigidBody.current.setLinvel(velocity)
        rigidBody.current.setTranslation(new THREE.Vector3(newPos.x, newPos.y, 0))
        prevPos.current.copy(newPos)
    })

    return (
        <>
            <RigidBody
                ref={rigidBody}
                colliders="ball"
                type="kinematicVelocity"
                userData={{ isLeg: true }}
                restitution={0.1}
                args={[legRadius]}
                lockRotations
                lockTranslationsZ
                enabledTranslations={[true, true, false]}
                ccd={true}
            >
                <mesh>
                    <sphereGeometry args={[legRadius, 32, 32]} />
                    <meshBasicMaterial color="red" />
                </mesh>
            </RigidBody>

            <mesh position={[0, movementBounds.maxY, 0]}>
                <boxGeometry args={[40, 0.1, 1]} />
                <meshBasicMaterial color="red" transparent opacity={0.5} />
            </mesh>
        </>
    )
}

function Counter({ holds, hits, holding }) {
    return (
        <group position={[0, 8, -5]}>
            <Text
                fontSize={1.5}
                color="white"
                anchorX="center"
                anchorY="top"
                outlineColor="black"
                outlineWidth={0.1}
            >
                {`Holds: ${holds}`}
            </Text>
            <Text
                position={[0, -2, 0]}
                fontSize={1.2}
                color="orange"
                anchorX="center"
                anchorY="top"
            >
                {`Holding: ${holding > 0 ? holding.toFixed(1) : '0.0'}s`}
            </Text>
            <Text
                position={[0, -4, 0]}
                fontSize={1.2}
                color="cyan"
                anchorX="center"
                anchorY="top"
            >
                {`Hits: ${hits}`}
            </Text>
        </group>
    )
}

export default function Scene() {
    const [holdCount, setHoldCount] = useState(0)
    const [holdTime, setHoldTime] = useState(0)
    const [hitCount, setHitCount] = useState(0)
    const holdRegistered = useRef(false)

    useEffect(() => {
        if (holdTime > 0.5 && !holdRegistered.current) {
            setHoldCount(prev => prev + 1)
            holdRegistered.current = true
        }
        if (holdTime === 0) {
            holdRegistered.current = false
        }
    }, [holdTime])

    return (
        <>
            <Counter
                holds={holdCount}
                hits={hitCount}
                holding={holdTime}
            />

            <Physics gravity={[0, -25, 0]} solverIterations={30}>
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                <Ball
                    onHit={() => setHitCount(prev => prev + 1)}
                    onHoldUpdate={setHoldTime}
                />
                <Leg />

                <RigidBody
                    type="fixed"
                    position={[0, -10, 0]}
                    lockRotations
                    lockTranslationsZ
                >
                    <mesh>
                        <boxGeometry args={[40, 2, 1]} />
                        <meshBasicMaterial color="#009900" />
                    </mesh>
                </RigidBody>
            </Physics>
        </>
    )
}