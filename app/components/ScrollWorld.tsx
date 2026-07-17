"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, Line, useTexture } from "@react-three/drei";
import { Suspense, createContext, useContext, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const ORANGE = "#ff6544";

type Timeline = {
  scrollY: number;
  pointerX: number;
  pointerY: number;
  reduced: boolean;
  sceneTops: number[];
  sceneHeights: number[];
};

const MotionContext = createContext<React.MutableRefObject<Timeline> | null>(null);

const clamp01 = (value: number) => THREE.MathUtils.clamp(value, 0, 1);
const smoothstep = (from: number, to: number, value: number) => {
  if (from === to) return value < from ? 0 : 1;
  const t = clamp01((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};

const ellipse = (
  xRadius: number,
  yRadius: number,
  zDepth = 0,
  phase = 0,
  count = 128,
) =>
  Array.from({ length: count }, (_, index) => {
    const angle = (index / (count - 1)) * Math.PI * 2;
    return new THREE.Vector3(
      Math.cos(angle + phase) * xRadius,
      Math.sin(angle + phase) * yRadius,
      Math.sin(angle * 2 + phase) * zDepth,
    );
  });

function Tube({
  points,
  radius = 0.018,
  color = "#8f815e",
  opacity = 1,
}: {
  points: THREE.Vector3[];
  radius?: number;
  color?: string;
  opacity?: number;
}) {
  const geometry = useMemo(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 64, radius, 8, false),
    [points, radius],
  );

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        roughness={0.42}
        metalness={0.58}
      />
    </mesh>
  );
}

function BotanicalPlane({
  url,
  position,
  scale,
  rotation = [0, 0, 0],
  opacity = 0.52,
  color = "#777756",
  phase = 0,
}: {
  url: string;
  position: [number, number, number];
  scale: [number, number];
  rotation?: [number, number, number];
  opacity?: number;
  color?: string;
  phase?: number;
}) {
  const sourceTexture = useTexture(url);
  const texture = useMemo(() => {
    const prepared = sourceTexture.clone();
    prepared.colorSpace = THREE.SRGBColorSpace;
    prepared.anisotropy = 4;
    prepared.needsUpdate = true;
    return prepared;
  }, [sourceTexture]);
  const mesh = useRef<THREE.Mesh>(null);
  const motion = useContext(MotionContext);

  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    if (motion?.current.reduced) return;
    mesh.current.rotation.z = rotation[2] + Math.sin(clock.elapsedTime * 0.22 + phase) * 0.018;
  });

  return (
    <mesh ref={mesh} position={position} rotation={rotation} scale={[scale[0], scale[1], 1]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        map={texture}
        color={color}
        transparent
        opacity={opacity}
        alphaTest={0.025}
        side={THREE.DoubleSide}
        depthWrite={false}
        roughness={0.94}
        metalness={0.02}
      />
    </mesh>
  );
}

function GlassNode({
  position,
  size,
  warm = false,
}: {
  position: [number, number, number];
  size: number;
  warm?: boolean;
}) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[size, 24, 24]} />
        <meshPhysicalMaterial
          color={warm ? "#f0d9ad" : "#a6a18c"}
          transparent
          opacity={0.32}
          roughness={0.08}
          metalness={0.45}
          transmission={0.35}
          clearcoat={1}
        />
      </mesh>
      <mesh scale={1.12}>
        <sphereGeometry args={[size, 18, 18]} />
        <meshBasicMaterial color={warm ? "#e9c27d" : "#b9b09a"} transparent opacity={0.08} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Rail({
  x,
  y,
  height,
  radius,
  z = 0,
  glass = false,
}: {
  x: number;
  y: number;
  height: number;
  radius: number;
  z?: number;
  glass?: boolean;
}) {
  return (
    <mesh position={[x, y + height / 2, z]}>
      <cylinderGeometry args={[radius, radius, height, 10]} />
      {glass ? (
        <meshPhysicalMaterial color="#c9bea2" transparent opacity={0.22} transmission={0.45} roughness={0.08} metalness={0.28} />
      ) : (
        <meshStandardMaterial color="#99855d" roughness={0.38} metalness={0.7} />
      )}
    </mesh>
  );
}

const rails = [
  { x: -0.34, y: -2.05, height: 5.1, radius: 0.024, z: -0.02, glass: false },
  { x: -0.2, y: -2.12, height: 5.55, radius: 0.016, z: 0.08, glass: true },
  { x: -0.07, y: -1.95, height: 5.18, radius: 0.026, z: -0.14, glass: false },
  { x: 0.06, y: -2.18, height: 5.7, radius: 0.018, z: 0.04, glass: true },
  { x: 0.19, y: -2.02, height: 5.28, radius: 0.023, z: -0.07, glass: false },
  { x: 0.32, y: -1.88, height: 4.9, radius: 0.013, z: 0.14, glass: true },
] as const;

const crossbars = [
  { y: -1.55, width: 1.55, x: -0.06 },
  { y: -0.98, width: 1.1, x: 0.1 },
  { y: -0.35, width: 1.85, x: -0.12 },
  { y: 0.28, width: 1.3, x: 0.08 },
  { y: 0.92, width: 1.62, x: -0.08 },
  { y: 1.58, width: 1.18, x: 0.11 },
  { y: 2.24, width: 1.45, x: -0.04 },
] as const;

function MechanicalSpine() {
  const ringSpecs = [
    { x: -0.12, y: -1.3, radius: 0.26, tilt: 0.12, opacity: 0.46 },
    { x: 0.1, y: -0.58, radius: 0.34, tilt: 0.44, opacity: 0.34 },
    { x: -0.08, y: 0.04, radius: 0.22, tilt: 0.7, opacity: 0.42 },
    { x: 0.28, y: 0.72, radius: 0.55, tilt: 0.22, opacity: 0.5 },
    { x: -0.04, y: 1.42, radius: 0.31, tilt: 0.86, opacity: 0.3 },
    { x: 0.12, y: 2.1, radius: 0.24, tilt: 0.54, opacity: 0.28 },
  ] as const;

  return (
    <group>
      {rails.map((rail) => <Rail key={`${rail.x}-${rail.y}`} {...rail} />)}
      {[-0.52, -0.44, 0.46, 0.54].map((x, index) => (
        <Line
          key={x}
          points={[new THREE.Vector3(x, -2.12, -0.2), new THREE.Vector3(x + (index % 2 ? 0.08 : -0.05), 3.55, -0.2)]}
          color="#9b865d"
          lineWidth={0.42}
          transparent
          opacity={0.34}
        />
      ))}
      {crossbars.map(({ y, width, x }, index) => (
        <group key={y} position={[x, y, index % 2 ? 0.05 : -0.08]}>
          <Line
            points={[new THREE.Vector3(-width / 2, 0, 0), new THREE.Vector3(width / 2, 0, 0)]}
            color="#bea06c"
            lineWidth={0.55}
            transparent
            opacity={0.5}
          />
          <mesh position={[-width / 2, 0, 0]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial color="#d6bd8b" />
          </mesh>
          <mesh position={[width / 2, 0, 0]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial color="#d6bd8b" />
          </mesh>
        </group>
      ))}
      {ringSpecs.map(({ x, y, radius, tilt, opacity }, index) => (
        <mesh key={y} position={[x, y, 0.08]} rotation={[0.24 + index * 0.06, tilt, index * 0.42]}>
          <torusGeometry args={[radius, 0.012, 10, 72]} />
          <meshStandardMaterial color="#a68c62" transparent opacity={opacity} roughness={0.35} metalness={0.72} />
        </mesh>
      ))}
    </group>
  );
}

const orbitSpecs = [
  { rx: 2.75, ry: 1.25, depth: 0.25, phase: 0.2, y: 0.65, z: -0.1, opacity: 0.45 },
  { rx: 3.35, ry: 1.7, depth: 0.4, phase: 1.1, y: 0.48, z: -0.35, opacity: 0.3 },
  { rx: 2.42, ry: 2.35, depth: 0.22, phase: 2.2, y: 0.46, z: 0.15, opacity: 0.34 },
  { rx: 1.7, ry: 2.86, depth: 0.3, phase: 0.6, y: 0.55, z: -0.18, opacity: 0.26 },
  { rx: 3.72, ry: 0.78, depth: 0.35, phase: 2.8, y: -0.25, z: -0.42, opacity: 0.22 },
  { rx: 2.18, ry: 1.02, depth: 0.18, phase: 1.7, y: 1.45, z: 0.1, opacity: 0.38 },
  { rx: 1.34, ry: 2.14, depth: 0.18, phase: 2.6, y: 0.18, z: 0.3, opacity: 0.3 },
  { rx: 3.05, ry: 2.05, depth: 0.24, phase: 0.05, y: 0.85, z: -0.3, opacity: 0.18 },
  { rx: 2.62, ry: 0.65, depth: 0.28, phase: 1.4, y: -1.05, z: 0.02, opacity: 0.26 },
  { rx: 1.92, ry: 1.5, depth: 0.34, phase: 2.1, y: -0.75, z: -0.16, opacity: 0.3 },
] as const;

const orbitNodes: Array<[number, number, number, number]> = [
  [-2.42, 1.26, 0.12, 0.06], [-1.88, -0.7, 0.22, 0.08], [-1.3, 2.15, -0.08, 0.055],
  [-0.92, 0.05, 0.42, 0.12], [-0.74, -1.28, 0.08, 0.075], [-0.38, 2.68, -0.1, 0.07],
  [0.62, 2.4, 0.1, 0.055], [0.95, -1.42, 0.28, 0.1], [1.28, 0.12, -0.08, 0.075],
  [1.66, 1.65, 0.18, 0.06], [2.05, -0.65, -0.12, 0.085], [2.55, 0.78, 0.04, 0.06],
];

function OrbitalSystems() {
  const group = useRef<THREE.Group>(null);
  const motion = useContext(MotionContext);
  useFrame(({ clock }) => {
    if (!group.current) return;
    if (motion?.current.reduced) return;
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.07) * 0.015;
  });

  return (
    <group ref={group}>
      {orbitSpecs.map((spec, index) => (
        <Line
          key={`${spec.rx}-${spec.ry}`}
          points={ellipse(spec.rx, spec.ry, spec.depth, spec.phase)}
          position={[0, spec.y, spec.z]}
          color={index === 0 ? "#d0a96f" : "#9e8257"}
          lineWidth={index < 2 ? 0.64 : 0.42}
          transparent
          opacity={spec.opacity}
        />
      ))}
      {orbitNodes.map(([x, y, z, size], index) => (
        <GlassNode key={`${x}-${y}`} position={[x, y, z]} size={size} warm={index % 4 === 0} />
      ))}
    </group>
  );
}

function BotanicalAssembly() {
  const roundLeaf = "/images/botanical/nasturtium-leaf.webp";
  const leafRight = "/images/botanical/zinnia-leaf-top-right.webp";
  const leafLeft = "/images/botanical/zinnia-leaf-middle-left.webp";
  const leafLowRight = "/images/botanical/zinnia-leaf-lower-right.webp";
  const leafLowLeft = "/images/botanical/zinnia-leaf-bottom-left.webp";
  return (
    <group>
      <BotanicalPlane url="/images/botanical/nasturtium-stem.webp" position={[0.62, 0.52, -0.4]} scale={[3.4, 3.4]} opacity={0.5} color="#8b8a67" phase={0.3} />
      <BotanicalPlane url="/images/botanical/passionfruit-vine.webp" position={[1.22, -0.18, -0.55]} scale={[3.1, 3.1]} opacity={0.36} color="#858765" phase={1.1} />
      <BotanicalPlane url="/images/botanical/zinnia-stem.webp" position={[1.34, -0.08, -0.2]} scale={[0.52, 3.45]} opacity={0.46} color="#7e805e" phase={4.7} />
      <BotanicalPlane url={leafRight} position={[-1.02, 1.26, 0.08]} scale={[1.18, 0.74]} rotation={[0.08, -0.3, -0.42]} opacity={0.7} color="#999a78" phase={1.8} />
      <BotanicalPlane url={leafLeft} position={[-1.42, 0.58, -0.02]} scale={[1.08, 0.68]} rotation={[-0.08, 0.38, 0.22]} opacity={0.65} color="#8f9270" phase={2.6} />
      <BotanicalPlane url={leafLowLeft} position={[-0.96, -0.38, 0.12]} scale={[0.92, 0.58]} rotation={[0.12, -0.45, -0.24]} opacity={0.6} color="#838766" phase={3.1} />
      <BotanicalPlane url={leafRight} position={[0.92, 1.52, 0.22]} scale={[1.22, 0.76]} rotation={[-0.1, 0.4, 0.62]} opacity={0.72} color="#939575" phase={4.4} />
      <BotanicalPlane url={leafLeft} position={[1.48, 0.78, 0.14]} scale={[1.34, 0.8]} rotation={[0.14, -0.32, -0.64]} opacity={0.7} color="#858967" phase={5.2} />
      <BotanicalPlane url={leafLowRight} position={[1.16, -0.18, 0.2]} scale={[1.02, 0.62]} rotation={[-0.08, 0.3, 0.38]} opacity={0.64} color="#91936f" phase={6.1} />
      <BotanicalPlane url={leafLowLeft} position={[1.8, -0.92, 0.1]} scale={[1.2, 0.7]} rotation={[0.1, -0.38, -0.72]} opacity={0.6} color="#7f8362" phase={0.9} />
      <BotanicalPlane url={roundLeaf} position={[-0.35, 2.12, -0.1]} scale={[0.72, 0.72]} rotation={[0.12, -0.28, 0.4]} opacity={0.48} color="#797d5b" phase={2.2} />
      <BotanicalPlane url={roundLeaf} position={[0.54, -1.2, -0.05]} scale={[0.58, 0.58]} rotation={[-0.08, 0.32, -0.2]} opacity={0.45} color="#747858" phase={5.8} />
      <BotanicalPlane url={leafRight} position={[-1.88, 0.16, -0.12]} scale={[0.72, 0.44]} rotation={[0.04, -0.2, -0.16]} opacity={0.56} color="#8f9270" phase={1.2} />
      <BotanicalPlane url={leafLeft} position={[-1.7, -0.78, 0.02]} scale={[0.62, 0.4]} rotation={[0.06, 0.3, 0.18]} opacity={0.52} color="#838766" phase={2.8} />
      <BotanicalPlane url={leafLowRight} position={[2.18, 0.12, -0.08]} scale={[0.78, 0.46]} rotation={[-0.04, -0.28, 0.52]} opacity={0.58} color="#8b8e6a" phase={3.6} />
      <BotanicalPlane url={leafLowLeft} position={[2.44, -0.72, -0.16]} scale={[0.64, 0.4]} rotation={[0.04, 0.24, -0.34]} opacity={0.5} color="#7d8160" phase={4.9} />
      <BotanicalPlane url="/images/botanical/nasturtium-bud.webp" position={[-0.68, -1.18, 0.28]} scale={[0.68, 0.68]} rotation={[0, 0.15, -0.42]} opacity={0.72} color="#9b7950" phase={1.4} />
    </group>
  );
}

function BotanicalTwigs() {
  const paths = [
    [new THREE.Vector3(-0.2, -1.2, -0.22), new THREE.Vector3(-1.0, -0.65, -0.18), new THREE.Vector3(-2.22, 0.22, -0.2)],
    [new THREE.Vector3(-0.12, -0.2, -0.18), new THREE.Vector3(-0.9, 0.48, -0.2), new THREE.Vector3(-1.92, 1.08, -0.24)],
    [new THREE.Vector3(0.16, 0.66, -0.22), new THREE.Vector3(-0.5, 1.48, -0.26), new THREE.Vector3(-1.2, 2.35, -0.28)],
    [new THREE.Vector3(0.18, -1.1, -0.2), new THREE.Vector3(1.18, -0.72, -0.2), new THREE.Vector3(2.58, -0.15, -0.24)],
    [new THREE.Vector3(0.22, -0.32, -0.18), new THREE.Vector3(1.24, 0.38, -0.2), new THREE.Vector3(2.35, 1.12, -0.25)],
    [new THREE.Vector3(0.14, 0.9, -0.2), new THREE.Vector3(0.9, 1.68, -0.23), new THREE.Vector3(1.62, 2.52, -0.26)],
  ];

  const buds: Array<[number, number, number, number]> = [
    [-2.1, 0.18, -0.18, 0.034], [-1.82, 1.02, -0.22, 0.026], [-1.08, 2.28, -0.26, 0.03],
    [2.42, -0.12, -0.22, 0.035], [2.2, 1.05, -0.23, 0.026], [1.52, 2.42, -0.24, 0.03],
  ];

  return (
    <group>
      {paths.map((points, index) => (
        <Tube key={index} points={points} radius={0.011} color="#70734f" opacity={0.74} />
      ))}
      {buds.map(([x, y, z, size], index) => (
        <mesh key={`${x}-${y}`} position={[x, y, z]}>
          <sphereGeometry args={[size, 10, 10]} />
          <meshStandardMaterial color={index % 2 ? "#9b865e" : "#74784f"} roughness={0.72} />
        </mesh>
      ))}
    </group>
  );
}

function GlassChambers() {
  const chambers: Array<[number, number, number, number]> = [
    [-0.16, -1.02, 0.26, 0.18], [0.2, -0.42, 0.34, 0.12], [-0.34, 0.32, 0.2, 0.16],
    [0.42, 1.08, 0.24, 0.13], [-0.2, 1.74, 0.18, 0.2], [0.24, 2.42, 0.12, 0.12],
  ];
  return (
    <group>
      {chambers.map(([x, y, z, size], index) => (
        <group key={`${x}-${y}`}>
          <Line
            points={[new THREE.Vector3(x, y + size, z - 0.08), new THREE.Vector3(x + (index % 2 ? 0.08 : -0.04), 3.62, z - 0.12)]}
            color="#9f8c69"
            lineWidth={0.28}
            transparent
            opacity={0.22}
          />
          <GlassNode position={[x, y, z]} size={size} warm={index === 0 || index === 4} />
          <mesh position={[x, y, z]} rotation={[0.18, index * 0.3, Math.PI / 2]}>
            <torusGeometry args={[size * 1.45, 0.008, 7, 48]} />
            <meshBasicMaterial color="#c7aa76" transparent opacity={0.36} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function PortalAura() {
  const material = useRef<THREE.ShaderMaterial>(null);
  const motion = useContext(MotionContext);
  useFrame(({ clock }) => {
    if (!material.current) return;
    if (motion?.current.reduced) return;
    material.current.uniforms.uOpacity.value = 0.28 + Math.sin(clock.elapsedTime * 0.24) * 0.008;
  });

  return (
    <mesh position={[0, -0.42, -0.92]} scale={[5.9, 4.8, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={material}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        uniforms={{ uColor: { value: new THREE.Color("#d2a964") }, uOpacity: { value: 0.28 } }}
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
            vec2 p = vec2((vUv.x - 0.5) * 1.35, (vUv.y - 0.18) * 1.45);
            float glow = exp(-dot(p, p) * 3.1);
            float lift = 1.0 - smoothstep(0.62, 1.0, vUv.y);
            gl_FragColor = vec4(uColor, glow * lift * uOpacity);
          }
        `}
      />
    </mesh>
  );
}

const fieldRings = [
  [3.12, 0.5, 0.3], [3.45, 0.62, 0.24], [3.85, 0.78, 0.19], [4.3, 0.94, 0.14], [4.82, 1.08, 0.1], [5.35, 1.24, 0.07],
] as const;

function Portal() {
  return (
    <group position={[0, -2.1, 0]}>
      <mesh position={[0, 0, -0.08]} scale={[1, 0.19, 1]}>
        <circleGeometry args={[2.73, 128]} />
        <meshBasicMaterial color="#030302" />
      </mesh>
      <mesh scale={[1, 0.19, 1]}>
        <torusGeometry args={[2.82, 0.24, 18, 160]} />
        <meshBasicMaterial color="#efbd72" transparent opacity={0.13} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh scale={[1, 0.19, 1]}>
        <torusGeometry args={[2.82, 0.11, 16, 160]} />
        <meshBasicMaterial color="#ffe0a1" transparent opacity={0.42} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh scale={[1, 0.19, 1]}>
        <torusGeometry args={[2.82, 0.038, 12, 160]} />
        <meshBasicMaterial color="#ffe9bb" toneMapped={false} />
      </mesh>
      <mesh scale={[1, 0.19, 1]}>
        <torusGeometry args={[2.66, 0.014, 10, 160]} />
        <meshBasicMaterial color="#b8894f" transparent opacity={0.5} />
      </mesh>
      {fieldRings.map(([rx, ry, opacity]) => (
        <Line
          key={rx}
          points={ellipse(rx, ry, 0, rx * 0.1)}
          color="#9d7846"
          lineWidth={0.38}
          transparent
          opacity={opacity}
        />
      ))}
      {[0.2, 0.86, 1.58, 2.35, 3.18, 4.02, 5.1].map((angle) => (
        <Line
          key={angle}
          points={[
            new THREE.Vector3(Math.cos(angle) * 2.95, Math.sin(angle) * 0.52, -0.02),
            new THREE.Vector3(Math.cos(angle) * 5.48, Math.sin(angle) * 1.28, -0.02),
          ]}
          color="#87683f"
          lineWidth={0.24}
          transparent
          opacity={0.11}
        />
      ))}
      <pointLight position={[0, 0.55, 0.6]} color="#ffe0a8" intensity={17} distance={5.8} decay={2} />
      <pointLight position={[0, 1.2, -0.4]} color="#b99c65" intensity={4} distance={4.5} decay={2} />
    </group>
  );
}

function Tomato({ position }: { position: [number, number, number] }) {
  const group = useRef<THREE.Group>(null);
  const motion = useContext(MotionContext);
  useFrame(({ clock }) => {
    if (!group.current) return;
    if (motion?.current.reduced) return;
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.55) * 0.035;
  });

  return (
    <group ref={group} position={position}>
      {[0, 1, 2, 3, 4].map((index) => {
        const angle = (index / 5) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.07, Math.sin(angle) * 0.035, 0]} scale={[1, 0.88, 0.92]}>
            <sphereGeometry args={[0.18, 20, 20]} />
            <meshStandardMaterial color="#bb4f32" emissive="#7c271c" emissiveIntensity={0.22} roughness={0.6} />
          </mesh>
        );
      })}
      {[0, 1, 2, 3, 4].map((index) => (
        <mesh key={`leaf-${index}`} position={[0, 0.23, 0.03]} rotation={[0, 0, (index / 5) * Math.PI * 2]}>
          <coneGeometry args={[0.1, 0.28, 3]} />
          <meshStandardMaterial color="#4f6038" roughness={0.82} />
        </mesh>
      ))}
      <pointLight color="#e75a39" intensity={2.5} distance={1.8} decay={2} />
    </group>
  );
}

function SignalCore() {
  const core = useRef<THREE.Group>(null);
  const motion = useContext(MotionContext);
  useFrame(({ clock }) => {
    if (!core.current) return;
    if (motion?.current.reduced) return;
    core.current.rotation.y = clock.elapsedTime * 0.08;
    core.current.rotation.z = Math.sin(clock.elapsedTime * 0.35) * 0.08;
  });

  return (
    <group ref={core}>
      <mesh>
        <sphereGeometry args={[0.205, 36, 36]} />
        <meshBasicMaterial color={ORANGE} toneMapped={false} />
      </mesh>
      {[0.24, 0.31, 0.4].map((radius, index) => (
        <mesh key={radius} rotation={[index * 0.27, 0.3, Math.PI / 2 + index * 0.31]}>
          <torusGeometry args={[radius, 0.011, 8, 80]} />
          <meshBasicMaterial color={ORANGE} transparent opacity={0.44 - index * 0.1} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function SeedBud() {
  const bud = useRef<THREE.Group>(null);
  const motion = useContext(MotionContext);
  useFrame(({ clock }) => {
    if (!bud.current) return;
    if (motion?.current.reduced) return;
    bud.current.rotation.z = -0.18 + Math.sin(clock.elapsedTime * 0.6) * 0.08;
    bud.current.rotation.y = clock.elapsedTime * 0.16;
  });

  return (
    <group ref={bud}>
      <mesh scale={[0.72, 1.28, 0.72]} rotation={[0, 0, 0.16]}>
        <sphereGeometry args={[0.235, 32, 32]} />
        <meshPhysicalMaterial color="#e45f3e" emissive="#76261b" emissiveIntensity={0.26} roughness={0.48} clearcoat={0.55} />
      </mesh>
      <mesh position={[0.055, 0.33, 0]} rotation={[0, 0, -0.16]}>
        <coneGeometry args={[0.075, 0.27, 5]} />
        <meshStandardMaterial color="#4e5a36" roughness={0.84} />
      </mesh>
      <mesh position={[-0.16, 0.08, 0.01]} rotation={[0, 0, 0.72]} scale={[0.23, 0.11, 0.11]}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial color="#657044" roughness={0.9} />
      </mesh>
    </group>
  );
}

function TechCube() {
  const cube = useRef<THREE.Group>(null);
  const motion = useContext(MotionContext);
  useFrame(({ clock }) => {
    if (!cube.current) return;
    if (motion?.current.reduced) return;
    cube.current.rotation.x = 0.48 + clock.elapsedTime * 0.23;
    cube.current.rotation.y = -0.38 + clock.elapsedTime * 0.31;
  });

  return (
    <group ref={cube}>
      <mesh>
        <boxGeometry args={[0.56, 0.56, 0.56, 3, 3, 3]} />
        <meshPhysicalMaterial color="#25271f" roughness={0.2} metalness={0.7} clearcoat={0.9} />
        <Edges color={ORANGE} threshold={12} />
      </mesh>
      <mesh scale={1.16}>
        <boxGeometry args={[0.56, 0.56, 0.56]} />
        <meshBasicMaterial color={ORANGE} wireframe transparent opacity={0.13} depthWrite={false} />
      </mesh>
    </group>
  );
}

function PageStack() {
  const pages = useRef<THREE.Group>(null);
  const motion = useContext(MotionContext);
  useFrame(({ clock }) => {
    if (!pages.current) return;
    if (motion?.current.reduced) return;
    pages.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.22;
    pages.current.rotation.z = -0.1 + Math.sin(clock.elapsedTime * 0.24) * 0.04;
  });

  return (
    <group ref={pages}>
      {[-1, 0, 1].map((index) => (
        <mesh key={index} position={[index * 0.12, index * 0.035, index * -0.06]} rotation={[0.08 * index, -0.2 * index, 0.16 * index]}>
          <boxGeometry args={[0.42, 0.58, 0.025]} />
          <meshPhysicalMaterial color={index === 0 ? "#b9deea" : "#f0eadb"} roughness={0.62} metalness={0.08} clearcoat={0.25} />
          <Edges color={index === 0 ? "#66c5f6" : ORANGE} threshold={15} />
        </mesh>
      ))}
      {[0.06, -0.04, -0.14].map((y, index) => (
        <mesh key={y} position={[0.12, y, 0.04]}>
          <boxGeometry args={[0.22 - index * 0.035, 0.014, 0.012]} />
          <meshBasicMaterial color="#40543a" transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function OrganicBlob() {
  const blob = useRef<THREE.Mesh>(null);
  const motion = useContext(MotionContext);
  useFrame(({ clock }) => {
    if (!blob.current) return;
    if (motion?.current.reduced) return;
    const time = clock.elapsedTime;
    blob.current.rotation.x = time * 0.12;
    blob.current.rotation.y = time * 0.18;
    blob.current.scale.set(1 + Math.sin(time * 0.8) * 0.14, 0.88 + Math.sin(time * 0.62 + 1.4) * 0.13, 1 + Math.cos(time * 0.7) * 0.1);
  });

  return (
    <mesh ref={blob}>
      <icosahedronGeometry args={[0.36, 4]} />
      <meshPhysicalMaterial color="#d64f37" emissive="#6f1e17" emissiveIntensity={0.26} roughness={0.3} metalness={0.08} clearcoat={0.75} />
    </mesh>
  );
}

const sceneX = [0.532, 0.76, 0.84, 0.69, 0.72, 0.54, 0.55];
const sceneY = [0.198, 0.35, 0.29, 0.23, 0.14, 0.34, 0.16];
const shapeForScene = [0, 1, 2, 3, 4, 5, 0];

function JourneyActor({ timeline }: { timeline: React.MutableRefObject<Timeline> }) {
  const actor = useRef<THREE.Group>(null);
  const thread = useRef<THREE.Group>(null);
  const flare = useRef<THREE.Mesh>(null);
  const point = useRef<THREE.PointLight>(null);
  const shapeRefs = useRef<Array<THREE.Group | null>>([]);
  const { viewport, size } = useThree();

  useFrame(({ clock }, delta) => {
    if (!actor.current) return;
    const current = timeline.current;
    const tops = current.sceneTops.length >= 7 ? current.sceneTops : [0, size.height * 0.491, size.height * 1.9, size.height * 2.8, size.height * 3.7, size.height * 4.6, size.height * 6];
    const xStops = size.width < 680 ? [0.74, 0.86, 0.86, 0.86, 0.86, 0.86, 0.76] : sceneX;
    const intro = smoothstep(0, Math.max(150, size.height * 0.19), current.scrollY);
    const introY = THREE.MathUtils.lerp(sceneY[0], sceneY[1], intro);
    const docY = current.scrollY + introY * size.height;

    let scene = 0;
    for (let index = 1; index < tops.length; index += 1) {
      if (docY >= tops[index]) scene = index;
      else break;
    }
    scene = Math.min(scene, sceneX.length - 1);
    const nextScene = Math.min(scene + 1, sceneX.length - 1);
    const segmentStart = tops[scene] ?? 0;
    const segmentEnd = tops[nextScene] ?? segmentStart + (current.sceneHeights[scene] || size.height);
    const segment = scene === nextScene ? 0 : smoothstep(segmentStart, segmentEnd, docY);

    let positionScene = 0;
    for (let index = 1; index < tops.length; index += 1) {
      if (current.scrollY >= tops[index]) positionScene = index;
      else break;
    }
    positionScene = Math.min(positionScene, xStops.length - 1);
    const nextPositionScene = Math.min(positionScene + 1, xStops.length - 1);
    const positionStart = tops[positionScene] ?? 0;
    const positionEnd = tops[nextPositionScene] ?? positionStart + (current.sceneHeights[positionScene] || size.height);
    const positionSegment = positionScene === nextPositionScene
      ? 0
      : positionScene === 0
        ? smoothstep((tops[1] || size.height * 0.49) * 0.28, Math.max(tops[1] || size.height * 0.49, 1), current.scrollY)
        : smoothstep(positionStart, positionEnd, current.scrollY);

    let xNorm = THREE.MathUtils.lerp(xStops[positionScene], xStops[nextPositionScene], positionSegment);
    let yNorm = scene === 0 ? introY : THREE.MathUtils.lerp(sceneY[scene], sceneY[nextScene], segment);
    if (!current.reduced) {
      xNorm += Math.sin(clock.elapsedTime * 0.34 + scene) * 0.004 + current.pointerX * 0.012;
      yNorm += Math.sin(clock.elapsedTime * 0.42 + scene * 0.7) * 0.006 + current.pointerY * 0.006;
    }

    const targetX = (xNorm - 0.5) * viewport.width;
    const targetY = (0.5 - yNorm) * viewport.height;
    actor.current.position.x = current.reduced ? targetX : THREE.MathUtils.damp(actor.current.position.x, targetX, 8.5, delta);
    actor.current.position.y = current.reduced ? targetY : THREE.MathUtils.damp(actor.current.position.y, targetY, 8.5, delta);

    const weights = [0, 0, 0, 0, 0, 0];
    const transitionWidth = current.reduced ? 1 : Math.max(120, size.height * 0.16);
    let transition = 0;
    if (scene > 0 && docY < tops[scene] + transitionWidth) {
      transition = smoothstep(tops[scene] - transitionWidth, tops[scene] + transitionWidth, docY);
      weights[shapeForScene[scene - 1]] += 1 - transition;
      weights[shapeForScene[scene]] += transition;
    } else if (nextScene !== scene && docY > segmentEnd - transitionWidth) {
      transition = smoothstep(segmentEnd - transitionWidth, segmentEnd + transitionWidth, docY);
      weights[shapeForScene[scene]] += 1 - transition;
      weights[shapeForScene[nextScene]] += transition;
    } else {
      weights[shapeForScene[scene]] = 1;
    }

    shapeRefs.current.forEach((shape, index) => {
      if (!shape) return;
      const weight = weights[index] || 0;
      const targetScale = weight <= 0.5 ? 0.001 : smoothstep(0.5, 1, weight);
      const nextScale = current.reduced ? targetScale : THREE.MathUtils.damp(shape.scale.x, targetScale, 12, delta);
      shape.scale.setScalar(nextScale);
      shape.visible = shape.scale.x > 0.012;
    });

    const transitionGlow = 4 * transition * (1 - transition);
    if (flare.current) {
      const pulse = 0.72 + Math.sin(clock.elapsedTime * 1.7) * 0.08 + transitionGlow * 0.55;
      flare.current.scale.setScalar(pulse);
      const material = flare.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.012 + transitionGlow * 0.045;
    }
    if (point.current) point.current.intensity = 3.5 + transitionGlow * 7;
    if (thread.current) thread.current.rotation.z = Math.sin(clock.elapsedTime * 0.12) * 0.03;
  });

  const threadPoints = [
    new THREE.Vector3(-0.16, 5.8, -0.8),
    new THREE.Vector3(0.15, 2.4, -0.65),
    new THREE.Vector3(-0.08, 0.9, -0.5),
    new THREE.Vector3(0, 0, -0.45),
    new THREE.Vector3(0.18, -1.7, -0.6),
    new THREE.Vector3(-0.14, -5.8, -0.8),
  ];
  const threadPointsEcho = threadPoints.map((point, index) => point.clone().add(new THREE.Vector3(index % 2 ? 0.08 : 0.04, 0, -0.05)));

  return (
    <group ref={actor} position={[0, 0, 0.2]}>
      <group ref={thread} scale={size.width < 680 ? [0.72, 1, 0.72] : 1}>
        <Line points={threadPoints} color="#b28a54" lineWidth={0.22} transparent opacity={0.2} />
        <Line points={threadPointsEcho} color="#776c4e" lineWidth={0.16} transparent opacity={0.12} />
        {[-3.1, -1.45, 1.28, 3.3].map((y, index) => (
          <GlassNode key={y} position={[index % 2 ? 0.12 : -0.1, y, -0.62]} size={index % 2 ? 0.045 : 0.032} warm={index === 2} />
        ))}
      </group>
      <group scale={size.width < 680 ? 0.5 : 0.65}>
        <group scale={0.001} ref={(node) => { shapeRefs.current[0] = node; }}><SignalCore /></group>
        <group scale={0.001} ref={(node) => { shapeRefs.current[1] = node; }}><Tomato position={[0, 0, 0]} /></group>
        <group scale={0.001} ref={(node) => { shapeRefs.current[2] = node; }}><SeedBud /></group>
        <group scale={0.001} ref={(node) => { shapeRefs.current[3] = node; }}><TechCube /></group>
        <group scale={0.001} ref={(node) => { shapeRefs.current[4] = node; }}><PageStack /></group>
        <group scale={0.001} ref={(node) => { shapeRefs.current[5] = node; }}><OrganicBlob /></group>
        <mesh ref={flare} position={[0, 0, -0.15]}>
          <sphereGeometry args={[0.52, 20, 20]} />
          <meshBasicMaterial color={ORANGE} transparent opacity={0.012} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <pointLight ref={point} color={ORANGE} intensity={4} distance={3.2} decay={2} />
      </group>
    </group>
  );
}

function TransitionFilaments() {
  const specs = [
    [-1.45, -0.9, -3.96], [-1.05, -0.52, -4.15], [-0.68, -0.34, -4.34], [-0.28, -0.12, -4.18],
    [0.22, 0.08, -4.35], [0.72, 0.32, -4.14], [1.1, 0.55, -4.02], [1.48, 0.92, -3.88],
  ] as const;
  return (
    <group>
      {specs.map(([topX, bottomX, bottomY], index) => (
        <group key={`${topX}-${bottomY}`}>
          <Line
            points={[
              new THREE.Vector3(topX, -1.88, -0.32),
              new THREE.Vector3((topX + bottomX) / 2, -2.85, -0.25 + index * 0.025),
              new THREE.Vector3(bottomX, bottomY, -0.18),
            ]}
            color="#9f8a61"
            lineWidth={0.42}
            transparent
            opacity={0.34}
          />
          <mesh position={[bottomX, bottomY + 0.18, -0.18]}>
            <sphereGeometry args={[index % 3 === 0 ? 0.045 : 0.025, 12, 12]} />
            <meshBasicMaterial color={index % 3 === 0 ? "#c9ad78" : "#77745f"} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function HeroAssembly() {
  return (
    <group>
      <Portal />
      <PortalAura />
      <OrbitalSystems />
      <MechanicalSpine />
      <BotanicalTwigs />
      <GlassChambers />
      <Suspense fallback={null}><BotanicalAssembly /></Suspense>
      <TransitionFilaments />
    </group>
  );
}

function WorldRig({ timeline }: { timeline: React.MutableRefObject<Timeline> }) {
  const assembly = useRef<THREE.Group>(null);
  const { viewport, size } = useThree();

  useFrame((_, delta) => {
    if (!assembly.current) return;
    const compact = size.width < 680;
    const scale = viewport.height * (compact ? 0.07 : 0.093);
    const pageOffset = timeline.current.scrollY * (viewport.height / Math.max(size.height, 1));
    const targetX = ((compact ? 0.56 : 0.515) - 0.5) * viewport.width + (timeline.current.reduced ? 0 : timeline.current.pointerX * 0.2);
    const heroHeight = timeline.current.sceneHeights[0] || size.height * 0.491;
    const portalScreenY = Math.min(size.height * 0.92, heroHeight * 0.883);
    const portalY = (0.5 - portalScreenY / Math.max(size.height, 1)) * viewport.height;
    const targetY = portalY + 2.1 * scale + pageOffset;

    assembly.current.scale.setScalar(scale);
    assembly.current.position.x = timeline.current.reduced ? targetX : THREE.MathUtils.damp(assembly.current.position.x, targetX, 5.5, delta);
    assembly.current.position.y = timeline.current.reduced ? targetY : THREE.MathUtils.damp(assembly.current.position.y, targetY, 7, delta);
    const rotationX = timeline.current.reduced ? 0 : timeline.current.pointerY * 0.045;
    const rotationY = timeline.current.reduced ? 0 : timeline.current.pointerX * 0.1;
    assembly.current.rotation.x = timeline.current.reduced ? rotationX : THREE.MathUtils.damp(assembly.current.rotation.x, rotationX, 4, delta);
    assembly.current.rotation.y = timeline.current.reduced ? rotationY : THREE.MathUtils.damp(assembly.current.rotation.y, rotationY, 4, delta);
  });

  return <group ref={assembly}><HeroAssembly /></group>;
}

function RenderPolicy({ timeline }: { timeline: React.MutableRefObject<Timeline> }) {
  const invalidate = useThree((state) => state.invalidate);
  const setDpr = useThree((state) => state.setDpr);
  const setFrameloop = useThree((state) => state.setFrameloop);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setDpr(window.innerWidth < 680 ? 1 : Math.min(window.devicePixelRatio || 1, 1.35));
      setFrameloop(reduced.matches || document.hidden ? "demand" : "always");
      invalidate();
    };
    const requestFrame = () => {
      if (reduced.matches || document.hidden) invalidate();
    };

    apply();
    reduced.addEventListener("change", apply);
    window.addEventListener("scroll", requestFrame, { passive: true });
    window.addEventListener("resize", apply, { passive: true });
    document.addEventListener("visibilitychange", apply);
    return () => {
      reduced.removeEventListener("change", apply);
      window.removeEventListener("scroll", requestFrame);
      window.removeEventListener("resize", apply);
      document.removeEventListener("visibilitychange", apply);
    };
  }, [invalidate, setDpr, setFrameloop, timeline]);

  return null;
}

export default function ScrollWorld() {
  const timeline = useRef<Timeline>({ scrollY: 0, pointerX: 0, pointerY: 0, reduced: false, sceneTops: [], sceneHeights: [] });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    timeline.current.reduced = reduced.matches;

    let layoutFrame = 0;
    const measureScenes = () => {
      cancelAnimationFrame(layoutFrame);
      layoutFrame = requestAnimationFrame(() => {
        const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
        timeline.current.sceneTops = scenes.map((section) => section.getBoundingClientRect().top + window.scrollY);
        timeline.current.sceneHeights = scenes.map((section) => section.getBoundingClientRect().height);
      });
    };

    const handleScroll = () => { timeline.current.scrollY = window.scrollY; };
    const handlePointer = (event: PointerEvent) => {
      timeline.current.pointerX = event.clientX / Math.max(window.innerWidth, 1) - 0.5;
      timeline.current.pointerY = event.clientY / Math.max(window.innerHeight, 1) - 0.5;
    };
    const handleReduced = (event: MediaQueryListEvent) => { timeline.current.reduced = event.matches; };

    handleScroll();
    measureScenes();
    document.fonts?.ready.then(measureScenes);
    const observer = new ResizeObserver(measureScenes);
    observer.observe(document.documentElement);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointer, { passive: true });
    window.addEventListener("resize", measureScenes, { passive: true });
    reduced.addEventListener("change", handleReduced);
    return () => {
      cancelAnimationFrame(layoutFrame);
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("resize", measureScenes);
      reduced.removeEventListener("change", handleReduced);
    };
  }, []);

  return (
    <div className="scroll-world" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8.6], fov: 40 }}
        dpr={[1, 1.35]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.12} color="#62664c" />
        <directionalLight position={[4, 6, 6]} intensity={1.8} color="#d9c49d" />
        <directionalLight position={[-4, 1, 4]} intensity={0.5} color="#526040" />
        <MotionContext.Provider value={timeline}>
          <RenderPolicy timeline={timeline} />
          <WorldRig timeline={timeline} />
          <JourneyActor timeline={timeline} />
        </MotionContext.Provider>
      </Canvas>
    </div>
  );
}
