import * as React from 'react'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRecoilState } from 'recoil'
import { fileDialogState } from '../atoms'

interface FileDropzoneProps {
  onClose: (fileData: string | null) => void
}

/**
 * This function tries to add width and height attributes
 * to a data-url encoded svg file.
 *
 * The canvas cannot draw svg files without any width or height
 * attributes, so possible width and height values are extracted
 * from the viewbox attribute and manually set as width and height
 * @param aDataURL A file encoded as a data URL
 * @returns either the unchanged data URL or a fixed one
 */
const fixSvgDimensions = (aDataURL: string) => {
  if (aDataURL.startsWith('data:image/svg')) {
    const svgString = atob(aDataURL.replace(/data:image\/svg\+xml;base64,/, ''))
    const parser = new DOMParser()
    const svgElem = parser.parseFromString(
      svgString,
      'image/svg+xml'
    ).documentElement

    if (
      ['100%', null].includes(svgElem.getAttribute('width')) ||
      ['100%', null].includes(svgElem.getAttribute('height'))
    ) {
      // fallback values, if there is also no viewbox
      let viewBoxWidth = '800'
      let viewBoxHeight = '600'

      const viewBox = svgElem.getAttribute('viewBox')
      if (viewBox) {
        // only the integer digits are needed
        const match = viewBox.match(
          /\d+\.?\d* \d+\.?\d* (\d+)\.?\d* (\d+)\.?\d*/
        )
        if (match) {
          viewBoxWidth = match[1]
          viewBoxHeight = match[2]
        }
      }
      svgElem.setAttribute('width', viewBoxWidth)
      svgElem.setAttribute('height', viewBoxHeight)

      const svgData = new XMLSerializer().serializeToString(svgElem)
      return 'data:image/svg+xml;base64,' + btoa(svgData)
    }
  }

  return aDataURL
}

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column' as 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#555',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
}

const focusedStyle = {
  borderColor: '#2196f3',
}

const acceptStyle = {
  borderColor: '#00e676',
}

const rejectStyle = {
  borderColor: '#ff1744',
}

const FileDropzone = (props: FileDropzoneProps) => {
  const { onClose } = props
  const [fileDialogData, setFileDialogData] = useRecoilState(fileDialogState)

  const onDrop = useCallback((acceptedFiles: any[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        // Do whatever you want with the file contents
        let dataURL = reader.result

        if (typeof dataURL === 'string') {
          dataURL = fixSvgDimensions(dataURL)
          onClose(dataURL)
        } else {
          onClose(null)
        }
      }
      reader.readAsDataURL(file)

      setFileDialogData({ ...fileDialogData, open: false })
    })
  }, [])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.JPG', '.svg', '.SVG'],
    },
    maxFiles: 1,
  })

  const style = React.useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  )

  return (
    <div className="container" style={{}}>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
    </div>
  )
}

export { FileDropzone }
