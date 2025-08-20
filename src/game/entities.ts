import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import type { Materials } from './physics';

export type Rigid = { mesh: THREE.Object3D; body: CANNON.Body };
export type Player = Rigid & { size: number };
export type Ball = Rigid & { radius: number };

export function createPlayers(scene: THREE.Scene, world: CANNON.World, materials: Materials) {
  const p1 = makePlayer(scene, world, materials, 0x00aaff, -15);
  const p2 = makePlayer(scene, world, materials, 0xff5555,  15);
  return { p1, p2 };
}

export function createBall(scene: THREE.Scene, world: CANNON.World, materials: Materials): Ball {
  const radius = 0.54; // 缩小40%（原 0.9）
  const sphereGeo = new THREE.SphereGeometry(radius, 24, 16);
  const baseMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const mesh = new THREE.Mesh(sphereGeo, baseMat);
  mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh);

  // 物理球体
  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({
    mass: 1.2,
    position: new CANNON.Vec3(0, radius + 0.05, 0),
    material: materials.ball,
    linearDamping: 0.05,
    angularDamping: 0.1
  });
  body.addShape(shape);
  world.addBody(body);
  return { mesh, body, radius };
}

function makePlayer(scene: THREE.Scene, world: CANNON.World, materials: Materials, color: number, x: number): Player {
  const size = 0.9; // 缩小40%（原 1.5）
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), new THREE.MeshLambertMaterial({ color }));
  mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh);

  const shape = new CANNON.Box(new CANNON.Vec3(size/2, size/2, size/2));
  const body = new CANNON.Body({
    mass: 6,
    position: new CANNON.Vec3(x, size/2 + 0.05, 0),
    material: materials.cube,
    linearDamping: 0.2,
    angularDamping: 0.9
  });
  body.addShape(shape);
  world.addBody(body);
  return { mesh, body, size };
}

