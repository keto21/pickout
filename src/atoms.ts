import { atom } from 'recoil'
import { ToolId } from './tools'
import { PointData, SnackbarData } from './types'

const activeToolState = atom({
  key: 'pointToolActiveState',
  default: ToolId.CURSOR,
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

export { activeToolState, pointDataState, snackbarState }
