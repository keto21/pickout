import * as React from 'react'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'
import { FileDropzone } from './FileDropzone'
import { useRecoilState } from 'recoil'
import { fileDialogState } from '../atoms'

interface FileDialogProps {
  open: boolean
  onClose: (fileData: string | null) => void
}

const FileDialog = (props: FileDialogProps) => {
  const { onClose, open } = props
  const [fileDialogData, setFileDialogData] = useRecoilState(fileDialogState)

  const handleClose = () => {
    setFileDialogData({ ...fileDialogData, open: false })
  }

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
      <DialogTitle sx={{ color: 'white' }}>Open File</DialogTitle>
      <FileDropzone onClose={onClose} />
    </Dialog>
  )
}

export { FileDialog }
