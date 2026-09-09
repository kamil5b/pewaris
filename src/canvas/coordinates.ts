export type Point = {
  x: number
  y: number
}

export type Transform = {
  zoom: number
  panX: number
  panY: number
}

export function screenToCanvas(
  x: number,
  y: number,
  transform: Transform
): Point {
  return {
    x: (x - transform.panX) / transform.zoom,
    y: (y - transform.panY) / transform.zoom,
  }
}

export function canvasToScreen(
  x: number,
  y: number,
  transform: Transform
): Point {
  return {
    x: x * transform.zoom + transform.panX,
    y: y * transform.zoom + transform.panY,
  }
}
