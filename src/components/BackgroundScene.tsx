import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════
// STAR SHADER MATERIAL
// This defines the GPU shader that renders each star as a soft
// glowing circle with independent twinkling.
// ═══════════════════════════════════════════════════════════════
const StarsMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 } // Elapsed time — drives twinkle animation
    },
    vertexShader: `
    attribute float size;           // Per-star size (randomized, 0.5–3.0)
    attribute float twinkleSpeed;   // How fast this star twinkles (0.5–2.5)
    attribute float twinkleOffset;  // Phase offset so stars don't twinkle in sync
    varying float vTwinkle;
    uniform float time;
    
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

      // ── Star visual size ──
      // 300.0 = base scale factor. Increase for bigger stars, decrease for smaller.
      // The division by -mvPosition.z creates perspective-based sizing (farther = smaller).
      gl_PointSize = size * (300.0 / -mvPosition.z);

      gl_Position = projectionMatrix * mvPosition;
      
      // ── Twinkle calculation ──
      // sin() oscillates between -1 and 1. Each star has its own speed & offset.
      vTwinkle = sin(time * twinkleSpeed + twinkleOffset);
    }
  `,
    fragmentShader: `
    varying float vTwinkle;
    void main() {
      // ── Soft circle shape ──
      // smoothstep creates a soft fade from center (bright) to edge (transparent).
      // Change 0.5 → 0.3 for smaller dots, 0.5 → 0.7 for larger blurred dots.
      float a = smoothstep(0.5, 0.1, length(gl_PointCoord - 0.5));

      // ── Twinkle brightness ──
      // Maps vTwinkle from [-1, 1] → [0.3, 1.0].
      // 0.3 = minimum brightness (star never fully disappears).
      // Change 0.3 to 0.0 for full off/on twinkle, or 0.6 for subtle flicker.
      float alpha = a * (0.3 + 0.7 * (vTwinkle * 0.5 + 0.5));

      // ── Star color ──
      // (1.0, 1.0, 1.0) = pure white. Change to (0.85, 0.93, 1.0) for icy blue.
      gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
    }
  `,
    transparent: true,
    depthWrite: false,
});

// ═══════════════════════════════════════════════════════════════
// TWINKLING STARS COMPONENT
// Generates 5000 randomly placed stars with randomized sizes,
// twinkle speeds, and phase offsets.
// ═══════════════════════════════════════════════════════════════
function TwinklingStars() {
    const count = 5000; // ← Total number of stars. More = denser sky, but heavier on GPU.
    const points = useRef<THREE.Points>(null);

    const [positions, sizes, speeds, offsets] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const siz = new Float32Array(count);
        const spd = new Float32Array(count);
        const off = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            // ── Star spread ──
            // 2000 = how far stars spread in each axis.
            // Larger = wider star field. Smaller = more concentrated.
            pos[i * 3] = (Math.random() - 0.5) * 2000;     // X spread
            pos[i * 3 + 1] = (Math.random() - 0.5) * 2000; // Y spread
            pos[i * 3 + 2] = (Math.random() - 0.5) * 2000; // Z depth spread

            // ── Star size range ──
            // 0.5 = minimum size, 2.5 = range added on top.
            // So final size is between 0.5 and 3.0.
            siz[i] = Math.random() * 2.5 + 0.5;

            // ── Twinkle speed range ──
            // 0.5 = slowest twinkle, 2.0 = range. So speed is 0.5–2.5.
            // Lower values = slower, calmer twinkling.
            spd[i] = Math.random() * 2.0 + 0.5;

            // ── Phase offset ──
            // Randomizes start phase so all stars don't blink together.
            off[i] = Math.random() * Math.PI * 2;
        }
        return [pos, siz, spd, off];
    }, []);

    // Update shader time uniform every frame
    useFrame((state) => {
        if (points.current) {
            const mat = points.current.material as THREE.ShaderMaterial;
            mat.uniforms.time.value = state.clock.elapsedTime;
        }
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} args={[positions, 3]} />
                <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} args={[sizes, 1]} />
                <bufferAttribute attach="attributes-twinkleSpeed" count={count} array={speeds} itemSize={1} args={[speeds, 1]} />
                <bufferAttribute attach="attributes-twinkleOffset" count={count} array={offsets} itemSize={1} args={[offsets, 1]} />
            </bufferGeometry>
            <primitive object={StarsMaterial} attach="material" />
        </points>
    );
}

// ═══════════════════════════════════════════════════════════════
// SHOOTING STAR COMPONENT
// Each shooting star periodically streaks across the sky.
// `offsetDelay` staggers multiple instances so they don't fire together.
// ═══════════════════════════════════════════════════════════════
function ShootingStar({ offsetDelay, interval = 4, duration = 0.7 }: { offsetDelay: number; interval?: number; duration?: number }) {
    const ref = useRef<THREE.Mesh>(null);

    // ── Starting position ──
    // X: random horizontal position across 1000 units
    // Y: 500–800 (always starts high up)
    // Z: -500 (in the background)
    const startPos = useMemo(() => new THREE.Vector3(
        (Math.random() - 0.5) * 1000,  // X start range
        500 + Math.random() * 200,       // Y start height
        -1000                              // Z depth (behind stars)
    ), []);

    // ── Velocity (direction + speed) ──
    // X: -300 to -500 (moves left). More negative = faster leftward.
    // Y: -200 to -300 (moves down). More negative = steeper angle.
    // Fixed: Passing duration to velocity to ensure "longer distance" stars move faster if needed.
    const velocity = useMemo(() => {
        const speedMultiplier = duration > 1 ? 1.5 : 1; // Faster for long-duration stars
        return new THREE.Vector3(
            (-300 - Math.random() * 200) * speedMultiplier,
            (-200 - Math.random() * 100) * speedMultiplier,
            0
        );
    }, [duration]);

    useFrame((state) => {
        if (ref.current) {
            // ── Timing ──
            const t = (state.clock.elapsedTime + offsetDelay) % interval;

            const visibleDuration = duration; // How long the star is visible

            // ── Visibility & Fade Out ──
            if (t < visibleDuration) {
                ref.current.position.copy(startPos).addScaledVector(velocity, t);
                ref.current.scale.setLength(1 + t * 10); // Grows as it streaks
                ref.current.visible = true;

                // ── Fade Out Logic ──
                // Starts fading at 50% of its visible duration.
                // Final opacity is 0.9 (max) fading to 0.0.
                const fadeStart = visibleDuration * 0.5;
                const opacity = t < fadeStart
                    ? 0.9
                    : 0.9 * (1 - (t - fadeStart) / (visibleDuration - fadeStart));

                (ref.current.material as THREE.MeshBasicMaterial).opacity = opacity;
            } else {
                ref.current.visible = false;
            }
        }
    });

    return (
        <mesh ref={ref} position={[0, 0, -500]}>
            {/* args={[radius, widthSegments, heightSegments]} — controls shooting star dot size */}
            <sphereGeometry args={[1, 16, 16]} />
            {/* opacity: 0.8 = brightness of the shooting star. 1.0 = fully opaque. */}
            <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
    );
}

// ═══════════════════════════════════════════════════════════════
// MOUSE PARALLAX — CAMERA RIG
// Tracks mouse position globally (window-level) and smoothly
// moves the camera to create a parallax depth effect.
// ═══════════════════════════════════════════════════════════════
const mousePos = { x: 0, y: 0 };
if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', (e) => {
        // Normalizes mouse position to range [-1, 1] on both axes.
        // (0,0) = center of screen, (-1,-1) = top-left, (1,1) = bottom-right.
        mousePos.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mousePos.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });
}

function easeInOutCubic(value: number) {
    return value < 0.5
        ? 4 * value * value * value
        : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function CameraRig({ detailOpen, isMobile }: { detailOpen: boolean; isMobile: boolean }) {
    const sectionPosition = useMemo(() => new THREE.Vector3(4, 2, 14), []);
    const sectionLookAt = useMemo(() => new THREE.Vector3(2, 1, 0), []);
    const detailPosition = useMemo(() => new THREE.Vector3(46, 3.2, 13), []);
    const detailLookAt = useMemo(() => new THREE.Vector3(2, 1, 0), []);

    const fromPositionRef = useRef(sectionPosition.clone());
    const fromLookAtRef = useRef(sectionLookAt.clone());
    const targetPositionRef = useRef(sectionPosition.clone());
    const targetLookAtRef = useRef(sectionLookAt.clone());
    const cameraBaseRef = useRef(sectionPosition.clone());
    const lookAtBaseRef = useRef(sectionLookAt.clone());
    const transitionProgressRef = useRef(1);
    const isTransitioningRef = useRef(false);

    useEffect(() => {
        const nextPosition = !isMobile && detailOpen ? detailPosition : sectionPosition;
        const nextLookAt = !isMobile && detailOpen ? detailLookAt : sectionLookAt;

        fromPositionRef.current.copy(cameraBaseRef.current);
        fromLookAtRef.current.copy(lookAtBaseRef.current);
        targetPositionRef.current.copy(nextPosition);
        targetLookAtRef.current.copy(nextLookAt);
        transitionProgressRef.current = 0;
        isTransitioningRef.current = true;
    }, [detailOpen, isMobile, detailPosition, detailLookAt, sectionPosition, sectionLookAt]);

    useFrame((state) => {
        if (isTransitioningRef.current) {
            transitionProgressRef.current = Math.min(transitionProgressRef.current + state.clock.getDelta() / 1, 1);
            const easedProgress = easeInOutCubic(transitionProgressRef.current);
            cameraBaseRef.current.lerpVectors(fromPositionRef.current, targetPositionRef.current, easedProgress);
            lookAtBaseRef.current.lerpVectors(fromLookAtRef.current, targetLookAtRef.current, easedProgress);

            if (transitionProgressRef.current >= 1) {
                isTransitioningRef.current = false;
            }
        } else {
            cameraBaseRef.current.lerp(targetPositionRef.current, 0.05);
            lookAtBaseRef.current.lerp(targetLookAtRef.current, 0.05);
        }

        const parallaxX = mousePos.x * 0.8;
        const parallaxY = -mousePos.y * 0.45;
        state.camera.position.set(
            cameraBaseRef.current.x + parallaxX,
            cameraBaseRef.current.y + parallaxY,
            cameraBaseRef.current.z
        );
        state.camera.lookAt(lookAtBaseRef.current);
    });
    return null;
}

// ═══════════════════════════════════════════════════════════════
// SNOW COMPONENT (Light theme only — controlled via CSS opacity)
// Gentle falling snowflakes with slight horizontal sway.
// ═══════════════════════════════════════════════════════════════
function Snow() {
    const count = 16000; // ← Number of snowflakes. More = denser snow.
    const points = useRef<THREE.Points>(null);

    const [positions, speeds] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const spd = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            // ── Snowflake spread ──
            // 2000 = spread range. Same concept as star spread.
            pos[i * 3] = (Math.random() - 0.5) * 600;     // X spread
            pos[i * 3 + 1] = Math.random() * 1000 - 500;   // Y (start randomly across full height)
            pos[i * 3 + 2] = (Math.random() - 0.5) * 2000;  // Z depth

            // ── Fall speed ──
            // 0.1 = minimum fall speed (slowest flakes).
            // 0.8 = range added. So speed is 0.1–0.9.
            // Lower both for slower, calmer snow. Higher for blizzard.
            spd[i] = Math.random() * 0.8 + 0.1;
        }
        return [pos, spd];
    }, []);

    useFrame((state) => {
        if (points.current) {
            const positionsArray = points.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < count; i++) {
                // ── Fall ──
                // Subtracts speed from Y each frame. Larger speed[i] = faster fall.
                positionsArray[i * 3 + 1] -= speeds[i];

                // ── Horizontal sway ──
                // 0.2 = sway amplitude. Increase for more wind-blown look.
                // sin(time + i) gives each flake a unique sway phase.
                positionsArray[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.2;

                // ── Reset to top when past bottom ──
                if (positionsArray[i * 3 + 1] < -1000) {
                    positionsArray[i * 3 + 1] = 1000;
                    positionsArray[i * 3] = (Math.random() - 0.5) * 2000;
                }
            }
            points.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} args={[positions, 3]} />
            </bufferGeometry>
            {/* size: snowflake dot size (pixels). opacity: 0.6 = semi-transparent. */}
            <pointsMaterial size={2.5} color="#ffffff" transparent opacity={0.6} sizeAttenuation={true} depthWrite={false} />
        </points>
    );
}

// ═══════════════════════════════════════════════════════════════
// MAIN BACKGROUND SCENE — assembles all layers
// ═══════════════════════════════════════════════════════════════
export default function BackgroundScene({
    theme: _theme,
    detailOpen,
    isMobile
}: {
    theme: 'Light' | 'Dark' | 'Night';
    detailOpen: boolean;
    isMobile: boolean;
}) {
    return (
        <>
            {/* Layer 1: Flat sky gradient background (CSS-driven, see index.css --sky-gradient) */}
            <div className="background-wrapper"></div>

            {/* Layer 2: Aurora teal glow near horizon (only Night theme via --aurora-opacity) */}
            <div className="aurora-glow"></div>

            {/* Horizontal band aurora (green bands at top of sky) — remove this div to disable */}
            <div className="aurora-bands"></div>

            {/* Layer 3: Stars + Shooting Stars WebGL canvas (hidden in Light theme via --stars-opacity) */}
            <div className="webgl-canvas-container">
                {/* Camera: position=[0,0,800] means 800 units back. fov=60 is field of view angle. */}
                <Canvas camera={{ position: [4, 2, 14], fov: 60, near: 1, far: 5000 }}>
                    <TwinklingStars />
                    {/* 3 shooting stars with staggered delays so they don't all fire at once */}
                    <ShootingStar offsetDelay={0} />
                    <ShootingStar offsetDelay={1.3} />
                    <ShootingStar offsetDelay={3.1} />
                    {/* The "Long Distance" Star: Higher duration (1.8s) and 4.7s interval */}
                    <ShootingStar offsetDelay={2.5} interval={4.7} duration={1.8} />
                    <CameraRig detailOpen={detailOpen} isMobile={isMobile} />
                </Canvas>
            </div>

            {/* Layer 4: Snow canvas (only visible in Light theme via --snow-opacity in CSS) */}
            <div className="snow-canvas-container">
                <Canvas camera={{ position: [4, 2, 14], fov: 60, near: 1, far: 5000 }}>
                    <Snow />
                    <CameraRig detailOpen={detailOpen} isMobile={isMobile} />
                </Canvas>
            </div>

            {/* Layer 5: SVG mountain silhouettes anchored at bottom */}
            <div className={`mountains-container ${detailOpen && !isMobile ? 'detail-pov' : ''}`}>
                {/* Back mountain — taller peaks, lighter fill (--mountain-back) */}
                <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="mountain-layer">
                    <path d="M0,400 L0,280 L80,230 L140,260 L200,200 L280,240 L340,170 L400,220 L460,150 L520,190 L580,130 L640,180 L700,100 L760,160 L820,80 L880,150 L940,120 L1000,170 L1060,140 L1120,190 L1180,160 L1240,210 L1300,180 L1360,230 L1440,200 L1440,400 Z"></path>
                </svg>
                {/* Front mountain — shorter peaks, darker fill (--mountain-front), closer to viewer */}
                <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="mountain-layer front">
                    <path d="M0,400 L0,320 L60,300 L120,330 L180,280 L240,310 L300,250 L360,290 L420,230 L480,270 L540,200 L600,250 L660,160 L720,130 L780,180 L840,220 L900,180 L960,240 L1020,210 L1080,260 L1140,230 L1200,270 L1260,250 L1320,290 L1380,270 L1440,300 L1440,400 Z"></path>
                </svg>
            </div>
        </>
    );
}
