import { atom } from 'recoil'
import { ToolId } from './tools'
import { FileDialogData, PointData, SnackbarData, ElementId } from './types'

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

export {
  activeToolState,
  pointDataState,
  snackbarState,
  fileDialogState,
  activeElementState,
}
