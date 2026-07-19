"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Edges, Environment, Lightformer, Line, RoundedBox, useTexture } from "@react-three/drei";
import { Suspense, type Ref, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { StudySlug, TransformationSlug } from "@/app/studies/study-data";

const PERSIMMON = "#ff6544";
const BRASS = "#765536";
const BRASS_LIGHT = "#9b7447";

const surfaceHash = (x: number, y: number, seed: number) => {
  const value = Math.sin(x * 12.9898 + y * 78.233 + seed * 41.37) * 43758.5453;
  return value - Math.floor(value);
};

function makeAgedSurface(seed: number) {
  const size = 160;
  const colorData = new Uint8Array(size * size * 4);
  const variationData = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = (y * size + x) * 4;
      const grain = surfaceHash(x, y, seed);
      const broad = Math.sin(x * 0.083 + seed) * Math.cos(y * 0.061 - seed * 0.7) * 0.5 + 0.5;
      const mottling = Math.sin((x + y) * 0.18 + seed * 2.1) * 0.5 + 0.5;
      const pit = grain > 0.972 ? 0.34 : 1;
      const scratch = surfaceHash(Math.floor(x / 18), y, seed + 17) > 0.987 ? 0.58 : 1;
      const oxidation = broad > 0.72 && mottling > 0.56 ? 0.68 : 1;
      const brightness = THREE.MathUtils.clamp((0.72 + broad * 0.22 + grain * 0.08) * pit * scratch, 0.28, 1);

      colorData[offset] = Math.round(238 * brightness * oxidation);
      colorData[offset + 1] = Math.round(225 * brightness * (oxidation < 1 ? 0.84 : 1));
      colorData[offset + 2] = Math.round(196 * brightness * (oxidation < 1 ? 0.7 : 1));
      colorData[offset + 3] = 255;

      const roughness = THREE.MathUtils.clamp(0.48 + (1 - broad) * 0.36 + (1 - pit) * 0.22 + grain * 0.12, 0, 1);
      const roughnessByte = Math.round(roughness * 255);
      variationData[offset] = roughnessByte;
      variationData[offset + 1] = roughnessByte;
      variationData[offset + 2] = roughnessByte;
      variationData[offset + 3] = 255;
    }
  }

  const color = new THREE.DataTexture(colorData, size, size, THREE.RGBAFormat);
  color.colorSpace = THREE.SRGBColorSpace;
  color.wrapS = color.wrapT = THREE.RepeatWrapping;
  color.repeat.set(3.5, 3.5);
  color.needsUpdate = true;

  const variation = new THREE.DataTexture(variationData, size, size, THREE.RGBAFormat);
  variation.wrapS = variation.wrapT = THREE.RepeatWrapping;
  variation.repeat.set(3.5, 3.5);
  variation.needsUpdate = true;

  return { color, variation };
}

const agedSurfaces = [makeAgedSurface(2.7), makeAgedSurface(8.3), makeAgedSurface(14.9), makeAgedSurface(21.4)];

function AgedMetalMaterial({
  color = BRASS,
  variant = 0,
  opacity = 1,
  metalness = 0.58,
  roughness = 0.82,
  emissive = "#000000",
  emissiveIntensity = 0,
  side = THREE.FrontSide,
}: {
  color?: string;
  variant?: number;
  opacity?: number;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  side?: THREE.Side;
}) {
  const surface = agedSurfaces[Math.abs(variant) % agedSurfaces.length];
  return (
    <meshStandardMaterial
      color={color}
      map={surface.color}
      roughnessMap={surface.variation}
      bumpMap={surface.variation}
      bumpScale={0.025}
      metalness={metalness}
      roughness={roughness}
      envMapIntensity={0.62}
      transparent={opacity < 1}
      opacity={opacity}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      side={side}
    />
  );
}

function TubeCurve({
  points,
  radius = 0.04,
  color = BRASS,
  metalness = 0.72,
  roughness = 0.34,
  opacity = 1,
}: {
  points: THREE.Vector3[];
  radius?: number;
  color?: string;
  metalness?: number;
  roughness?: number;
  opacity?: number;
}) {
  const geometry = useMemo(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 96, radius, 12, false),
    [points, radius],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      <AgedMetalMaterial
        color={color}
        metalness={metalness}
        roughness={Math.max(roughness, 0.56)}
        opacity={opacity}
      />
    </mesh>
  );
}

function ClosedTube({
  points,
  radius = 0.025,
  color = BRASS_LIGHT,
  opacity = 1,
  emissive = "#000000",
  emissiveIntensity = 0,
}: {
  points: THREE.Vector3[];
  radius?: number;
  color?: string;
  opacity?: number;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  const geometry = useMemo(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true, "centripetal"), 128, radius, 10, true),
    [points, radius],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      <AgedMetalMaterial
        color={color}
        metalness={0.58}
        roughness={0.7}
        opacity={opacity}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
}

function GlassTubeCurve({
  points,
  radius,
  opacity = 0.5,
}: {
  points: THREE.Vector3[];
  radius: number;
  opacity?: number;
}) {
  const surface = agedSurfaces[1];
  const geometry = useMemo(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 160, radius, 24, false),
    [points, radius],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial
        color="#3d3027"
        metalness={0.04}
        roughness={0.2}
        roughnessMap={surface.variation}
        bumpMap={surface.variation}
        bumpScale={0.008}
        transmission={0.52}
        thickness={0.92}
        ior={1.5}
        transparent
        opacity={opacity}
        clearcoat={1}
        clearcoatRoughness={0.2}
        attenuationColor="#71452f"
        attenuationDistance={1.5}
        envMapIntensity={0.7}
        depthWrite={false}
      />
    </mesh>
  );
}

function CurveCollar({
  points,
  t,
  radius,
  tube = 0.045,
}: {
  points: THREE.Vector3[];
  t: number;
  radius: number;
  tube?: number;
}) {
  const transform = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points);
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
    return { point, quaternion };
  }, [points, t]);

  return (
    <group position={transform.point} quaternion={transform.quaternion}>
      <mesh>
        <torusGeometry args={[radius, tube, 12, 72]} />
        <AgedMetalMaterial variant={1} />
      </mesh>
      <mesh position={[0, 0, tube * 0.65]}>
        <torusGeometry args={[radius * 0.84, tube * 0.22, 8, 64]} />
        <AgedMetalMaterial color="#a17b4c" variant={3} roughness={0.62} />
      </mesh>
    </group>
  );
}

function OrbitTube({
  xRadius,
  yRadius,
  rotation,
  position = [0, 0, 0],
}: {
  xRadius: number;
  yRadius: number;
  rotation: [number, number, number];
  position?: [number, number, number];
}) {
  const points = useMemo(
    () => Array.from({ length: 128 }, (_, index) => {
      const angle = (index / 128) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle) * xRadius, Math.sin(angle) * yRadius, Math.sin(angle * 2) * 0.04);
    }),
    [xRadius, yRadius],
  );
  return <group position={position} rotation={rotation}><ClosedTube points={points} radius={0.024} opacity={0.92} /></group>;
}

function PartialOrbit({
  xRadius = 2.05,
  yRadius = 1.65,
}: {
  xRadius?: number;
  yRadius?: number;
}) {
  const points = useMemo(
    () => Array.from({ length: 72 }, (_, index) => {
      const progress = index / 71;
      const angle = -Math.PI * 0.88 + progress * Math.PI * 1.45;
      return new THREE.Vector3(
        Math.cos(angle) * xRadius,
        Math.sin(angle) * yRadius,
        Math.sin(angle * 1.6) * 0.14,
      );
    }),
    [xRadius, yRadius],
  );
  const geometry = useMemo(
    () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 96, 0.018, 8, false),
    [points],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        color="#cf7645"
        transparent
        opacity={0.42}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function GlassMaterial({ opacity = 0.62 }: { opacity?: number }) {
  const surface = agedSurfaces[2];
  return (
    <meshPhysicalMaterial
      color="#33281e"
      metalness={0.04}
      roughness={0.22}
      roughnessMap={surface.variation}
      bumpMap={surface.variation}
      bumpScale={0.006}
      transmission={0.62}
      thickness={1.08}
      ior={1.5}
      transparent
      opacity={opacity}
      clearcoat={1}
      clearcoatRoughness={0.2}
      attenuationColor="#7b4d31"
      attenuationDistance={2.2}
      envMapIntensity={0.72}
      depthWrite={false}
    />
  );
}

function useTransitionHousingGeometry() {
  const geometry = useMemo(() => {
    const housing = new THREE.Shape();
    housing.absarc(0, 0, 0.47, 0, Math.PI * 2, false);
    const opening = new THREE.Path();
    opening.absarc(0, 0, 0.285, 0, Math.PI * 2, true);
    housing.holes.push(opening);
    const result = new THREE.ExtrudeGeometry(housing, {
      depth: 0.18,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.025,
      bevelThickness: 0.025,
      curveSegments: 64,
    });
    result.translate(0, 0, -0.09);
    return result;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

function TransitionAperture({ rotationSpeed = 0.22 }: { rotationSpeed?: number } = {}) {
  const housing = useTransitionHousingGeometry();
  const axialRef = useRef<THREE.Group>(null);
  const motionTimeRef = useRef(0);

  useFrame((_, delta) => {
    motionTimeRef.current += Math.min(delta, 0.05);
    if (axialRef.current) {
      axialRef.current.rotation.x = (motionTimeRef.current * rotationSpeed) % (Math.PI * 2);
      axialRef.current.rotation.z = 0;
    }
  });

  return (
    <group rotation={[0.11, -0.22, -0.025]}>
      <group ref={axialRef}>
        <mesh geometry={housing}>
          <AgedMetalMaterial color="#735139" variant={1} roughness={0.78} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, -0.005]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.267, 0.267, 0.14, 96, 1, false]} />
          <meshPhysicalMaterial
            color="#120b08"
            roughnessMap={agedSurfaces[2].variation}
            bumpMap={agedSurfaces[2].variation}
            bumpScale={0.006}
            transmission={0.12}
            thickness={0.48}
            roughness={0.52}
            transparent
            opacity={0.82}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0, 0.078]}>
          <circleGeometry args={[0.267, 96]} />
          <GlassMaterial opacity={0.2} />
        </mesh>
        <mesh position={[0, 0, -0.078]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[0.267, 96]} />
          <GlassMaterial opacity={0.17} />
        </mesh>
        {[1, -1].map((face) => (
          <group key={face} position={[0, 0, face * 0.115]} rotation={[0, face < 0 ? Math.PI : 0, 0]}>
            <mesh>
              <torusGeometry args={[0.34, 0.021, 10, 96]} />
              <AgedMetalMaterial color="#9b6b45" variant={face > 0 ? 3 : 1} roughness={0.66} />
            </mesh>
            <mesh position={[0, 0, 0.01]}>
              <ringGeometry args={[0.238, 0.312, 112]} />
              <meshBasicMaterial
                color="#ff8244"
                transparent
                opacity={face > 0 ? 0.62 : 0.42}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}
        {[-1, 1].map((direction) => (
          <mesh key={direction} position={[direction * 0.47, 0, 0.015]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.09, 18]} />
            <AgedMetalMaterial color="#5f4532" variant={direction > 0 ? 2 : 0} roughness={0.86} />
          </mesh>
        ))}
        <pointLight position={[0, 0, 0.18]} color="#ff6c32" intensity={3.8} distance={3.2} decay={2} />
      </group>
    </group>
  );
}

function Nucleus({
  scale = 1,
  minimal = false,
  apertureRotationSpeed,
}: {
  scale?: number;
  minimal?: boolean;
  apertureRotationSpeed?: number;
}) {
  const spokes = useMemo(
    () => Array.from({ length: 16 }, (_, index) => {
      const angle = (index / 16) * Math.PI * 2;
      return [
        new THREE.Vector3(Math.cos(angle) * 0.2, Math.sin(angle) * 0.2, 0.43),
        new THREE.Vector3(Math.cos(angle) * 0.78, Math.sin(angle) * 0.78, 0.43),
      ];
    }),
    [],
  );
  if (minimal) {
    return <group scale={scale}><TransitionAperture rotationSpeed={apertureRotationSpeed} /></group>;
  }
  return (
    <group scale={scale}>
      <mesh>
        <sphereGeometry args={[0.4, 64, 48]} />
        <meshPhysicalMaterial
          color="#ad3519"
          map={agedSurfaces[0].color}
          emissive="#7f1d0c"
          emissiveIntensity={0.3}
          roughness={0.58}
          roughnessMap={agedSurfaces[0].variation}
          bumpMap={agedSurfaces[0].variation}
          bumpScale={0.022}
          metalness={0.04}
          transmission={0.08}
          thickness={0.5}
          clearcoat={0.24}
          clearcoatRoughness={0.66}
          envMapIntensity={0.58}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.14, 32, 24]} />
        <meshBasicMaterial color="#ffb766" toneMapped={false} />
      </mesh>
      <mesh scale={1.72}>
        <sphereGeometry args={[0.43, 40, 28]} />
        <GlassMaterial opacity={0.24} />
      </mesh>
      <>
        {[0.52, 0.66, 0.8].map((radius, index) => (
          <mesh key={radius} position={[0, 0, 0.43]}>
            <torusGeometry args={[radius, index === 2 ? 0.025 : 0.014, 10, 96]} />
            <AgedMetalMaterial color={index === 2 ? BRASS_LIGHT : "#9a5837"} variant={index} roughness={0.7} />
          </mesh>
        ))}
        {spokes.map((points, index) => (
          <TubeCurve key={index} points={points} radius={index % 4 === 0 ? 0.014 : 0.008} color="#d59759" metalness={0.76} roughness={0.28} />
        ))}
      </>
      <pointLight color={PERSIMMON} intensity={7} distance={5.5} decay={2} />
    </group>
  );
}

function LeafCard({
  url,
  position,
  rotation,
  scale,
}: {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number];
}) {
  const source = useTexture(url);
  const texture = useMemo(() => {
    const copy = source.clone();
    copy.colorSpace = THREE.SRGBColorSpace;
    copy.anisotropy = 8;
    copy.needsUpdate = true;
    return copy;
  }, [source]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={position} rotation={rotation} scale={[scale[0], scale[1], 1]}>
      <planeGeometry args={[1, 1, 4, 4]} />
      <meshStandardMaterial
        map={texture}
        color="#b4ad82"
        transparent
        alphaTest={0.05}
        side={THREE.DoubleSide}
        roughness={0.58}
        metalness={0.08}
      />
    </mesh>
  );
}

function PortalAuraRing({
  radius,
  y,
  tube,
  opacity,
}: {
  radius: number;
  y: number;
  tube: number;
  opacity: number;
}) {
  const geometry = useMemo(() => {
    const points = Array.from({ length: 160 }, (_, index) => {
      const angle = (index / 160) * Math.PI * 2;
      const ripple = Math.sin(angle * 6 + y * 4) * 0.01 + Math.sin(angle * 13) * 0.004;
      return new THREE.Vector3(
        Math.cos(angle) * (radius + ripple),
        y + Math.sin(angle * 5) * 0.006,
        Math.sin(angle) * (radius + ripple),
      );
    });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true, "centripetal"), 160, tube, 8, true);
  }, [radius, tube, y]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        color="#ff9a58"
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function PortalLightBeam() {
  return (
    <mesh position={[0, 0.64, 0]}>
      <cylinderGeometry args={[1.28, 2.02, 2.7, 96, 1, true]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        vertexShader={`
          varying float vHeight;
          varying vec3 vViewNormal;
          varying vec3 vViewDirection;

          void main() {
            vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
            vHeight = clamp((position.y + 1.35) / 2.7, 0.0, 1.0);
            vViewNormal = normalize(normalMatrix * normal);
            vViewDirection = normalize(-viewPosition.xyz);
            gl_Position = projectionMatrix * viewPosition;
          }
        `}
        fragmentShader={`
          varying float vHeight;
          varying vec3 vViewNormal;
          varying vec3 vViewDirection;

          float grain(vec2 coordinate) {
            return fract(sin(dot(coordinate, vec2(12.9898, 78.233))) * 43758.5453);
          }

          void main() {
            float verticalFade = pow(1.0 - smoothstep(0.0, 1.0, vHeight), 1.55);
            float portalBloom = 1.0 - smoothstep(0.0, 0.24, vHeight);
            float edgeFeather = pow(clamp(abs(dot(vViewNormal, vViewDirection)), 0.0, 1.0), 0.82);
            float dither = mix(0.93, 1.07, grain(gl_FragCoord.xy));
            float alpha = (verticalFade * 0.058 + portalBloom * 0.035) * edgeFeather * dither;
            vec3 lowerColor = vec3(0.94, 0.31, 0.11);
            vec3 upperColor = vec3(0.48, 0.20, 0.09);
            vec3 color = mix(lowerColor, upperColor, smoothstep(0.0, 0.82, vHeight));

            if (alpha < 0.001) discard;
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
}

function PortalGroundGlow({ radius = 3.12 }: { radius?: number }) {
  return (
    <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 128]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        side={THREE.DoubleSide}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          void main() {
            vec2 point = (vUv - 0.5) * 2.0;
            float radius = length(point);
            float core = exp(-radius * radius * 5.2) * 0.14;
            float halo = exp(-pow((radius - 0.68) * 4.8, 2.0)) * 0.22;
            float edge = 1.0 - smoothstep(0.86, 1.0, radius);
            float alpha = (core + halo) * edge;
            vec3 ember = vec3(1.0, 0.25, 0.07);
            vec3 amber = vec3(1.0, 0.62, 0.25);
            vec3 color = mix(ember, amber, halo * 1.35 + core * 0.7);

            if (alpha < 0.002) discard;
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
}

function PortalStudy({
  reduced = false,
  aura = false,
  hideShaft = false,
  heroComposition = false,
}: {
  reduced?: boolean;
  aura?: boolean;
  hideShaft?: boolean;
  heroComposition?: boolean;
} = {}) {
  const ringSpecs = useMemo(
    () => (reduced ? (heroComposition ? [
      { radius: 2.18, tube: 0.05, y: -0.03 },
    ] : [
      { radius: 2.14, tube: 0.05, y: -0.02 },
      { radius: 2.52, tube: 0.025, y: -0.1 },
      { radius: 3.08, tube: 0.014, y: -0.2 },
    ]) : [
      { radius: 2.08, tube: 0.035, y: -0.04 },
      { radius: 2.24, tube: 0.072, y: 0.01 },
      { radius: 2.42, tube: 0.024, y: -0.06 },
      { radius: 2.68, tube: 0.032, y: -0.12 },
      { radius: 3.02, tube: 0.019, y: -0.18 },
      { radius: 3.42, tube: 0.014, y: -0.24 },
    ]).map((spec, ringIndex) => ({
      ...spec,
      points: Array.from({ length: 160 }, (_, index) => {
        const angle = (index / 160) * Math.PI * 2;
        const irregularity = Math.sin(angle * 5 + ringIndex * 1.7) * 0.012 + Math.sin(angle * 11 - ringIndex) * 0.005;
        return new THREE.Vector3(
          Math.cos(angle) * (spec.radius + irregularity),
          spec.y + Math.sin(angle * 3 + ringIndex) * 0.009,
          Math.sin(angle) * (spec.radius + irregularity),
        );
      }),
    })),
    [heroComposition, reduced],
  );
  const depthRings = useMemo(
    () => [
      { radius: 1.94, tube: 0.035, y: -0.24 },
      { radius: 1.72, tube: 0.026, y: -0.54 },
      { radius: 1.52, tube: 0.022, y: -0.82 },
      { radius: 1.34, tube: 0.018, y: -1.08 },
      { radius: 1.2, tube: 0.014, y: -1.3 },
    ].map((spec, ringIndex) => ({
      ...spec,
      points: Array.from({ length: 128 }, (_, index) => {
        const angle = (index / 128) * Math.PI * 2;
        const irregularity = Math.sin(angle * 7 + ringIndex * 1.3) * 0.008;
        return new THREE.Vector3(
          Math.cos(angle) * (spec.radius + irregularity),
          spec.y + Math.sin(angle * 4 + ringIndex) * 0.006,
          Math.sin(angle) * (spec.radius + irregularity),
        );
      }),
    })),
    [],
  );
  return (
    <group position={[0, 0.18, 0]} scale={0.92}>
      {heroComposition && <PortalGroundGlow radius={3.68} />}
      <mesh position={[0, heroComposition ? -0.17 : -0.68, 0]}>
        <cylinderGeometry
          args={heroComposition ? [2.18, 2.02, 0.28, 128, 1, true] : [2.18, 1.14, 1.5, 128, 1, true]}
        />
        <AgedMetalMaterial
          color={heroComposition ? "#69472f" : "#4e3a29"}
          variant={2}
          roughness={0.86}
          emissive={heroComposition ? "#35150b" : "#000000"}
          emissiveIntensity={heroComposition ? 0.22 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, heroComposition ? -0.3 : -1.44, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.18, 128]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          uniforms={{}}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            void main() {
              vec2 p = (vUv - 0.5) * 2.0;
              float r = length(p);
              float core = exp(-r * 3.2);
              float ringA = exp(-pow((r - 0.3) * 16.0, 2.0));
              float ringB = exp(-pow((r - 0.66) * 20.0, 2.0));
              float radial = 0.5 + 0.5 * cos(atan(p.y, p.x) * 12.0);
              vec3 deep = vec3(0.075, 0.032, 0.012);
              vec3 amber = vec3(0.88, 0.29, 0.065);
              vec3 hot = vec3(1.0, 0.72, 0.28);
              vec3 color = mix(deep, amber, core * 0.82 + ringB * 0.24);
              color = mix(color, hot, ringA * (0.44 + radial * 0.14));
              float edge = smoothstep(1.0, 0.72, r);
              gl_FragColor = vec4(color, edge * 0.96);
            }
          `}
        />
      </mesh>
      {!hideShaft && (
        <mesh position={[0, -0.84, 0]}>
          <cylinderGeometry args={[1.82, 1.12, 1.12, 128, 1, true]} />
          <meshPhysicalMaterial
            color="#572718"
            emissive="#8e2d13"
            emissiveIntensity={0.72}
            roughness={0.82}
            transparent
            opacity={0.25}
            transmission={0.16}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
      {depthRings.slice(0, heroComposition ? 0 : depthRings.length).map((ring, index) => (
        <ClosedTube
          key={ring.y}
          points={ring.points}
          radius={ring.tube}
          color={index < 2 ? "#7e5838" : "#4d3929"}
          opacity={0.94 - index * 0.1}
          emissive={heroComposition && index < 2 ? "#6d210c" : "#000000"}
          emissiveIntensity={heroComposition && index < 2 ? 0.34 - index * 0.08 : 0}
        />
      ))}
      {ringSpecs.map((ring) => (
        <ClosedTube
          key={ring.radius}
          points={ring.points}
          radius={ring.tube}
          color={ring.radius < 2.4 ? "#ae7548" : "#755439"}
          opacity={ring.radius > 3 ? 0.78 : 1}
          emissive={heroComposition ? (ring.radius < 2.4 ? "#7b280f" : "#3c160b") : "#000000"}
          emissiveIntensity={heroComposition ? (ring.radius < 2.4 ? 0.42 : 0.16) : 0}
        />
      ))}
      {aura && heroComposition && (
        <PortalAuraRing radius={3.76} y={-0.18} tube={0.011} opacity={0.22} />
      )}
      {aura && !heroComposition && <>
        <PortalAuraRing radius={2.3} y={0.14} tube={0.018} opacity={0.62} />
        <PortalAuraRing radius={2.66} y={0.38} tube={0.014} opacity={0.42} />
        <PortalAuraRing radius={3.04} y={0.66} tube={0.011} opacity={0.28} />
        <PortalAuraRing radius={3.44} y={0.96} tube={0.008} opacity={0.18} />
        <PortalLightBeam />
      </>}
      {!heroComposition && Array.from({ length: reduced ? 6 : 12 }, (_, index) => (index / (reduced ? 6 : 12)) * Math.PI * 2).map((angle, index) => (
        <mesh
          key={angle}
          position={[Math.cos(angle) * 2.18, -0.01 + (index % 2) * 0.025, Math.sin(angle) * 2.18]}
          rotation={[0, -angle, 0]}
        >
          <boxGeometry args={[0.07, 0.08, 0.36]} />
          <AgedMetalMaterial color="#6e5134" variant={index % 4} />
        </mesh>
      ))}
      <pointLight position={[0, heroComposition ? -0.24 : -1.08, 0]} color="#ff7134" intensity={heroComposition ? 32 : 18} distance={7.5} decay={1.7} />
      {heroComposition && <pointLight position={[0, 0.22, 1.7]} color="#ffc27a" intensity={8} distance={5.5} decay={2} />}
    </group>
  );
}

function Collar({ position, radius = 0.15 }: { position: [number, number, number]; radius?: number }) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[radius, radius, 0.16, 32]} />
      <AgedMetalMaterial color={BRASS_LIGHT} variant={2} />
    </mesh>
  );
}

function SpineStudy({ reduced = false }: { reduced?: boolean } = {}) {
  const sidePipes = useMemo(() => [
    [new THREE.Vector3(-0.26, -2.35, 0), new THREE.Vector3(-0.92, -1.45, 0.08), new THREE.Vector3(-0.76, -0.35, 0.02), new THREE.Vector3(-0.3, 0.18, 0)],
    [new THREE.Vector3(0.28, -0.25, 0), new THREE.Vector3(0.82, 0.45, -0.04), new THREE.Vector3(0.96, 1.45, 0.06), new THREE.Vector3(0.32, 2.38, 0)],
    [new THREE.Vector3(-0.12, -1.85, -0.12), new THREE.Vector3(0.62, -1.1, -0.2), new THREE.Vector3(0.65, 0.1, -0.18), new THREE.Vector3(0.18, 0.72, -0.12)],
  ], []);
  const crossbars = useMemo(() => [-1.82, -1.08, -0.32, 0.48, 1.28, 2.02].map((y, index) => [
    new THREE.Vector3(-0.72 - (index % 2) * 0.12, y, 0.08),
    new THREE.Vector3(0, y + (index % 2 ? 0.09 : -0.06), index % 2 ? 0.14 : -0.06),
    new THREE.Vector3(0.72 + (index % 2) * 0.12, y + 0.03, 0.08),
  ]), []);
  const rings = [
    [-0.03, -1.55, 0.44, -0.16],
    [0.06, -0.62, 0.53, 0.22],
    [-0.08, 0.28, 0.42, -0.3],
    [0.08, 1.18, 0.58, 0.18],
    [-0.04, 2.04, 0.4, -0.12],
  ] as const;
  const verticalRails = reduced
    ? [
      { x: -0.18, radius: 0.06, z: 0, color: BRASS },
      { x: 0.2, radius: 0.038, z: -0.05, color: "#8d744d" },
    ]
    : [
      { x: -0.32, radius: 0.065, z: 0, color: BRASS },
      { x: -0.1, radius: 0.04, z: -0.08, color: "#8d744d" },
      { x: 0.12, radius: 0.065, z: 0, color: BRASS },
      { x: 0.34, radius: 0.04, z: 0, color: "#8d744d" },
    ];
  const visibleSidePipes = reduced ? [] : sidePipes;
  const visibleCrossbars = reduced ? [] : crossbars;
  const collarLevels = reduced ? [-1.48, 0.92] : [-2.28, -1.48, -0.68, 0.12, 0.92, 1.72, 2.5];
  const visibleRings = reduced ? rings.filter((_, index) => index === 3) : rings;
  const railYokes = useMemo(() => [-1.48, 0.92].map((y) => [
    new THREE.Vector3(-0.18, y, 0),
    new THREE.Vector3(0.01, y + 0.055, 0.025),
    new THREE.Vector3(0.2, y, 0),
  ]), []);
  const capPoints = useMemo(() => [
    new THREE.Vector3(-0.18, 2.68, 0),
    new THREE.Vector3(-0.1, 2.86, 0.01),
    new THREE.Vector3(0.01, 2.94, 0.02),
    new THREE.Vector3(0.12, 2.86, 0.01),
    new THREE.Vector3(0.2, 2.68, 0),
  ], []);
  return (
    <group scale={[1.12, 0.94, 1.12]}>
      {verticalRails.map((rail, index) => (
        <mesh key={rail.x} position={[rail.x, 0, rail.z]}>
          <cylinderGeometry args={[rail.radius, rail.radius, 5.45 + index * 0.05, 24]} />
          <AgedMetalMaterial color={rail.color} variant={index} />
        </mesh>
      ))}
      {visibleSidePipes.map((points, index) => (
        <group key={index}>
          <TubeCurve points={points} radius={0.06 - index * 0.008} color={index === 2 ? BRASS_LIGHT : BRASS} />
          {reduced && <>
            <CurveCollar points={points} t={0.015} radius={0.082} tube={0.022} />
            <CurveCollar points={points} t={0.985} radius={0.082} tube={0.022} />
          </>}
        </group>
      ))}
      {visibleCrossbars.map((points, index) => <TubeCurve key={index} points={points} radius={0.025} color="#b69665" />)}
      {collarLevels.map((y, index) => (
        <group key={y}>
          <Collar position={[reduced ? -0.18 : -0.32, y, 0]} radius={0.115} />
          <Collar position={[reduced ? 0.2 : 0.34, y + (index % 2 ? 0.12 : -0.06), 0]} radius={0.105} />
        </group>
      ))}
      {reduced && railYokes.map((points, index) => (
        <TubeCurve key={index} points={points} radius={0.026} color="#8b6945" metalness={0.5} roughness={0.76} />
      ))}
      {visibleRings.map(([x, y, radius, tilt], index) => (
        <group key={y} position={[x, y, 0.14]} rotation={[0.12, tilt, index * 0.28]}>
          <mesh>
            <torusGeometry args={[radius, 0.055, 12, 72]} />
            <AgedMetalMaterial variant={index} />
          </mesh>
          <mesh scale={0.78}>
            <sphereGeometry args={[radius, 32, 24]} />
            <GlassMaterial opacity={0.3} />
          </mesh>
        </group>
      ))}
      {(reduced ? [] : [[-0.86, -1.08, 0.16], [0.88, 0.48, 0.12], [-0.76, 1.3, 0.1]]).map(([x, y, size]) => (
        <group key={`${x}-${y}`} position={[x, y, 0.12]}>
          <mesh><sphereGeometry args={[size, 32, 24]} /><GlassMaterial opacity={0.44} /></mesh>
          <mesh><torusGeometry args={[size * 1.2, 0.02, 8, 48]} /><AgedMetalMaterial variant={1} /></mesh>
        </group>
      ))}
      <mesh position={[0, -2.72, 0]}>
        <cylinderGeometry args={[0.66, 0.82, 0.24, 48]} />
        <AgedMetalMaterial variant={3} />
      </mesh>
      {reduced && <>
        <mesh position={[0, -3.01, 0]}>
          <cylinderGeometry args={[0.56, 0.76, 0.48, 48]} />
          <AgedMetalMaterial color="#654b34" variant={1} roughness={0.88} />
        </mesh>
        <mesh position={[0, -3.25, 0]}>
          <torusGeometry args={[0.75, 0.045, 10, 72]} />
          <AgedMetalMaterial color="#796040" variant={3} roughness={0.8} />
        </mesh>
      </>}
      {reduced && <group>
        <TubeCurve points={capPoints} radius={0.048} color="#8f6c45" metalness={0.52} roughness={0.76} />
        <mesh position={[0.01, 2.91, 0.02]}>
          <cylinderGeometry args={[0.11, 0.09, 0.14, 24]} />
          <AgedMetalMaterial color="#715238" variant={2} roughness={0.84} />
        </mesh>
        <mesh position={[0.01, 3.09, 0.02]} scale={[0.78, 1.16, 0.78]}>
          <sphereGeometry args={[0.14, 32, 24]} />
          <GlassMaterial opacity={0.42} />
        </mesh>
      </group>}
    </group>
  );
}

function HelicalSpineStudy() {
  const strands = useMemo(() => [0, Math.PI].map((phase, strandIndex) => (
    Array.from({ length: 112 }, (_, index) => {
      const t = index / 111;
      const y = -3.05 + t * 6.05;
      const bulge = Math.pow(Math.sin(Math.PI * t), 0.82);
      const radius = 0.12 + bulge * (strandIndex === 0 ? 0.48 : 0.43);
      const angle = phase + t * Math.PI * 3.3 + Math.sin(t * Math.PI * 5) * 0.045;
      return new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius,
      );
    })
  )), []);
  const crown = useMemo(() => {
    const left = strands[0][strands[0].length - 1];
    const right = strands[1][strands[1].length - 1];
    return [
      left.clone(),
      new THREE.Vector3(left.x * 0.45, 3.18, left.z * 0.45),
      new THREE.Vector3(0, 3.27, 0),
      new THREE.Vector3(right.x * 0.45, 3.18, right.z * 0.45),
      right.clone(),
    ];
  }, [strands]);

  return (
    <group>
      {strands.map((points, index) => (
        <group key={index}>
          <TubeCurve
            points={points}
            radius={index === 0 ? 0.066 : 0.052}
            color={index === 0 ? "#75543a" : "#8a6644"}
            metalness={0.5}
            roughness={0.8}
          />
          <CurveCollar points={points} t={0.025} radius={index === 0 ? 0.1 : 0.085} tube={0.028} />
          <CurveCollar points={points} t={0.56} radius={index === 0 ? 0.112 : 0.098} tube={0.03} />
          <CurveCollar points={points} t={0.975} radius={index === 0 ? 0.1 : 0.085} tube={0.028} />
        </group>
      ))}

      <mesh position={[0, -3.12, 0]}>
        <cylinderGeometry args={[0.34, 0.62, 0.38, 48]} />
        <AgedMetalMaterial color="#604832" variant={1} roughness={0.9} />
      </mesh>
      <mesh position={[0, -3.14, 0]}>
        <torusGeometry args={[0.78, 0.035, 10, 88]} />
        <AgedMetalMaterial color="#7a5e3f" variant={3} roughness={0.82} />
      </mesh>

      <TubeCurve points={crown} radius={0.052} color="#876442" metalness={0.5} roughness={0.8} />
      <mesh position={[0, 3.24, 0]}>
        <cylinderGeometry args={[0.105, 0.085, 0.14, 24]} />
        <AgedMetalMaterial color="#6d5036" variant={2} roughness={0.86} />
      </mesh>
      <mesh position={[0, 3.42, 0]} scale={[0.78, 1.16, 0.78]}>
        <sphereGeometry args={[0.14, 32, 24]} />
        <GlassMaterial opacity={0.42} />
      </mesh>
    </group>
  );
}

function GlobeStudy({ showNucleus = true }: { showNucleus?: boolean } = {}) {
  const axis = useMemo(() => [
    new THREE.Vector3(0, -1.15, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1.15, 0),
  ], []);
  return (
    <group scale={1.04}>
      <mesh>
        <sphereGeometry args={[1.42, 64, 48]} />
        <GlassMaterial opacity={0.42} />
      </mesh>
      <mesh scale={0.92}>
        <sphereGeometry args={[1.42, 64, 48]} />
        <meshPhysicalMaterial color="#271f19" transmission={0.5} thickness={0.62} roughness={0.24} roughnessMap={agedSurfaces[1].variation} bumpMap={agedSurfaces[1].variation} bumpScale={0.004} transparent opacity={0.22} depthWrite={false} />
      </mesh>
      {[
        [0, 0, 0],
        [Math.PI / 2, 0, 0],
        [0, Math.PI / 2, 0],
        [Math.PI / 3, Math.PI / 5, 0.3],
      ].map((rotation, index) => (
        <mesh key={index} rotation={rotation as [number, number, number]}>
          <torusGeometry args={[1.43, index === 0 ? 0.055 : 0.035, 12, 112]} />
          <AgedMetalMaterial color={index === 3 ? BRASS_LIGHT : BRASS} variant={index} />
        </mesh>
      ))}
      {showNucleus ? <Nucleus scale={0.72} /> : (
        <mesh scale={0.48}>
          <sphereGeometry args={[0.42, 40, 28]} />
          <meshStandardMaterial color="#654426" emissive="#9b4a24" emissiveIntensity={0.22} roughness={0.86} />
        </mesh>
      )}
      <TubeCurve points={axis} radius={0.035} color="#d17d44" metalness={0.24} roughness={0.18} />
      {[-1.58, 1.58].map((y) => (
        <group key={y} position={[0, y, 0]}>
          <mesh>
            <cylinderGeometry args={[0.42, 0.42, 0.28, 48]} />
            <AgedMetalMaterial variant={2} />
          </mesh>
          <mesh position={[0, y > 0 ? -0.16 : 0.16, 0]}>
            <torusGeometry args={[0.39, 0.035, 10, 72]} />
            <AgedMetalMaterial color="#9c784d" variant={1} />
          </mesh>
          <mesh position={[0, y > 0 ? 0.28 : -0.28, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.38, 32]} />
            <AgedMetalMaterial variant={3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const leafAssets = [
  "/images/botanical/zinnia-leaf-top-right.webp",
  "/images/botanical/zinnia-leaf-middle-left.webp",
  "/images/botanical/zinnia-leaf-lower-right.webp",
  "/images/botanical/zinnia-leaf-bottom-left.webp",
];

const ORBIT_CENTER_Y = 0.55;
const ORBIT_COMPOSITION_SCALE = 0.82;
const ORBIT_VERTICAL_SCALE = 0.78;
const ORBIT_DEPTH_SCALE = Math.sqrt(1 - ORBIT_VERTICAL_SCALE * ORBIT_VERTICAL_SCALE);
const INNER_ORBIT_RADIUS = 1.3;
const INNER_ORBIT_PERIOD_SECONDS = 30;

function solarOrbitPositionAtAngle(
  radius: number,
  phase: number,
  depthOffset: number,
): [number, number, number] {
  const compositionRadius = radius * ORBIT_COMPOSITION_SCALE;
  const x = Math.cos(phase) * compositionRadius;
  const sine = Math.sin(phase);
  return [
    x,
    ORBIT_CENTER_Y + sine * compositionRadius * ORBIT_VERTICAL_SCALE,
    depthOffset + sine * compositionRadius * ORBIT_DEPTH_SCALE,
  ];
}

function solarOrbitPosition(
  radius: number,
  phaseDegrees: number,
  depthOffset: number,
): [number, number, number] {
  return solarOrbitPositionAtAngle(
    radius,
    THREE.MathUtils.degToRad(phaseDegrees),
    depthOffset,
  );
}

function orbitalAngularSpeed(radius: number) {
  const innerAngularSpeed = (Math.PI * 2) / INNER_ORBIT_PERIOD_SECONDS;
  return innerAngularSpeed * Math.pow(INNER_ORBIT_RADIUS / radius, 1.5);
}

type OrbitalLeafSpec = {
  radius: number;
  phase: number;
  depth: number;
  rotation: [number, number, number];
  asset: number;
  scale: [number, number];
};

function AnimatedOrbitalLeaf({
  radius,
  phase,
  depth,
  rotation,
  asset,
  scale,
  index,
}: OrbitalLeafSpec & { index: number }) {
  const orbitRef = useRef<THREE.Group>(null);
  const attitudeRef = useRef<THREE.Group>(null);
  const phaseRef = useRef(THREE.MathUtils.degToRad(phase));
  const attitudeTimeRef = useRef(index * 0.83);
  const axialSpinRef = useRef(0);
  const angularSpeed = orbitalAngularSpeed(radius);

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05);
    phaseRef.current = (phaseRef.current + step * angularSpeed) % (Math.PI * 2);
    attitudeTimeRef.current += step * (0.16 + index * 0.008);
    axialSpinRef.current += step * (0.034 + (index % 3) * 0.004) * (index % 2 ? 1 : -1);

    const angle = phaseRef.current;
    const position = solarOrbitPositionAtAngle(radius, angle, depth);
    orbitRef.current?.position.set(...position);

    if (attitudeRef.current) {
      const turn = attitudeTimeRef.current;
      attitudeRef.current.rotation.set(
        Math.sin(turn * 0.72) * 0.055,
        Math.cos(turn * 0.58) * 0.13,
        axialSpinRef.current + Math.sin(turn * 0.46) * 0.075,
      );
    }
  });

  return (
    <group ref={orbitRef} position={solarOrbitPosition(radius, phase, depth)}>
      <group ref={attitudeRef}>
        <LeafCard
          url={leafAssets[asset]}
          position={[0, 0, 0]}
          rotation={rotation}
          scale={scale}
        />
      </group>
    </group>
  );
}

function OrbitalLeavesStudy() {
  const leaves: OrbitalLeafSpec[] = [
    { radius: 2.7, phase: 155, depth: -0.2, rotation: [0.08, -0.2, -0.58], asset: 0, scale: [0.88, 0.51] },
    { radius: 1.55, phase: 115, depth: -0.2, rotation: [0.04, 0.16, 0.4], asset: 3, scale: [0.66, 0.41] },
    { radius: 2.8, phase: 30, depth: -0.2, rotation: [0.06, 0.18, 0.26], asset: 1, scale: [1.08, 0.67] },
    { radius: 2.3, phase: 330, depth: -0.2, rotation: [-0.04, -0.16, -0.26], asset: 0, scale: [1.12, 0.7] },
    { radius: 1.7, phase: 300, depth: -0.2, rotation: [0.08, 0.12, 0.48], asset: 2, scale: [0.74, 0.46] },
    { radius: 1.65, phase: 195, depth: -0.2, rotation: [-0.02, 0.18, 0.12], asset: 2, scale: [0.82, 0.51] },
  ];

  return (
    <group>
      {leaves.map((leaf, index) => (
        <AnimatedOrbitalLeaf
          key={index}
          {...leaf}
          index={index}
        />
      ))}
    </group>
  );
}

function OrbitalGuide({ radius, depth }: { radius: number; depth: number }) {
  const { points, colors } = useMemo(() => {
    const guidePoints: [number, number, number][] = [];
    const guideColors: [number, number, number, number][] = [];
    const startAngle = -Math.PI * 0.2;
    const arcLength = Math.PI * 1.32;
    const segments = 96;

    for (let index = 0; index <= segments; index += 1) {
      const progress = index / segments;
      const angle = startAngle + arcLength * progress;
      const edgeDistance = Math.min(progress, 1 - progress) / 0.16;
      const clampedEdge = THREE.MathUtils.clamp(edgeDistance, 0, 1);
      const edgeFade = clampedEdge * clampedEdge * (3 - 2 * clampedEdge);
      const cameraFacing = THREE.MathUtils.clamp((Math.sin(angle) + 1) * 0.5, 0, 1);
      const warmth = 0.3 + cameraFacing * 0.7;

      guidePoints.push(solarOrbitPositionAtAngle(radius, angle, depth));
      guideColors.push([
        0.42 + warmth * 0.38,
        0.18 + warmth * 0.22,
        0.055 + warmth * 0.065,
        edgeFade * (0.085 + cameraFacing * 0.62),
      ]);
    }

    return { points: guidePoints, colors: guideColors };
  }, [depth, radius]);

  return (
    <Line
      points={points}
      vertexColors={colors}
      lineWidth={0.9}
      opacity={0.9}
      depthWrite={false}
      toneMapped={false}
    />
  );
}

function AnimatedOrbitalGlobe({
  radius,
  phase,
  depth,
  rotation,
  scale,
  showPartialOrbit = false,
  showGuide = false,
  direction = 1,
}: {
  radius: number;
  phase: number;
  depth: number;
  rotation: [number, number, number];
  scale: number;
  showPartialOrbit?: boolean;
  showGuide?: boolean;
  direction?: 1 | -1;
}) {
  const systemRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const phaseRef = useRef(THREE.MathUtils.degToRad(phase));
  const precessionRef = useRef(0);
  const angularSpeed = orbitalAngularSpeed(radius);
  const compositionRadius = radius * ORBIT_COMPOSITION_SCALE;

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05);
    precessionRef.current += step;
    phaseRef.current = (phaseRef.current + step * angularSpeed) % (Math.PI * 2);

    const angle = phaseRef.current;
    const sine = Math.sin(angle);
    orbitRef.current?.position.set(
      Math.cos(angle) * compositionRadius,
      ORBIT_CENTER_Y + sine * compositionRadius * ORBIT_VERTICAL_SCALE,
      depth + sine * compositionRadius * ORBIT_DEPTH_SCALE,
    );

    if (spinRef.current) {
      spinRef.current.rotation.y += step * 0.18 * direction;
      spinRef.current.rotation.x = Math.sin(angle * 0.7) * 0.065;
      spinRef.current.rotation.z += step * 0.025 * direction;
    }

    if (systemRef.current && showGuide) {
      systemRef.current.rotation.y += step * 0.012 * direction;
      systemRef.current.rotation.x = Math.sin(precessionRef.current * 0.11) * 0.035;
      systemRef.current.rotation.z = Math.sin(precessionRef.current * 0.07) * 0.018;
    }
  });

  return (
    <group ref={systemRef}>
      {showGuide && <OrbitalGuide radius={radius} depth={depth} />}
      <group
        ref={orbitRef}
        position={solarOrbitPosition(radius, phase, depth)}
        rotation={rotation}
        scale={scale}
      >
        <group ref={spinRef}>
          <GlobeStudy showNucleus={false} />
          {showPartialOrbit && (
            <group rotation={[0.28, -0.22, 0.46]}>
              <PartialOrbit />
            </group>
          )}
        </group>
      </group>
    </group>
  );
}

const APERTURE_ORBIT_RADIUS = 1.87;
const APERTURE_ORBIT_TILT = -0.62;

function apertureOrbitPositionAtAngle(
  radius: number,
  angle: number,
): [number, number, number] {
  const sine = Math.sin(angle);
  return [
    Math.cos(angle) * radius * 0.82,
    sine * radius * 0.52,
    -0.16 + sine * radius * 0.3,
  ];
}

function ApertureOrbitalGuide({ radius }: { radius: number }) {
  const { points, colors } = useMemo(() => {
    const guidePoints: [number, number, number][] = [];
    const guideColors: [number, number, number, number][] = [];
    const startAngle = -Math.PI * 0.42;
    const arcLength = Math.PI * 1.45;
    const segments = 104;

    for (let index = 0; index <= segments; index += 1) {
      const progress = index / segments;
      const angle = startAngle + arcLength * progress;
      const edgeDistance = Math.min(progress, 1 - progress) / 0.18;
      const clampedEdge = THREE.MathUtils.clamp(edgeDistance, 0, 1);
      const edgeFade = clampedEdge * clampedEdge * (3 - 2 * clampedEdge);
      const cameraFacing = THREE.MathUtils.clamp((Math.sin(angle) + 1) * 0.5, 0, 1);
      const warmth = 0.28 + cameraFacing * 0.72;

      guidePoints.push(apertureOrbitPositionAtAngle(radius, angle));
      guideColors.push([
        0.38 + warmth * 0.3,
        0.16 + warmth * 0.18,
        0.05 + warmth * 0.06,
        edgeFade * (0.055 + cameraFacing * 0.43),
      ]);
    }

    return { points: guidePoints, colors: guideColors };
  }, [radius]);

  return (
    <Line
      points={points}
      vertexColors={colors}
      lineWidth={0.72}
      opacity={0.84}
      depthWrite={false}
      toneMapped={false}
    />
  );
}

function AnimatedOrbitalAperture() {
  const systemRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const phaseRef = useRef(THREE.MathUtils.degToRad(330));
  const motionTimeRef = useRef(0);
  const angularSpeed = orbitalAngularSpeed(APERTURE_ORBIT_RADIUS);

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05);
    motionTimeRef.current += step;
    phaseRef.current = (phaseRef.current + step * angularSpeed) % (Math.PI * 2);

    orbitRef.current?.position.set(
      ...apertureOrbitPositionAtAngle(APERTURE_ORBIT_RADIUS, phaseRef.current),
    );

    if (bodyRef.current) {
      bodyRef.current.rotation.y += step * 0.012;
      bodyRef.current.rotation.z = Math.sin(motionTimeRef.current * 0.08) * 0.018;
    }

    if (systemRef.current) {
      systemRef.current.rotation.x = Math.sin(motionTimeRef.current * 0.06) * 0.024;
      systemRef.current.rotation.y = Math.sin(motionTimeRef.current * 0.075) * 0.045;
      systemRef.current.rotation.z = APERTURE_ORBIT_TILT + Math.sin(motionTimeRef.current * 0.05) * 0.018;
    }
  });

  return (
    <group ref={systemRef} position={[0, 0.42, 0]} rotation={[0, 0, APERTURE_ORBIT_TILT]}>
      <ApertureOrbitalGuide radius={APERTURE_ORBIT_RADIUS} />
      <group
        ref={orbitRef}
        position={apertureOrbitPositionAtAngle(
          APERTURE_ORBIT_RADIUS,
          THREE.MathUtils.degToRad(330),
        )}
        rotation={[0.06, -0.18, 0]}
        scale={0.57}
      >
        <group ref={bodyRef}>
          <TransitionAperture rotationSpeed={0.06} />
        </group>
      </group>
    </group>
  );
}

function BotanicalOrbitStudy({ reduced = false }: { reduced?: boolean } = {}) {
  const branches = useMemo(() => [
    [new THREE.Vector3(-0.08, -2.45, 0), new THREE.Vector3(-0.5, -0.55, 0.02), new THREE.Vector3(-0.82, 2.12, 0)],
    [new THREE.Vector3(0.12, -2.38, 0.04), new THREE.Vector3(0.54, -0.48, 0.08), new THREE.Vector3(0.86, 2.35, 0.02)],
    [new THREE.Vector3(-0.3, -0.8, 0), new THREE.Vector3(-1.08, 0.02, 0.02), new THREE.Vector3(-1.7, 1.18, 0)],
    [new THREE.Vector3(0.28, -0.18, 0.04), new THREE.Vector3(1.12, 0.52, 0.02), new THREE.Vector3(1.7, 1.48, 0)],
    [new THREE.Vector3(-0.42, 0.34, -0.04), new THREE.Vector3(-1.2, 1.18, -0.02), new THREE.Vector3(-1.48, 2.06, 0)],
    [new THREE.Vector3(0.5, -0.82, -0.04), new THREE.Vector3(1.3, -0.48, 0), new THREE.Vector3(1.76, 0.18, 0)],
    [new THREE.Vector3(-0.18, -1.55, -0.08), new THREE.Vector3(-1.1, -1.18, -0.05), new THREE.Vector3(-1.72, -0.54, 0)],
  ], []);
  const leaves = [
    [-1.64, 1.18, 0.12, -0.48, 0, 1.08], [-1.36, 2.04, 0.04, 0.5, 1, 0.9], [-0.78, 2.24, 0.12, -0.54, 2, 1.02],
    [0.82, 2.4, 0.08, 0.58, 3, 1.1], [1.66, 1.5, 0.06, -0.52, 0, 1.15], [1.72, 0.18, 0.16, 0.5, 1, 0.88],
    [-1.12, 0.2, 0.18, -0.22, 2, 0.95], [1.08, 0.56, 0.22, 0.34, 3, 0.92], [-0.72, -0.72, 0.18, 0.24, 0, 0.88],
    [0.72, -0.86, 0.2, -0.4, 1, 0.94], [1.32, -0.52, 0.04, 0.58, 2, 0.82], [-1.62, -0.5, 0.08, -0.42, 3, 0.78],
    [-0.18, 1.18, 0.28, 0.18, 1, 0.78], [0.22, -1.58, 0.08, -0.16, 2, 0.75],
  ] as const;
  const visibleBranches = (reduced ? branches.filter((_, index) => index < 3) : branches).map((points) => (
    reduced
      ? points.map((point) => new THREE.Vector3(point.x * 1.18, point.y, point.z))
      : points
  ));
  const visibleLeaves = reduced
    ? leaves.filter((_, index) => [0, 1, 2, 3, 4, 6, 7, 9].includes(index))
    : leaves;
  return (
    <group scale={0.88}>
      {!reduced && <>
        <OrbitTube xRadius={2.65} yRadius={1.18} rotation={[0.18, 0.52, 0.1]} position={[0, 0.48, -0.42]} />
        <OrbitTube xRadius={1.9} yRadius={2.72} rotation={[0.2, -0.34, -0.18]} position={[0, 0.08, -0.34]} />
        <OrbitTube xRadius={2.2} yRadius={1.72} rotation={[-0.28, 0.2, 0.72]} position={[0.05, -0.1, -0.24]} />
        <OrbitTube xRadius={2.42} yRadius={0.72} rotation={[0.32, -0.42, -0.35]} position={[0, -0.72, -0.3]} />
        <OrbitTube xRadius={1.24} yRadius={2.28} rotation={[-0.16, 0.46, 0.42]} position={[0.1, 0.24, -0.5]} />
      </>}
      {visibleBranches.map((points, index) => <TubeCurve key={index} points={points} radius={index < 2 ? 0.055 : 0.035} color={index < 2 ? "#77724c" : "#8a8459"} metalness={0.26} roughness={0.56} />)}
      {visibleLeaves.map(([x, y, z, rotation, asset, size], index) => (
        <LeafCard
          key={`${x}-${y}`}
          url={leafAssets[asset]}
          position={[reduced ? x * 1.2 + Math.sign(x) * 0.14 : x, y, z]}
          rotation={[0.06 * (index % 3), index % 2 ? -0.2 : 0.22, rotation]}
          scale={[1.12 * size, 0.7 * size]}
        />
      ))}
    </group>
  );
}

function LivingCoreStudy({
  scale = 1,
  reduced = false,
  apertureRotationSpeed,
}: {
  scale?: number;
  reduced?: boolean;
  apertureRotationSpeed?: number;
}) {
  const endpoints = useMemo(() => [
    new THREE.Vector3(1.08, 0.6, 0.5), new THREE.Vector3(-0.96, 0.82, 0.42),
    new THREE.Vector3(0.78, -0.94, 0.5), new THREE.Vector3(-1.12, -0.52, 0.36),
    new THREE.Vector3(0.18, 1.18, -0.45), new THREE.Vector3(-0.26, -1.2, -0.42),
    new THREE.Vector3(1.16, -0.18, -0.28), new THREE.Vector3(-1.08, 0.12, -0.34),
  ], []);
  const visibleEndpoints = reduced ? [] : endpoints;
  return (
    <group scale={scale}>
      <mesh>
        <sphereGeometry args={[1.48, 72, 56]} />
        <GlassMaterial opacity={0.36} />
      </mesh>
      {!reduced && <mesh scale={0.74}>
        <sphereGeometry args={[1.48, 64, 48]} />
        <GlassMaterial opacity={0.3} />
      </mesh>}
      <Nucleus
        scale={0.9}
        minimal={reduced}
        apertureRotationSpeed={apertureRotationSpeed}
      />
      {!reduced && [
        [0.12, 0.18, 0.08],
        [Math.PI / 2.08, 0.08, 0.46],
        [0.36, Math.PI / 2.12, -0.38],
        [0.72, 0.52, Math.PI / 2.25],
      ].map((rotation, index) => (
        <mesh key={index} rotation={rotation as [number, number, number]}>
          <torusGeometry args={[1.5, index === 0 ? 0.052 : 0.035, 12, 112]} />
          <AgedMetalMaterial color={index === 1 ? BRASS_LIGHT : BRASS} variant={index} />
        </mesh>
      ))}
      {visibleEndpoints.map((end, index) => {
        const points = [
          end.clone().multiplyScalar(0.48),
          end.clone().multiplyScalar(0.72).add(new THREE.Vector3(index % 2 ? -0.16 : 0.18, index < 4 ? 0.12 : -0.08, index % 3 === 0 ? 0.08 : -0.04)),
          reduced ? end.clone().normalize().multiplyScalar(1.46) : end.clone().multiplyScalar(1.14),
        ];
        return (
          <group key={index}>
            <TubeCurve points={points} radius={0.052} color={index % 2 ? BRASS_LIGHT : BRASS} />
            <CurveCollar points={points} t={0.18} radius={reduced ? 0.1 : 0.08} tube={reduced ? 0.028 : 0.022} />
            <CurveCollar points={points} t={reduced ? 0.985 : 0.88} radius={reduced ? 0.125 : 0.085} tube={reduced ? 0.034 : 0.024} />
          </group>
        );
      })}
    </group>
  );
}

function usePetalGeometry() {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.08, 0);
    shape.bezierCurveTo(-0.4, 0.22, -0.58, 0.82, -0.28, 1.16);
    shape.bezierCurveTo(-0.14, 1.34, 0.14, 1.34, 0.28, 1.16);
    shape.bezierCurveTo(0.58, 0.82, 0.4, 0.22, 0.08, 0);
    shape.closePath();
    const petal = new THREE.ExtrudeGeometry(shape, {
      depth: 0.035,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.018,
      bevelThickness: 0.018,
      curveSegments: 16,
    });
    petal.translate(0, 0, -0.02);
    return petal;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

function ZinniaStudy({ minimalNucleus = false }: { minimalNucleus?: boolean } = {}) {
  const petal = usePetalGeometry();
  const backColors = ["#5b2418", "#762b19", "#94351d", "#b84522"];
  const layers = [
    { count: 13, radius: 0.56, scale: 1.22, width: 1.05, z: -0.22, color: "#35110b", opacity: 0.72 },
    { count: 12, radius: 0.45, scale: 1.02, width: 0.94, z: -0.08, color: "#641b0e", opacity: 0.78 },
    { count: 10, radius: 0.34, scale: 0.82, width: 0.84, z: 0.08, color: "#9a2b13", opacity: 0.84 },
    { count: 8, radius: 0.22, scale: 0.62, width: 0.76, z: 0.23, color: "#d3461d", opacity: 0.9 },
  ];
  return (
    <group rotation={[-0.2, 0.08, -0.04]} scale={1.08}>
      {layers.flatMap((layer, layerIndex) => Array.from({ length: layer.count }, (_, index) => {
        const angle = (index / layer.count) * Math.PI * 2 + layerIndex * 0.18;
        const variation = 1 + Math.sin(index * 2.31 + layerIndex) * 0.06;
        return (
          <group
            key={`${layerIndex}-${index}`}
            position={[Math.cos(angle) * layer.radius, Math.sin(angle) * layer.radius, layer.z]}
            rotation={[0.04 + layerIndex * 0.035, Math.sin(angle) * 0.06, angle - Math.PI / 2]}
            scale={[layer.scale * layer.width * variation, layer.scale * variation, layer.scale]}
          >
            <mesh geometry={petal}>
              <meshPhysicalMaterial
                color={layer.color}
                map={agedSurfaces[layerIndex % agedSurfaces.length].color}
                roughnessMap={agedSurfaces[layerIndex % agedSurfaces.length].variation}
                bumpMap={agedSurfaces[layerIndex % agedSurfaces.length].variation}
                bumpScale={0.018}
                emissive="#651707"
                emissiveIntensity={0.08}
                roughness={0.78}
                metalness={0.32}
                clearcoat={0.24}
                clearcoatRoughness={0.58}
                transmission={0.16}
                thickness={0.18}
                envMapIntensity={0.55}
                transparent
                opacity={layer.opacity}
              />
            </mesh>
            <mesh geometry={petal} position={[0, 0, -0.016]}>
              <meshPhysicalMaterial
                color={backColors[layerIndex]}
                map={agedSurfaces[(layerIndex + 1) % agedSurfaces.length].color}
                roughnessMap={agedSurfaces[layerIndex % agedSurfaces.length].variation}
                bumpMap={agedSurfaces[layerIndex % agedSurfaces.length].variation}
                bumpScale={0.022}
                emissive="#45140c"
                emissiveIntensity={0.12}
                roughness={0.86}
                metalness={0.24}
                clearcoat={0.12}
                clearcoatRoughness={0.72}
                transparent
                opacity={Math.min(0.96, layer.opacity + 0.12)}
              />
            </mesh>
            <mesh position={[0, 0.58, 0.07]}>
              <boxGeometry args={[0.018, 0.9, 0.014]} />
              <AgedMetalMaterial color="#8f4d2f" variant={layerIndex} opacity={0.72} roughness={0.76} />
            </mesh>
          </group>
        );
      }))}
      <group position={[0, 0, 0.48]}>
        <Nucleus scale={0.62} minimal={minimalNucleus} />
        {!minimalNucleus && [0.54, 0.67].map((radius) => (
          <mesh key={radius}>
            <torusGeometry args={[radius, 0.035, 10, 72]} />
            <AgedMetalMaterial variant={1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function GlassWing({
  position,
  rotation,
  scale,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}) {
  const shape = useMemo(() => {
    const panel = new THREE.Shape();
    panel.moveTo(0, -0.1);
    panel.bezierCurveTo(-0.82, -0.34, -1.02, 0.62, -0.72, 1.24);
    panel.bezierCurveTo(-0.32, 1.92, 0.38, 1.88, 0.72, 1.18);
    panel.bezierCurveTo(1.02, 0.52, 0.72, -0.34, 0, -0.1);
    panel.closePath();
    return panel;
  }, []);
  const geometry = useMemo(() => {
    const panel = new THREE.ExtrudeGeometry(shape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.035,
      bevelThickness: 0.035,
      curveSegments: 24,
    });
    panel.translate(0, 0, -0.04);
    return panel;
  }, [shape]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} position={position} rotation={rotation} scale={scale}>
      <meshPhysicalMaterial
        color="#3d3027"
        roughnessMap={agedSurfaces[3].variation}
        bumpMap={agedSurfaces[3].variation}
        bumpScale={0.008}
        emissive="#26160f"
        emissiveIntensity={0.08}
        transmission={0.54}
        thickness={0.62}
        roughness={0.28}
        transparent
        opacity={0.48}
        clearcoat={0.5}
        clearcoatRoughness={0.36}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
      <Edges color="#876742" linewidth={1.2} threshold={8} />
    </mesh>
  );
}

function AIGardenStudy({
  minimalNucleus = false,
  grounded = false,
}: {
  minimalNucleus?: boolean;
  grounded?: boolean;
} = {}) {
  const rootPaths = useMemo(() => (grounded ? [-0.72, 0, 0.72] : [-1.02, -0.5, 0, 0.48, 1.04]).map((x, index) => [
    new THREE.Vector3(x * 0.06, -0.25, 0),
    new THREE.Vector3(x * 0.36 + Math.sin(index * 1.7) * 0.08, grounded ? -1.45 : -1.08, index % 2 ? 0.18 : -0.14),
    new THREE.Vector3(x * 0.74, grounded ? -3.15 : -1.72, index % 2 ? -0.12 : 0.12),
    new THREE.Vector3(x, grounded ? -4.55 : -2.32 - Math.abs(x) * 0.12, index % 2 ? -0.05 : 0.08),
  ]), [grounded]);
  const shootPaths = useMemo(() => [-0.74, 0, 0.74].map((x, index) => [
    new THREE.Vector3(x * 0.12, 0.18, 0),
    new THREE.Vector3(x * 0.54, 0.9 + index * 0.12, 0.04),
    new THREE.Vector3(x * 0.82, 1.64 + index * 0.12, 0),
    new THREE.Vector3(x, 2.18 + (index === 1 ? 0.46 : 0), 0),
  ]), []);
  return (
    <group scale={0.92}>
      <GlassWing position={[-0.58, -0.14, -0.24]} rotation={[-0.12, -0.34, -0.52]} scale={[0.92, 0.92, 1]} />
      <GlassWing position={[0.58, -0.14, -0.24]} rotation={[-0.12, 0.34, 0.52]} scale={[-0.92, 0.92, 1]} />
      <GlassWing position={[-0.3, -0.54, -0.02]} rotation={[-0.72, -0.18, -1.08]} scale={[0.62, 0.58, 0.82]} />
      <GlassWing position={[0.3, -0.54, -0.02]} rotation={[-0.72, 0.18, 1.08]} scale={[-0.62, 0.58, 0.82]} />
      <mesh position={[0, -0.06, -0.12]} scale={[1.08, 0.92, 0.74]}>
        <sphereGeometry args={[0.9, 48, 36]} />
        <GlassMaterial opacity={0.24} />
      </mesh>
      <Nucleus scale={0.86} minimal={minimalNucleus} />
      {rootPaths.map((points, index) => (
        <group key={index}>
          <TubeCurve points={points} radius={0.046 + (index % 2) * 0.008} color={index === 2 ? "#8b6842" : BRASS} />
          <CurveCollar points={points} t={0.12} radius={0.067} tube={0.018} />
          {grounded && <CurveCollar points={points} t={0.985} radius={0.09} tube={0.026} />}
        </group>
      ))}
      {shootPaths.map((points, index) => (
        <group key={index}>
          <TubeCurve points={points} radius={0.042 + (index === 1 ? 0.008 : 0)} color="#696b46" metalness={0.3} roughness={0.7} />
          <CurveCollar points={points} t={0.16} radius={0.075} tube={0.02} />
        </group>
      ))}
      {[
        [-0.88, 2.12, -0.32, 0, 0.86], [-0.2, 2.6, -0.42, 1, 0.75], [0.2, 2.6, 0.42, 2, 0.75],
        [0.88, 2.12, 0.34, 3, 0.88], [-0.58, 1.52, 0.26, 2, 0.64], [0.58, 1.56, -0.26, 1, 0.64],
      ].map(([x, y, rot, asset, size]) => (
        <LeafCard key={`${x}-${y}`} url={leafAssets[asset]} position={[x, y, 0.1]} rotation={[0.04, 0.1, rot]} scale={[0.9 * size, 0.56 * size]} />
      ))}
    </group>
  );
}

function CubeFrame() {
  const size = 2.82;
  const half = size / 2;
  const beam = 0.13;
  const edges: Array<{ position: [number, number, number]; scale: [number, number, number] }> = [];
  [-half, half].forEach((a) => [-half, half].forEach((b) => {
    edges.push({ position: [0, a, b], scale: [size, beam, beam] });
    edges.push({ position: [a, 0, b], scale: [beam, size, beam] });
    edges.push({ position: [a, b, 0], scale: [beam, beam, size] });
  }));
  return <>{edges.map((edge, index) => <mesh key={index} position={edge.position} scale={edge.scale}><boxGeometry args={[1, 1, 1]} /><AgedMetalMaterial variant={index} /></mesh>)}</>;
}

function TechnicalCubeStudy({ minimalNucleus = false }: { minimalNucleus?: boolean } = {}) {
  const collars = [
    { position: [0.82, 0, 0] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number] },
    { position: [-0.82, 0, 0] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number] },
    { position: [0, 0.82, 0] as [number, number, number], rotation: [Math.PI / 2, 0, 0] as [number, number, number] },
    { position: [0, -0.82, 0] as [number, number, number], rotation: [Math.PI / 2, 0, 0] as [number, number, number] },
    { position: [0, 0, 0.82] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] },
    { position: [0, 0, -0.82] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] },
  ];
  return (
    <group rotation={[0.05, 0.08, 0]} scale={0.98}>
      <RoundedBox args={[2.72, 2.72, 2.72]} radius={0.1} smoothness={5}>
        <meshPhysicalMaterial color="#27211b" roughnessMap={agedSurfaces[2].variation} bumpMap={agedSurfaces[2].variation} bumpScale={0.004} transparent opacity={0.2} transmission={0.52} thickness={0.55} roughness={0.26} depthWrite={false} />
        <Edges color="#735238" linewidth={1} threshold={12} />
      </RoundedBox>
      <CubeFrame />
      <RoundedBox args={[1.92, 1.92, 1.92]} radius={0.055} smoothness={4}>
        <meshPhysicalMaterial color="#32261e" roughnessMap={agedSurfaces[1].variation} bumpMap={agedSurfaces[1].variation} bumpScale={0.003} transparent opacity={0.15} transmission={0.5} thickness={0.38} roughness={0.3} depthWrite={false} />
        <Edges color="#604832" linewidth={0.7} threshold={10} />
      </RoundedBox>
      {[
        { rotation: [0, 0, Math.PI / 2] as [number, number, number], length: 2.78 },
        { rotation: [0, 0, 0] as [number, number, number], length: 2.78 },
        { rotation: [Math.PI / 2, 0, 0] as [number, number, number], length: 2.78 },
      ].map((pipe, index) => (
        <mesh key={index} rotation={pipe.rotation}>
          <cylinderGeometry args={[0.075, 0.075, pipe.length, 24]} />
          <AgedMetalMaterial color="#7f2d1c" variant={index} emissive="#a82d18" emissiveIntensity={0.22} metalness={0.42} roughness={0.7} />
        </mesh>
      ))}
      {collars.map((collar, index) => (
        <mesh key={index} position={collar.position} rotation={collar.rotation}>
          <torusGeometry args={[0.13, 0.03, 10, 56]} />
          <AgedMetalMaterial variant={index} />
        </mesh>
      ))}
      {[
        [2.02, 0.025, 2.02],
        [2.02, 2.02, 0.025],
        [0.025, 2.02, 2.02],
      ].map((scale, index) => (
        <mesh key={index} scale={scale as [number, number, number]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshPhysicalMaterial color="#423127" roughnessMap={agedSurfaces[index].variation} transparent opacity={0.15} transmission={0.38} roughness={0.34} depthWrite={false} />
        </mesh>
      ))}
      <Nucleus scale={0.8} minimal={minimalNucleus} />
    </group>
  );
}

function BeamBetween({
  start,
  end,
  radius = 0.065,
  variant = 0,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  radius?: number;
  variant?: number;
}) {
  const transform = useMemo(() => {
    const direction = end.clone().sub(start);
    return {
      length: direction.length(),
      midpoint: start.clone().add(end).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize(),
      ),
    };
  }, [end, start]);

  return (
    <mesh position={transform.midpoint} quaternion={transform.quaternion}>
      <cylinderGeometry args={[radius, radius, transform.length, 18]} />
      <AgedMetalMaterial variant={variant} roughness={0.76} />
    </mesh>
  );
}

function TetrahedralReliquary() {
  const vertices = useMemo(() => [
    new THREE.Vector3(0, 1.48, 0),
    new THREE.Vector3(-1.24, -0.76, 0.72),
    new THREE.Vector3(1.24, -0.76, 0.72),
    new THREE.Vector3(0, -0.76, -1.38),
  ], []);
  const edges = useMemo(() => [
    [0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [3, 1],
  ] as const, []);

  return (
    <group rotation={[0.04, -0.18, 0.02]}>
      <mesh scale={0.96}>
        <tetrahedronGeometry args={[1.62, 0]} />
        <meshPhysicalMaterial
          color="#342820"
          roughnessMap={agedSurfaces[2].variation}
          bumpMap={agedSurfaces[2].variation}
          bumpScale={0.004}
          transparent
          opacity={0.18}
          transmission={0.5}
          thickness={0.48}
          roughness={0.3}
          depthWrite={false}
        />
      </mesh>
      {edges.map(([from, to], index) => (
        <BeamBetween
          key={`${from}-${to}`}
          start={vertices[from]}
          end={vertices[to]}
          variant={index}
        />
      ))}
      {vertices.map((vertex, index) => (
        <group key={index} position={vertex}>
          <mesh>
            <sphereGeometry args={[0.12, 18, 14]} />
            <AgedMetalMaterial color={index === 0 ? "#9a5837" : BRASS} variant={index} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, index * 0.4]}>
            <torusGeometry args={[0.17, 0.025, 8, 42]} />
            <AgedMetalMaterial color="#9b7447" variant={index + 1} roughness={0.7} />
          </mesh>
        </group>
      ))}
      <Nucleus scale={0.72} minimal />
    </group>
  );
}

function GyroscopicKnot() {
  return (
    <group rotation={[0.08, -0.12, 0.04]}>
      <OrbitTube xRadius={1.36} yRadius={0.72} rotation={[0.28, 0.18, 0.18]} />
      <OrbitTube xRadius={1.18} yRadius={0.82} rotation={[1.12, -0.34, 0.64]} />
      <OrbitTube xRadius={1.02} yRadius={0.66} rotation={[-0.82, 0.72, -0.34]} />
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.055, 0.055, 2.38, 18]} />
          <AgedMetalMaterial color="#8a5639" variant={2} roughness={0.74} />
        </mesh>
        {[-0.9, 0.9].map((y, index) => (
          <mesh key={y} position={[0, y, 0]}>
            <torusGeometry args={[0.14, 0.03, 8, 44]} />
            <AgedMetalMaterial variant={index + 1} />
          </mesh>
        ))}
      </group>
      <Nucleus scale={0.68} minimal />
    </group>
  );
}

function ResonanceSpindle() {
  const rails = useMemo(() => [-1, 0, 1].map((direction, index) => [
    new THREE.Vector3(direction * 0.1, -1.46, index === 1 ? -0.18 : 0.02),
    new THREE.Vector3(direction * (0.62 + index * 0.08), -0.62, 0.05),
    new THREE.Vector3(direction * (0.72 - index * 0.06), 0.42, -0.03),
    new THREE.Vector3(direction * 0.08, 1.46, index === 1 ? 0.18 : 0.02),
  ]), []);

  return (
    <group rotation={[0.05, 0.18, -0.03]}>
      {rails.map((points, index) => (
        <TubeCurve
          key={index}
          points={points}
          radius={index === 1 ? 0.04 : 0.055}
          color={index === 1 ? "#9a4f32" : BRASS_LIGHT}
          metalness={0.48}
          roughness={0.72}
        />
      ))}
      {[-0.92, 0, 0.92].map((y, index) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, index * 0.22]}>
          <torusGeometry args={[0.3 + index * 0.05, 0.035, 10, 64]} />
          <AgedMetalMaterial variant={index} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 1.52, 0]}>
        <sphereGeometry args={[0.11, 16, 12]} />
        <AgedMetalMaterial variant={2} />
      </mesh>
      <mesh position={[0, -1.52, 0]}>
        <sphereGeometry args={[0.11, 16, 12]} />
        <AgedMetalMaterial variant={3} />
      </mesh>
      <Nucleus scale={0.62} minimal />
    </group>
  );
}

function useFlowShellGeometry() {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-2.45, -0.62);
    shape.bezierCurveTo(-2.7, -0.2, -2.55, 0.62, -1.9, 0.72);
    shape.bezierCurveTo(-1.1, 0.82, -0.6, 0.42, 0, 0.34);
    shape.bezierCurveTo(0.6, 0.42, 1.1, 0.82, 1.9, 0.72);
    shape.bezierCurveTo(2.55, 0.62, 2.7, -0.2, 2.45, -0.62);
    shape.bezierCurveTo(1.7, -0.84, 0.65, -0.48, 0, -0.36);
    shape.bezierCurveTo(-0.65, -0.48, -1.7, -0.84, -2.45, -0.62);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.62,
      bevelEnabled: true,
      bevelSegments: 5,
      bevelSize: 0.09,
      bevelThickness: 0.09,
      curveSegments: 32,
    });
    geo.translate(0, 0, -0.31);
    return geo;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

function FlowFin({ mirror = false }: { mirror?: boolean }) {
  const shape = useMemo(() => {
    const fin = new THREE.Shape();
    fin.moveTo(0, -0.72);
    fin.bezierCurveTo(-0.82, -0.64, -1.02, -0.28, -1.18, 0);
    fin.bezierCurveTo(-1.02, 0.28, -0.82, 0.64, 0, 0.72);
    fin.bezierCurveTo(0.28, 0.38, 0.28, -0.38, 0, -0.72);
    fin.closePath();
    return fin;
  }, []);
  return (
    <mesh position={[mirror ? 0.14 : -0.14, 0, 0.36]} rotation={[0, 0, mirror ? Math.PI : 0]} scale={[1.02, 1.08, 1]}>
      <shapeGeometry args={[shape, 32]} />
      <meshPhysicalMaterial
        color="#30261f"
        roughnessMap={agedSurfaces[3].variation}
        bumpMap={agedSurfaces[3].variation}
        bumpScale={0.006}
        transparent
        opacity={0.34}
        transmission={0.48}
        thickness={0.42}
        roughness={0.34}
        clearcoat={0.25}
        clearcoatRoughness={0.48}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
      <Edges color="#6d5137" linewidth={0.6} threshold={10} />
    </mesh>
  );
}

function DFlowStudy({ minimalNucleus = false }: { minimalNucleus?: boolean } = {}) {
  const shell = useFlowShellGeometry();
  const routes = useMemo(() => [
    [new THREE.Vector3(-2.62, 0.48, 0.34), new THREE.Vector3(-1.72, 0.5, 0.36), new THREE.Vector3(-0.82, 0.18, 0.38), new THREE.Vector3(0, 0.04, 0.42), new THREE.Vector3(0.82, 0.28, 0.38), new THREE.Vector3(1.7, 0.5, 0.36), new THREE.Vector3(2.62, 0.4, 0.34)],
    [new THREE.Vector3(-2.62, 0.16, 0.34), new THREE.Vector3(-1.7, 0.16, 0.36), new THREE.Vector3(-0.8, 0.08, 0.38), new THREE.Vector3(0, 0, 0.42), new THREE.Vector3(0.84, -0.08, 0.38), new THREE.Vector3(1.72, 0.16, 0.36), new THREE.Vector3(2.62, 0.12, 0.34)],
    [new THREE.Vector3(-2.62, -0.16, 0.34), new THREE.Vector3(-1.72, -0.16, 0.36), new THREE.Vector3(-0.82, -0.04, 0.38), new THREE.Vector3(0, -0.02, 0.42), new THREE.Vector3(0.82, 0.1, 0.38), new THREE.Vector3(1.72, -0.14, 0.36), new THREE.Vector3(2.62, -0.16, 0.34)],
    [new THREE.Vector3(-2.62, -0.48, 0.34), new THREE.Vector3(-1.72, -0.48, 0.36), new THREE.Vector3(-0.82, -0.22, 0.38), new THREE.Vector3(0, -0.06, 0.42), new THREE.Vector3(0.82, -0.28, 0.38), new THREE.Vector3(1.72, -0.46, 0.36), new THREE.Vector3(2.62, -0.4, 0.34)],
  ], []);
  const outline = useMemo(() => [
    new THREE.Vector3(-2.45, -0.62, 0.3), new THREE.Vector3(-2.62, 0.2, 0.3), new THREE.Vector3(-1.9, 0.72, 0.3),
    new THREE.Vector3(0, 0.34, 0.3), new THREE.Vector3(1.9, 0.72, 0.3), new THREE.Vector3(2.62, 0.2, 0.3),
    new THREE.Vector3(2.45, -0.62, 0.3), new THREE.Vector3(0, -0.36, 0.3),
  ], []);
  return (
    <group rotation={[-0.04, 0.02, 0]} scale={0.96}>
      <mesh geometry={shell}>
        <meshPhysicalMaterial
          color="#473329"
          roughnessMap={agedSurfaces[2].variation}
          bumpMap={agedSurfaces[2].variation}
          bumpScale={0.008}
          transparent
          opacity={0.42}
          transmission={0.4}
          thickness={0.82}
          roughness={0.36}
          metalness={0.03}
          clearcoat={0.32}
          clearcoatRoughness={0.5}
          attenuationColor="#6b3d28"
          attenuationDistance={1.3}
          depthWrite={false}
        />
      </mesh>
      <ClosedTube points={outline} radius={0.055} />
      <FlowFin />
      <FlowFin mirror />
      {routes.map((points, index) => <TubeCurve key={index} points={points} radius={0.048} color={index === 1 || index === 2 ? "#c97843" : BRASS_LIGHT} />)}
      <Nucleus scale={0.68} minimal={minimalNucleus} />
      {routes.flatMap((points, routeIndex) => [points[0], points[points.length - 1]].map((point, endIndex) => (
        <group key={`${routeIndex}-${endIndex}`} position={point} rotation={[0, 0, Math.PI / 2]}>
          <mesh><cylinderGeometry args={[0.09, 0.09, 0.28, 24]} /><AgedMetalMaterial variant={routeIndex} roughness={0.76} /></mesh>
          <mesh position={[0, endIndex === 0 ? -0.13 : 0.13, 0]}><torusGeometry args={[0.1, 0.02, 8, 48]} /><AgedMetalMaterial color="#8d6843" variant={routeIndex + 1} roughness={0.72} /></mesh>
        </group>
      )))}
    </group>
  );
}

function WaveformStudy({ minimalNucleus = false }: { minimalNucleus?: boolean } = {}) {
  const wave = useMemo(() => [
    new THREE.Vector3(-2.72, 0.42, 0),
    new THREE.Vector3(-2.18, 0.88, 0.02),
    new THREE.Vector3(-1.58, 0.26, 0.06),
    new THREE.Vector3(-1.08, -0.82, 0.02),
    new THREE.Vector3(-0.28, -0.96, -0.04),
    new THREE.Vector3(0.38, 0.14, 0.02),
    new THREE.Vector3(0.92, 0.94, 0.08),
    new THREE.Vector3(1.58, 0.56, 0.02),
    new THREE.Vector3(2.12, -0.42, -0.02),
    new THREE.Vector3(2.7, -0.28, 0),
  ], []);
  const corePosition = useMemo(() => new THREE.CatmullRomCurve3(wave).getPointAt(0.66), [wave]);
  const collarPositions = [0.08, 0.2, 0.34, 0.46, 0.59, 0.69, 0.8, 0.91];
  return (
    <group rotation={[-0.04, -0.04, 0]} scale={0.94}>
      <GlassTubeCurve points={wave} radius={0.34} opacity={0.46} />
      <TubeCurve points={wave} radius={0.028} color="#d26e38" metalness={0.24} roughness={0.18} opacity={0.9} />
      {collarPositions.map((t, index) => <CurveCollar key={t} points={wave} t={t} radius={0.39} tube={index === 5 ? 0.058 : 0.046} />)}
      <group position={[corePosition.x, corePosition.y, corePosition.z + 0.12]}>
        <Nucleus scale={0.56} minimal={minimalNucleus} />
      </group>
    </group>
  );
}

function StudyObject({ slug }: { slug: StudySlug }) {
  switch (slug) {
    case "portal": return <group rotation={[-0.08, 0.16, 0]}><PortalStudy /></group>;
    case "spine": return <group rotation={[0.02, -0.2, 0]}><SpineStudy /></group>;
    case "globe": return <group rotation={[0.02, -0.18, 0]}><GlobeStudy /></group>;
    case "botanical-orbits": return <group rotation={[0.02, -0.12, 0]}><BotanicalOrbitStudy /></group>;
    case "living-core": return <group rotation={[0.06, -0.12, 0]}><LivingCoreStudy scale={1.04} /></group>;
    case "zinnia": return <ZinniaStudy />;
    case "ai-garden": return <group rotation={[0.02, -0.12, 0]}><AIGardenStudy /></group>;
    case "technical-cube": return <group rotation={[0.08, -0.24, 0.03]}><TechnicalCubeStudy /></group>;
    case "dflow": return <DFlowStudy />;
    case "waveform": return <WaveformStudy />;
  }
}

function AssemblyStateObject({ slug }: { slug: TransformationSlug }) {
  switch (slug) {
    case "living-core": return <group rotation={[0.06, -0.12, 0]}><LivingCoreStudy scale={1.04} reduced /></group>;
    case "zinnia": return <ZinniaStudy minimalNucleus />;
    case "ai-garden": return <group rotation={[0.02, -0.12, 0]}><AIGardenStudy minimalNucleus grounded /></group>;
    case "technical-cube": return <group rotation={[0.08, -0.24, 0.03]}><TechnicalCubeStudy minimalNucleus /></group>;
    case "dflow": return <DFlowStudy minimalNucleus />;
    case "waveform": return <WaveformStudy minimalNucleus />;
  }
}

function JourneyStateObject({ slug }: { slug: TransformationSlug }) {
  switch (slug) {
    case "living-core": return <group rotation={[0.06, -0.12, 0]}><LivingCoreStudy scale={1.04} reduced /></group>;
    case "zinnia": return <ZinniaStudy minimalNucleus />;
    case "ai-garden": return <TetrahedralReliquary />;
    case "technical-cube": return <group rotation={[0.08, -0.24, 0.03]}><TechnicalCubeStudy minimalNucleus /></group>;
    case "dflow": return <GyroscopicKnot />;
    case "waveform": return <ResonanceSpindle />;
  }
}

function SoftJourneyState({ slug }: { slug: TransformationSlug }) {
  const rotationRef = useRef<THREE.Group>(null);
  const motionTimeRef = useRef(0);
  const phase = ["living-core", "zinnia", "ai-garden", "technical-cube", "dflow", "waveform"].indexOf(slug) * 0.72;
  const yaw = slug === "zinnia" ? 0.3 : slug === "living-core" ? 0.22 : 0.46;

  useFrame((_, delta) => {
    motionTimeRef.current += Math.min(delta, 0.05);
    if (!rotationRef.current) return;
    rotationRef.current.rotation.x = Math.sin(motionTimeRef.current * 0.11 + phase) * 0.07;
    rotationRef.current.rotation.y = Math.sin(motionTimeRef.current * 0.16 + phase) * yaw;
    rotationRef.current.rotation.z = Math.sin(motionTimeRef.current * 0.09 + phase * 0.6) * 0.025;
  });

  return <group ref={rotationRef}><JourneyStateObject slug={slug} /></group>;
}

function RotatingHelicalSpine() {
  const rotationRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (rotationRef.current) {
      rotationRef.current.rotation.y += Math.min(delta, 0.05) * 0.036;
    }
  });

  return <group ref={rotationRef}><HelicalSpineStudy /></group>;
}

function RotatingAssemblyState({ slug }: { slug: TransformationSlug }) {
  const rotationRef = useRef<THREE.Group>(null);
  const motionTimeRef = useRef(0);
  const rotationSpeed = slug === "waveform" || slug === "ai-garden" ? 0.038 : 0.052;

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05);
    motionTimeRef.current += step;
    if (rotationRef.current) {
      rotationRef.current.rotation.y += step * rotationSpeed;
      rotationRef.current.rotation.z = Math.sin(motionTimeRef.current * 0.18) * 0.018;
    }
  });

  return <group ref={rotationRef}><AssemblyStateObject slug={slug} /></group>;
}

const assemblyStateScale = (slug: TransformationSlug) =>
  slug === "ai-garden" ? 0.62 :
  slug === "zinnia" ? 0.68 :
  slug === "living-core" ? 0.7 :
  slug === "technical-cube" ? 0.72 :
  slug === "dflow" || slug === "waveform" ? 0.76 : 0.7;

const assemblyStateY = (slug: TransformationSlug) =>
  slug === "ai-garden" ? 0.32 : slug === "zinnia" ? 0.46 : 0.36;

export function LivingMachineTransitionState({ slug }: { slug: TransformationSlug }) {
  return (
    <group scale={assemblyStateScale(slug)}>
      <RotatingAssemblyState slug={slug} />
    </group>
  );
}

export function LivingMachineJourneyState({ slug }: { slug: TransformationSlug }) {
  return (
    <group scale={assemblyStateScale(slug)}>
      <SoftJourneyState slug={slug} />
    </group>
  );
}

export function LivingMachineContactPlanet() {
  const spinRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!spinRef.current) return;
    const step = Math.min(delta, 0.05);
    spinRef.current.rotation.y += step * 0.075;
    spinRef.current.rotation.x += step * 0.018;
  });

  return (
    <group ref={spinRef} rotation={[0.2, -0.3, -0.08]}>
      <mesh>
        <icosahedronGeometry args={[0.5, 3]} />
        <AgedMetalMaterial
          color="#8a4f31"
          variant={3}
          metalness={0.42}
          roughness={0.72}
          emissive="#68200f"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh rotation={[0.84, 0.24, 0.18]}>
        <torusGeometry args={[0.72, 0.052, 10, 84]} />
        <AgedMetalMaterial color="#9c6742" variant={1} roughness={0.76} />
      </mesh>
      <mesh rotation={[-0.34, 0.72, -0.28]}>
        <torusGeometry args={[0.58, 0.025, 8, 72]} />
        <AgedMetalMaterial color="#70442f" variant={2} roughness={0.82} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.16, 24, 18]} />
        <meshBasicMaterial color="#ff9a55" toneMapped={false} />
      </mesh>
    </group>
  );
}

export function LivingMachineApparatus({
  activeSlug,
  heroComposition = false,
  stateGroupRef,
}: {
  activeSlug: TransformationSlug;
  heroComposition?: boolean;
  stateGroupRef?: Ref<THREE.Group>;
}) {
  const stateScale = assemblyStateScale(activeSlug);
  const stateY = assemblyStateY(activeSlug);

  return (
    <group position={[0, 0.05, 0]}>
      <group
        position={[0, heroComposition ? -2.08 : -2.45, -0.12]}
        rotation={[heroComposition ? 0.22 : -0.02, 0, 0]}
        scale={heroComposition ? 0.656 : 0.82}
      >
        <PortalStudy reduced aura hideShaft={heroComposition} heroComposition={heroComposition} />
      </group>

      <group position={[0, -2, 0]}>
        <group position={[0, 2, 0]} scale={[1, heroComposition ? 0.82 : 1, 1]}>
          <group position={[0, 0, -0.2]} rotation={[0.01, 0, 0]} scale={[0.68, 0.76, 0.68]}>
            <RotatingHelicalSpine />
          </group>

          {!heroComposition && <OrbitalLeavesStudy />}

          {!heroComposition && <AnimatedOrbitalGlobe
            radius={2.7}
            phase={235}
            depth={-0.2}
            rotation={[0.08, -0.28, -0.08]}
            scale={0.25}
          />}
          <AnimatedOrbitalGlobe
            radius={2.35}
            phase={130}
            depth={-0.2}
            rotation={[-0.1, 0.34, 0.08]}
            scale={0.18}
            showPartialOrbit={!heroComposition}
            showGuide={heroComposition}
            direction={-1}
          />

          {heroComposition ? (
            <AnimatedOrbitalAperture />
          ) : (
            <group position={[0, stateY, 0.34]} scale={stateScale}>
              <group ref={stateGroupRef}>
                <RotatingAssemblyState slug={activeSlug} />
              </group>
            </group>
          )}
        </group>
      </group>
    </group>
  );
}

function AssemblyScene({ activeSlug }: { activeSlug: TransformationSlug }) {
  return (
    <>
      <ambientLight intensity={0.3} color="#817967" />
      <directionalLight position={[5, 8, 7]} intensity={3.4} color="#e7c99f" />
      <directionalLight position={[-5, 1, 3]} intensity={1.15} color="#66745e" />
      <spotLight position={[1.5, -1.6, 5.2]} intensity={12} angle={0.5} penumbra={0.92} color="#b76536" distance={14} />
      <spotLight position={[0, -3.08, 0.12]} intensity={24} angle={0.38} penumbra={0.96} color="#ff8a4b" distance={8.5} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.15} color="#d9ad74" position={[4, 4, 7]} rotation={[0, Math.PI, 0]} scale={[3, 8, 1]} />
        <Lightformer form="rect" intensity={1.05} color="#68725f" position={[-5, 1, 4]} rotation={[0, -0.6, 0]} scale={[2, 6, 1]} />
        <Lightformer form="ring" intensity={1.4} color="#8f4b31" position={[0, -5, 2]} rotation={[Math.PI / 2, 0, 0]} scale={6} />
      </Environment>

      <LivingMachineApparatus activeSlug={activeSlug} />
      <ContactShadows position={[0, -3.46, 0]} opacity={0.32} scale={9} blur={3.2} far={5.5} frames={1} color="#000000" />
    </>
  );
}

function Scene({ slug }: { slug: StudySlug }) {
  const objectScale =
    slug === "spine" ? 0.84 :
    slug === "botanical-orbits" ? 0.8 :
    slug === "ai-garden" ? 0.88 :
    slug === "portal" || slug === "zinnia" ? 0.84 :
    slug === "dflow" || slug === "waveform" ? 0.96 :
    slug === "technical-cube" ? 0.92 : 0.96;
  const objectY = slug === "portal" ? 0.4 : slug === "spine" || slug === "botanical-orbits" ? 0.12 : 0.3;
  return (
    <>
      <ambientLight intensity={0.34} color="#817967" />
      <directionalLight position={[4, 7, 6]} intensity={3.8} color="#eed4ad" />
      <directionalLight position={[-5, 2, 4]} intensity={1.35} color="#66745e" />
      <spotLight position={[0, -2.4, 4.2]} intensity={14} angle={0.55} penumbra={0.9} color="#cb7740" distance={13} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.4} color="#e3b980" position={[4, 3, 6]} rotation={[0, Math.PI, 0]} scale={[3, 7, 1]} />
        <Lightformer form="rect" intensity={1.25} color="#69745f" position={[-4, 1, 3]} rotation={[0, -0.6, 0]} scale={[2, 5, 1]} />
        <Lightformer form="ring" intensity={1.6} color="#9e5734" position={[0, -4, 2]} rotation={[Math.PI / 2, 0, 0]} scale={5} />
      </Environment>
      <group position={[0, objectY, 0]} scale={objectScale}>
        <Suspense fallback={null}><StudyObject slug={slug} /></Suspense>
      </group>
      <ContactShadows position={[0, -2.45, 0]} opacity={0.38} scale={9} blur={2.8} far={5.5} frames={1} color="#000000" />
    </>
  );
}

export default function StudyWorld({ slug }: { slug: StudySlug }) {
  const cameraPosition: [number, number, number] =
    slug === "portal" ? [3.8, 4.4, 8.8] :
    slug === "technical-cube" ? [3.6, 2.8, 9.6] :
    slug === "spine" || slug === "globe" || slug === "botanical-orbits" ? [2.5, 2.25, 10] :
    [0.9, 1.35, 10.6];
  return (
    <Canvas
      camera={{ position: cameraPosition, fov: 31, near: 0.1, far: 100 }}
      dpr={[1, 1.5]}
      frameloop="demand"
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.98;
      }}
    >
      <color attach="background" args={["#050504"]} />
      <Scene slug={slug} />
    </Canvas>
  );
}

export function AssemblyWorld({ activeSlug }: { activeSlug: TransformationSlug }) {
  return (
    <Canvas
      camera={{ position: [0, 3.4, 13.4], fov: 31, near: 0.1, far: 100 }}
      dpr={[1, 1.5]}
      frameloop="always"
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.96;
      }}
    >
      <color attach="background" args={["#050504"]} />
      <fog attach="fog" args={["#050504", 13, 22]} />
      <Suspense fallback={null}>
        <AssemblyScene activeSlug={activeSlug} />
      </Suspense>
    </Canvas>
  );
}
