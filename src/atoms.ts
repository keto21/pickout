import { atom } from 'recoil'
import { ToolId } from './tools'
import {
  FileDialogData,
  PointData,
  SnackbarData,
  ElementId,
  CanvasOptions,
  ExportDialogData,
  FileInfo,
} from './types'

const fileInfoState = atom<FileInfo>({
  key: 'fileInfoState',
  default: {
    width: 0,
    height: 0,
  },
})

const activeToolState = atom<ToolId>({
  key: 'pointToolActiveState',
  default: ToolId.CURSOR,
})

const activeElementState = atom<ElementId>({
  key: 'activeElement',
  default: -1,
})

const pointDataState = atom<PointData[]>({
  key: 'pointToolState',
  default: [],
})

const canvasOptionsState = atom<CanvasOptions>({
  key: 'canvasOptionsState',
  default: {
    hideLabels: false,
  },
})

const snackbarState = atom<SnackbarData>({
  key: 'snackBarState',
  default: {
    severity: 'success',
    open: false,
    message: '',
    vertical: 'top',
    horizontal: 'center',
  },
})

const fileDialogState = atom<FileDialogData>({
  key: 'fileDialogState',
  default: {
    fileExists: false,
    open: false,
  },
})

const exportDialogState = atom<ExportDialogData>({
  key: 'exportDialogState',
  default: {
    open: false,
  },
})

export {
  fileInfoState,
  activeToolState,
  pointDataState,
  snackbarState,
  fileDialogState,
  exportDialogState,
  activeElementState,
  canvasOptionsState,
}
