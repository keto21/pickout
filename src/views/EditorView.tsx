import React, { useEffect, useState } from 'react'
import { ResponsiveAppBar } from '../components/ResponsiveAppBar'
import { ToolSelection } from '../components/ToolSelection'
import CssBaseline from '@mui/material/CssBaseline'
import { PointList } from '../components/PointList'
import { Canvas } from '../components/Canvas/Canvas'
import Drawer from '@mui/material/Drawer'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Snackbar from '@mui/material/Snackbar'
import { useRecoilState } from 'recoil'
import { snackbarState } from '../atoms'
import Alert from '@mui/material/Alert'

type Dimensions = {
  width: number
  height: number
}

const EditorView = () => {
  const [clientDimensions, setClientDimensions] = useState<Dimensions>({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  })

  const [snackbarData, setSnackbarData] = useRecoilState(snackbarState)

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') return

    setSnackbarData((prev) => ({
      ...prev,
      open: false,
    }))
  }

  const [openSnackbar, setOpenSnackbar] = useState(false)

  useEffect(() => {
    const updateDimensions = () => {
      setClientDimensions({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      })
    }
    window.onresize = updateDimensions

    return () => {
      window.onresize = () => {}
    }
  })

  const drawerWidth = 240

  return (
    <>
      <CssBaseline />
      <ResponsiveAppBar />
      <Drawer
        anchor="right"
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
          zIndex: -1,
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}></Box>
        <PointList />
      </Drawer>
      <ToolSelection />
      <Canvas
        canvasHeight={clientDimensions.height}
        canvasWidth={clientDimensions.width}
      ></Canvas>
      <Snackbar
        anchorOrigin={{
          vertical: snackbarData.vertical,
          horizontal: snackbarData.horizontal,
        }}
        open={snackbarData.open}
        onClose={handleClose}
        autoHideDuration={1000}
      >
        <Alert
          onClose={handleClose}
          severity={snackbarData.severity}
          sx={{ width: '100%' }}
        >
          {snackbarData.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export { EditorView }
