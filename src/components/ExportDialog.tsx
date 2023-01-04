import * as React from 'react'
import Button from '@mui/material/Button'
import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'
import { useRecoilState, useRecoilValue } from 'recoil'
import { exportDialogState, fileInfoState, pointDataState } from '../atoms'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { useCallback, useState } from 'react'

interface ExportDialogProps {
  open: boolean
  onClose: (fileData: string | null) => void
}

type ExportFormat = 'CSV' | 'JSON'
type ExportCoordinates = 'relative' | 'absolute'

const ExportDialog = (props: ExportDialogProps) => {
  const { onClose, open } = props
  const [dialogData, setDialogData] = useRecoilState(exportDialogState)

  const [fileFormat, setFileFormat] = useState<ExportFormat>('CSV')
  const [coordinateFormat, setCoordinateFormat] =
    useState<ExportCoordinates>('relative')

  const pointData = useRecoilValue(pointDataState)
  const fileInfo = useRecoilValue(fileInfoState)

  const handleClose = () => {
    setDialogData({ ...dialogData, open: false })
  }

  const createExportFile = useCallback(() => {
    const cleanPointData = pointData.map((point) => ({
      id: point.id,
      name: point.name,
      x: coordinateFormat === 'relative' ? point.x / fileInfo.width : point.x,
      y: coordinateFormat === 'relative' ? point.y / fileInfo.height : point.y,
    }))

    let fileURI = null
    let fileExtension = ''
    const fileName = 'point-data'

    if (fileFormat === 'JSON') {
      const fileData = JSON.stringify(cleanPointData)
      const blob = new Blob([fileData], { type: 'text/plain' })
      fileURI = URL.createObjectURL(blob)
      fileExtension = 'json'
    } else if (fileFormat === 'CSV') {
      const csvContent = `data:text/csv;charset=utf-8,${[
        'id',
        'name',
        'x',
        'y',
      ].join(',')}\n${cleanPointData
        .map((p) => [p.id, p.x, p.y].join(','))
        .join('\n')}`

      fileURI = encodeURI(csvContent)
      fileExtension = 'csv'
    } else {
      return
    }

    const link = document.createElement('a')
    link.download = `${fileName}.${fileExtension}`
    link.href = fileURI
    link.click()
  }, [pointData, fileFormat, coordinateFormat, fileInfo])

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      PaperProps={{
        style: {
          backgroundColor: '#444',
          boxShadow: 'none',
        },
      }}
    >
      <DialogTitle sx={{ color: 'white' }}>Export</DialogTitle>
      <DialogContent sx={{ color: 'white' }} dividers>
        <FormControl>
          <FormLabel
            sx={{ color: '#ccc' }}
            id="coordinates-radio-buttons-group-label"
          >
            Coordinates
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="coordinates-row-radio-buttons-group-label"
            name="coordinates-row-radio-buttons-group"
            value={coordinateFormat}
            onChange={(event) => {
              const value = event.target.value
              if (value === 'relative' || value === 'absolute')
                setCoordinateFormat(value)
            }}
          >
            <FormControlLabel
              value="relative"
              control={<Radio />}
              label="Relative"
            />
            <FormControlLabel
              value="absolute"
              control={<Radio />}
              label="Absolute"
            />
          </RadioGroup>
          <FormLabel
            sx={{ color: '#ccc' }}
            id="format-radio-buttons-group-label"
          >
            Format
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="format-row-radio-buttons-group-label"
            name="format-row-radio-buttons-group"
            value={fileFormat}
            onChange={(event) => {
              const value = event.target.value
              if (value === 'CSV' || value === 'JSON') setFileFormat(value)
            }}
          >
            <FormControlLabel value="CSV" control={<Radio />} label="CSV" />
            <FormControlLabel value="JSON" control={<Radio />} label="JSON" />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={() => {
            createExportFile()
          }}
        >
          Download Export File
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export { ExportDialog }
