import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html} from "@react-three/drei";
import Stage from './Stage';
import Player from './Player';
import TrickScene from './TrickScene';

const Loader = () => {
    return (
        <Html center>
            <div
                style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    padding: '20px',
                    borderRadius: '10px',
                    color: 'white',
                    fontFamily: 'Arial',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        border: '8px solid #f3f3f3',
                        borderTop: '8px solid #e74c3c',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px',
                    }}
                />
                <progress value="0" max="100" style={{ width: '100px' }} />
                <p>Loading Models...</p>
                <style>
                    {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
                </style>
            </div>
        </Html>
    );
};

export default function App() {
    return (
        <Canvas
            camera={{ position: [0, 0, 20], fov: 50, near: 0.1, far: 1000 }}
            gl={{ antialias: true }}
            style={{
                cursor: 'none',
                width: '100vw',
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
            }}
        >
            <Stage />
            <Suspense fallback={<Loader />}>
                <Player />
                <TrickScene />
            </Suspense>
        </Canvas>
    );
}