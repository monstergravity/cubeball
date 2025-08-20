import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FIELD_W, FIELD_D, GOAL_W } from './constants';

export function createRendererAndScene() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  // 天空（昼夜会改变颜色）
  const skyGeo = new THREE.SphereGeometry(200, 32, 16);
  const skyMat = new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);

  scene.background = new THREE.Color(0x87ceeb);

  // 暂存 camera、sky、lighting 以便其它模块访问
  scene.userData.camera = null;
  scene.userData.sky = sky;
  scene.userData.lighting = undefined;

  window.addEventListener('resize', () => {
    const cam = scene.userData.camera as THREE.PerspectiveCamera | undefined;
    if (cam) {
      cam.aspect = window.innerWidth / window.innerHeight;
      cam.updateProjectionMatrix();
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { renderer, scene };
}

export function createCameraAndControls(renderer: THREE.WebGLRenderer) {
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 28, 34);
  camera.lookAt(0, 0, 0);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.minDistance = 20;
  controls.maxDistance = 120;
  controls.maxPolarAngle = Math.PI * 0.45;
  controls.target.set(0, 0, 0);
  controls.update();
  return { camera, controls };
}

export function addLights(scene: THREE.Scene) {
  const hemi = new THREE.HemisphereLight(0xffffff, 0x223344, 0.8);
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(18, 40, 12);
  sun.castShadow = true;

  // 新增：球场中央上方的强力点光源（夜间照明）
  const centerLight = new THREE.PointLight(0xffffff, 0.0, 80, 1.5);
  centerLight.position.set(0, 25, 0);
  centerLight.castShadow = true;
  centerLight.shadow.mapSize.width = 1024;
  centerLight.shadow.mapSize.height = 1024;
  scene.add(centerLight);

  // 新增：球场边缘的环境增强光（夜间辅助照明）
  const ambientBooster = new THREE.DirectionalLight(0xaaccff, 0.0);
  ambientBooster.position.set(-20, 30, 20);
  ambientBooster.target.position.set(0, 0, 0);
  scene.add(ambientBooster);
  scene.add(ambientBooster.target);

  // 四角体育场泛光灯组（夜间更亮）
  const floodLights: THREE.SpotLight[] = [];
  const poles: THREE.Object3D[] = [];
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.6, roughness: 0.5 });
  const mkPole = (x: number, z: number, rotY: number) => {
    const pole = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 8, 8), poleMat);
    base.position.set(0, 4, 0);
    pole.add(base);
    // 顶部横梁
    const headBar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 2.0), poleMat);
    headBar.position.set(0, 8.3, -0.4);
    pole.add(headBar);
    // 三个灯头与聚光灯
    for (let i=0; i<3; i++) {
      const px = (i-1)*0.5;
      const lampMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.4, roughness: 0.4, emissive: 0xffffee, emissiveIntensity: 0.6 });
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.15), lampMat);
      lamp.position.set(px, 8.6, -0.8);
      pole.add(lamp);

      const spot = new THREE.SpotLight(0xffffff, 0.0, 120, Math.PI/3.2, 0.35, 1.0);
      spot.castShadow = false;
      spot.position.set(px, 8.6, -0.8);
      spot.target.position.set(0, 0, 0);
      pole.add(spot); pole.add(spot.target);
      floodLights.push(spot);
    }
    pole.position.set(x, 0, z);
    pole.rotation.y = rotY;
    poles.push(pole);
    scene.add(pole);
  };
  // 将灯杆靠近球场四周边角（由 +6 收紧到 +2）
  const dX = FIELD_W/2 + 2, dZ = FIELD_D/2 + 2;
  mkPole(-dX, -dZ, Math.PI/4);
  mkPole( dX, -dZ, -Math.PI/4);
  mkPole(-dX,  dZ, -Math.PI/4);
  mkPole( dX,  dZ, Math.PI/4);

  scene.add(hemi);
  scene.add(sun);
  scene.userData.lighting = { hemi, sun, floodLights, poles, centerLight, ambientBooster };
}

export function addGrass(scene: THREE.Scene) {
  // 渐变草坪+条纹
  const grassMat = new THREE.MeshLambertMaterial({ color: 0x2dbb3f });
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(FIELD_W+6, FIELD_D+6), grassMat);
  grass.rotation.x = -Math.PI / 2;
  grass.receiveShadow = true;
  scene.add(grass);

  // 场地主体
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(FIELD_W, FIELD_D, 8, 1), new THREE.MeshLambertMaterial({ color: 0x2aa63a }));
  pitch.rotation.x = -Math.PI/2;
  pitch.position.y = 0.001;
  pitch.receiveShadow = true;
  scene.add(pitch);

  // 条纹（旋转90°，沿 X 方向分条）
  const stripeMat1 = new THREE.MeshLambertMaterial({ color: 0x33c44a });
  const stripeMat2 = new THREE.MeshLambertMaterial({ color: 0x29a53a });
  const stripeW = FIELD_W/10;
  for (let i=0; i<10; i++) {
    const m = (i%2? stripeMat1: stripeMat2);
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(stripeW, FIELD_D), m);
    stripe.rotation.x = -Math.PI/2;
    stripe.position.set(-FIELD_W/2 + stripeW/2 + i*stripeW, 0.002, 0);
    stripe.receiveShadow = true;
    scene.add(stripe);
  }

  // 白线：边线、禁区、中圈等
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const mkLine = (w: number, d: number, x: number, z: number) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), white);
    mesh.rotation.x = -Math.PI/2;
    mesh.position.set(x, 0.003, z);
    scene.add(mesh);
  };
  // 外围
  mkLine(FIELD_W, 0.2, 0,  FIELD_D/2);
  mkLine(FIELD_W, 0.2, 0, -FIELD_D/2);
  mkLine(0.2, FIELD_D, -FIELD_W/2, 0);
  mkLine(0.2, FIELD_D,  FIELD_W/2, 0);
  // 中线与中圈
  // 中线旋转90度：改为沿 Z 方向
  mkLine(0.15, FIELD_D, 0, 0);
  const circle = new THREE.Mesh(new THREE.RingGeometry(3.5, 3.65, 32), white);
  circle.rotation.x = -Math.PI/2;
  circle.position.y = 0.003;
  scene.add(circle);
}

export function addGoalVisuals(scene: THREE.Scene) {
  const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.6 });
  const netMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });
  const mkGoal = (side: 'left'|'right') => {
    const sign = side === 'left' ? -1 : 1;
    const x = sign*(FIELD_W/2 + 0.6);
    const group = new THREE.Group();

    // 门柱与横梁
    const postR = 0.12; const w = GOAL_W; const h = 3; const depth = 2.4;
    const vert = new THREE.Mesh(new THREE.CylinderGeometry(postR, postR, h, 12), postMat);
    const vert2 = vert.clone();
    const cross = new THREE.Mesh(new THREE.CylinderGeometry(postR, postR, w, 12), postMat);
    vert.position.set(0, h/2, -w/2);
    vert2.position.set(0, h/2,  w/2);
    // 横梁需要沿 Z 方向，绕 X 轴旋转 90°
    cross.rotation.x = Math.PI/2;
    cross.position.set(0, h, 0);
    group.add(vert, vert2, cross);

    // 球网（用薄盒子近似）
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.1, h, w), netMat);
    back.position.set(-depth, h/2, 0);
    const side1 = new THREE.Mesh(new THREE.BoxGeometry(depth, h, 0.1), netMat);
    const side2 = side1.clone();
    side1.position.set(-depth/2, h/2, -w/2);
    side2.position.set(-depth/2, h/2,  w/2);
    const top = new THREE.Mesh(new THREE.BoxGeometry(depth, 0.1, w), netMat);
    top.position.set(-depth/2, h, 0);
    group.add(back, side1, side2, top);

    if (side === 'right') { group.rotation.y = Math.PI; }
    group.position.set(x, 0, 0);
    scene.add(group);
  };
  mkGoal('left');
  mkGoal('right');
}

export function addDebugHelpers(scene: THREE.Scene) {
  const axes = new THREE.AxesHelper(5);
  scene.add(axes);
  const grid = new THREE.GridHelper(FIELD_W, Math.floor(FIELD_W/2), 0xffffff, 0x444444);
  (grid as any).position.y = 0.02;
  scene.add(grid);
}

export function addStandsWithSpectators(scene: THREE.Scene) {
  const standWidth = FIELD_W + 10;
  const standDepth = 6;
  // 移除上方看台（本阶段不渲染看台）
  const tiers = 0;
  const tierH = 0.6;
  const matBlue = new THREE.MeshLambertMaterial({ color: 0x3aa2ff });

  const buildBleachers = (z: number) => {
    const group = new THREE.Group();
    for (let i=0; i<tiers; i++) {
      const w = standWidth, d = standDepth - i*0.8, h = tierH;
      const step = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matBlue);
      step.position.set(0, h/2 + i*h, z + (i? (i*0.4) : 0));
      group.add(step);
      // 护栏
      const rail = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, 0.08), new THREE.MeshLambertMaterial({ color: 0xffffff }));
      rail.position.set(0, i*h + h + 0.2, z + d/2);
      group.add(rail);
      // 观众
      const cols = 24;
      for (let c=0; c<cols; c++) {
        const cube = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.4), new THREE.MeshLambertMaterial({ color: randomAudienceColor() }));
        const px = -w/2 + (c+0.5)*(w/cols);
        const py = h + i*h + 0.35;
        const pz = z - d/2 + 0.6;
        cube.position.set(px, py, pz);
        group.add(cube);
      }
    }
    scene.add(group);
  };

  // 仅远端一侧看台（靠近相机这一侧不要）
  buildBleachers(-FIELD_D/2 - 1.4);
}

function randomAudienceColor() {
  const palette = [0xff5555, 0x00aaff, 0xffcc00, 0x66ff66, 0xffffff];
  return palette[Math.floor(Math.random()*palette.length)];
}

