import {
  useEffect,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import * as React from 'react'
import { activeToolState, pointDataState, snackbarState } from '../../atoms'
import { useRecoilState, useRecoilValue } from 'recoil'
import { ToolId } from '../../tools'
import {
  addPoints,
  CanvasProps,
  diffPoints,
  getTransformedPoint,
  Point,
  scalePoint,
} from './CanvasHelper'
import { Severity } from '../../types'

const ORIGIN: Point = Object.freeze({ x: 0, y: 0 })
const { devicePixelRatio: ratio = 1 } = window

const MAX_SCALE = 5
const MIN_SCALE = 0.05
const ZOOM_SENSITIVITY = 500 // bigger for lower zoom per scroll

const Canvas = (props: CanvasProps) => {
  const { canvasWidth, canvasHeight } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [counter, setCounter] = useState(0)

  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
  const [redrawNeeded, setRedrawNeeded] = useState(false)

  const [image, setImage] = useState<HTMLImageElement | null>(new Image())

  const isResetRef = useRef<boolean>(false)
  const lastMousePosRef = useRef<Point>(ORIGIN)

  const activeTool = useRecoilValue(activeToolState)

  const [pointData, setPointData] = useRecoilState(pointDataState)
  const addPoint = (x: number, y: number, id: number) => {
    setPointData((oldPointData) => [
      ...oldPointData,
      { x: x, y: y, id: id, name: 'POINT_' + id },
    ])
    setCounter((prev) => prev + 1)
  }

  const [_, setSnackbarData] = useRecoilState(snackbarState)
  const showSnackbar = (severity: Severity, message: string) => {
    setSnackbarData((prev) => ({
      ...prev,
      severity,
      message,
      open: true,
    }))
  }

  // Load background image
  useEffect(() => {
    if (image) {
      // TODO: Switch out with dynamic image src
      image.src =
        'https://www.simplilearn.com/ice9/free_resources_article_thumb/what_is_image_Processing.jpg'
    }
  }, [])

  // reset
  const reset = useCallback(
    (context: CanvasRenderingContext2D) => {
      if (context && !isResetRef.current) {
        // adjust for device pixel density
        context.canvas.width = canvasWidth * ratio
        context.canvas.height = canvasHeight * ratio
        context.scale(ratio, ratio)

        // To make sure that the image is centered, it needs to be translated correctly.
        // So the image dimensions need to be known at that point.
        // Also, the scale might need to be adjusted to cater for bigger images.
        if (image) {
          context.translate(
            canvasWidth * (image.width / canvasWidth),
            canvasHeight * (image.height / canvasHeight)
          )
          console.log(image.width)
        }

        // reset state and refs
        setContext(context)
        lastMousePosRef.current = ORIGIN

        // this thing is so multiple resets in a row don't clear canvas
        isResetRef.current = true
      }
    },
    [canvasWidth, canvasHeight, image]
  )

  // Update offset while move mouse event is active.
  const mouseMove = useCallback(
    (event: MouseEvent) => {
      if (!context) return

      const lastMousePos = lastMousePosRef.current
      const currentMousePos = { x: event.offsetX, y: event.offsetY }
      lastMousePosRef.current = currentMousePos

      const tranformedLastMousePos = getTransformedPoint(context, lastMousePos)
      const transformedCurrentMousePos = getTransformedPoint(
        context,
        currentMousePos
      )

      const diffPoint = diffPoints(
        transformedCurrentMousePos,
        tranformedLastMousePos
      )
      context.translate(diffPoint.x, diffPoint.y)

      setRedrawNeeded(true)
      event.preventDefault()
    },
    [context]
  )

  // Signals the end of a pan action, so remove event listeners.
  const mouseUp = useCallback(() => {
    document.removeEventListener('mousemove', mouseMove)
    document.removeEventListener('mouseup', mouseUp)
  }, [mouseMove])

  // This event is added to the canvas event listener directly
  const startPan = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      document.addEventListener('mousemove', mouseMove)
      document.addEventListener('mouseup', mouseUp)
      lastMousePosRef.current = { x: event.pageX, y: event.pageY }
    },
    [mouseMove, mouseUp]
  )

  // Handle wheel events for zooming
  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault()
    if (!context) return
    if (!image) return

    if (event.deltaY === 0) return

    const zoom = event.deltaY > 0 ? 0.9 : 1.1 // smaller than 0 means zoom out

    const clientPoint = { x: event.clientX, y: event.clientY }
    const transformedClientPoint = getTransformedPoint(context, clientPoint)
    console.log(JSON.stringify(transformedClientPoint))

    context.translate(transformedClientPoint.x, transformedClientPoint.y)
    context.scale(zoom, zoom)
    context.translate(-transformedClientPoint.x, -transformedClientPoint.y)

    setRedrawNeeded(true)

    isResetRef.current = false
  }, [])

  // setup canvas and set context
  useLayoutEffect(() => {
    if (canvasRef.current) {
      // get new drawing context
      const renderCtx = canvasRef.current.getContext('2d')

      if (renderCtx) {
        reset(renderCtx)
      }
    }
  }, [reset, canvasHeight, canvasWidth])

  // Draw
  useLayoutEffect(() => {
    setRedrawNeeded(false)
    if (context) {
      // Clear canvas but maintain transform
      // Store the current transformation matrix
      context.save()

      // Use the identity matrix while clearing the canvas
      context.resetTransform()
      context.clearRect(0, 0, canvasWidth, canvasHeight)

      // Restore the transform
      context.restore()

      // Draw image at the origin
      if (image) context.drawImage(image, 0, 0)

      pointData.forEach((point) => {
        context.beginPath()
        context.arc(point.x, point.y, 25, 0, 2 * Math.PI)
        context.stroke()
        context.fill()
        console.log(JSON.stringify(point))
      })
    }
  }, [canvasWidth, canvasHeight, context, pointData, redrawNeeded])

  // Adds wheel event listener to handle zoom
  useEffect(() => {
    if (!canvasRef.current) return

    canvasRef.current.addEventListener('wheel', handleWheel)

    return () => {
      if (canvasRef.current)
        canvasRef.current.removeEventListener('wheel', handleWheel)
    }
  }, [])

  // Add event listener to add points
  useEffect(() => {
    const canvasElem = canvasRef.current
    if (!canvasElem) return
    if (!context) return
    if (activeTool !== ToolId.ADD_POINT) return

    const handleMouseClick = (event: MouseEvent) => {
      if (canvasRef.current) {
        const clientPoint = {
          x: event.clientX,
          y: event.clientY,
        }
        const transformedClientPoint = getTransformedPoint(context, clientPoint)
        addPoint(transformedClientPoint.x, transformedClientPoint.y, counter)
        showSnackbar('success', 'Point added!')
      }
    }

    canvasElem.addEventListener('click', handleMouseClick)

    return () => {
      canvasElem.removeEventListener('click', handleMouseClick)
    }
  }, [activeTool, counter])

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }}>
      <canvas
        onMouseDown={startPan}
        ref={canvasRef}
        width={canvasWidth * ratio}
        height={canvasHeight * ratio}
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
        }}
      ></canvas>
    </div>
  )
}

export { Canvas }
