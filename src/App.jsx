import React from 'react';
import {Canvas} from '@react-three/fiber';
import TrickScene from './TrickScene';
import Stage from './Stage';
import Player from "./Player";
// import Scene from './TrickScene';

export default function App() {
    return (
        <Canvas
            camera={{
                position: [0, 0, 20],
                fov: 50,
                near: 0.1,
                far: 1000
            }}
            gl={{antialias: true}}
            style={{
                cursor: 'none',
                width: '100vw',
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0
            }}
        >
            <Stage/>
            <Player/>
            <TrickScene/>
        </Canvas>
    );
}