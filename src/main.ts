import * as THREE from 'three';
import { createRendererAndScene, createCameraAndControls, addLights, addGrass, addGoalVisuals, addStandsWithSpectators } from './game/engine';
import { createWorld, addFieldAndWalls } from './game/physics';
import { createPlayers, createBall } from './game/entities';
import { startMatchLoop } from './game/match';

const { renderer, scene } = createRendererAndScene();
const { camera, controls } = createCameraAndControls(renderer);
(scene as any).userData.camera = camera;
addLights(scene);
addGrass(scene);
addGoalVisuals(scene);
addStandsWithSpectators(scene);

const { world, materials } = createWorld();
addFieldAndWalls(scene, world, materials);

const { p1, p2 } = createPlayers(scene, world, materials);
const ball = createBall(scene, world, materials);

startMatchLoop({ renderer, scene, camera, controls, world, p1, p2, ball });

// 昼夜切换
const toggleBtn = document.getElementById('toggleDayNightBtn') as HTMLButtonElement | null;
let isNight = false;
function applyDayNight(night: boolean) {
  const { sky, lighting } = (scene as any).userData as any;
  if (!lighting) return;
  const { hemi, sun, floodLights, centerLight, ambientBooster } = lighting;
  if (night) {
    scene.background = new THREE.Color(0x0b0e18);
    (sky as any).material.color.setHex(0x0b0e18);
    // 夜间进一步提亮
    hemi.intensity = 0.3;
    sun.intensity = 0.24;
    floodLights.forEach((s: any) => s.intensity = 3.0);
    // 新增灯光在夜间开启
    centerLight.intensity = 2.5;  // 中央点光源
    ambientBooster.intensity = 0.8;  // 环境增强光
  } else {
    scene.background = new THREE.Color(0x87ceeb);
    (sky as any).material.color.setHex(0x87ceeb);
    hemi.intensity = 0.8;
    sun.intensity = 0.9;
    floodLights.forEach((s: any) => s.intensity = 0.0);
    // 新增灯光在白天关闭
    centerLight.intensity = 0.0;
    ambientBooster.intensity = 0.0;
  }
}
if (toggleBtn) {
  toggleBtn.onclick = () => { isNight = !isNight; applyDayNight(isNight); };
}
applyDayNight(false);
