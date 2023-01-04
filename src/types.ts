type PointData = {
  id: ElementId
  x: number
  y: number
  name: string
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

export type {
  ElementId,
  PointData,
  Tool,
  SnackbarData,
  Severity,
  FileDialogData,
}
