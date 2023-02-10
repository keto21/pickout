import {
  useEffect,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import * as React from 'react'
import {
  activeToolState,
  fileInfoState,
  pointDataState,
  snackbarState,
} from '../../atoms'
import { useRecoilState, useRecoilValue } from 'recoil'
import { ToolId } from '../../tools'
import {
  CanvasProps,
  diffPoints,
  generateColor,
  getTransformedPoint,
  ORIGIN,
  Point,
} from './CanvasHelper'
import { Severity } from '../../types'
import { SVGCanvas } from './SVGCanvas'

const { devicePixelRatio: ratio = 1 } = window

const Canvas = (props: CanvasProps) => {
  const { canvasWidth, canvasHeight, fileData } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [counter, setCounter] = useState(0)

  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
  const [redrawNeeded, setRedrawNeeded] = useState(false)

  const [image, setImage] = useState<HTMLImageElement>(new Image())
  const [newFileLoaded, setNewFileLoaded] = useState(false)

  const imageOnLoad = useCallback(() => {
    if (!context || !image) return
    setNewFileLoaded(true)
    setRedrawNeeded(true)
  }, [context, image, fileData])
  image.onload = imageOnLoad

  const isResetRef = useRef<boolean>(false)
  const lastMousePosRef = useRef<Point>(ORIGIN)

  const activeTool = useRecoilValue(activeToolState)

  const [pointData, setPointData] = useRecoilState(pointDataState)
  const addPoint = (x: number, y: number, id: number) => {
    setPointData((oldPointData) => [
      ...oldPointData,
      { x: x, y: y, id: id, name: 'POINT_' + id, color: generateColor(id) },
    ])
    setCounter((prev) => prev + 1)
  }

  const [fileInfo, setFileInfo] = useRecoilState(fileInfoState)

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
    if (image && fileData) {
      image.src = fileData
    }
  }, [fileData])

  useLayoutEffect(() => {
    if (canvasRef.current) setContext(canvasRef.current.getContext('2d'))
  }, [canvasWidth, canvasHeight])

  // Update offset while move mouse event is active.
  const mouseMove = useCallback(
    (event: MouseEvent) => {
      if (!context) return

      const lastMousePos = lastMousePosRef.current
      const currentMousePos = { x: event.pageX * ratio, y: event.pageY * ratio }
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

      if (event.deltaY === 0) return

      const zoom = event.deltaY > 0 ? 0.9 : 1.1 // smaller than 0 means zoom out

      const clientPoint = { x: event.clientX * ratio, y: event.clientY * ratio }
      const transformedClientPoint = getTransformedPoint(context, clientPoint)

      context.translate(transformedClientPoint.x, transformedClientPoint.y)
      context.scale(zoom, zoom)
      context.translate(-transformedClientPoint.x, -transformedClientPoint.y)

      setRedrawNeeded(true)

      isResetRef.current = false
    },
    [context, ratio]
  )

  // Draw
  useLayoutEffect(() => {
    setRedrawNeeded(false)

    const actualWidth = canvasWidth * ratio
    const actualHeight = canvasHeight * ratio

    if (context) {
      // Clear canvas but maintain transform.
      // Store the current transformation matrix.
      context.save()

      // Use the identity matrix while clearing the canvas.
      context.resetTransform()

      context.clearRect(0, 0, actualWidth, actualHeight)

      // Restore the transform
      context.restore()

      // Draw image at the origin
      if (image) {
        context.drawImage(image, 0, 0)
        if (newFileLoaded) {
          context.resetTransform()

          setFileInfo({ width: image.width, height: image.height })

          // TODO: Fix center calculation
          const translateX = (actualWidth - 450 * ratio) / 2 - image.width / 2
          const translateY = (actualHeight - 120 * ratio) / 2 - image.height / 2
          context.translate(translateX, translateY)

          context.scale(ratio, ratio)
        }
        setNewFileLoaded(false)
      }
    }
  }, [
    canvasWidth,
    canvasHeight,
    ratio,
    context,
    pointData,
    redrawNeeded,
    newFileLoaded,
    fileData,
  ])

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
          x: event.clientX * ratio,
          y: event.clientY * ratio,
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
        disableEditing={activeTool !== ToolId.CURSOR}
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
