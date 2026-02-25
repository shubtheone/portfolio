import { useRef, useMemo } from 'react';
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
        500 + Math.random() * 300,       // Y start height
        -500                              // Z depth (behind stars)
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

function CameraRig() {
    useFrame((state) => {
        // ══════════════════════════════════════════════
        // TWEAK THESE VALUES to control the parallax feel:
        //
        // mousePos.x * 200  → "200" = max horizontal camera drift in pixels/units.
        //                     Lower (e.g. 50) = subtle horizontal shift.
        //                     Higher (e.g. 400) = dramatic horizontal shift.
        //
        // -mousePos.y * 100 → "100" = max vertical camera drift.
        //                     Lower (e.g. 30) = subtle vertical shift.
        //                     Higher (e.g. 200) = dramatic vertical shift.
        //                     The "-" inverts Y so mouse-up moves camera up.
        //
        // * 0.03             → SMOOTHING / EASING factor (0 to 1).
        //                     0.01 = very slow, floaty, cinematic follow.
        //                     0.03 = smooth and natural (current).
        //                     0.05 = snappier, more responsive.
        //                     0.1  = almost instant, jittery.
        //
        // TL;DR: To make the effect SLOWER/SUBTLER:
        //   - Decrease 200 and 100 (less drift range)
        //   - Decrease 0.03 (slower easing)
        // ══════════════════════════════════════════════
        state.camera.position.x += (mousePos.x * 20 - state.camera.position.x) * 0.03;
        state.camera.position.y += (-mousePos.y * 10 - state.camera.position.y) * 0.03;
        state.camera.lookAt(0, 0, -500);
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
export default function BackgroundScene({ theme: _theme }: { theme: 'Light' | 'Dark' | 'Night' }) {
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
                <Canvas camera={{ position: [0, 0, 800], fov: 60, near: 1, far: 5000 }}>
                    <TwinklingStars />
                    {/* 3 shooting stars with staggered delays so they don't all fire at once */}
                    <ShootingStar offsetDelay={0} />
                    <ShootingStar offsetDelay={1.3} />
                    <ShootingStar offsetDelay={3.1} />
                    {/* The "Long Distance" Star: Higher duration (1.8s) and 4.7s interval */}
                    <ShootingStar offsetDelay={2.5} interval={4.7} duration={1.8} />
                    <CameraRig />
                </Canvas>
            </div>

            {/* Layer 4: Snow canvas (only visible in Light theme via --snow-opacity in CSS) */}
            <div className="snow-canvas-container">
                <Canvas camera={{ position: [0, 0, 800], fov: 60, near: 1, far: 5000 }}>
                    <Snow />
                    <CameraRig />
                </Canvas>
            </div>

            {/* Layer 5: SVG mountain silhouettes anchored at bottom */}
            <div className="mountains-container">
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
