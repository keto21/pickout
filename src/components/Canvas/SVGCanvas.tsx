import { useCallback, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import { pointDataState } from '../../atoms'
import {
  diffPoints,
  getUntransformedPoint,
  ORIGIN,
  Point,
  SVGCanvasProps,
} from './CanvasHelper'

const SVGCanvas = (props: SVGCanvasProps) => {
  const { canvasWidth, canvasHeight, context, ratio, disableEditing } = props

  const [pointData, setPointData] = useRecoilState(pointDataState)
  const [dragPosition, setDragPosition] = useState(ORIGIN)

  const [dragStarted, setDragStarted] = useState<boolean>(false)

  const draggedItemRef = useRef<boolean[]>([])
  const dragStartPosRef = useRef<Point>(ORIGIN)
  const dragEndPosRef = useRef<Point>(ORIGIN)

  const mouseMove = useCallback(
    (event: MouseEvent) => {
      dragEndPosRef.current = { x: event.pageX, y: event.pageY }
      setDragPosition(dragEndPosRef.current)
    },
    [pointData]
  )

  const mouseUp = useCallback(
    (event: MouseEvent) => {
      dragEndPosRef.current = { x: event.pageX, y: event.pageY }
      setDragStarted(false)

      const offset = diffPoints(dragEndPosRef.current, dragStartPosRef.current)
      const newPointData = pointData.map((oldPoint, idx) =>
        draggedItemRef.current[idx]
          ? {
              ...oldPoint,
              x: oldPoint.x + offset.x,
              y: oldPoint.y + offset.y,
            }
          : oldPoint
      )
      setPointData(newPointData)
      draggedItemRef.current = pointData.map(() => false)

      document.removeEventListener('mousemove', mouseMove)
      document.removeEventListener('mouseup', mouseUp)
    },
    [mouseMove, pointData]
  )

  // This event is added to the canvas event listener directly
  const startDrag = useCallback(
    (event: React.MouseEvent<SVGCircleElement, MouseEvent>) => {
      if (disableEditing) return
      event.stopPropagation()

      setDragStarted(true)
      dragStartPosRef.current = {
        x: event.currentTarget.cx.baseVal.value,
        y: event.currentTarget.cy.baseVal.value,
      }
      dragEndPosRef.current = { x: event.pageX, y: event.pageY }
      setDragPosition(dragEndPosRef.current)

      document.addEventListener('mousemove', mouseMove)
      document.addEventListener('mouseup', mouseUp)
    },
    [mouseMove, mouseUp, disableEditing]
  )

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      width={canvasWidth * ratio}
      height={canvasHeight * ratio}
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      style={{
        top: 0,
        left: 0,
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        zIndex: 1,
      }}
    >
      {pointData.map((point, idx) => {
        if (!context) return null

        const transformedPoint = getUntransformedPoint(context, {
          x: point.x,
          y: point.y,
        })

        return (
          <circle
            onMouseDown={(event) => {
              draggedItemRef.current = pointData.map(
                (_, index) => idx === index
              )
              startDrag(event)
            }}
            style={{ cursor: disableEditing ? 'auto' : 'grab' }}
            key={`circle-${point.id}`}
            cx={`${transformedPoint.x}px`}
            cy={`${transformedPoint.y}px`}
            r="10px"
            stroke={'white'}
            strokeWidth={'3'}
            fill={'black'}
            fillOpacity={
              !disableEditing &&
              draggedItemRef.current.length > 0 &&
              draggedItemRef.current[idx]
                ? 0.2
                : 1.0
            }
          />
        )
      })}
      {dragStarted && (
        <circle
          style={{ cursor: disableEditing ? 'auto' : 'grabbing' }}
          key={`drag-circle}`}
          cx={`${dragPosition.x}px`}
          cy={`${dragPosition.y}px`}
          r="10px"
          stroke={'white'}
          strokeWidth={'3'}
          fill={dragStarted ? 'pink' : 'black'}
          fillOpacity={1.0}
        />
      )}
    </svg>
  )
}

export { SVGCanvas }
