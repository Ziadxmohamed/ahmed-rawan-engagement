import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
/** A lightweight articulated 2.5D puppet. Texture art is skinned to actual bones;
 * this is not a fully modelled or facially rigged 3D character. */
export default function SpriteRig({
  texture,
  woman,
  walking,
  step,
  reduced,
  opacity = 1,
}: {
  texture: THREE.Texture;
  woman: boolean;
  walking: boolean;
  step: number;
  reduced: boolean;
  opacity?: number;
}) {
  const pose = useRef({ walking, step });
  pose.current = { walking, step };
  const rig = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(2.6, 2.6, 48, 64);
    const root = new THREE.Bone();
    const spine = new THREE.Bone();
    spine.position.set(0, 0.3, 0);
    root.add(spine);
    const head = new THREE.Bone();
    head.position.set(0, 0.54, 0);
    spine.add(head);
    const leftLeg = new THREE.Bone();
    leftLeg.position.set(-0.12, -0.05, 0);
    root.add(leftLeg);
    const leftKnee = new THREE.Bone();
    leftKnee.position.set(0, -0.56, 0);
    leftLeg.add(leftKnee);
    const rightLeg = new THREE.Bone();
    rightLeg.position.set(0.12, -0.05, 0);
    root.add(rightLeg);
    const rightKnee = new THREE.Bone();
    rightKnee.position.set(0, -0.56, 0);
    rightLeg.add(rightKnee);
    const leftArm = new THREE.Bone();
    leftArm.position.set(-0.24, 0.35, 0);
    spine.add(leftArm);
    const rightArm = new THREE.Bone();
    rightArm.position.set(0.24, 0.35, 0);
    spine.add(rightArm);
    const skirt = new THREE.Bone();
    skirt.position.set(0, -0.1, 0);
    root.add(skirt);
    const bones = [
      root,
      spine,
      head,
      leftLeg,
      leftKnee,
      rightLeg,
      rightKnee,
      leftArm,
      rightArm,
      skirt,
    ];
    const indices: number[] = [],
      weights: number[] = [],
      p = geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i);
      let a = 0,
        b = 0,
        w = 1;
      if (y < -0.05) {
        if (woman) {
          a = 9;
          b = 0;
          w = THREE.MathUtils.smoothstep(-y, 0.05, 0.55);
        } else {
          a = x < 0 ? 3 : 5;
          b = x < 0 ? 4 : 6;
          w = 1 - THREE.MathUtils.smoothstep(-y, 0.48, 0.74);
        }
      } else if (y > 0.8) {
        a = 2;
        b = 1;
        w = THREE.MathUtils.smoothstep(y, 0.8, 0.98);
      } else if (y < 0.74 && Math.abs(x) > 0.22) {
        a = x < 0 ? 7 : 8;
        b = 1;
        w = THREE.MathUtils.smoothstep(Math.abs(x), 0.22, 0.36);
      } else {
        a = 1;
        b = 0;
        w = THREE.MathUtils.smoothstep(y, 0.1, 0.5);
      }
      indices.push(a, b, 0, 0);
      weights.push(w, 1 - w, 0, 0);
    }
    geometry.setAttribute(
      "skinIndex",
      new THREE.Uint16BufferAttribute(indices, 4),
    );
    geometry.setAttribute(
      "skinWeight",
      new THREE.Float32BufferAttribute(weights, 4),
    );
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.015,
      toneMapped: false,
      fog: false,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.SkinnedMesh(geometry, material);
    mesh.add(root);
    mesh.bind(new THREE.Skeleton(bones));
    mesh.frustumCulled = false;
    return { mesh, bones, geometry, material };
  }, [texture, woman]);
  useEffect(() => {
    rig.material.opacity = opacity;
  }, [rig, opacity]);
  useEffect(
    () => () => {
      rig.geometry.dispose();
      rig.material.dispose();
      rig.mesh.skeleton.dispose();
    },
    [rig],
  );
  useFrame(({ clock }, delta) => {
    const { walking, step } = pose.current,
      p = reduced ? 0 : step,
      t = reduced ? 0 : clock.elapsedTime,
      [root, spine, head, l, kneeL, r, kneeR, armL, armR, skirt] = rig.bones;
    const stride = walking && !reduced ? Math.sin(p) : 0;
    const damp = (current: number, target: number) =>
      reduced ? target : THREE.MathUtils.damp(current, target, 10, delta);
    l.rotation.x = damp(l.rotation.x, stride * 0.12);
    r.rotation.x = damp(r.rotation.x, -stride * 0.12);
    kneeL.rotation.x = damp(kneeL.rotation.x, Math.max(0, -stride) * 0.3);
    kneeR.rotation.x = damp(kneeR.rotation.x, Math.max(0, stride) * 0.3);
    l.rotation.z = damp(l.rotation.z, stride * 0.035);
    r.rotation.z = damp(r.rotation.z, stride * 0.035);
    armL.rotation.x = damp(armL.rotation.x, -stride * 0.12);
    armR.rotation.x = damp(armR.rotation.x, stride * 0.12);
    armL.rotation.z = damp(
      armL.rotation.z,
      -stride * 0.025 + Math.sin(t * 1.3) * 0.008,
    );
    armR.rotation.z = damp(
      armR.rotation.z,
      -stride * 0.025 - Math.sin(t * 1.3) * 0.008,
    );
    root.position.y =
      walking && !reduced
        ? Math.abs(Math.sin(p)) * 0.025
        : Math.sin(t * 1.5) * 0.006;
    spine.rotation.z = stride * 0.012;
    head.rotation.z = -stride * 0.008 + Math.sin(t * 0.9) * 0.006;
    skirt.rotation.z = (walking ? stride : Math.sin(t * 0.7)) * 0.012;
    skirt.rotation.x = walking ? Math.abs(stride) * 0.025 : 0;
  });
  return <primitive object={rig.mesh} position={[0, 1.3, 0]} />;
}
