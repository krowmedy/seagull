export interface Bounds {
  x: number;
  y: number;
  right: number;
  bottom: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export function clampToBounds(
  pos: Vec2,
  vel: Vec2,
  bounds: Bounds,
): { pos: Vec2; vel: Vec2 } {
  let { x, y } = pos;
  let { x: vx, y: vy } = vel;

  if (y <= bounds.y) {
    y = bounds.y;
    if (vy < 0) vy = 0;
  } else if (y >= bounds.bottom) {
    y = bounds.bottom;
    if (vy > 0) vy = 0;
  }

  if (x <= bounds.x) {
    x = bounds.x;
    if (vx < 0) vx = 0;
  } else if (x >= bounds.right) {
    x = bounds.right;
    if (vx > 0) vx = 0;
  }

  return { pos: { x, y }, vel: { x: vx, y: vy } };
}
