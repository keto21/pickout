import * as React from 'react'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import { useRecoilState } from 'recoil'
import {
  pointDataState,
  activeElementState,
  canvasOptionsState,
} from '../atoms'
import { Checkbox, IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { EditableLabel } from './EditableLabel'
import SquareIcon from '@mui/icons-material/Square'

const PointList = () => {
  const [pointData, setPointData] = useRecoilState(pointDataState)

  const handleDeletePoint =
    (id: number) => (_: React.MouseEvent<HTMLElement>) => {
      setPointData(pointData.filter((point) => point.id !== id))
    }

  const handleEditPoint = (id: number, value: string) => {
    const newPointData = pointData.map((point) =>
      point.id === id ? { ...point, name: value } : point
    )
    setPointData(newPointData)
  }

  const [activeElement, setActiveElement] = useRecoilState(activeElementState)
  const [canvasOptions, setCanvasOptions] = useRecoilState(canvasOptionsState)

  const handleChange = () => {
    setCanvasOptions((prev) => {
      return { ...prev, hideLabels: !prev.hideLabels }
    })
  }

  return (
    <>
      <List
        dense
        sx={{ width: '100%', maxWidth: 450 }}
        subheader={
          <ListSubheader
            sx={{ bgcolor: '#282828', color: 'white', position: 'sticky' }}
          >
            Created Points
            <span style={{ marginLeft: '3em' }}>
              <Checkbox
                checked={!canvasOptions.hideLabels}
                onChange={handleChange}
                inputProps={{ 'aria-label': 'controlled' }}
              />
              Show labels
            </span>
          </ListSubheader>
        }
      >
        {pointData.map((point) => (
          <ListItem
            sx={{
              bgcolor: activeElement === point.id ? '#282828' : '#202020',
              borderLeft: `4px solid ${point.color}`,
            }}
            onMouseOver={() => {
              setActiveElement(point.id)
            }}
            onMouseLeave={() => {
              setActiveElement(-1)
            }}
            key={point.id}
            secondaryAction={
              <>
                <IconButton
                  size="large"
                  aria-label="delete-button"
                  aria-controls="delete-point-button"
                  aria-haspopup="true"
                  onClick={handleDeletePoint(point.id)}
                  color="primary"
                >
                  <DeleteIcon />
                </IconButton>
              </>
            }
            divider
          >
            <ListItemText
              sx={{ color: 'white' }}
              primary={
                <EditableLabel
                  initialValue={point.name}
                  onBlur={(value) => {
                    handleEditPoint(point.id, value)
                  }}
                ></EditableLabel>
              }
            ></ListItemText>
          </ListItem>
        ))}
      </List>
    </>
  )
}

export { PointList }
