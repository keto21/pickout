import * as React from 'react'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Paper from '@mui/material/Paper'
import { ToolId, tools } from '../tools'
import { activeToolState } from '../atoms'
import { useRecoilState } from 'recoil'

import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import MouseIcon from '@mui/icons-material/Mouse'
import NewReleasesIcon from '@mui/icons-material/NewReleases'

const chooseIcon = (toolId: number) => {
  switch (toolId) {
    case ToolId.CURSOR:
      return <MouseIcon />
    case ToolId.ADD_POINT:
      return <GpsFixedIcon />
    default:
      return <NewReleasesIcon />
  }
}

const ToolSelection = () => {
  const [activeTool, setActiveTool] = useRecoilState(activeToolState)

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
      <BottomNavigation
        showLabels
        value={activeTool}
        onChange={(_, newValue) => {
          setActiveTool(newValue)
          console.log(newValue)
        }}
      >
        {tools.map((tool) => {
          return (
            <BottomNavigationAction
              key={tool.id}
              label={tool.name}
              value={tool.id}
              icon={chooseIcon(tool.id)}
            />
          )
        })}
      </BottomNavigation>
    </Paper>
  )
}

export { ToolSelection }
