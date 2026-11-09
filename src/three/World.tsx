import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import {
  Billboard,
  Environment,
  Html,
  Lightformer,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import type { Mode } from "../lib/core";
import type { Dialogue } from "../story";
import SpeechBubble from "../components/SpeechBubble";
import SpriteRig from "./SpriteRig";

const gold = "#cfad73",
  cream = "#f4e6cc",
  wine = "#641d37",
  green = "#324739";
function Ball({
  at,
  scale = 1,
  color = cream,
}: {
  at: [number, number, number];
  scale?: number | [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={at} scale={scale} castShadow>
      <sphereGeometry args={[1, 20, 16]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}
function Box({
  at,
  size,
  color = cream,
}: {
  at: [number, number, number];
  size: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={at} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}
function Column({ x, z = 0, h = 3 }: { x: number; z?: number; h?: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.17, h, 16]} />
        <meshStandardMaterial color={cream} />
      </mesh>
      {[0.12, h - 0.1].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.16, 20]} />
          <meshStandardMaterial color={gold} metalness={0.55} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}
function Flowers({
  x,
  z,
  scale = 1,
}: {
  x: number;
  z: number;
  scale?: number;
}) {
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.17, 0.45, 16]} />
        <meshStandardMaterial color={cream} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => {
        const a = i * 2.4,
          r = 0.12 + (i % 3) * 0.09,
          y = 0.65 + (i % 4) * 0.14;
        return (
          <group key={i} position={[Math.cos(a) * r, y, Math.sin(a) * r]}>
            <mesh position={[0, -0.22, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.5, 5]} />
              <meshStandardMaterial color={green} />
            </mesh>
            <Ball
              at={[0.09, -0.1, 0]}
              scale={[0.16, 0.035, 0.07]}
              color={green}
            />
            {[0, 1, 2, 3, 4].map((p) => (
              <Ball
                key={p}
                at={[
                  Math.cos(p * 1.257) * 0.065,
                  0.01,
                  Math.sin(p * 1.257) * 0.065,
                ]}
                scale={[0.085, 0.055, 0.085]}
                color={
                  i % 3 === 0 ? "#a65c6e" : i % 3 === 1 ? "#f1d8ca" : "#dfb0af"
                }
              />
            ))}
            <Ball at={[0, 0.05, 0]} scale={0.055} color={gold} />
          </group>
        );
      })}
    </group>
  );
}
function Candle({ at }: { at: [number, number, number] }) {
  const flame = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (flame.current)
      flame.current.scale.y = 1 + Math.sin(clock.elapsedTime * 5 + at[0]) * 0.1;
  });
  return (
    <group position={at}>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.28, 12]} />
        <meshStandardMaterial color="#f9ecd4" />
      </mesh>
      <mesh ref={flame} position={[0, 0.31, 0]} scale={[0.022, 0.055, 0.022]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ffcf7c" />
      </mesh>
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.03, 16]} />
        <meshStandardMaterial color={gold} metalness={0.7} roughness={0.25} />
      </mesh>
    </group>
  );
}
function Garden() {
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side}>
          <Flowers x={side * 1.95} z={-0.8} scale={1.2} />
          <Flowers x={side * 2.3} z={0.3} scale={0.8} />
          <Flowers x={side * 1.65} z={1.05} scale={0.65} />
          {[0, 1, 2, 3].map((i) => (
            <Candle key={i} at={[side * (1.3 + i * 0.22), 0, 0.5 + i * 0.18]} />
          ))}
          <Column x={side * 2.8} z={-2} h={3.7} />
        </group>
      ))}
    </group>
  );
}

/** Illustrated cinematic characters, layered as animated cutouts in the 3D set.
 * These are original fictional designs, not likenesses or rigged talking models.
 */
export function Character({
  kind,
  x = 0,
  z = 0,
  talking = false,
  scene = 2,
  reduced = false,
  progress = 0,
  dialogue = null,
  intro = false,
  anchorX,
}: {
  kind: "ahmed" | "rawan" | "friend" | "other";
  x?: number;
  z?: number;
  talking?: boolean;
  scene?: number;
  reduced?: boolean;
  progress?: number;
  dialogue?: Dialogue | null;
  intro?: boolean;
  anchorX?: number;
}) {
  const root = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const walking =
    !intro &&
    ((scene === 2 && kind === "ahmed" && progress < 0.32) ||
      (scene === 4 && kind === "friend" && progress < 0.18) ||
      (scene === 3 && progress < 0.2));
  const step =
    scene === 2
      ? (progress / 0.32) * Math.PI * 6
      : scene === 3
        ? (progress / 0.2) * Math.PI * 4
        : (progress / 0.18) * Math.PI * 5;
  const atlas = useLoader(THREE.TextureLoader, "/characters.webp");
  const texture = useMemo(() => {
    const t = atlas.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.repeat.set(0.5, 0.5);
    const index = { ahmed: 0, rawan: 1, friend: 2, other: 3 }[kind];
    t.offset.set((index % 2) * 0.5, index < 2 ? 0.5 : 0);
    t.needsUpdate = true;
    return t;
  }, [atlas, kind]);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame(({ clock }, delta) => {
    if (!root.current) return;
    const desiredX =
      intro && anchorX !== undefined
        ? ((anchorX * 2 - 1) *
            (camera.position.z - z) *
            Math.tan(
              THREE.MathUtils.degToRad(
                (camera as THREE.PerspectiveCamera).fov / 2,
              ),
            ) *
            size.width) /
          size.height
        : x;
    const approach =
      !intro && scene === 2 && kind === "ahmed"
        ? THREE.MathUtils.lerp(-2.1, x, Math.min(1, progress / 0.32))
        : !intro && scene === 4 && kind === "friend"
          ? THREE.MathUtils.lerp(-3.2, x, Math.min(1, progress / 0.18))
          : scene === 3
            ? THREE.MathUtils.lerp(
                kind === "ahmed" ? -1.5 : 1.5,
                x,
                Math.min(1, progress / 0.2),
              )
            : desiredX;
    root.current.position.x = reduced
      ? desiredX
      : THREE.MathUtils.damp(root.current.position.x, approach, 5, delta);
    if (reduced) return;
    root.current.position.y =
      (intro ? -0.2 : 0) + Math.sin(clock.elapsedTime * 1.3 + x) * 0.008;
    const targetScale = talking ? 1.035 : 1;
    root.current.scale.setScalar(
      THREE.MathUtils.damp(root.current.scale.x, targetScale, 4, delta),
    );
    root.current.rotation.z = THREE.MathUtils.damp(
      root.current.rotation.z,
      talking ? Math.sin(clock.elapsedTime * 1.7) * 0.012 : 0,
      4,
      delta,
    );
  });
  return (
    <group ref={root} position={[x, 0, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.28, 24]} />
        <meshBasicMaterial
          color="#171018"
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </mesh>
      <Billboard lockX lockZ>
        <SpriteRig
          texture={texture}
          woman={kind === "rawan"}
          walking={walking}
          opacity={
            intro ? 1 - THREE.MathUtils.smoothstep(progress, 0.28, 0.5) : 1
          }
          step={step}
          reduced={reduced}
        />
      </Billboard>
      {talking && dialogue && (
        <Html
          center
          position={[
            x < -1 ? 0.35 : x < 0 ? 0.15 : -0.15,
            size.width < 600 ? 3.25 : 3.05,
            0.15,
          ]}
          zIndexRange={[8, 1]}
          style={{ pointerEvents: "none" }}
        >
          <div
            className={`anchored-bubble ${x < 0 ? "from-left" : "from-right"}`}
          >
            <SpeechBubble
              name={dialogue.speaker}
              text={dialogue.text}
              side={x < 0 ? "left" : "right"}
            />
          </div>
        </Html>
      )}
    </group>
  );
}
function HoldingCouple({ reduced }: { reduced: boolean }) {
  const source = useLoader(THREE.TextureLoader, "/couple-holding.webp"),
    root = useRef<THREE.Group>(null);
  const texture = useMemo(() => {
    const t = source.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, [source]);
  useEffect(() => () => texture.dispose(), [texture]);
  useEffect(() => {
    if (!root.current || reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        root.current!.scale,
        { x: 0.96, y: 0.96, z: 0.96 },
        { x: 1, y: 1, z: 1, duration: 0.9, ease: "power2.out" },
      );
    });
    return () => ctx.revert();
  }, [reduced]);
  useFrame(({ clock }) => {
    if (root.current && !reduced)
      root.current.position.y = Math.sin(clock.elapsedTime * 1.1) * 0.008;
  });
  return (
    <group ref={root} position={[0.2, 0, 0.2]}>
      <Billboard lockX lockZ>
        <mesh position={[0, 1.4, 0]}>
          <planeGeometry args={[(2.8 * 2) / 3, 2.8]} />
          <meshBasicMaterial
            map={texture}
            transparent
            alphaTest={0.08}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Billboard>
    </group>
  );
}
function House() {
  return (
    <group position={[0, 0, -1]} scale={0.9}>
      <Box at={[0, 0.85, 0]} size={[2.5, 1.7, 1.4]} color="#dfc4a7" />
      <mesh position={[0, 1.95, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.95, 1, 4]} />
        <meshStandardMaterial color={wine} />
      </mesh>
      <Box at={[0, 0.55, 0.72]} size={[0.48, 1.1, 0.06]} color="#526354" />
      {[-0.8, 0.8].map((x) => (
        <group key={x}>
          <Box at={[x, 1.05, 0.72]} size={[0.55, 0.6, 0.07]} color={gold} />
          <Box at={[x, 1.05, 0.77]} size={[0.42, 0.47, 0.03]} color="#fff2ba" />
          <Box at={[x, 1.05, 0.8]} size={[0.025, 0.47, 0.02]} color={wine} />
        </group>
      ))}
      <Flowers x={-1.7} z={0.6} />
      <Flowers x={1.7} z={0.6} />
    </group>
  );
}
function paperTexture(text: string, sub: string, bg: string, fg: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 640);
  ctx.strokeStyle = fg;
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, 964, 580);
  ctx.strokeRect(42, 42, 940, 556);
  ctx.fillStyle = fg;
  ctx.textAlign = "center";
  ctx.font = "italic 90px Georgia";
  ctx.fillText(text, 512, 300);
  ctx.font = "22px Georgia";
  ctx.fillText(sub, 512, 370);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
function Envelope({
  open,
  reduced,
  onOpen,
  openProgress,
}: {
  open: boolean;
  reduced: boolean;
  onOpen: () => void;
  openProgress: number;
}) {
  const group = useRef<THREE.Group>(null),
    flap = useRef<THREE.Group>(null),
    seal = useRef<THREE.Group>(null),
    card = useRef<THREE.Mesh>(null);
  const textures = useMemo(
    () => [
      paperTexture("A & R", "OUR NEXT CHAPTER", wine, gold),
      paperTexture("Ahmed & Rawan", "NOVEMBER 13, 2026", cream, wine),
    ],
    [],
  );
  const triangle = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.4, 0);
    s.lineTo(1.4, 0);
    s.lineTo(0, -0.86);
    s.closePath();
    return new THREE.ShapeGeometry(s);
  }, []);
  useEffect(
    () => () => {
      textures.forEach((t) => t.dispose());
      triangle.dispose();
    },
    [textures, triangle],
  );
  useEffect(() => {
    if (!seal.current || !flap.current || !card.current) return;
    const p = openProgress,
      d = reduced ? 0 : 0.15;
    const sealScale = 1 - THREE.MathUtils.smoothstep(p, 0, 0.22);
    gsap.to(seal.current.scale, {
      x: sealScale,
      y: sealScale,
      z: sealScale,
      duration: d,
      overwrite: true,
    });
    gsap.to(flap.current.rotation, {
      x: -Math.PI * THREE.MathUtils.smoothstep(p, 0.18, 0.65),
      duration: d,
      overwrite: true,
    });
    gsap.to(card.current.position, {
      y: 0.03 + 1.22 * THREE.MathUtils.smoothstep(p, 0.5, 1),
      z: 0.12,
      duration: d,
      overwrite: true,
    });
  }, [openProgress, reduced]);
  useFrame(({ clock }, delta) => {
    if (group.current && !open && !reduced) {
      group.current.position.y =
        1.65 + Math.sin(clock.elapsedTime * 0.8) * 0.05;
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        Math.sin(clock.elapsedTime * 0.3) * 0.09,
        3,
        delta,
      );
    }
  });
  return (
    <group
      ref={group}
      position={[0, 1.65, 0.5]}
      rotation={[-0.04, -0.13, -0.04]}
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
    >
      <mesh position={[0, 0, -0.08]} castShadow>
        <boxGeometry args={[2.85, 1.8, 0.12]} />
        <meshStandardMaterial color={wine} roughness={0.7} />
      </mesh>
      <mesh ref={card} position={[0, 0.03, -0.005]}>
        <planeGeometry args={[2.65, 1.65]} />
        <meshStandardMaterial map={textures[1]} />
      </mesh>
      <mesh position={[0, -0.05, 0.05]} castShadow>
        <boxGeometry args={[2.85, 1.7, 0.08]} />
        <meshStandardMaterial map={textures[0]} roughness={0.7} />
      </mesh>
      <group ref={flap} position={[0, 0.83, 0.105]}>
        <mesh geometry={triangle}>
          <meshStandardMaterial
            color="#7a2a43"
            side={THREE.DoubleSide}
            roughness={0.6}
          />
        </mesh>
      </group>
      <group ref={seal} position={[0, -0.02, 0.19]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.23, 0.23, 0.065, 40]} />
          <meshStandardMaterial color={gold} metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <torusGeometry args={[0.18, 0.01, 8, 40]} />
          <meshStandardMaterial
            color="#a27c41"
            metalness={0.6}
            roughness={0.35}
          />
        </mesh>
        <mesh position={[0, 0, 0.045]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.11, 0.11, 0.015]} />
          <meshStandardMaterial
            color="#9b753d"
            metalness={0.5}
            roughness={0.4}
          />
        </mesh>
      </group>
    </group>
  );
}
function initialTexture(letter: string) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "italic 174px Georgia";
  ctx.shadowColor = "#ffe3a0";
  ctx.shadowBlur = 24;
  ctx.fillStyle = "#fff3cb";
  ctx.fillText(letter, 128, 139);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
function WeddingRings({
  progress,
  reduced,
  intro = false,
}: {
  progress: number;
  reduced: boolean;
  intro?: boolean;
}) {
  const a = useRef<THREE.Group>(null),
    b = useRef<THREE.Group>(null),
    root = useRef<THREE.Group>(null),
    ia = useRef<THREE.MeshBasicMaterial>(null),
    ib = useRef<THREE.MeshBasicMaterial>(null);
  const { size } = useThree();
  const letters = useMemo(() => [initialTexture("A"), initialTexture("R")], []);
  useEffect(() => () => letters.forEach((t) => t.dispose()), [letters]);
  useFrame(({ clock }, delta) => {
    if (!a.current || !b.current || !root.current) return;
    const p = reduced
      ? 1
      : intro
        ? THREE.MathUtils.clamp((progress - 0.32) / 0.45, 0, 1)
        : 1;
    const blend = THREE.MathUtils.smoothstep(p, 0, 1),
      t = reduced ? 0 : clock.elapsedTime,
      spread = 0.95 * (1 - blend);
    root.current.visible = !intro || progress > 0.28;
    const targetScale = intro
      ? (size.width < 600 ? 1.6 : 2.5) *
        THREE.MathUtils.lerp(0.65, 1, Math.min(1, p * 2))
      : 0.58;
    root.current.scale.setScalar(
      reduced
        ? targetScale
        : THREE.MathUtils.damp(root.current.scale.x, targetScale, 5, delta),
    );
    root.current.rotation.set(0.08, -0.55 + Math.sin(t * 0.22) * 0.025, -0.12);
    a.current.position.set(-0.16 - spread, 0, 0);
    b.current.position.set(
      0.1 + spread,
      0.12 + Math.sin(Math.PI * blend) * 0.3,
      0.16 + Math.sin(Math.PI * blend) * 0.7,
    );
    a.current.rotation.set(0.06, 0, 0.12);
    b.current.rotation.set(
      0,
      THREE.MathUtils.lerp(0.18, Math.PI / 2, blend),
      0,
    );
    const shine =
      THREE.MathUtils.smoothstep(p, 0.82, 1) *
      (reduced ? 1 : 0.88 + Math.sin(t * 1.7) * 0.12);
    if (ia.current) ia.current.opacity = shine;
    if (ib.current) ib.current.opacity = shine;
  });
  return (
    <group ref={root} position={[0, intro ? 2.05 : 1.0, 1.2]}>
      <group ref={a}>
        <mesh castShadow>
          <torusGeometry args={[0.38, 0.065, 24, 128]} />
          <meshPhysicalMaterial
            color="#deb467"
            metalness={0.92}
            roughness={0.13}
            clearcoat={0.7}
            envMapIntensity={1.8}
          />
        </mesh>
        <mesh position={[0, 0, 0.042]}>
          <torusGeometry args={[0.38, 0.008, 8, 96]} />
          <meshStandardMaterial
            color="#ffe4aa"
            metalness={0.85}
            roughness={0.17}
          />
        </mesh>
        <Billboard position={[0, 0, 0.09]}>
          <mesh renderOrder={30}>
            <planeGeometry args={[0.24, 0.24]} />
            <meshBasicMaterial
              ref={ia}
              depthTest={false}
              map={letters[0]}
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </Billboard>
      </group>
      <group ref={b}>
        <mesh castShadow>
          <torusGeometry args={[0.33, 0.056, 24, 128]} />
          <meshPhysicalMaterial
            color="#e9c58a"
            metalness={0.92}
            roughness={0.12}
            clearcoat={0.7}
            envMapIntensity={1.8}
          />
        </mesh>
        <mesh position={[0, 0, 0.038]}>
          <torusGeometry args={[0.33, 0.007, 8, 96]} />
          <meshStandardMaterial
            color="#ffeac5"
            metalness={0.85}
            roughness={0.15}
          />
        </mesh>
        <Billboard position={[0, 0, 0.08]}>
          <mesh renderOrder={31}>
            <planeGeometry args={[0.23, 0.23]} />
            <meshBasicMaterial
              ref={ib}
              depthTest={false}
              map={letters[1]}
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </Billboard>
      </group>
      {!reduced && (
        <Sparkles
          count={12}
          scale={[1.4, 1, 1]}
          size={2.3}
          speed={0.12}
          color="#ffe6a7"
        />
      )}
    </group>
  );
}
function CameraRig({
  scene,
  mode,
  reduced,
  progress,
  intro,
  openProgress,
}: {
  scene: number;
  mode: Mode;
  reduced: boolean;
  progress: number;
  intro: boolean;
  openProgress: number;
}) {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    invalidate();
  }, [scene, mode, reduced, progress, intro, openProgress, invalidate]);
  useFrame((state, delta) => {
    const mobile = size.width < 600,
      story = mode === "story";
    const distance = intro
      ? mobile
        ? 10.7
        : 9.2
      : story
        ? mobile
          ? scene === 4
            ? 10.2
            : scene === 1
              ? 9.3
              : 9.5
          : 7.4
        : mobile
          ? 9.6
          : 7.4;
    const dolly = reduced ? 0 : progress * (intro ? 1.0 : 0.6);
    const orbit = !reduced && story && scene === 2 ? (progress - 0.5) * 1.2 : 0;
    const targetX = orbit + (reduced ? 0 : state.pointer.x * 0.06),
      targetY = intro ? 3.6 : story ? 2.9 : 3.3,
      targetZ =
        Math.max(
          distance - dolly,
          mobile && story && !intro
            ? 3.4 /
                ((2 *
                  Math.tan(
                    THREE.MathUtils.degToRad(
                      (camera as THREE.PerspectiveCamera).fov / 2,
                    ),
                  ) *
                  size.width) /
                  size.height) +
                0.8
            : 0,
        ) -
        openProgress * 1.3;
    if (reduced) camera.position.set(targetX, targetY, targetZ);
    else {
      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        targetX,
        3,
        delta,
      );
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        targetY,
        3,
        delta,
      );
      camera.position.z = THREE.MathUtils.damp(
        camera.position.z,
        targetZ,
        3,
        delta,
      );
    }
    camera.lookAt(0, intro ? 2.15 : story ? 1.7 : 2.0, 0);
  }, -1);
  return null;
}
function Set({
  scene,
  mode,
  talking,
  reduced,
  open,
  onOpen,
  progress,
  intro,
  dialogue,
  introAnchors,
  openProgress,
}: {
  scene: number;
  mode: Mode;
  talking: string;
  reduced: boolean;
  open: boolean;
  onOpen: () => void;
  progress: number;
  intro: boolean;
  dialogue: Dialogue | null;
  introAnchors: { ahmed: number; rawan: number };
  openProgress: number;
}) {
  const story = mode === "story";
  return (
    <>
      <fog attach="fog" args={["#241c23", 10, 23]} />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={3} position={[0, 5, 4]} scale={[8, 4, 1]} />
        <Lightformer
          intensity={2}
          position={[-5, 2, -2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[3, 6, 1]}
          color="#ffd4a4"
        />
        <Lightformer
          intensity={2}
          position={[5, 2, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[3, 6, 1]}
        />
      </Environment>
      <ambientLight intensity={1.2} color="#ead5c3" />
      <hemisphereLight args={["#f9e3cc", "#40352c", 1.1]} />
      <directionalLight
        position={[-3, 6, 5]}
        intensity={3}
        color="#ffe4b5"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={6}
        shadow-camera-bottom={-3}
        shadow-normalBias={0.04}
      />
      <directionalLight position={[3, 3, -3]} intensity={3} color="#f5b0a1" />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.4, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <shadowMaterial transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <group key={story ? scene : "envelope"}>
        {!story && <Garden />}
        {story && scene === 3 && (
          <group scale={0.35} position={[0, 0.18, -0.8]}>
            <House />
          </group>
        )}
        {story ? (
          <>
            {scene === 4 ? (
              <>
                <HoldingCouple reduced={reduced} />
                <Character
                  kind="friend"
                  x={-1.15}
                  z={0.7}
                  talking={!intro && talking === "friend"}
                  scene={scene}
                  reduced={reduced}
                  progress={progress}
                  dialogue={dialogue}
                />
              </>
            ) : scene === 0 ? (
              <>
                <Character
                  kind="friend"
                  x={-0.75}
                  talking={talking === "friend"}
                  scene={scene}
                  reduced={reduced}
                  progress={progress}
                  dialogue={dialogue}
                  intro={intro}
                />
                <Character
                  kind="other"
                  x={0.75}
                  talking={talking === "other"}
                  scene={scene}
                  reduced={reduced}
                  progress={progress}
                  dialogue={dialogue}
                  intro={intro}
                />
              </>
            ) : (
              <>
                <Character
                  anchorX={introAnchors.ahmed}
                  kind="ahmed"
                  x={scene === 1 ? 0.55 : -0.85}
                  z={scene === 3 ? 0.8 : 0.2}
                  talking={talking === "ahmed"}
                  scene={scene}
                  reduced={reduced}
                  progress={progress}
                  dialogue={dialogue}
                  intro={intro}
                />
                {scene === 1 ? (
                  <Character
                    kind="friend"
                    x={-1.0}
                    talking={talking === "friend"}
                    scene={scene}
                    reduced={reduced}
                    progress={progress}
                    dialogue={dialogue}
                    intro={intro}
                  />
                ) : (
                  <Character
                    anchorX={introAnchors.rawan}
                    kind="rawan"
                    x={0.9}
                    z={scene === 3 ? 0.8 : 0.2}
                    talking={talking === "rawan"}
                    scene={scene}
                    reduced={reduced}
                    progress={progress}
                    dialogue={dialogue}
                    intro={intro}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <>
            <mesh position={[0, 0.35, 0.4]} castShadow>
              <cylinderGeometry args={[0.75, 0.95, 0.7, 48]} />
              <meshStandardMaterial color="#dbc5a5" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.72, 0.4]}>
              <cylinderGeometry args={[0.82, 0.82, 0.05, 48]} />
              <meshStandardMaterial
                color={gold}
                metalness={0.5}
                roughness={0.4}
              />
            </mesh>
            <Envelope
              open={open}
              openProgress={openProgress}
              reduced={reduced}
              onOpen={onOpen}
            />
          </>
        )}
      </group>
      {!reduced && (
        <Sparkles
          count={window.innerWidth < 600 ? 22 : 45}
          scale={[7, 4, 5]}
          size={2}
          speed={0.22}
          color="#f6d69b"
          opacity={0.65}
        />
      )}
      {story && scene === 1 && talking === "rawan" && dialogue && (
        <Html
          center
          position={[0.35, 3.05, 0.5]}
          zIndexRange={[8, 1]}
          style={{ pointerEvents: "none" }}
        >
          <div className="message-phone">
            <span className="phone-notch" />
            <SpeechBubble name="روان" text={dialogue.text} phone side="right" />
          </div>
        </Html>
      )}
      {(intro || !story || (scene === 2 && progress > 0.84)) && (
        <WeddingRings progress={progress} reduced={reduced} intro={intro} />
      )}
      <CameraRig
        scene={scene}
        mode={mode}
        reduced={reduced}
        progress={progress}
        intro={intro}
        openProgress={openProgress}
      />
    </>
  );
}
export default function World(props: {
  scene: number;
  mode: Mode;
  talking: string;
  reduced: boolean;
  open: boolean;
  onOpen: () => void;
  onFailure: () => void;
  progress: number;
  intro: boolean;
  dialogue: Dialogue | null;
  introAnchors: { ahmed: number; rawan: number };
  openProgress: number;
}) {
  return (
    <Canvas
      frameloop={props.reduced ? "demand" : "always"}
      shadows
      dpr={[
        1,
        Math.min(window.devicePixelRatio, window.innerWidth < 600 ? 1.3 : 1.75),
      ]}
      camera={{ position: [0, 2.9, 8.5], fov: 39 }}
      gl={{ antialias: true, powerPreference: "low-power", alpha: true }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          "webglcontextlost",
          (e) => {
            e.preventDefault();
            props.onFailure();
          },
          { once: true },
        );
      }}
      fallback={
        <span>
          Garden illustration unavailable. Your invitation is ready below.
        </span>
      }
    >
      <Set {...props} />
    </Canvas>
  );
}
