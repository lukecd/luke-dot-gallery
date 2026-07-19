"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, Environment, Lightformer, Line, useTexture } from "@react-three/drei";
import { Suspense, createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  LivingMachineApparatus,
  LivingMachineContactPlanet,
  LivingMachineJourneyState,
} from "./StudyWorld";
import type { TransformationSlug } from "@/app/studies/study-data";

const ORANGE = "#ff6544";
const SHOW_JOURNEY_FORMS = false;
const PROGRESS_STOP_COUNT = 6;

type Timeline = {
  scrollY: number;
  visualScrollY: number;
  actorScrollY: number;
  previousScrollY: number;
  scrollVelocity: number;
  scrollEnergy: number;
  ready: boolean;
  pointerX: number;
  pointerY: number;
  pointerTargetX: number;
  pointerTargetY: number;
  reduced: boolean;
  sceneTops: number[];
  sceneHeights: number[];
  invalidate?: () => void;
};

const MotionContext = createContext<React.MutableRefObject<Timeline> | null>(null);

const clamp01 = (value: number) => THREE.MathUtils.clamp(value, 0, 1);
const smoothstep = (from: number, to: number, value: number) => {
  if (from === to) return value < from ? 0 : 1;
  const t = clamp01((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};

const organicEllipse = (
  xRadius: number,
  yRadius: number,
  seed = 0,
  irregularity = 0.035,
  count = 192,
  zDepth = 0,
) =>
  Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const ripple =
      Math.sin(angle * 3 + seed) * irregularity +
      Math.sin(angle * 7 - seed * 0.7) * irregularity * 0.34 +
      Math.sin(angle * 11 + seed * 1.4) * irregularity * 0.12;
    return new THREE.Vector3(
      Math.cos(angle) * (xRadius + ripple),
      Math.sin(angle) * (yRadius + ripple * 0.28),
      Math.sin(angle * 2 + seed) * zDepth + Math.sin(angle * 5 - seed) * irregularity * 0.12,
    );
  });

const organicArc = (
  xRadius: number,
  yRadius: number,
  seed: number,
  irregularity: number,
  start: number,
  coverage: number,
) => {
  const points = organicEllipse(xRadius, yRadius, seed, irregularity, 192);
  const startIndex = Math.floor(clamp01(start) * points.length);
  const pointCount = Math.floor(clamp01(coverage) * points.length);
  return Array.from({ length: pointCount }, (_, index) => points[(startIndex + index) % points.length]);
};

function MotionEngine({ advance }: { advance: (delta: number, viewportHeight: number) => void }) {
  const { size } = useThree();

  useFrame((_, delta) => {
    advance(delta, size.height);
  }, -10);

  return null;
}

function SectionProgressRail() {
  const rail = useRef<HTMLDivElement>(null);
  const bead = useRef<HTMLSpanElement>(null);
  const markerRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let anchors: number[] = [];
    let targetProgress = 0;
    let renderedProgress = 0;
    let activeMarker = -1;
    let animationFrame = 0;
    let previousTime = 0;
    let initialized = false;

    const render = (progress: number) => {
      if (!rail.current) return;
      const markerRadius = 2.5;
      const travel = Math.max(rail.current.clientHeight - markerRadius * 2, 0);
      rail.current.style.setProperty("--rail-progress", `${progress * 100}%`);
      bead.current?.style.setProperty(
        "transform",
        `translate3d(-50%, ${markerRadius + progress * travel - 4.5}px, 0)`,
      );
    };

    const setMarkerState = (marker: number) => {
      if (marker === activeMarker) return;
      activeMarker = marker;
      markerRefs.current.forEach((node, index) => {
        if (!node) return;
        node.dataset.active = String(index === marker);
        node.dataset.passed = String(index <= marker);
      });
    };

    const animate = (time: number) => {
      const delta = previousTime === 0 ? 1 / 60 : Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      const follow = reducedMotion.matches ? 1 : 1 - Math.exp(-12 * delta);
      renderedProgress = THREE.MathUtils.lerp(renderedProgress, targetProgress, follow);
      render(renderedProgress);

      if (Math.abs(renderedProgress - targetProgress) > 0.0002) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        renderedProgress = targetProgress;
        render(renderedProgress);
        animationFrame = 0;
        previousTime = 0;
      }
    };

    const requestAnimation = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(animate);
    };

    const updateProgress = () => {
      if (anchors.length !== PROGRESS_STOP_COUNT) return;
      const scrollY = window.scrollY;
      let markerPosition = 0;

      if (scrollY >= anchors[anchors.length - 1]) {
        markerPosition = PROGRESS_STOP_COUNT - 1;
      } else if (scrollY > anchors[0]) {
        for (let index = 0; index < anchors.length - 1; index += 1) {
          if (scrollY > anchors[index + 1]) continue;
          const distance = Math.max(anchors[index + 1] - anchors[index], 1);
          const local = clamp01((scrollY - anchors[index]) / distance);
          markerPosition = index + local * local * (3 - 2 * local);
          break;
        }
      }

      targetProgress = markerPosition / (PROGRESS_STOP_COUNT - 1);
      setMarkerState(Math.round(markerPosition));

      if (!initialized) {
        initialized = true;
        renderedProgress = targetProgress;
        render(renderedProgress);
        return;
      }
      requestAnimation();
    };

    const measure = () => {
      anchors = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"))
        .slice(1, PROGRESS_STOP_COUNT + 1)
        .map((section) => section.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.38);
      updateProgress();
    };

    const observer = new ResizeObserver(measure);
    document.querySelectorAll<HTMLElement>("[data-scene]").forEach((scene) => observer.observe(scene));
    measure();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    reducedMotion.addEventListener("change", updateProgress);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", measure);
      reducedMotion.removeEventListener("change", updateProgress);
    };
  }, []);

  return (
    <div className="section-progress-rail" ref={rail} aria-hidden="true">
      <span className="section-progress-rail__track" />
      <span className="section-progress-rail__bead" ref={bead}><i /></span>
      <span className="section-progress-rail__markers">
        {Array.from({ length: PROGRESS_STOP_COUNT }, (_, index) => (
          <span
            className="section-progress-rail__marker"
            data-active={index === 0}
            data-passed={index === 0}
            key={index}
            ref={(node) => { markerRefs.current[index] = node; }}
          />
        ))}
      </span>
    </div>
  );
}

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
        roughness={0.84}
        metalness={0.02}
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
  anchor = [0, -0.46],
  motionScale = 1,
}: {
  url: string;
  position: [number, number, number];
  scale: [number, number];
  rotation?: [number, number, number];
  opacity?: number;
  color?: string;
  phase?: number;
  anchor?: [number, number];
  motionScale?: number;
}) {
  const sourceTexture = useTexture(url);
  const texture = useMemo(() => {
    const prepared = sourceTexture.clone();
    prepared.colorSpace = THREE.SRGBColorSpace;
    prepared.anisotropy = 4;
    prepared.needsUpdate = true;
    return prepared;
  }, [sourceTexture]);
  const pivot = useRef<THREE.Group>(null);
  const plane = useRef<THREE.Mesh>(null);
  const restPositions = useRef<Float32Array | null>(null);
  const time = useRef(0);
  const motion = useContext(MotionContext);

  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  useFrame((_, delta) => {
    if (!pivot.current || !plane.current) return;
    const reduced = motion?.current.reduced ?? false;
    if (!reduced) time.current += Math.min(delta, 0.05);
    const sharedWind =
      reduced ? 0 : Math.sin(time.current * 0.43 + phase) * 0.7 +
      Math.sin(time.current * 0.19 + phase * 0.37) * 0.3;
    const localFlutter = reduced ? 0 : Math.sin(time.current * (0.29 + (phase % 3) * 0.018) + phase * 1.7);
    const scrollWind = reduced ? 0 : motion?.current.scrollVelocity ?? 0;
    const pointerX = reduced ? 0 : motion?.current.pointerX ?? 0;
    const pointerY = reduced ? 0 : motion?.current.pointerY ?? 0;
    const bend = (sharedWind * 0.014 + localFlutter * 0.004 + scrollWind * 0.012) * motionScale;
    const geometry = plane.current.geometry;
    const positions = geometry.attributes.position as THREE.BufferAttribute;
    const values = positions.array as Float32Array;
    if (!restPositions.current || restPositions.current.length !== values.length) {
      restPositions.current = Float32Array.from(values);
    }
    const resting = restPositions.current;
    const maxReach = Math.hypot(0.5 + Math.abs(anchor[0]), 0.5 + Math.abs(anchor[1]));

    for (let index = 0; index < positions.count; index += 1) {
      const offset = index * 3;
      const localX = resting[offset];
      const localY = resting[offset + 1];
      const reach = clamp01(Math.hypot(localX - anchor[0], localY - anchor[1]) / maxReach);
      const edgeFlutter = Math.sin(localX * 4.2 + localY * 2.7 + time.current * 0.34 + phase) * 0.002;
      values[offset + 2] = resting[offset + 2] + bend * reach * reach + edgeFlutter * reach * motionScale;
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();

    pivot.current.rotation.z = (sharedWind * 0.013 + localFlutter * 0.003 + scrollWind * 0.018 + pointerX * 0.006) * motionScale;
    pivot.current.rotation.x = (sharedWind * 0.005 + scrollWind * 0.008 - pointerY * 0.016) * motionScale;
    pivot.current.rotation.y = (localFlutter * 0.008 + scrollWind * 0.01 + pointerX * 0.025) * motionScale;
  });

  return (
    <group position={position} rotation={rotation}>
      <group ref={pivot} position={[anchor[0] * scale[0], anchor[1] * scale[1], 0]}>
        <mesh ref={plane} position={[-anchor[0] * scale[0], -anchor[1] * scale[1], 0]} scale={[scale[0], scale[1], 1]}>
          <planeGeometry args={[1, 1, 8, 8]} />
          <meshStandardMaterial
            map={texture}
            color={color}
            transparent
            opacity={opacity}
            alphaTest={0.045}
            side={THREE.DoubleSide}
            depthWrite
            roughness={0.9}
            metalness={0}
          />
        </mesh>
      </group>
    </group>
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
  const geometry = useMemo(() => {
    const seed = x * 17 + z * 23;
    const points = [
      new THREE.Vector3(x, y - 0.28, -0.38),
      new THREE.Vector3(x + Math.sin(seed + 0.8) * 0.035, y + height * 0.26, z + Math.cos(seed) * 0.018),
      new THREE.Vector3(x + Math.sin(seed + 1.7) * 0.028, y + height * 0.68, z + Math.cos(seed + 0.9) * 0.022),
      new THREE.Vector3(x + Math.sin(seed + 2.4) * 0.018, y + height, z),
    ];
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 56, radius, 8, false);
  }, [height, radius, x, y, z]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      {glass ? (
        <meshStandardMaterial color="#bdb095" transparent opacity={0.2} roughness={0.5} metalness={0.08} depthWrite={false} />
      ) : (
        <meshStandardMaterial color="#8e7955" roughness={0.62} metalness={0.38} />
      )}
    </mesh>
  );
}

const rails = [
  { x: -0.28, y: -2.05, height: 5.2, radius: 0.022, z: -0.04, glass: false },
  { x: -0.1, y: -2.12, height: 5.55, radius: 0.013, z: 0.06, glass: true },
  { x: 0.1, y: -1.98, height: 5.24, radius: 0.021, z: -0.1, glass: false },
  { x: 0.28, y: -2.16, height: 5.62, radius: 0.012, z: 0.11, glass: true },
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
  const group = useRef<THREE.Group>(null);
  const time = useRef(0);
  const motion = useContext(MotionContext);
  const ringSpecs = [
    { x: -0.12, y: -1.3, radius: 0.26, tilt: 0.12, opacity: 0.46 },
    { x: 0.1, y: -0.58, radius: 0.34, tilt: 0.44, opacity: 0.34 },
    { x: -0.08, y: 0.04, radius: 0.22, tilt: 0.7, opacity: 0.42 },
    { x: 0.28, y: 0.72, radius: 0.55, tilt: 0.22, opacity: 0.5 },
    { x: -0.04, y: 1.42, radius: 0.31, tilt: 0.86, opacity: 0.3 },
    { x: 0.12, y: 2.1, radius: 0.24, tilt: 0.54, opacity: 0.28 },
  ] as const;

  useFrame((_, delta) => {
    if (!group.current || motion?.current.reduced) return;
    time.current += Math.min(delta, 0.05);
    const breath = Math.sin(time.current * 0.22 + 0.8);
    group.current.rotation.z = breath * 0.0022 + (motion?.current.scrollVelocity ?? 0) * 0.0025;
    group.current.scale.y = 1 + breath * 0.0018;
  });

  return (
    <group ref={group}>
      {rails.map((rail) => <Rail key={`${rail.x}-${rail.y}`} {...rail} />)}
      {[-0.48, 0.49].map((x, index) => (
        <Line
          key={x}
          points={[new THREE.Vector3(x, -2.12, -0.2), new THREE.Vector3(x + (index % 2 ? 0.08 : -0.05), 3.55, -0.2)]}
          color="#9b865d"
          lineWidth={0.42}
          transparent
          opacity={0.26}
        />
      ))}
      {crossbars.map(({ y, width, x }, index) => (
        <group key={y} position={[x, y, index % 2 ? 0.05 : -0.08]}>
          <Line
            points={[new THREE.Vector3(-width / 2, 0, 0), new THREE.Vector3(width / 2, 0, 0)]}
            color="#bea06c"
            lineWidth={0.55}
            transparent
            opacity={0.3}
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
          <meshStandardMaterial color="#907a55" transparent opacity={opacity * 0.78} roughness={0.6} metalness={0.4} />
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
  const time = useRef(0);
  const motion = useContext(MotionContext);
  const compact = useThree((state) => state.size.width < 680);
  const visibleOrbits = compact ? orbitSpecs.slice(0, 5) : orbitSpecs;
  const visibleNodes = compact ? orbitNodes.slice(0, 7) : orbitNodes;
  useFrame((_, delta) => {
    if (!group.current) return;
    if (motion?.current.reduced) return;
    time.current += Math.min(delta, 0.05);
    group.current.rotation.z = Math.sin(time.current * 0.07) * 0.008 + (motion?.current.scrollVelocity ?? 0) * 0.004;
    group.current.rotation.x = (motion?.current.pointerY ?? 0) * 0.006;
    group.current.rotation.y = (motion?.current.pointerX ?? 0) * 0.01;
    group.current.scale.x = 1 + Math.sin(time.current * 0.11 + 0.8) * 0.0018;
    group.current.scale.y = 1 + Math.cos(time.current * 0.09) * 0.0024;
  });

  return (
    <group ref={group}>
      {visibleOrbits.map((spec, index) => (
        <Line
          key={`${spec.rx}-${spec.ry}`}
          points={organicEllipse(spec.rx, spec.ry, spec.phase, 0.018 + index * 0.0015, 176, spec.depth)}
          position={[0, spec.y, spec.z]}
          color={index === 0 ? "#d0a96f" : "#9e8257"}
          lineWidth={index < 2 ? 0.64 : 0.42}
          transparent
          opacity={spec.opacity * (index < 4 ? 0.82 : 0.62)}
        />
      ))}
      {visibleNodes.map(([x, y, z, size], index) => (
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
      <BotanicalPlane url="/images/botanical/nasturtium-stem.webp" position={[0.62, 0.52, -0.4]} scale={[3.4, 3.4]} opacity={0.36} color="#9c9872" phase={0.3} anchor={[0, -0.49]} motionScale={0.22} />
      <BotanicalPlane url="/images/botanical/passionfruit-vine.webp" position={[1.22, -0.18, -0.55]} scale={[3.1, 3.1]} opacity={0.3} color="#96936e" phase={1.1} anchor={[0, -0.49]} motionScale={0.2} />
      <BotanicalPlane url="/images/botanical/zinnia-stem.webp" position={[1.34, -0.08, -0.2]} scale={[0.52, 3.45]} opacity={0.4} color="#96936e" phase={4.7} anchor={[0, -0.49]} motionScale={0.24} />
      <BotanicalPlane url={leafRight} position={[-1.02, 1.26, 0.08]} scale={[1.18, 0.74]} rotation={[0.08, -0.3, -0.42]} opacity={0.8} color="#aaa57d" phase={1.8} anchor={[-0.47, -0.2]} motionScale={0.9} />
      <BotanicalPlane url={leafLeft} position={[-1.42, 0.58, -0.02]} scale={[1.08, 0.68]} rotation={[-0.08, 0.38, 0.22]} opacity={0.76} color="#a29f78" phase={2.6} anchor={[0.47, -0.2]} motionScale={0.8} />
      <BotanicalPlane url={leafLowLeft} position={[-0.96, -0.38, 0.12]} scale={[0.92, 0.58]} rotation={[0.12, -0.45, -0.24]} opacity={0.72} color="#97956e" phase={3.1} anchor={[0.47, -0.18]} motionScale={0.72} />
      <BotanicalPlane url={leafRight} position={[0.92, 1.52, 0.22]} scale={[1.22, 0.76]} rotation={[-0.1, 0.4, 0.62]} opacity={0.82} color="#aaa67e" phase={4.4} anchor={[-0.47, -0.2]} motionScale={1} />
      <BotanicalPlane url={leafLeft} position={[1.48, 0.78, 0.14]} scale={[1.34, 0.8]} rotation={[0.14, -0.32, -0.64]} opacity={0.8} color="#9f9c75" phase={5.2} anchor={[0.47, -0.2]} motionScale={0.9} />
      <BotanicalPlane url={leafLowRight} position={[1.16, -0.18, 0.2]} scale={[1.02, 0.62]} rotation={[-0.08, 0.3, 0.38]} opacity={0.74} color="#a4a078" phase={6.1} anchor={[-0.47, -0.22]} motionScale={0.78} />
      <BotanicalPlane url={leafLowLeft} position={[1.8, -0.92, 0.1]} scale={[1.2, 0.7]} rotation={[0.1, -0.38, -0.72]} opacity={0.72} color="#96936d" phase={0.9} anchor={[0.47, -0.2]} motionScale={0.7} />
      <BotanicalPlane url={roundLeaf} position={[-0.35, 2.12, -0.1]} scale={[0.72, 0.72]} rotation={[0.12, -0.28, 0.4]} opacity={0.62} color="#92906a" phase={2.2} anchor={[0, -0.48]} motionScale={0.72} />
      <BotanicalPlane url={roundLeaf} position={[0.54, -1.2, -0.05]} scale={[0.58, 0.58]} rotation={[-0.08, 0.32, -0.2]} opacity={0.58} color="#8c8a65" phase={5.8} anchor={[0, -0.48]} motionScale={0.58} />
      <BotanicalPlane url={leafRight} position={[-1.88, 0.16, -0.12]} scale={[0.72, 0.44]} rotation={[0.04, -0.2, -0.16]} opacity={0.68} color="#9d9a73" phase={1.2} anchor={[-0.47, -0.2]} motionScale={0.86} />
      <BotanicalPlane url={leafLeft} position={[-1.7, -0.78, 0.02]} scale={[0.62, 0.4]} rotation={[0.06, 0.3, 0.18]} opacity={0.64} color="#939168" phase={2.8} anchor={[0.47, -0.2]} motionScale={0.72} />
      <BotanicalPlane url={leafLowRight} position={[2.18, 0.12, -0.08]} scale={[0.78, 0.46]} rotation={[-0.04, -0.28, 0.52]} opacity={0.68} color="#9b9870" phase={3.6} anchor={[-0.47, -0.22]} motionScale={0.9} />
      <BotanicalPlane url={leafLowLeft} position={[2.44, -0.72, -0.16]} scale={[0.64, 0.4]} rotation={[0.04, 0.24, -0.34]} opacity={0.62} color="#8f8d67" phase={4.9} anchor={[0.47, -0.2]} motionScale={0.78} />
      <BotanicalPlane url="/images/botanical/nasturtium-bud.webp" position={[-0.68, -1.18, 0.28]} scale={[0.68, 0.68]} rotation={[0, 0.15, -0.42]} opacity={0.8} color="#a58d66" phase={1.4} anchor={[-0.33, 0.46]} motionScale={0.72} />
    </group>
  );
}

function BotanicalTwigs() {
  const group = useRef<THREE.Group>(null);
  const time = useRef(0);
  const motion = useContext(MotionContext);
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

  useFrame((_, delta) => {
    if (!group.current || motion?.current.reduced) return;
    time.current += Math.min(delta, 0.05);
    const wind = Math.sin(time.current * 0.31) * 0.7 + Math.sin(time.current * 0.17 + 1.4) * 0.3;
    group.current.rotation.z = wind * 0.0035 + (motion?.current.scrollVelocity ?? 0) * 0.006;
    group.current.rotation.x = wind * 0.0018;
  });

  return (
    <group ref={group}>
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
  const time = useRef(0);
  const motion = useContext(MotionContext);
  useFrame((_, delta) => {
    if (!material.current) return;
    if (motion?.current.reduced) return;
    time.current += Math.min(delta, 0.05);
    material.current.uniforms.uTime.value = time.current;
    material.current.uniforms.uOpacity.value =
      0.2 + Math.sin(time.current * 0.24) * 0.008 + (motion?.current.scrollEnergy ?? 0) * 0.025;
  });

  return (
    <mesh position={[0, -0.55, -0.92]} scale={[6.2, 4.7, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={material}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        uniforms={{
          uColor: { value: new THREE.Color("#c99a58") },
          uOpacity: { value: 0.2 },
          uTime: { value: 0 },
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
          uniform float uTime;
          void main() {
            vec2 q = (vUv - vec2(0.5, 0.38)) / vec2(0.48, 0.58);
            float angle = atan(q.y, q.x);
            float warp = sin(angle * 5.0 + uTime * 0.08) * 0.025 + sin(angle * 9.0 - uTime * 0.05) * 0.008;
            float radial = pow(max(0.0, 1.0 - dot(q, q) + warp), 2.35);
            float edge =
              smoothstep(0.0, 0.1, vUv.x) *
              smoothstep(0.0, 0.1, 1.0 - vUv.x) *
              smoothstep(0.0, 0.1, vUv.y) *
              smoothstep(0.0, 0.12, 1.0 - vUv.y);
            float lift = 0.58 + 0.42 * (1.0 - smoothstep(0.52, 0.96, vUv.y));
            float alpha = radial * edge * lift * uOpacity;
            if (alpha < 0.002) discard;
            gl_FragColor = vec4(uColor, alpha);
          }
        `}
      />
    </mesh>
  );
}

const fieldRings = [
  [3.12, 0.5, 0.3], [3.45, 0.62, 0.24], [3.85, 0.78, 0.19], [4.3, 0.94, 0.14], [4.82, 1.08, 0.1], [5.35, 1.24, 0.07],
] as const;

function OrganicPortalRing({
  xRadius,
  yRadius,
  seed,
  tubeRadius,
  color,
  opacity,
  glow = false,
  emissiveIntensity = 0.34,
}: {
  xRadius: number;
  yRadius: number;
  seed: number;
  tubeRadius: number;
  color: string;
  opacity: number;
  glow?: boolean;
  emissiveIntensity?: number;
}) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      organicEllipse(xRadius, yRadius, seed, 0.026, 196, 0.018),
      true,
      "centripetal",
    );
    return new THREE.TubeGeometry(curve, 196, tubeRadius, 8, true);
  }, [seed, tubeRadius, xRadius, yRadius]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      {glow ? (
        <meshBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      ) : (
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity} transparent opacity={opacity} roughness={0.54} metalness={0.3} depthWrite={false} />
      )}
    </mesh>
  );
}

function Portal() {
  const group = useRef<THREE.Group>(null);
  const time = useRef(0);
  const motion = useContext(MotionContext);
  const compact = useThree((state) => state.size.width < 680);
  const voidGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = organicEllipse(2.69, 0.49, 1.7, 0.028, 196);
    shape.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => shape.lineTo(point.x, point.y));
    shape.closePath();
    return new THREE.ShapeGeometry(shape, 4);
  }, []);

  useEffect(() => () => voidGeometry.dispose(), [voidGeometry]);

  useFrame((_, delta) => {
    if (!group.current || motion?.current.reduced) return;
    time.current += Math.min(delta, 0.05);
    const breath = Math.sin(time.current * 0.19);
    group.current.scale.x = 1 + breath * 0.004;
    group.current.scale.y = 1 + Math.sin(time.current * 0.16 + 1.2) * 0.008;
    group.current.rotation.z = Math.sin(time.current * 0.11) * 0.003 + (motion?.current.scrollVelocity ?? 0) * 0.002;
  });

  return (
    <group ref={group} position={[0, -2.1, 0]}>
      <mesh geometry={voidGeometry} position={[0, 0, -0.12]}>
        <meshStandardMaterial color="#020302" roughness={1} metalness={0} />
      </mesh>
      <OrganicPortalRing xRadius={2.84} yRadius={0.54} seed={0.4} tubeRadius={0.19} color="#e7a65e" opacity={0.13} glow />
      <OrganicPortalRing xRadius={2.82} yRadius={0.52} seed={1.1} tubeRadius={0.058} color="#8c704d" opacity={0.7} emissiveIntensity={0.18} />
      <OrganicPortalRing xRadius={2.81} yRadius={0.515} seed={2.2} tubeRadius={0.014} color="#ffe7b8" opacity={0.86} glow />
      <OrganicPortalRing xRadius={2.67} yRadius={0.462} seed={3.4} tubeRadius={0.01} color="#d3a467" opacity={0.7} emissiveIntensity={0.9} />
      <OrganicPortalRing xRadius={2.91} yRadius={0.56} seed={4.1} tubeRadius={0.007} color="#b8884f" opacity={0.46} emissiveIntensity={0.55} />
      {fieldRings.slice(0, compact ? 3 : fieldRings.length).map(([rx, ry, opacity], index) => (
        <Line
          key={rx}
          points={organicArc(rx, ry, rx * 0.17, 0.022, (index * 0.13) % 0.44, 0.69 + (index % 3) * 0.08)}
          color="#9d7846"
          lineWidth={index < 2 ? 0.34 : 0.24}
          transparent
          opacity={opacity * 0.72}
        />
      ))}
      {[0.2, 0.86, 1.58, 2.35, 3.18, 4.02, 5.1].slice(0, compact ? 4 : 7).map((angle) => (
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
      <pointLight position={[0, 0.45, 0.7]} color="#ffd69a" intensity={10} distance={5.4} decay={2} />
      <pointLight position={[0, 1.2, -0.4]} color="#899064" intensity={3.2} distance={4.4} decay={2} />
    </group>
  );
}

function Tomato({ position }: { position: [number, number, number] }) {
  const group = useRef<THREE.Group>(null);
  const time = useRef(0);
  const motion = useContext(MotionContext);
  useFrame((_, delta) => {
    if (!group.current) return;
    if (motion?.current.reduced) return;
    time.current += Math.min(delta, 0.05);
    group.current.rotation.z = Math.sin(time.current * 0.55) * 0.035;
  });

  return (
    <group ref={group} position={position}>
      <mesh scale={[1, 0.92, 0.96]}>
        <sphereGeometry args={[0.19, 32, 32]} />
        <meshPhysicalMaterial color="#b74731" emissive="#5f1d16" emissiveIntensity={0.16} roughness={0.72} clearcoat={0.18} />
      </mesh>
      {[0, 1, 2, 3, 4].map((index) => {
        const angle = (index / 5) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.065, Math.sin(angle) * 0.035, 0.012]} scale={[1, 0.9, 0.94]}>
            <sphereGeometry args={[0.15, 24, 24]} />
            <meshPhysicalMaterial color="#bd4c33" emissive="#632018" emissiveIntensity={0.15} roughness={0.76} clearcoat={0.16} />
          </mesh>
        );
      })}
      {[0, 1, 2, 3, 4].map((index) => (
        <mesh
          key={`leaf-${index}`}
          position={[0, 0.205, 0.04]}
          rotation={[0.18, index * 0.34, (index / 5) * Math.PI * 2]}
          scale={[1, 0.78, 0.5]}
        >
          <coneGeometry args={[0.075, 0.22, 4]} />
          <meshStandardMaterial color="#4f6038" roughness={0.82} />
        </mesh>
      ))}
      <mesh position={[0.01, 0.31, -0.01]} rotation={[0, 0, -0.08]}>
        <cylinderGeometry args={[0.018, 0.026, 0.14, 7]} />
        <meshStandardMaterial color="#55623c" roughness={0.9} />
      </mesh>
    </group>
  );
}

function SignalCore() {
  const core = useRef<THREE.Group>(null);
  const time = useRef(0);
  const motion = useContext(MotionContext);
  useFrame((_, delta) => {
    if (!core.current) return;
    if (motion?.current.reduced) return;
    time.current += Math.min(delta, 0.05);
    core.current.rotation.y = time.current * 0.08;
    core.current.rotation.z = Math.sin(time.current * 0.35) * 0.08;
  });

  return (
    <group ref={core}>
      <mesh>
        <sphereGeometry args={[0.225, 40, 40]} />
        <meshPhysicalMaterial
          color="#9f3427"
          emissive="#ff543b"
          emissiveIntensity={0.42}
          roughness={0.2}
          metalness={0.04}
          clearcoat={1}
          clearcoatRoughness={0.12}
          transmission={0.1}
          transparent
          opacity={0.92}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.13, 32, 32]} />
        <meshBasicMaterial color="#ff6b48" toneMapped={false} />
      </mesh>
      <mesh position={[-0.065, 0.075, 0.17]}>
        <sphereGeometry args={[0.035, 18, 18]} />
        <meshBasicMaterial color="#ffe5c0" transparent opacity={0.78} toneMapped={false} />
      </mesh>
      <mesh scale={1.2}>
        <sphereGeometry args={[0.225, 28, 28]} />
        <meshBasicMaterial color={ORANGE} transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {[0.24, 0.31, 0.4].map((radius, index) => (
        <mesh key={radius} rotation={[index * 0.27, 0.3, Math.PI / 2 + index * 0.31]}>
          <torusGeometry args={[radius, 0.011, 8, 80]} />
          <meshBasicMaterial color={index === 0 ? "#f2b16d" : ORANGE} transparent opacity={0.36 - index * 0.08} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function SeedBud() {
  const bud = useRef<THREE.Group>(null);
  const time = useRef(0);
  const motion = useContext(MotionContext);
  useFrame((_, delta) => {
    if (!bud.current) return;
    if (motion?.current.reduced) return;
    time.current += Math.min(delta, 0.05);
    bud.current.rotation.z = -0.18 + Math.sin(time.current * 0.6) * 0.08;
    bud.current.rotation.y = time.current * 0.16;
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
  const time = useRef(0);
  const motion = useContext(MotionContext);
  useFrame((_, delta) => {
    if (!cube.current) return;
    if (motion?.current.reduced) return;
    time.current += Math.min(delta, 0.05);
    cube.current.rotation.x = 0.48 + time.current * 0.23;
    cube.current.rotation.y = -0.38 + time.current * 0.31;
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
  const time = useRef(0);
  const motion = useContext(MotionContext);
  useFrame((_, delta) => {
    if (!pages.current) return;
    if (motion?.current.reduced) return;
    time.current += Math.min(delta, 0.05);
    pages.current.rotation.y = Math.sin(time.current * 0.35) * 0.22;
    pages.current.rotation.z = -0.1 + Math.sin(time.current * 0.24) * 0.04;
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
  const time = useRef(0);
  const motion = useContext(MotionContext);
  useFrame((_, delta) => {
    if (!blob.current) return;
    if (motion?.current.reduced) return;
    time.current += Math.min(delta, 0.05);
    const phase = time.current;
    blob.current.rotation.x = phase * 0.12;
    blob.current.rotation.y = phase * 0.18;
    blob.current.scale.set(1 + Math.sin(phase * 0.8) * 0.14, 0.88 + Math.sin(phase * 0.62 + 1.4) * 0.13, 1 + Math.cos(phase * 0.7) * 0.1);
  });

  return (
    <mesh ref={blob}>
      <icosahedronGeometry args={[0.36, 4]} />
      <meshPhysicalMaterial color="#d64f37" emissive="#6f1e17" emissiveIntensity={0.26} roughness={0.3} metalness={0.08} clearcoat={0.75} />
    </mesh>
  );
}

const sceneX = [0.515, 0.76, 0.84, 0.69, 0.72, 0.54, 0.55];
const sceneY = [0.265, 0.35, 0.29, 0.23, 0.14, 0.34, 0.16];
const shapeForScene = [0, 1, 2, 3, 4, 5, 0];
const transitionStateSlugs: TransformationSlug[] = [
  "living-core",
  "zinnia",
  "ai-garden",
  "technical-cube",
  "dflow",
  "waveform",
];
const journeyStateScale = [0.16, 0.105, 0.1, 0.1, 0.11, 0.11];

function JourneyActor({ timeline }: { timeline: React.MutableRefObject<Timeline> }) {
  const actor = useRef<THREE.Group>(null);
  const thread = useRef<THREE.Group>(null);
  const flare = useRef<THREE.Mesh>(null);
  const point = useRef<THREE.PointLight>(null);
  const shapeRefs = useRef<Array<THREE.Group | null>>([]);
  const time = useRef(0);
  const { viewport, size } = useThree();

  useFrame((_, delta) => {
    if (!actor.current) return;
    const current = timeline.current;
    if (!current.ready) {
      actor.current.visible = false;
      return;
    }
    actor.current.visible = true;
    const dt = Math.min(delta, 0.05);
    time.current += dt;
    const tops = current.sceneTops.length >= 7 ? current.sceneTops : [0, size.height * 0.55, size.height * 1.9, size.height * 2.8, size.height * 3.7, size.height * 4.6, size.height * 6];
    const compact = size.width < 680;
    const heroHeight = current.sceneHeights[0] || size.height * 0.55;
    const xStops = compact ? [0.74, 0.86, 0.86, 0.86, 0.86, 0.86, 0.76] : sceneX;
    const yStops = [...sceneY];
    if (compact) yStops[0] = 0.49;
    const travelScroll = current.actorScrollY;
    const portalDocumentY = heroHeight;
    const portalCrossScroll = THREE.MathUtils.clamp(heroHeight * 0.38, 190, 240);
    yStops[1] = clamp01((portalDocumentY - portalCrossScroll) / Math.max(size.height, 1));
    const firstCross = (tops[1] || size.height * 0.49) - yStops[1] * size.height;
    // Move in screen space as the form enters the aperture. The old route
    // interpolated a document-space point and then suddenly pinned it to the
    // viewport, which changed velocity at the portal and read as a hitch.
    const introY = THREE.MathUtils.lerp(
      yStops[0],
      yStops[1],
      smoothstep(0, portalCrossScroll, travelScroll),
    );
    const docY = travelScroll + introY * size.height;

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

    const xTops = [...tops];
    xTops[1] = (tops[1] || size.height * 0.49) + Math.min(current.sceneHeights[1] * 0.28 || 280, 320);
    let positionScene = 0;
    for (let index = 1; index < xTops.length; index += 1) {
      if (travelScroll >= xTops[index]) positionScene = index;
      else break;
    }
    positionScene = Math.min(positionScene, xStops.length - 1);
    const nextPositionScene = Math.min(positionScene + 1, xStops.length - 1);
    const positionStart = xTops[positionScene] ?? 0;
    const positionEnd = xTops[nextPositionScene] ?? positionStart + (current.sceneHeights[positionScene] || size.height);
    const positionSegment = positionScene === nextPositionScene
      ? 0
      : positionScene === 0
        ? smoothstep(
            firstCross + Math.min(28, size.height * 0.035),
            xTops[1],
            travelScroll,
          )
        : smoothstep(positionStart, positionEnd, travelScroll);

    let xNorm = THREE.MathUtils.lerp(xStops[positionScene], xStops[nextPositionScene], positionSegment);
    let yNorm = scene === 0 ? introY : THREE.MathUtils.lerp(yStops[scene], yStops[nextScene], segment);
    if (!current.reduced) {
      const routeProgress = scene + segment;
      xNorm += Math.sin(time.current * 0.34 + routeProgress * 0.3) * 0.003 + current.pointerX * 0.008;
      yNorm += Math.sin(time.current * 0.42 + routeProgress * 0.22) * 0.0045 + current.pointerY * 0.004;
    }

    const targetX = (xNorm - 0.5) * viewport.width;
    const targetY = (0.5 - yNorm) * viewport.height;
    actor.current.position.x = targetX;
    actor.current.position.y = targetY;

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

    const journeyHandoff = smoothstep(0, heroHeight * 0.12, travelScroll);
    shapeRefs.current.forEach((shape, index) => {
      if (!shape) return;
      const weight = weights[index] || 0;
      // Preserve a continuous silhouette through a state handoff. Collapsing
      // both forms around the midpoint made every transformation look like a
      // dropped frame even when the route itself was moving smoothly.
      const growth = smoothstep(0.04, 0.96, weight);
      const handoffScale = index === 0 ? journeyHandoff : 1;
      const visibleScale = growth * handoffScale;
      const compactScale = compact ? 0.82 : 1;
      const coreScale = THREE.MathUtils.lerp(
        0.82,
        journeyStateScale[0],
        smoothstep(heroHeight * 0.035, portalCrossScroll * 0.82, travelScroll),
      );
      const stateScale = index === 0 ? coreScale : journeyStateScale[index];
      const targetScale = 0.001 + stateScale * compactScale * visibleScale;
      shape.scale.setScalar(targetScale);
      shape.visible = visibleScale > 0.0005;
    });

    const transitionGlow = 4 * transition * (1 - transition);
    if (flare.current) {
      const pulse = 0.72 + Math.sin(time.current * 1.7) * 0.08 + transitionGlow * 0.55;
      flare.current.scale.setScalar(pulse);
      const material = flare.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.001 + transitionGlow * 0.005;
    }
    if (point.current) point.current.intensity = 0.9 + transitionGlow * 2.5;
    if (thread.current) thread.current.rotation.z = Math.sin(time.current * 0.12) * 0.005;
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
        <Line points={threadPoints} color="#b28a54" lineWidth={0.18} transparent opacity={0.08} />
        <Line points={threadPointsEcho} color="#776c4e" lineWidth={0.12} transparent opacity={0.04} />
        {[-3.1, -1.45, 1.28, 3.3].map((y, index) => (
          <GlassNode key={y} position={[index % 2 ? 0.08 : -0.07, y, -0.62]} size={index % 2 ? 0.024 : 0.017} warm={index === 2} />
        ))}
      </group>
      <group>
        {transitionStateSlugs.map((slug, index) => (
          <group key={slug} scale={0.001} ref={(node) => { shapeRefs.current[index] = node; }}>
            <LivingMachineJourneyState slug={slug} />
          </group>
        ))}
        <mesh ref={flare} position={[0, 0, -0.15]}>
          <sphereGeometry args={[0.32, 20, 20]} />
          <meshBasicMaterial color={ORANGE} transparent opacity={0.001} blending={THREE.AdditiveBlending} depthWrite={false} />
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
    <Suspense fallback={null}>
      <LivingMachineApparatus activeSlug="living-core" heroComposition />
    </Suspense>
  );
}

function WorldRig({ timeline }: { timeline: React.MutableRefObject<Timeline> }) {
  const assembly = useRef<THREE.Group>(null);
  const livingLayer = useRef<THREE.Group>(null);
  const baseY = useRef<number | null>(null);
  const time = useRef(0);
  const { viewport, size } = useThree();

  useFrame((_, delta) => {
    if (!assembly.current) return;
    const dt = Math.min(delta, 0.05);
    time.current += dt;
    const compact = size.width < 680;
    const scaleFactor = compact ? 0.0688 : 0.0912;
    const scale = viewport.height * scaleFactor;
    const scaleInPixels = size.height * scaleFactor;
    const pageOffset = timeline.current.scrollY * (viewport.height / Math.max(size.height, 1));
    const targetX = ((compact ? 0.57 : 0.64) - 0.5) * viewport.width;
    const heroHeight = timeline.current.sceneHeights[0] || size.height * 0.55;
    const portalBoundaryGap = compact ? 24 : 20;
    const portalBottomScreenY = Math.min(size.height - portalBoundaryGap, heroHeight - portalBoundaryGap);
    // The lowest projected portal edge sits about 2.46 local units below the
    // apparatus origin. Register that edge, rather than the portal center, so
    // the complete glow remains inside the black hero at every viewport size.
    const apparatusOriginScreenY = portalBottomScreenY - 2.46 * scaleInPixels;
    const baseTargetY = (0.5 - apparatusOriginScreenY / Math.max(size.height, 1)) * viewport.height;
    baseY.current = baseY.current === null
      ? baseTargetY
      : THREE.MathUtils.damp(baseY.current, baseTargetY, 12, dt);

    assembly.current.scale.setScalar(scale);
    assembly.current.position.x = targetX;
    assembly.current.position.y = baseY.current + pageOffset;

    if (livingLayer.current) {
      const reduced = timeline.current.reduced;
      const pointerX = reduced ? 0 : timeline.current.pointerX;
      const pointerY = reduced ? 0 : timeline.current.pointerY;
      const breath = reduced ? 0 : Math.sin(time.current * 0.21) * 0.012;
      livingLayer.current.position.x = THREE.MathUtils.damp(livingLayer.current.position.x, pointerX * 0.025, 4.5, dt);
      livingLayer.current.position.y = THREE.MathUtils.damp(livingLayer.current.position.y, breath, 3.2, dt);
      livingLayer.current.rotation.x = THREE.MathUtils.damp(livingLayer.current.rotation.x, pointerY * 0.004, 4, dt);
      livingLayer.current.rotation.y = THREE.MathUtils.damp(livingLayer.current.rotation.y, pointerX * 0.008, 4, dt);
      livingLayer.current.rotation.z = THREE.MathUtils.damp(
        livingLayer.current.rotation.z,
        (reduced ? 0 : timeline.current.scrollVelocity * 0.0025),
        4,
        dt,
      );
    }
  });

  return <group ref={assembly}><group ref={livingLayer}><HeroAssembly /></group></group>;
}

function ContactPlanetOrbit({ timeline }: { timeline: React.MutableRefObject<Timeline> }) {
  const root = useRef<THREE.Group>(null);
  const planet = useRef<THREE.Group>(null);
  const phase = useRef(THREE.MathUtils.degToRad(235));
  const { viewport, size } = useThree();
  const xRadius = viewport.width * 0.4;
  // Keep the contact orbit visibly elliptical in portrait layouts. A pure
  // viewport-height radius becomes taller than it is wide on phones/tablets.
  const yRadius = Math.min(viewport.height * 0.28, xRadius * 0.58);
  const orbitPosition = useCallback((angle: number): [number, number, number] => {
    const ellipseX = Math.cos(angle) * xRadius;
    const ellipseY = Math.sin(angle) * yRadius;
    const tiltCosine = Math.cos(0.05);
    const tiltSine = Math.sin(0.05);
    return [
      ellipseX * tiltCosine - ellipseY * tiltSine,
      ellipseX * tiltSine + ellipseY * tiltCosine,
      -0.32 + Math.sin(angle) * 0.21,
    ];
  }, [xRadius, yRadius]);
  const initialPosition = useMemo(
    () => orbitPosition(THREE.MathUtils.degToRad(235)),
    [orbitPosition],
  );
  const { points, colors } = useMemo(() => {
    const orbitPoints: [number, number, number][] = [];
    const orbitColors: [number, number, number, number][] = [];
    const warm = new THREE.Color("#b76f43");
    const dim = new THREE.Color("#6c432d");
    const segments = 180;

    for (let index = 0; index <= segments; index += 1) {
      const angle = (index / segments) * Math.PI * 2;
      const cameraFacing = (Math.sin(angle) + 1) * 0.5;
      const color = dim.clone().lerp(warm, cameraFacing);
      orbitPoints.push(orbitPosition(angle));
      orbitColors.push([color.r, color.g, color.b, 0.25 + cameraFacing * 0.34]);
    }
    return { points: orbitPoints, colors: orbitColors };
  }, [orbitPosition]);

  useFrame((_, delta) => {
    if (!root.current || !planet.current) return;
    const current = timeline.current;
    const contactTop = current.sceneTops[6];
    const contactHeight = current.sceneHeights[6] || size.height;
    if (!current.ready || contactTop === undefined) {
      root.current.visible = false;
      return;
    }

    const centerScreenY = contactTop + contactHeight * 0.48 - current.scrollY;
    root.current.visible = centerScreenY > -size.height * 0.7 && centerScreenY < size.height * 1.7;
    root.current.position.set(
      0,
      (0.5 - centerScreenY / Math.max(size.height, 1)) * viewport.height,
      -0.42,
    );

    if (!current.reduced) {
      phase.current -= Math.min(delta, 0.05) * (Math.PI * 2 / 138);
    }
    planet.current.position.set(...orbitPosition(phase.current));
  });

  return (
    <group ref={root} visible={false}>
      <Line
        points={points}
        vertexColors={colors}
        lineWidth={0.84}
        opacity={0.9}
        depthWrite={false}
        toneMapped={false}
      />
      <group ref={planet} position={initialPosition} scale={size.width < 680 ? 0.26 : 0.34}>
        <LivingMachineContactPlanet />
      </group>
    </group>
  );
}

function RenderPolicy({ registerInvalidate }: { registerInvalidate: (invalidate?: () => void) => void }) {
  const invalidate = useThree((state) => state.invalidate);
  const setDpr = useThree((state) => state.setDpr);
  const setFrameloop = useThree((state) => state.setFrameloop);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    registerInvalidate(invalidate);
    const apply = () => {
      setDpr(window.innerWidth < 680 ? 1 : Math.min(window.devicePixelRatio || 1, 1.2));
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
      registerInvalidate(undefined);
      reduced.removeEventListener("change", apply);
      window.removeEventListener("scroll", requestFrame);
      window.removeEventListener("resize", apply);
      document.removeEventListener("visibilitychange", apply);
    };
  }, [invalidate, registerInvalidate, setDpr, setFrameloop]);

  return null;
}

export default function ScrollWorld() {
  const timeline = useRef<Timeline>({
    scrollY: 0,
    visualScrollY: 0,
    actorScrollY: 0,
    previousScrollY: 0,
    scrollVelocity: 0,
    scrollEnergy: 0,
    ready: false,
    pointerX: 0,
    pointerY: 0,
    pointerTargetX: 0,
    pointerTargetY: 0,
    reduced: false,
    sceneTops: [],
    sceneHeights: [],
  });

  const advanceMotion = useCallback((delta: number, viewportHeight: number) => {
    const current = timeline.current;
    const dt = THREE.MathUtils.clamp(delta, 1 / 240, 0.05);
    const frameScroll = current.scrollY - current.previousScrollY;
    current.previousScrollY = current.scrollY;

    if (current.reduced) {
      current.visualScrollY = current.scrollY;
      current.actorScrollY = current.scrollY;
      current.scrollVelocity = 0;
      current.scrollEnergy = 0;
      current.pointerX = 0;
      current.pointerY = 0;
      return;
    }

    const pixelsPerSecond = frameScroll / dt;
    const velocityTarget = THREE.MathUtils.clamp(
      pixelsPerSecond / Math.max(viewportHeight * 3.2, 1),
      -1,
      1,
    );
    current.scrollVelocity = THREE.MathUtils.damp(
      current.scrollVelocity,
      velocityTarget,
      frameScroll === 0 ? 5.2 : 10,
      dt,
    );
    current.scrollEnergy = THREE.MathUtils.damp(
      current.scrollEnergy,
      Math.min(Math.abs(velocityTarget), 1),
      frameScroll === 0 ? 3.4 : 8,
      dt,
    );

    const heroHeight = current.sceneHeights[0] || viewportHeight * 0.55;
    // One monotonic scroll clock now drives both the route and state changes.
    // Previously the raw and spring-smoothed clocks were blended together;
    // their changing offset produced visible catches during trackpad bursts.
    const followRate = THREE.MathUtils.lerp(
      13,
      8.5,
      smoothstep(heroHeight * 0.7, heroHeight * 1.8, current.scrollY),
    );
    current.visualScrollY = THREE.MathUtils.damp(
      current.visualScrollY,
      current.scrollY,
      followRate,
      dt,
    );
    current.actorScrollY = current.visualScrollY;
    current.pointerX = THREE.MathUtils.damp(current.pointerX, current.pointerTargetX, 5.2, dt);
    current.pointerY = THREE.MathUtils.damp(current.pointerY, current.pointerTargetY, 5.2, dt);
  }, []);

  const registerInvalidate = useCallback((invalidate?: () => void) => {
    timeline.current.invalidate = invalidate;
  }, []);

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    timeline.current.reduced = reduced.matches;

    let layoutFrame = 0;
    let restorationFrame = 0;
    let cancelled = false;
    let userHasInteracted = false;
    let compactLayout = window.innerWidth < 680;
    let maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - document.documentElement.clientHeight,
    );

    const updateMaxScroll = () => {
      maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - document.documentElement.clientHeight,
      );
    };
    const handleScroll = () => {
      timeline.current.scrollY = THREE.MathUtils.clamp(window.scrollY, 0, maxScroll);
    };
    const snapMotionToScroll = () => {
      const current = timeline.current;
      current.visualScrollY = current.scrollY;
      current.actorScrollY = current.scrollY;
      current.previousScrollY = current.scrollY;
      current.scrollVelocity = 0;
      current.scrollEnergy = 0;
    };
    const commitSceneMeasure = () => {
      const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
      timeline.current.sceneTops = scenes.map((section) => section.getBoundingClientRect().top + window.scrollY);
      timeline.current.sceneHeights = scenes.map((section) => section.getBoundingClientRect().height);
      updateMaxScroll();
      handleScroll();
      timeline.current.ready = scenes.length >= 7;
      timeline.current.invalidate?.();
    };
    const measureScenes = () => {
      cancelAnimationFrame(layoutFrame);
      layoutFrame = requestAnimationFrame(commitSceneMeasure);
    };
    const handlePointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || timeline.current.reduced) return;
      timeline.current.pointerTargetX = event.clientX / Math.max(window.innerWidth, 1) - 0.5;
      timeline.current.pointerTargetY = event.clientY / Math.max(window.innerHeight, 1) - 0.5;
    };
    const resetPointer = () => {
      timeline.current.pointerTargetX = 0;
      timeline.current.pointerTargetY = 0;
    };
    const handleReduced = (event: MediaQueryListEvent) => {
      timeline.current.reduced = event.matches;
      if (event.matches) snapMotionToScroll();
      timeline.current.invalidate?.();
    };
    const handleResize = () => {
      const nextCompactLayout = window.innerWidth < 680;
      updateMaxScroll();
      handleScroll();
      if (nextCompactLayout !== compactLayout) {
        compactLayout = nextCompactLayout;
        snapMotionToScroll();
      }
      measureScenes();
      timeline.current.invalidate?.();
    };
    const markUserInteraction = () => { userHasInteracted = true; };
    const syncRestoredScroll = () => {
      if (userHasInteracted) return;
      updateMaxScroll();
      handleScroll();
      snapMotionToScroll();
      timeline.current.invalidate?.();
    };

    updateMaxScroll();
    handleScroll();
    snapMotionToScroll();
    commitSceneMeasure();
    document.fonts?.ready.then(() => {
      if (cancelled) return;
      commitSceneMeasure();
      if (!userHasInteracted) snapMotionToScroll();
    });
    const observer = new ResizeObserver(measureScenes);
    document.querySelectorAll<HTMLElement>("[data-scene]").forEach((scene) => observer.observe(scene));
    restorationFrame = requestAnimationFrame(() => {
      restorationFrame = requestAnimationFrame(syncRestoredScroll);
    });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointer, { passive: true });
    window.addEventListener("pointerdown", markUserInteraction, { passive: true });
    window.addEventListener("touchstart", markUserInteraction, { passive: true });
    window.addEventListener("wheel", markUserInteraction, { passive: true });
    window.addEventListener("keydown", markUserInteraction);
    window.addEventListener("blur", resetPointer);
    window.addEventListener("pageshow", syncRestoredScroll);
    window.addEventListener("resize", handleResize, { passive: true });
    document.documentElement.addEventListener("pointerleave", resetPointer);
    reduced.addEventListener("change", handleReduced);
    return () => {
      cancelled = true;
      cancelAnimationFrame(layoutFrame);
      cancelAnimationFrame(restorationFrame);
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("pointerdown", markUserInteraction);
      window.removeEventListener("touchstart", markUserInteraction);
      window.removeEventListener("wheel", markUserInteraction);
      window.removeEventListener("keydown", markUserInteraction);
      window.removeEventListener("blur", resetPointer);
      window.removeEventListener("pageshow", syncRestoredScroll);
      window.removeEventListener("resize", handleResize);
      document.documentElement.removeEventListener("pointerleave", resetPointer);
      reduced.removeEventListener("change", handleReduced);
    };
  }, []);

  return (
    <div className="scroll-world" aria-hidden="true">
      <SectionProgressRail />
      <Canvas
        camera={{ position: [0, 0, 8.6], fov: 40 }}
        dpr={[1, 1.2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.26} color="#817967" />
        <directionalLight position={[5, 8, 7]} intensity={3.1} color="#e7c99f" />
        <directionalLight position={[-5, 1, 3]} intensity={0.95} color="#66745e" />
        <Suspense fallback={null}>
          <Environment resolution={128}>
            <Lightformer form="rect" intensity={2.05} color="#d9ad74" position={[4, 4, 7]} rotation={[0, Math.PI, 0]} scale={[3, 8, 1]} />
            <Lightformer form="rect" intensity={0.92} color="#68725f" position={[-5, 1, 4]} rotation={[0, -0.6, 0]} scale={[2, 6, 1]} />
            <Lightformer form="ring" intensity={1.25} color="#8f4b31" position={[0, -5, 2]} rotation={[Math.PI / 2, 0, 0]} scale={6} />
          </Environment>
        </Suspense>
        <MotionContext.Provider value={timeline}>
          <RenderPolicy registerInvalidate={registerInvalidate} />
          <MotionEngine advance={advanceMotion} />
          <WorldRig timeline={timeline} />
          <Suspense fallback={null}>
            <ContactPlanetOrbit timeline={timeline} />
          </Suspense>
          {SHOW_JOURNEY_FORMS && <Suspense fallback={null}>
            <JourneyActor timeline={timeline} />
          </Suspense>}
        </MotionContext.Provider>
      </Canvas>
    </div>
  );
}
