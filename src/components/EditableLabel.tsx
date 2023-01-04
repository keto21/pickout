import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react'
import PropTypes from 'prop-types'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel'

const DEFAULT_LABEL_PLACEHOLDER = 'Click To Edit'

const EditableLabel = ({
  onFocus = (value: string) => {},
  onBlur = (value: string) => {},
  color = 'white',
  ...props
}) => {
  const [isEditing, setEditing] = useState(false)
  const [value, setValue] = useState(props.initialValue)
  const inputRef = useRef<typeof Input>(null)

  const isTextValueValid = () => value && value.trim().length > 0

  const handleFocus = () => {
    const doAction = isEditing ? onBlur : onFocus
    doAction(value)
    handleEditState()
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    setValue(event.currentTarget.value)

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleEnterKey()
    }
  }

  const handleEditState = () => {
    if (!isTextValueValid()) return
    setEditing((prev) => !prev)
  }

  const handleEnterKey = () => {
    handleFocus()
  }

  if (isEditing) {
    return (
      <Input
        inputProps={{
          ref: inputRef,
          value,
        }}
        sx={{ color: color }}
        onChange={handleChange}
        onBlur={handleFocus}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    )
  }

  const labelText = isTextValueValid()
    ? value
    : props.labelPlaceHolder || DEFAULT_LABEL_PLACEHOLDER

  return (
    <InputLabel sx={{ color: color }} onClick={handleFocus}>
      {labelText}
    </InputLabel>
  )
}

export { EditableLabel }
