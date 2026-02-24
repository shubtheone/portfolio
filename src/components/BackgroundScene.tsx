import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import './BackgroundScene.css';

// ─── Mouse tracker (shared across components) ──────────────────────────────
const mousePos = { x: 0, y: 0 };
if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', (e) => {
        mousePos.x = (e.clientX / window.innerWidth - 0.5) * 2;  // -1 to 1
        mousePos.y = (e.clientY / window.innerHeight - 0.5) * 2;  // -1 to 1
    });
}

// ─── Camera Rig — follows mouse for parallax ────────────────────────────────
const CameraRig = () => {
    const { camera } = useThree();

    useEffect(() => {
        camera.position.set(0, 0, 1);
    }, [camera]);

    useFrame(() => {
        // Smooth follow — camera gently drifts toward mouse position
        camera.position.x += (mousePos.x * 0.15 - camera.position.x) * 0.03;
        camera.position.y += (-mousePos.y * 0.08 - camera.position.y) * 0.03;
    });

    return null;
};

// ─── Stars scattered across a flat sky dome ─────────────────────────────────
const StarField = () => {
    const count = 2500;

    // Stars are placed on a flat plane at z=0, spread wide
    // Various brightness via the phase attribute
    const { positions, phases } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const ph = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            // Very wide spread, strictly zero depth (Z=0)
            pos[i * 3] = (Math.random() - 0.5) * 80;  // Increased X spread
            pos[i * 3 + 1] = (Math.random() - 0.5) * 20;  // Full Y spread
            pos[i * 3 + 2] = 0;
            ph[i] = Math.random();
        }
        return { positions: pos, phases: ph };
    }, []);

    // Custom shader: per-star size variation + independent twinkle
    const shaderMat = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
            },
            vertexShader: `
        attribute float phase;
        varying float vAlpha;
        uniform float uTime;
        void main() {
          // Independent twinkle per star
          float twinkle = 0.4 + 0.6 * (0.5 + 0.5 * sin(uTime * (1.0 + phase * 2.0) + phase * 50.0));
          vAlpha = twinkle;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Size varies: most stars are tiny, a few are big (like the reference photo)
          float baseSize = phase < 0.85 ? 1.0 + phase * 1.5 : 3.0 + (phase - 0.85) * 15.0;
          gl_PointSize = baseSize;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
            fragmentShader: `
        varying float vAlpha;
        void main() {
          // Soft circle
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float softness = smoothstep(0.5, 0.05, d);
          gl_FragColor = vec4(0.85, 0.93, 1.0, vAlpha * softness);
        }
      `,
            transparent: true,
            depthWrite: false,
        });
    }, []);

    useFrame(({ clock }) => {
        shaderMat.uniforms.uTime.value = clock.getElapsedTime();
    });

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-phase" args={[phases, 1]} />
            </bufferGeometry>
            <primitive object={shaderMat} attach="material" />
        </points>
    );
};

// ─── Shooting Stars ─────────────────────────────────────────────────────────
const ShootingStars = () => {
    const count = 3;
    const refs = useRef<(THREE.Mesh | null)[]>([]);
    const trailRefs = useRef<(THREE.Mesh | null)[]>([]);

    const timings = useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            period: 5 + i * 3,     // More frequent
            offset: i * 2,
            startX: -10 + i * 6,   // Wider start range
            startY: 8 + i * 3,
            speedX: 0.6 + i * 0.1,
            speedY: -(0.2 + i * 0.05),
        }));
    }, []);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        timings.forEach((timing, i) => {
            const mesh = refs.current[i];
            const trail = trailRefs.current[i];
            if (!mesh || !trail) return;
            const phase = ((t + timing.offset) % timing.period) / timing.period;
            if (phase < 0.15) {
                const progress = phase / 0.15;
                mesh.visible = true;
                trail.visible = true;
                // Move across the screen
                const x = timing.startX + progress * timing.speedX * 30;
                const y = timing.startY + progress * timing.speedY * 30;
                mesh.position.set(x, y, 0);
                trail.position.set(x - 0.4, y + 0.15, 0);
                trail.rotation.z = Math.atan2(timing.speedY, timing.speedX);
                const fade = progress < 0.7 ? 1 : (1 - progress) / 0.3;
                (mesh.material as THREE.MeshBasicMaterial).opacity = fade * 0.9;
                (trail.material as THREE.MeshBasicMaterial).opacity = fade * 0.6;
            } else {
                mesh.visible = false;
                trail.visible = false;
            }
        });
    });

    return (
        <>
            {timings.map((_, i) => (
                <group key={i}>
                    <mesh ref={el => { refs.current[i] = el; }} visible={false}>
                        <circleGeometry args={[0.08, 12]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={1} />
                    </mesh>
                    <mesh ref={el => { trailRefs.current[i] = el; }} visible={false}>
                        <planeGeometry args={[1.5, 0.03]} />
                        <meshBasicMaterial color="#d0eeff" transparent opacity={0.6} />
                    </mesh>
                </group>
            ))}
        </>
    );
};

// ─── Main Export ────────────────────────────────────────────────────────────
interface BackgroundSceneProps {
    theme: 'dark' | 'light' | 'color';
}

export default function BackgroundScene({ theme }: BackgroundSceneProps) {
    const showStars = theme !== 'light';

    return (
        <div className={`bg-scene bg-${theme}`}>
            <div className="sky-gradient" />

            {theme === 'color' && <div className="aurora-glow" />}

            <svg className="mountain-svg" viewBox="0 0 1440 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <path className="mountain-back"
                    d="M0,400 L0,280 L80,230 L140,260 L200,200 L280,240 L340,170 L400,220 L460,150 L520,190 L580,130 L640,180 L700,100 L760,160 L820,80 L880,150 L940,120 L1000,170 L1060,140 L1120,190 L1180,160 L1240,210 L1300,180 L1360,230 L1440,200 L1440,400 Z" />
                <path className="mountain-front"
                    d="M0,400 L0,320 L60,300 L120,330 L180,280 L240,310 L300,250 L360,290 L420,230 L480,270 L540,200 L600,250 L660,160 L720,130 L780,180 L840,220 L900,180 L960,240 L1020,210 L1080,260 L1140,230 L1200,270 L1260,250 L1320,290 L1380,270 L1440,300 L1440,400 Z" />
            </svg>

            {showStars && (
                <div className="stars-canvas">
                    <Canvas
                        orthographic
                        camera={{ zoom: 100, near: 0.1, far: 100, position: [0, 0, 1] }}
                        gl={{ antialias: false, alpha: true }}
                        style={{ background: 'transparent' }}
                    >
                        <CameraRig />
                        <StarField />
                        <ShootingStars />
                    </Canvas>
                </div>
            )}
        </div>
    );
}
