import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { FIELD_W, GOAL_W, MATCH_SECONDS } from './constants';
import type { Player, Ball } from './entities';
import { isGoal } from '../utils/goal';

type Ctx = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: any;
  world: CANNON.World;
  p1: Player; p2: Player; ball: Ball;
};

const keys = new Set<string>();
function setupKeys() {
  window.addEventListener('keydown', e => keys.add(e.code));
  window.addEventListener('keyup', e => keys.delete(e.code));
}
function clearKeysAndDisable() {
  keys.clear();
}

function applyInputForces(p1: Player, p2: Player) {
  const F = 140;
  const clampV = 10;
  function drive(body: CANNON.Body, up: string, down: string, left: string, right: string) {
    let fx = 0, fz = 0;
    if (keys.has(up))    fz -= F;
    if (keys.has(down))  fz += F;
    if (keys.has(left))  fx -= F;
    if (keys.has(right)) fx += F;
    if (fx || fz) body.applyForce(new CANNON.Vec3(fx, 0, fz), body.position);
    const v = body.velocity;
    const speed = Math.hypot(v.x, v.z);
    if (speed > clampV) {
      const s = clampV / speed;
      v.x *= s; v.z *= s;
    }
  }
  drive(p1.body, 'KeyW', 'KeyS', 'KeyA', 'KeyD');
  drive(p2.body, 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight');
}

function resetKickoff(p1: Player, p2: Player, ball: Ball) {
  p1.body.position.set(-15, p1.size/2 + 0.05, 0);
  p2.body.position.set( 15, p2.size/2 + 0.05, 0);
  p1.body.velocity.setZero(); p1.body.angularVelocity.setZero();
  p2.body.velocity.setZero(); p2.body.angularVelocity.setZero();
  ball.body.position.set(0, ball.radius + 0.05, 0);
  ball.body.velocity.setZero(); ball.body.angularVelocity.setZero();
}

function shatterPlayer(scene: THREE.Scene, player: Player, out: { list: { mesh: THREE.InstancedMesh; velocities: Float32Array }[] }) {
  scene.remove(player.mesh);
  const N = 5, total = N*N*N, size = player.size, small = size / N * 0.9;
  const geom = new THREE.BoxGeometry(small, small, small);
  // 碎块颜色沿用玩家立方体自身颜色
  let colorHex = 0xdddddd;
  const baseMatAny: any = (player.mesh as THREE.Mesh).material as any;
  if (baseMatAny && baseMatAny.color && typeof baseMatAny.color.getHex === 'function') {
    colorHex = baseMatAny.color.getHex();
  }
  const mat = new THREE.MeshLambertMaterial({ color: colorHex });
  const inst = new THREE.InstancedMesh(geom, mat, total);
  inst.castShadow = true; inst.receiveShadow = true;
  scene.add(inst);

  const velocities = new Float32Array(total*3);
  let i = 0;
  const base = player.body.position;
  for (let ix=0; ix<N; ix++) for (let iy=0; iy<N; iy++) for (let iz=0; iz<N; iz++) {
    const x = (ix/(N-1)-0.5)*size;
    const y = (iy/(N-1)-0.5)*size + player.size*0.1;
    const z = (iz/(N-1)-0.5)*size;
    const m = new THREE.Matrix4().makeTranslation(base.x + x, base.y + y, base.z + z);
    inst.setMatrixAt(i, m);
    velocities[i*3+0] = (Math.random()-0.5)*6;
    velocities[i*3+1] = Math.random()*6 + 2;
    velocities[i*3+2] = (Math.random()-0.5)*6;
    i++;
  }
  inst.instanceMatrix.needsUpdate = true;
  out.list.push({ mesh: inst, velocities });
}

export function startMatchLoop(ctx: Ctx) {
  setupKeys();

  const scoreLeftEl = document.getElementById('scoreLeft')!;
  const scoreRightEl = document.getElementById('scoreRight')!;
  const timerCenterEl = document.getElementById('timerCenter')!;
  const restartBtn = document.getElementById('restartBtn')! as HTMLButtonElement;
  let score1 = 0, score2 = 0;
  let timeLeft = MATCH_SECONDS;
  let running = true;
  let shatters: { mesh: THREE.InstancedMesh; velocities: Float32Array }[] = [];
  let countdownHandle: number | undefined;

  function updateScore() {
    scoreLeftEl.textContent = String(score1);
    scoreRightEl.textContent = String(score2);
  }
  function startCountdown() {
    if (countdownHandle) clearInterval(countdownHandle);
    timerCenterEl.textContent = String(timeLeft);
    countdownHandle = window.setInterval(() => {
      if (!running) { if (countdownHandle) clearInterval(countdownHandle); return; }
      timeLeft--;
      timerCenterEl.textContent = String(timeLeft);
      if (timeLeft <= 0) {
        if (countdownHandle) clearInterval(countdownHandle);
        // 时间到：直接结束游戏，禁止继续操作
        running = false;
        // 可选：如果比分是 0:0，再触发崩塌效果；否则只结束
        if (score1 === 0 && score2 === 0) {
          const out = { list: shatters };
          shatterPlayer(ctx.scene, ctx.p1, out);
          shatterPlayer(ctx.scene, ctx.p2, out);
          shatters = out.list;
        }
      }
    }, 1000);
  }
  updateScore();
  startCountdown();

  restartBtn.onclick = () => {
    score1 = 0; score2 = 0; timeLeft = MATCH_SECONDS; running = true; shatters = [];
    updateScore();
    resetKickoff(ctx.p1, ctx.p2, ctx.ball);
    startCountdown();
  };

  let last = performance.now();
  let acc = 0;
  const FIXED_DT = 1 / 60;

  const tick = (now: number) => {
    requestAnimationFrame(tick);
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;

    if (running) {
      applyInputForces(ctx.p1, ctx.p2);

      acc += dt;
      while (acc >= FIXED_DT) {
        ctx.world.step(FIXED_DT);
        acc -= FIXED_DT;
      }

      // 同步 Three mesh
      for (const o of [ctx.p1, ctx.p2, ctx.ball]) {
        o.mesh.position.copy(o.body.position as any);
        o.mesh.quaternion.copy(o.body.quaternion as any);
      }

      // 判定进球（考虑球半径）
      const g = isGoal(
        ctx.ball.body.position.x,
        ctx.ball.body.position.z,
        ctx.ball.radius,
        FIELD_W,
        GOAL_W
      );
      if (g === 1) { score1++; updateScore(); resetKickoff(ctx.p1, ctx.p2, ctx.ball); }
      if (g === 2) { score2++; updateScore(); resetKickoff(ctx.p1, ctx.p2, ctx.ball); }
    } else {
      // 停止玩家输入影响，并更新崩塌碎块
      clearKeysAndDisable();
      updateShatters(shatters, dt);
    }

    ctx.renderer.render(ctx.scene, ctx.camera);
  };
  requestAnimationFrame(tick);
}


function updateShatters(arr: { mesh: THREE.InstancedMesh; velocities: Float32Array }[], dt: number) {
  const g = -9.82, damping = 0.98;
  const mtx = new THREE.Matrix4();
  for (const s of arr) {
    for (let i=0; i<s.mesh.count; i++) {
      s.mesh.getMatrixAt(i, mtx);
      const p = new THREE.Vector3().setFromMatrixPosition(mtx);
      const idx = i*3;
      s.velocities[idx+0] *= damping;
      s.velocities[idx+2] *= damping;
      s.velocities[idx+1] = s.velocities[idx+1] + g*dt;
      p.x += s.velocities[idx+0]*dt;
      p.y += s.velocities[idx+1]*dt;
      p.z += s.velocities[idx+2]*dt;
      mtx.makeTranslation(p.x, p.y, p.z);
      s.mesh.setMatrixAt(i, mtx);
    }
    s.mesh.instanceMatrix.needsUpdate = true;
  }
}

