import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { FIELD_W, FIELD_D, WALL_H, WALL_T, GOAL_W } from './constants';

export type Materials = {
  ground: CANNON.Material;
  ball: CANNON.Material;
  cube: CANNON.Material;
};

export function createWorld() {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.allowSleep = true;

  const ground = new CANNON.Material('ground');
  const ball   = new CANNON.Material('ball');
  const cube   = new CANNON.Material('cube');

  world.addContactMaterial(new CANNON.ContactMaterial(ground, ball, { friction: 0.25, restitution: 0.35 }));
  world.addContactMaterial(new CANNON.ContactMaterial(ground, cube, { friction: 0.6, restitution: 0.0 }));
  world.addContactMaterial(new CANNON.ContactMaterial(cube,   ball, { friction: 0.3, restitution: 0.2 }));
  world.addContactMaterial(new CANNON.ContactMaterial(cube,   cube, { friction: 0.5, restitution: 0.0 }));
  world.addContactMaterial(new CANNON.ContactMaterial(ball,   ball, { friction: 0.25, restitution: 0.6 }));

  return { world, materials: { ground, ball, cube } };
}

export function addFieldAndWalls(scene: THREE.Scene, world: CANNON.World, materials: Materials) {
  const groundBody = new CANNON.Body({ type: CANNON.Body.STATIC, material: materials.ground });
  groundBody.addShape(new CANNON.Plane());
  groundBody.quaternion.setFromEuler(-Math.PI/2, 0, 0);
  world.addBody(groundBody);

  // 顶、底边界墙
  addWall(scene, world, 0,  FIELD_D/2 + WALL_T/2, FIELD_W + WALL_T*2, WALL_T, materials.ground);
  addWall(scene, world, 0, -FIELD_D/2 - WALL_T/2, FIELD_W + WALL_T*2, WALL_T, materials.ground);

  // 端线围墙（除球门开口外），防止球从两端滚出
  addEndWalls(scene, world, materials);

  // 球门后方薄墙，作为“球网”物理挡板，防止进球后滚出场外
  addGoalBackstops(scene, world, materials);
}

function addEndWalls(scene: THREE.Scene, world: CANNON.World, materials: Materials) {
  const segDepth = (FIELD_D/2 - GOAL_W/2); // 每侧应覆盖的 z 长度
  if (segDepth <= 0) return;
  const sx = WALL_T, sz = segDepth;
  const xL = -FIELD_W/2 - WALL_T/2;
  const xR =  FIELD_W/2 + WALL_T/2;
  const zTop =  (GOAL_W/2 + FIELD_D/2)/2;  // 顶部段中心 z
  const zBot = -(GOAL_W/2 + FIELD_D/2)/2;  // 底部段中心 z
  addWall(scene, world, xL, zTop, sx, sz, materials.ground);
  addWall(scene, world, xL, zBot, sx, sz, materials.ground);
  addWall(scene, world, xR, zTop, sx, sz, materials.ground);
  addWall(scene, world, xR, zBot, sx, sz, materials.ground);
}

function addGoalBackstops(scene: THREE.Scene, world: CANNON.World, materials: Materials) {
  const sx = 0.2, sz = GOAL_W, h = 3;
  const xL = - (FIELD_W/2 + 0.6), xR = (FIELD_W/2 + 0.6);
  addCustomWall(scene, world, xL, h/2, 0, sx, h, sz, 0x88c0ff, materials.ground);
  addCustomWall(scene, world, xR, h/2, 0, sx, h, sz, 0x88c0ff, materials.ground);
}

function addWall(scene: THREE.Scene, world: CANNON.World, x: number, z: number, sx: number, sz: number, mat: CANNON.Material) {
  const shape = new CANNON.Box(new CANNON.Vec3(sx/2, WALL_H/2, sz/2));
  const body = new CANNON.Body({ type: CANNON.Body.STATIC, shape, position: new CANNON.Vec3(x, WALL_H/2, z), material: mat });
  world.addBody(body);

  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, WALL_H, sz), new THREE.MeshLambertMaterial({ color: 0x666666 }));
  mesh.position.set(x, WALL_H/2, z);
  mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh);
}

function addCustomWall(scene: THREE.Scene, world: CANNON.World, x: number, y: number, z: number, sx: number, sy: number, sz: number, color: number, mat: CANNON.Material) {
  const shape = new CANNON.Box(new CANNON.Vec3(sx/2, sy/2, sz/2));
  const body = new CANNON.Body({ type: CANNON.Body.STATIC, shape, position: new CANNON.Vec3(x, y, z), material: mat });
  world.addBody(body);

  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.15 }));
  mesh.position.set(x, y, z);
  mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh);
}

