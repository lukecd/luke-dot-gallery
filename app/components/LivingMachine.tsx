"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const PERSIMMON = "#ff5a3d";
const IVORY = "#f3eddf";

function Tube({ points, radius = 0.018 }: { points: THREE.Vector3[]; radius?: number }) {
  const geometry = useMemo(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 54, radius, 8, false),
    [points, radius],
  );
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#8d896a" roughness={0.5} metalness={0.45} />
    </mesh>
  );
}

function GlassNode({ position, size }: { position: [number, number, number]; size: number }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 28, 28]} />
      <meshPhysicalMaterial color="#d2c9b6" transparent opacity={0.23} roughness={0.06} metalness={0.35} clearcoat={1} />
    </mesh>
  );
}

const ellipse = (xRadius: number, yRadius: number, zTilt = 0) =>
  Array.from({ length: 96 }, (_, index) => {
    const angle = (index / 95) * Math.PI * 2;
    return new THREE.Vector3(
      Math.cos(angle) * xRadius,
      Math.sin(angle) * yRadius * Math.cos(zTilt),
      Math.sin(angle) * yRadius * Math.sin(zTilt),
    );
  });

const ellipseArc = (
  xRadius: number,
  yRadius: number,
  start = 0,
  end = Math.PI * 2,
  offsetX = 0,
  offsetY = 0,
  segments = 112,
) =>
  Array.from({ length: segments }, (_, index) => {
    const angle = start + (index / (segments - 1)) * (end - start);
    return new THREE.Vector3(
      offsetX + Math.cos(angle) * xRadius,
      offsetY + Math.sin(angle) * yRadius,
      0,
    );
  });

const portalNodes = [
  { x: -1.58, y: 0.42, size: 0.01, phase: 0.2 },
  { x: -1.4, y: -0.78, size: 0.016, phase: 1.8, bright: true },
  { x: -0.7, y: 1.54, size: 0.007, phase: 2.7 },
  { x: 0.6, y: -1.62, size: 0.008, phase: 4.1 },
  { x: 1.72, y: 0.12, size: 0.011, phase: 5.2 },
  { x: -2.08, y: -0.18, size: 0.008, phase: 3.2 },
  { x: -1.72, y: 1.22, size: 0.007, phase: 1.2 },
  { x: -0.28, y: -2.04, size: 0.014, phase: 2.3, bright: true },
  { x: 1.48, y: -1.5, size: 0.007, phase: 4.8 },
  { x: 2.16, y: 0.52, size: 0.006, phase: 0.8 },
  { x: -2.46, y: 0.84, size: 0.008, phase: 5.7 },
  { x: -2.12, y: -1.54, size: 0.013, phase: 2.1, bright: true },
  { x: -0.72, y: 2.46, size: 0.006, phase: 3.8 },
  { x: 1.1, y: -2.42, size: 0.007, phase: 1.5 },
  { x: 2.58, y: -0.68, size: 0.01, phase: 4.4 },
  { x: -2.9, y: -0.42, size: 0.006, phase: 0.4 },
  { x: -1.38, y: 2.58, size: 0.007, phase: 2.9 },
  { x: 0.5, y: -2.94, size: 0.012, phase: 5.4, bright: true },
  { x: 2.82, y: 1.08, size: 0.006, phase: 1.1 },
  { x: 3.16, y: -0.42, size: 0.007, phase: 3.5 },
] as const;

function PortalNode({ x, y, size, phase, bright = false }: (typeof portalNodes)[number]) {
  const core = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (!core.current) return;
    const base = bright ? 0.82 : 0.3;
    core.current.opacity = base + Math.sin(clock.elapsedTime * 0.32 + phase) * (bright ? 0.08 : 0.035);
  });

  return (
    <group position={[x, y, -0.018]}>
      <mesh>
        <sphereGeometry args={[size, 12, 12]} />
        <meshBasicMaterial ref={core} color="#f6dfad" transparent opacity={bright ? 0.82 : 0.3} toneMapped={false} />
      </mesh>
      {bright && (
        <mesh scale={4.6}>
          <sphereGeometry args={[size, 12, 12]} />
          <meshBasicMaterial
            color="#e8b866"
            transparent
            opacity={0.055}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}

function PortalField() {
  const field = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!field.current) return;
    field.current.rotation.z = Math.sin(clock.elapsedTime * 0.08) * 0.012;
  });

  const tracks = [
    { xRadius: 1.58, yRadius: 1.46, start: 0, end: Math.PI * 2, x: 0.02, y: -0.02, opacity: 0.26, width: 0.34 },
    { xRadius: 1.82, yRadius: 1.7, start: 0.18, end: 5.9, x: -0.04, y: 0.03, opacity: 0.21, width: 0.3 },
    { xRadius: 2.1, yRadius: 1.96, start: 0, end: Math.PI * 2, x: 0.06, y: -0.01, opacity: 0.17, width: 0.29 },
    { xRadius: 2.42, yRadius: 2.24, start: 0.48, end: 6.06, x: -0.08, y: -0.04, opacity: 0.135, width: 0.28 },
    { xRadius: 2.74, yRadius: 2.55, start: 0, end: Math.PI * 2, x: 0.1, y: 0.04, opacity: 0.105, width: 0.27 },
    { xRadius: 3.06, yRadius: 2.82, start: 0.28, end: 5.62, x: -0.12, y: 0.02, opacity: 0.08, width: 0.25 },
    { xRadius: 3.42, yRadius: 3.14, start: 0, end: Math.PI * 2, x: 0.06, y: -0.06, opacity: 0.055, width: 0.24 },
  ] as const;

  const fragments = [
    { xRadius: 1.7, yRadius: 1.56, start: 2.28, end: 3.72, x: 0.03, y: 0, opacity: 0.25 },
    { xRadius: 2.3, yRadius: 2.16, start: 0.2, end: 1.14, x: -0.08, y: 0.03, opacity: 0.18 },
    { xRadius: 2.68, yRadius: 2.44, start: 3.6, end: 4.62, x: 0.12, y: -0.04, opacity: 0.14 },
    { xRadius: 3.18, yRadius: 2.92, start: 1.7, end: 2.46, x: -0.1, y: 0.04, opacity: 0.09 },
  ] as const;

  const spokes = [0.2, 1.42, 2.72, 4.02, 5.24];

  return (
    <group position={[0, -2.25, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
      <group ref={field}>
        {tracks.map(({ xRadius, yRadius, start, end, x, y, opacity, width }) => (
          <Line
            key={`${xRadius}-${start}`}
            points={ellipseArc(xRadius, yRadius, start, end, x, y)}
            color="#b59660"
            lineWidth={width}
            transparent
            opacity={opacity}
            depthWrite={false}
            toneMapped={false}
          />
        ))}
        {fragments.map(({ xRadius, yRadius, start, end, x, y, opacity }) => (
          <Line
            key={`${xRadius}-${start}`}
            points={ellipseArc(xRadius, yRadius, start, end, x, y, 64)}
            color="#e0bd78"
            lineWidth={0.36}
            transparent
            opacity={opacity}
            depthWrite={false}
            toneMapped={false}
          />
        ))}
        {spokes.map((angle) => (
          <Line
            key={angle}
            points={[
              new THREE.Vector3(Math.cos(angle) * 1.5, Math.sin(angle) * 1.4, 0),
              new THREE.Vector3(Math.cos(angle) * 3.48, Math.sin(angle) * 3.14, 0),
            ]}
            color="#8f7549"
            lineWidth={0.22}
            transparent
            opacity={0.075}
            depthWrite={false}
            toneMapped={false}
          />
        ))}
        {portalNodes.map((node) => (
          <PortalNode key={`${node.x}-${node.y}`} {...node} />
        ))}
      </group>
    </group>
  );
}

function Aperture() {
  return (
    <group position={[0, -2.25, -0.15]}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh position={[0, 0, -0.04]}>
          <circleGeometry args={[1.32, 96]} />
          <meshBasicMaterial color="#010201" />
        </mesh>
        <mesh>
          <torusGeometry args={[1.44, 0.105, 18, 128]} />
          <meshBasicMaterial
            color="#ffedc8"
            transparent
            opacity={0.035}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh>
          <torusGeometry args={[1.44, 0.052, 16, 128]} />
          <meshBasicMaterial
            color="#ffecc9"
            transparent
            opacity={0.14}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh>
          <torusGeometry args={[1.44, 0.021, 14, 128]} />
          <meshBasicMaterial color="#fff1d6" toneMapped={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[1.34, 0.009, 10, 128]} />
          <meshBasicMaterial color="#c9ab75" transparent opacity={0.34} />
        </mesh>
      </group>
      <pointLight position={[0, 0.34, 0.18]} color="#ffe9bd" intensity={9} distance={4.6} decay={2.15} />
    </group>
  );
}

function PortalGlow() {
  const glow = useRef<THREE.ShaderMaterial>(null);
  useFrame(({ clock }) => {
    if (!glow.current) return;
    glow.current.uniforms.uOpacity.value = 0.115 + Math.sin(clock.elapsedTime * 0.28) * 0.004;
  });

  return (
    <mesh position={[0, -2.23, -0.16]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[4.8, 4.8]} />
      <shaderMaterial
        ref={glow}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        uniforms={{
          uColor: { value: new THREE.Color("#f1cf91") },
          uOpacity: { value: 0.115 },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform vec3 uColor;
          uniform float uOpacity;
          void main() {
            vec2 p = (vUv - 0.5) * 2.0;
            float distanceFromCenter = length(p);
            float ring = 1.0 - smoothstep(0.02, 0.24, abs(distanceFromCenter - 0.6));
            float haze = (1.0 - smoothstep(0.42, 1.0, distanceFromCenter)) * 0.12;
            gl_FragColor = vec4(uColor, (ring * 0.72 + haze) * uOpacity);
          }
        `}
      />
    </mesh>
  );
}

function Core() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.1) * 0.08;
    mesh.current.scale.setScalar(pulse);
  });
  return (
    <group position={[0.18, 0.75, 0.45]}>
      <mesh ref={mesh}>
        <sphereGeometry args={[0.145, 36, 36]} />
        <meshBasicMaterial color={PERSIMMON} />
      </mesh>
      <pointLight color={PERSIMMON} intensity={8} distance={3.4} decay={2} />
      {[0.3, 0.41].map((radius) => (
        <mesh key={radius} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.008, 8, 80]} />
          <meshBasicMaterial color={PERSIMMON} transparent opacity={0.34} />
        </mesh>
      ))}
    </group>
  );
}

function Sculpture() {
  const group = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);
  const { pointer, viewport } = useThree();
  const compact = viewport.width < 7;

  const main = useMemo(() => [
    new THREE.Vector3(0, -2.7, 0),
    new THREE.Vector3(-0.12, -1.3, 0.04),
    new THREE.Vector3(0.12, 0.05, -0.04),
    new THREE.Vector3(-0.08, 1.5, 0.03),
    new THREE.Vector3(0.1, 3.15, 0),
  ], []);
  const branch = useMemo(() => [
    new THREE.Vector3(0, -0.7, 0),
    new THREE.Vector3(0.65, -0.05, 0.04),
    new THREE.Vector3(1.25, 0.45, 0),
  ], []);

  useFrame(({ clock, camera }) => {
    if (!group.current) return;
    const scroll = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pointer.y * 0.055, 0.04);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * 0.13, 0.04);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, -scroll * 0.8, 0.04);
    if (orbit.current) orbit.current.rotation.z = clock.elapsedTime * 0.055;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.3, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.2, 0.03);
  });

  return (
    <group ref={group} position={[compact ? 1.15 : 1.8, -0.05, 0]} scale={compact ? 0.78 : 1}>
      <PortalField />
      <PortalGlow />
      <Aperture />
      <Tube points={main} radius={0.024} />
      <Tube points={branch} radius={0.014} />
      <group ref={orbit}>
        <Line points={ellipse(2.05, 1.1, 0.7)} color="#b7a786" lineWidth={0.48} transparent opacity={0.28} />
      </group>
      <GlassNode position={[0, -1.15, 0.16]} size={0.23} />
      <GlassNode position={[-0.06, 1.75, 0.15]} size={0.17} />
      <Core />
      <Sparkles count={compact ? 8 : 14} scale={[4.8, 6.5, 1.4]} size={0.8} speed={0.1} color={IVORY} opacity={0.22} />
    </group>
  );
}

export default function LivingMachine() {
  return (
    <div className="machine-canvas" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 8.6], fov: 40 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
        <ambientLight intensity={0.2} color="#737965" />
        <directionalLight position={[4, 6, 7]} intensity={2.2} color={IVORY} />
        <directionalLight position={[-3, -2, 3]} intensity={0.4} color="#52634a" />
        <Sculpture />
      </Canvas>
    </div>
  );
}
