export type CanvasProps = {
  canvasWidth: number
  canvasHeight: number
}

export type Point = {
  x: number
  y: number
}

export const diffPoints = (p1: Point, p2: Point) => {
  return { x: p1.x - p2.x, y: p1.y - p2.y }
}

export const addPoints = (p1: Point, p2: Point) => {
  return { x: p1.x + p2.x, y: p1.y + p2.y }
}

export const scalePoint = (p1: Point, scale: number) => {
  return { x: p1.x / scale, y: p1.y / scale }
}

export const getTransformedPoint = (
  context: CanvasRenderingContext2D,
  point: Point
) => {
  const originalPoint = new DOMPoint(point.x, point.y)
  return context.getTransform().invertSelf().transformPoint(originalPoint)
}
