export const ORIGIN: Point = Object.freeze({ x: 0, y: 0 })

export type CanvasProps = {
  canvasWidth: number
  canvasHeight: number
  fileData: string | null
}

export type SVGCanvasProps = {
  canvasWidth: number
  canvasHeight: number
  context: CanvasRenderingContext2D | null
  ratio: number
  disableEditing: boolean
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

// Transforms a point with client coordinates to canvas coordinates
export const getTransformedPoint = (
  context: CanvasRenderingContext2D,
  point: Point
) => {
  const originalPoint = new DOMPoint(point.x, point.y)
  return context.getTransform().invertSelf().transformPoint(originalPoint)
}

// Transforms a point with canvas coordinates to client coordinates
export const getUntransformedPoint = (
  context: CanvasRenderingContext2D,
  point: Point
) => {
  const originalPoint = new DOMPoint(point.x, point.y)
  return context.getTransform().transformPoint(originalPoint)
}

function hsv2Rgb(h: number, s: number, v: number) {
  let [r, g, b] = [0, 0, 0]

  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)

  switch (i % 6) {
    case 0:
      ;(r = v), (g = t), (b = p)
      break
    case 1:
      ;(r = q), (g = v), (b = p)
      break
    case 2:
      ;(r = p), (g = v), (b = t)
      break
    case 3:
      ;(r = p), (g = q), (b = v)
      break
    case 4:
      ;(r = t), (g = p), (b = v)
      break
    case 5:
      ;(r = v), (g = p), (b = q)
      break
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

const componentToHex = (c: number) => {
  const hex = c.toString(16)
  return hex.length == 1 ? '0' + hex : hex
}

const rgb2Hex = (r: number, g: number, b: number) => {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

export const generateColor = (seed: number) => {
  const golden_ratio_conjugate = 0.618033988749895

  const hue = (seed * golden_ratio_conjugate) % 1

  const [r, g, b] = hsv2Rgb(hue, 0.7, 0.7)
  return rgb2Hex(r, g, b)
}
