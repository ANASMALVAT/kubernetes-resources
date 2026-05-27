import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Resource } from '../types';
import { resources } from '../data/resources';
import { tiers } from '../data/tiers';
import { computeTierPositions } from './layout';
import { createNodes, type SceneNode } from './createNodes';
import {
  createConnections,
  highlightConnections,
  resetConnections,
} from './createConnections';
import { createTierFloors, highlightTierFloor } from './createTierFloors';
import { createStars } from './createStars';
import { createCore } from './createCore';

export interface SceneHandle {
  dispose: () => void;
  setHoverListener: (listener: (resource: Resource | null) => void) => void;
  setClickListener: (listener: (resource: Resource) => void) => void;
  setActiveTierListener: (listener: (tierId: number | null) => void) => void;
  focusTier: (tierId: number) => void;
  focusAll: () => void;
}

const OVERVIEW_TARGET = new THREE.Vector3(0, 0, 0);
const OVERVIEW_POSITION = new THREE.Vector3(0, 6, 40);
const LERP_FACTOR = 0.08;
const LERP_THRESHOLD = 0.1;
const MAX_PIXEL_RATIO = 1.5;

/**
 * Builds the Three.js scene inside the given container. Rendering is
 * **on demand** — we only call `renderer.render` when something actually
 * changed (user input, focus animation, hover update, resize). The rAF
 * loop still runs, but each idle tick is essentially free.
 */
export function createScene(container: HTMLElement): SceneHandle {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05050f, 0.012);

  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.copy(OVERVIEW_POSITION);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = 'three-canvas';
  container.appendChild(renderer.domElement);

  // Renders happen on demand — set this flag any time the scene needs to be
  // repainted. Declared before OrbitControls so the change listener below
  // can capture it cleanly.
  let needsRender = true;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = false;
  controls.minDistance = 12;
  controls.maxDistance = 80;
  controls.target.copy(OVERVIEW_TARGET);

  // OrbitControls applies wheel zoom synchronously inside its own event
  // handler and calls update() once. Our animate-loop call to update()
  // afterwards sees no change, so without this listener the wheel would
  // move the camera in memory but never trigger a redraw. The 'change'
  // event fires for every camera-affecting interaction.
  controls.addEventListener('change', () => {
    needsRender = true;
  });

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  scene.add(makePointLight(0x9b8cff, 1.0, new THREE.Vector3(0, 0, 0)));
  scene.add(makePointLight(0xec4899, 0.35, new THREE.Vector3(15, 14, -10)));
  scene.add(makePointLight(0x22d3ee, 0.35, new THREE.Vector3(-15, -14, 10)));

  scene.add(createStars());

  const { group: tierFloorsGroup, tierMeshes } = createTierFloors();
  scene.add(tierFloorsGroup);

  const core = createCore();
  scene.add(core.group);

  const positions = computeTierPositions();
  const { group: nodesGroup, nodes } = createNodes({ resources, positions });
  scene.add(nodesGroup);

  const { group: connectionsGroup, connections } = createConnections({
    resources,
    positions,
  });
  scene.add(connectionsGroup);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const raycastTargets: THREE.Object3D[] = nodes.map((n) => n.mesh);
  let hoveredMesh: SceneNode['mesh'] | null = null;

  // Each node mesh has a translucent glow sphere as a child. The glow is
  // larger than the inner icosahedron, so a ray will often hit the glow
  // first — but only the inner mesh carries the userData.resource we need.
  // Walk up from any hit object to find that mesh.
  function findNodeMesh(object: THREE.Object3D): SceneNode['mesh'] | null {
    let current: THREE.Object3D | null = object;
    while (current) {
      if ((current.userData as { resource?: Resource }).resource) {
        return current as SceneNode['mesh'];
      }
      current = current.parent;
    }
    return null;
  }

  const desiredTarget = OVERVIEW_TARGET.clone();
  const desiredPosition = OVERVIEW_POSITION.clone();
  let isAnimatingFocus = false;

  let onHover: (resource: Resource | null) => void = () => {};
  let onClick: (resource: Resource) => void = () => {};
  let onActiveTierChange: (tierId: number | null) => void = () => {};

  function handlePointerMove(event: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    updateHover();
  }

  function handlePointerLeave() {
    if (hoveredMesh) clearHover();
  }

  function handleClick() {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(raycastTargets);
    if (hits.length === 0) return;
    const mesh = findNodeMesh(hits[0].object);
    if (mesh) onClick(mesh.userData.resource as Resource);
  }

  function handleResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    needsRender = true;
  }

  renderer.domElement.addEventListener('pointermove', handlePointerMove);
  renderer.domElement.addEventListener('pointerleave', handlePointerLeave);
  renderer.domElement.addEventListener('click', handleClick);
  window.addEventListener('resize', handleResize);

  function setActiveTier(tierId: number | null) {
    highlightTierFloor(tierMeshes, tierId);
    onActiveTierChange(tierId);
    needsRender = true;
  }

  function focusTier(tierId: number) {
    const tier = tiers.find((t) => t.id === tierId);
    if (!tier) return;

    desiredTarget.set(0, tier.y, 0);

    // Preserve the user's current horizontal viewing angle, just slide to
    // the new tier's Y at a comfortable distance.
    const horizontalDistance = Math.hypot(camera.position.x, camera.position.z);
    const safeDistance = Math.min(Math.max(horizontalDistance, 14), 20);
    const angle = Math.atan2(camera.position.z, camera.position.x) || 0;
    desiredPosition.set(
      Math.cos(angle) * safeDistance,
      tier.y + 2,
      Math.sin(angle) * safeDistance
    );

    isAnimatingFocus = true;
    needsRender = true;
    setActiveTier(tierId);
  }

  function focusAll() {
    desiredTarget.copy(OVERVIEW_TARGET);
    desiredPosition.copy(OVERVIEW_POSITION);
    isAnimatingFocus = true;
    needsRender = true;
    setActiveTier(null);
  }

  function updateHover() {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(raycastTargets);

    if (hits.length > 0) {
      const mesh = findNodeMesh(hits[0].object);
      if (mesh && hoveredMesh !== mesh) {
        clearHover();
        hoveredMesh = mesh;
        mesh.scale.set(1.4, 1.4, 1.4);
        mesh.material.emissiveIntensity = 1.4;
        renderer.domElement.style.cursor = 'pointer';
        const resource = mesh.userData.resource as Resource;
        highlightConnections(connections, resource.id);
        onHover(resource);
        needsRender = true;
      }
    } else if (hoveredMesh) {
      clearHover();
    }
  }

  function clearHover() {
    if (!hoveredMesh) return;
    hoveredMesh.scale.set(1, 1, 1);
    hoveredMesh.material.emissiveIntensity = 0.7;
    hoveredMesh = null;
    renderer.domElement.style.cursor = 'grab';
    resetConnections(connections);
    onHover(null);
    needsRender = true;
  }

  let frame = 0;
  function animate() {
    try {
      if (isAnimatingFocus) {
        camera.position.lerp(desiredPosition, LERP_FACTOR);
        controls.target.lerp(desiredTarget, LERP_FACTOR);
        if (
          camera.position.distanceTo(desiredPosition) < LERP_THRESHOLD &&
          controls.target.distanceTo(desiredTarget) < LERP_THRESHOLD
        ) {
          isAnimatingFocus = false;
        }
        updateHover();
        needsRender = true;
      }

      // controls.update() returns true while damping is still settling.
      // When it returns false and needsRender is false, the scene is idle
      // and we don't touch the GPU.
      if (controls.update()) {
        updateHover();
        needsRender = true;
      }

      if (needsRender) {
        renderer.render(scene, camera);
        needsRender = false;
      }
    } catch (err) {
      // Never let an error kill the rAF chain — if this loop dies the
      // canvas freezes and the cursor sticks. Log and keep going.
      console.error('[three] render loop error:', err);
    }
    frame = requestAnimationFrame(animate);
  }
  animate();

  return {
    setHoverListener: (listener) => {
      onHover = listener;
    },
    setClickListener: (listener) => {
      onClick = listener;
    },
    setActiveTierListener: (listener) => {
      onActiveTierChange = listener;
    },
    focusTier,
    focusAll,
    dispose: () => {
      cancelAnimationFrame(frame);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
      renderer.domElement.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.domElement.parentNode?.removeChild(renderer.domElement);
      renderer.dispose();
      disposeScene(scene);
    },
  };
}

function makePointLight(color: number, intensity: number, position: THREE.Vector3) {
  const light = new THREE.PointLight(color, intensity, 100);
  light.position.copy(position);
  return light;
}

function disposeScene(scene: THREE.Scene) {
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
      obj.geometry?.dispose?.();
      const material = obj.material;
      if (Array.isArray(material)) {
        material.forEach((m) => m.dispose());
      } else if (material) {
        (material as THREE.Material).dispose();
      }
    }
  });
}
