import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const StarsMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 }
    },
    vertexShader: `
    attribute float size;
    attribute float twinkleSpeed;
    attribute float twinkleOffset;
    varying float vTwinkle;
    uniform float time;
    
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
      
      // Calculate twinkling
      vTwinkle = sin(time * twinkleSpeed + twinkleOffset);
    }
  `,
    fragmentShader: `
    varying float vTwinkle;
    void main() {
      float a = smoothstep(0.5, 0.1, length(gl_PointCoord - 0.5));
      // Twinkle mapped from [-1, 1] to [0.3, 1]
      float alpha = a * (0.3 + 0.7 * (vTwinkle * 0.5 + 0.5));
      gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
    }
  `,
    transparent: true,
    depthWrite: false,
});

function TwinklingStars() {
    const count = 5000;
    const points = useRef<THREE.Points>(null);

    const [positions, sizes, speeds, offsets] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const siz = new Float32Array(count);
        const spd = new Float32Array(count);
        const off = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 2000;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 2000;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 2000;
            siz[i] = Math.random() * 2.5 + 0.5;
            spd[i] = Math.random() * 2.0 + 0.5; // twinkle speed
            off[i] = Math.random() * Math.PI * 2; // offset
        }
        return [pos, siz, spd, off];
    }, []);

    useFrame((state) => {
        if (points.current) {
            const mat = points.current.material as THREE.ShaderMaterial;
            mat.uniforms.time.value = state.clock.elapsedTime;
        }
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
                <bufferAttribute attach="attributes-twinkleSpeed" count={count} array={speeds} itemSize={1} />
                <bufferAttribute attach="attributes-twinkleOffset" count={count} array={offsets} itemSize={1} />
            </bufferGeometry>
            <primitive object={StarsMaterial} attach="material" />
        </points>
    );
}

function ShootingStar({ offsetDelay }: { offsetDelay: number }) {
    const ref = useRef<THREE.Mesh>(null);
    const startPos = useMemo(() => new THREE.Vector3((Math.random() - 0.5) * 1000, 500 + Math.random() * 300, -500), []);
    const velocity = useMemo(() => new THREE.Vector3(-300 - Math.random() * 200, -200 - Math.random() * 100, 0), []);

    useFrame((state) => {
        if (ref.current) {
            const t = (state.clock.elapsedTime + offsetDelay) % 4; // Reset every 4 seconds
            if (t < 0.5) {
                ref.current.position.copy(startPos).addScaledVector(velocity, t);
                ref.current.scale.setLength(1 + t * 10);
                ref.current.visible = true;
            } else {
                ref.current.visible = false;
            }
        }
    });

    return (
        <mesh ref={ref} position={[0, 0, -500]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
    );
}

function CameraRig() {
    useFrame((state) => {
        const mouseX = (state.pointer.x * 0.1);
        const mouseY = (state.pointer.y * 0.1);
        state.camera.position.x += (mouseX * 200 - state.camera.position.x) * 0.05;
        state.camera.position.y += (mouseY * 200 - state.camera.position.y) * 0.05;
        state.camera.lookAt(0, 0, -500);
    });
    return null;
}

export default function BackgroundScene({ theme }: { theme: 'Light' | 'Dark' | 'Night' }) {
    return (
        <>
            <div className="background-wrapper"></div>
            <div className="aurora-glow"></div>

            <div className="webgl-canvas-container">
                <Canvas camera={{ position: [0, 0, 800], fov: 60, near: 1, far: 5000 }}>
                    <TwinklingStars />
                    <ShootingStar offsetDelay={0} />
                    <ShootingStar offsetDelay={1.3} />
                    <ShootingStar offsetDelay={3.1} />
                    <CameraRig />
                </Canvas>
            </div>

            <div className="mountains-container">
                {/* Back Mountain Silhouette (Simplified SVG) */}
                <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="mountain-layer">
                    <path d="M0,400 L0,280 L80,230 L140,260 L200,200 L280,240 L340,170 L400,220 L460,150 L520,190 L580,130 L640,180 L700,100 L760,160 L820,80 L880,150 L940,120 L1000,170 L1060,140 L1120,190 L1180,160 L1240,210 L1300,180 L1360,230 L1440,200 L1440,400 Z"></path>
                </svg>
                {/* Front Mountain Silhouette */}
                <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="mountain-layer front">
                    <path d="M0,400 L0,320 L60,300 L120,330 L180,280 L240,310 L300,250 L360,290 L420,230 L480,270 L540,200 L600,250 L660,160 L720,130 L780,180 L840,220 L900,180 L960,240 L1020,210 L1080,260 L1140,230 L1200,270 L1260,250 L1320,290 L1380,270 L1440,300 L1440,400 Z"></path>
                </svg>
            </div>
        </>
    );
}
