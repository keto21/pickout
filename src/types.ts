type PointData = {
  id: ElementId
  x: number
  y: number
  name: string
  color: string
}

type CanvasOptions = {
  hideLabels: boolean
}

type ElementId = number

type Tool = {
  id: number
  name: string
}

type Severity = 'success' | 'error' | 'warning' | 'info'

type SnackbarData = {
  severity: Severity
  open: boolean
  message: string
  vertical: 'top' | 'bottom'
  horizontal: 'left' | 'right' | 'center'
}

type FileDialogData = {
  open: boolean
  fileExists: boolean
}

type FileInfo = {
  width: number
  height: number
}

type ExportDialogData = {
  open: boolean
}

export type {
  ElementId,
  PointData,
  Tool,
  SnackbarData,
  Severity,
  FileDialogData,
  ExportDialogData,
  CanvasOptions,
  FileInfo,
}
