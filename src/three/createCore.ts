import * as THREE from 'three';

/**
 * The central wireframe icosahedron + glow sphere — purely decorative,
 * gives the scene a focal point on the Y axis between the tier rings.
 */
export function createCore(): { group: THREE.Group; tick: (time: number) => void } {
  const group = new THREE.Group();
  group.name = 'core';

  const wireframe = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.7, 1),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xa78bfa,
      emissiveIntensity: 1.4,
      wireframe: true,
    })
  );
  group.add(wireframe);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(1.4, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xa78bfa,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
    })
  );
  group.add(glow);

  function tick(time: number) {
    wireframe.rotation.x += 0.002;
    wireframe.rotation.y += 0.003;
    glow.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
  }

  return { group, tick };
}
