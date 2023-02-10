import * as React from 'react'
import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'
import { FileDropzone } from './FileDropzone'
import { useRecoilState } from 'recoil'
import { dialogState } from '../atoms'
import { Accept } from 'react-dropzone'

interface FileDialogProps {
  open: boolean
  onClose: () => void
  onDrop: (acceptedFiles: any[]) => void
  accept: Accept
}

const FileDialog = (props: FileDialogProps) => {
  const { onClose, open, accept, onDrop } = props

  return (
    <Dialog
      onClose={onClose}
      open={open}
      PaperProps={{
        style: {
          backgroundColor: '#444',
          boxShadow: 'none',
        },
      }}
    >
      <DialogTitle sx={{ color: 'white' }}>Open File</DialogTitle>
      <FileDropzone
        accept={accept}
        onDrop={(acceptedFiles: any[]) => {
          onDrop(acceptedFiles)
          onClose()
        }}
      />
    </Dialog>
  )
}

export { FileDialog }
