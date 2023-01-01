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

const PointList = () => {
  const [pointData, setPointData] = useRecoilState(pointDataState)

  const handleDeletePoint =
    (id: number) => (_: React.MouseEvent<HTMLElement>) => {
      console.log('delete' + id)
      setPointData(pointData.filter((point) => point.id !== id))
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
        {pointData.map((point) => {
          const labelId = `checkbox-list-secondary-label-${point.id}`
          return (
            <ListItem
              key={point.id}
              secondaryAction={
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
              }
              disablePadding
              divider
            >
              <ListItemButton>
                <ListItemText id={labelId} primary={`${point.name}`} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </>
  )
}

export { PointList }
