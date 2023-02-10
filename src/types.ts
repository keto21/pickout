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

type DialogData = {
  fileDialogOpen: boolean
  fileExists: boolean
  exportDialogOpen: boolean
  importDialogOpen: boolean
}

type FileInfo = {
  width: number
  height: number
}

export type {
  ElementId,
  PointData,
  Tool,
  SnackbarData,
  Severity,
  DialogData,
  CanvasOptions,
  FileInfo,
}
