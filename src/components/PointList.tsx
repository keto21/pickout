import * as React from 'react'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import { useRecoilState } from 'recoil'
import { pointDataState } from '../atoms'
import { IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { EditableLabel } from './EditableLabel'

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

  return (
    <>
      <List
        dense
        sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
        subheader={
          <ListSubheader sx={{ bgcolor: 'black', color: 'white' }}>
            Points
          </ListSubheader>
        }
      >
        {pointData.map((point) => (
          <ListItem
            key={point.id}
            secondaryAction={
              <>
                <IconButton
                  size="large"
                  aria-label="delete-button"
                  aria-controls="delete-point-button"
                  aria-haspopup="true"
                  onClick={handleDeletePoint(point.id)}
                  color="inherit"
                >
                  <DeleteIcon />
                </IconButton>
              </>
            }
            divider
          >
            <ListItemText
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
