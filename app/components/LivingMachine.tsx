"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const PERSIMMON = "#ff5a3d";
const IVORY = "#f3eddf";

function Stem({ points, radius = 0.018, color = "#7f875f" }: { points: THREE.Vector3[]; radius?: number; color?: string }) {
  const geometry = useMemo(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 48, radius, 7, false),
    [points, radius],
  );

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} roughness={0.58} metalness={0.28} />
    </mesh>
  );
}

function GlassNode({ position, size = 0.18 }: { position: [number, number, number]; size?: number }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 28, 28]} />
      <meshPhysicalMaterial
        color="#b6b09e"
        transparent
        opacity={0.26}
        roughness={0.06}
        metalness={0.48}
        clearcoat={1}
      />
    </mesh>
  );
}

function Signal({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.15;
    ref.current.scale.setScalar(pulse);
  });

  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.13, 32, 32]} />
        <meshStandardMaterial color={PERSIMMON} emissive={PERSIMMON} emissiveIntensity={2.8} />
      </mesh>
      <pointLight color={PERSIMMON} intensity={11} distance={3.8} decay={2.2} />
      {[0.27, 0.37, 0.5].map((radius) => (
        <mesh key={radius} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.008, 8, 72]} />
          <meshBasicMaterial color={PERSIMMON} transparent opacity={0.5 - radius * 0.45} />
        </mesh>
      ))}
    </group>
  );
}

const orbitPoints = (radiusX: number, radiusY: number, tilt: number, offset = 0) =>
  Array.from({ length: 90 }, (_, index) => {
    const angle = (index / 89) * Math.PI * 2;
    const x = Math.cos(angle) * radiusX;
    const y = Math.sin(angle) * radiusY;
    return new THREE.Vector3(x, y * Math.cos(tilt), y * Math.sin(tilt) + offset);
  });

function Machine() {
  const group = useRef<THREE.Group>(null);
  const signalRail = useRef<THREE.Mesh>(null);
  const { pointer, viewport } = useThree();
  const compact = viewport.width < 7;

  const mainStem = useMemo(() => [
    new THREE.Vector3(0.1, -3.8, 0),
    new THREE.Vector3(-0.1, -2.1, 0.08),
    new THREE.Vector3(0.15, -0.4, -0.05),
    new THREE.Vector3(-0.05, 1.25, 0.04),
    new THREE.Vector3(0.18, 3.35, 0),
  ], []);

  const sideStems = useMemo(() => [
    [new THREE.Vector3(0, -1.8, 0), new THREE.Vector3(-1, -1.05, 0.05), new THREE.Vector3(-1.65, -0.35, 0)],
    [new THREE.Vector3(0.05, -0.55, 0), new THREE.Vector3(0.85, 0.12, 0.08), new THREE.Vector3(1.55, 0.62, 0)],
    [new THREE.Vector3(0, 0.9, 0), new THREE.Vector3(-0.7, 1.48, 0.08), new THREE.Vector3(-1.35, 2.18, 0)],
    [new THREE.Vector3(0.1, 1.8, 0), new THREE.Vector3(0.75, 2.25, 0.05), new THREE.Vector3(1.22, 2.75, 0)],
  ], []);

  useFrame(({ clock, camera }) => {
    if (!group.current) return;
    const scroll = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.15);
    const targetX = pointer.y * 0.08;
    const targetY = pointer.x * 0.15;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.035);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.035);
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.17) * 0.012 - scroll * 0.035;
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, -scroll * 1.45, 0.035);
    group.current.scale.setScalar(1 - scroll * 0.08);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.22, 0.025);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.16, 0.025);
    if (signalRail.current) signalRail.current.rotation.z = clock.elapsedTime * 0.12;
  });

  return (
    <group ref={group} position={[compact ? 1.15 : 1.5, -0.05, 0]} scale={compact ? 0.78 : 1}>
      <Stem points={mainStem} radius={0.03} color="#8d865e" />
      {sideStems.map((points, index) => <Stem points={points} radius={0.018} key={index} />)}

      <group ref={signalRail}>
        <Line points={orbitPoints(2.6, 1.35, 0.7)} color="#b9aa8d" lineWidth={0.52} transparent opacity={0.34} />
        <Line points={orbitPoints(3.25, 1.8, -0.35, -0.2)} color="#8f8d78" lineWidth={0.42} transparent opacity={0.22} />
      </group>
      <Line points={orbitPoints(1.75, 3.2, 0.12)} color="#d0b78c" lineWidth={0.4} transparent opacity={0.24} />

      <GlassNode position={[0.05, -2.35, 0.2]} size={0.22} />
      <GlassNode position={[-0.05, 0.72, 0.25]} size={0.31} />
      <GlassNode position={[0.1, 2.42, 0.18]} size={0.18} />
      <GlassNode position={[1.62, -0.15, 0]} size={0.11} />
      <GlassNode position={[-1.7, 0.8, 0]} size={0.09} />
      <Signal position={[0.08, 1.18, 0.38]} />

      <Sparkles count={compact ? 22 : 42} scale={[6.5, 7.8, 2]} size={1.1} speed={0.18} color={IVORY} opacity={0.36} />
    </group>
  );
}

export default function LivingMachine() {
  return (
    <div className="machine-canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8.8], fov: 40 }}
        dpr={[1, 1.55]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.6} color="#7c806b" />
        <directionalLight position={[4, 6, 7]} intensity={4.2} color={IVORY} />
        <directionalLight position={[-3, -2, 3]} intensity={1.8} color="#52634a" />
        <Machine />
      </Canvas>
    </div>
  );
}
