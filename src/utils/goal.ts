// 半径判定：当球的表面穿过球门线（而非球心）时判定进球
export function isGoal(x: number, z: number, radius: number, fieldW: number, goalW: number): 0 | 1 | 2 {
  const inGateZ = Math.abs(z) < goalW / 2;
  if (!inGateZ) return 0;
  const half = fieldW / 2;
  if (x + radius >  half) return 1; // 右侧破门：P1 得分
  if (x - radius < -half) return 2; // 左侧破门：P2 得分
  return 0;
}

