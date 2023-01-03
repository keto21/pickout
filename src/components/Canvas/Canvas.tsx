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
  CanvasProps,
  diffPoints,
  getTransformedPoint,
  ORIGIN,
  Point,
} from './CanvasHelper'
import { Severity } from '../../types'
import { SVGCanvas } from './SVGCanvas'

const { devicePixelRatio: ratio = 1 } = window

const Canvas = (props: CanvasProps) => {
  const { canvasWidth, canvasHeight } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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
      const currentMousePos = { x: event.pageX, y: event.pageY }
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
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      document.addEventListener('mousemove', mouseMove)
      document.addEventListener('mouseup', mouseUp)
      lastMousePosRef.current = { x: event.pageX, y: event.pageY }
    },
    [mouseMove, mouseUp]
  )

  // Handle wheel events for zooming
  const handleWheel = useCallback(
    (event: WheelEvent) => {
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
    },
    [context]
  )

  useLayoutEffect(() => {
    if (canvasRef.current) {
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
      // Clear canvas but maintain transform.
      // Store the current transformation matrix.
      context.save()

      // Use the identity matrix while clearing the canvas.
      context.resetTransform()
      context.clearRect(0, 0, canvasWidth, canvasHeight)

      // Restore the transform
      context.restore()

      // Draw image at the origin
      if (image) context.drawImage(image, 0, 0)
    }
  }, [canvasWidth, canvasHeight, context, pointData, redrawNeeded])

  // Adds wheel event listener to handle zoom
  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.addEventListener('wheel', handleWheel)

    return () => {
      if (containerRef.current)
        containerRef.current.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  // Add event listener to add points
  useEffect(() => {
    const canvasElem = containerRef.current
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
    <div
      ref={containerRef}
      onMouseDown={startPan}
      style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }}
    >
      <SVGCanvas
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        context={context}
        ratio={ratio}
      ></SVGCanvas>
      <canvas
        ref={canvasRef}
        width={canvasWidth * ratio}
        height={canvasHeight * ratio}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          zIndex: 'inherit',
        }}
      ></canvas>
    </div>
  )
}

export { Canvas }
