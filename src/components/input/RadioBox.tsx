import { CSSObject } from '@emotion/core'
import { PropsWithChildren } from 'react'
import { InputStyleConstants } from 'src/components/input/styles'
import { Color } from 'src/styles/Color'

export interface RadioBoxInputProps {
  name: string
  label: string
  value: string
  checked?: boolean
  tabIndex?: number
  onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  containerCss?: CSSObject
  inputCss?: CSSObject
  labelCss?: CSSObject
  // TODO add validation hook
}

const containerStyle: CSSObject = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: InputStyleConstants.padding,
  border: InputStyleConstants.border,
  borderColor: Color.primaryGrey,
  borderRadius: InputStyleConstants.borderRadius,
  cursor: 'pointer',
  userSelect: 'none',
  color: Color.primaryGrey,
  marginRight: 4,
  height: InputStyleConstants.defaultHeight, //default height (may be overridden by the classes)
}

const containerStyleSelected: CSSObject = {
  ...containerStyle,
  borderColor: Color.primaryGreen,
  color: Color.primaryGreen, //Color.primaryWhite,
  // backgroundColor: Color.primaryGreen,
}

const inputStyle: CSSObject = {
  position: 'absolute',
  opacity: 0,
  cursor: 'pointer',
}

const labelStyle: CSSObject = {
  color: 'inherit',
}

export function RadioBox(props: PropsWithChildren<RadioBoxInputProps>) {
  const { name, label, value, checked, onChange, tabIndex } = props

  const containerCss = checked
    ? { ...containerStyleSelected, ...props.containerCss }
    : { ...containerStyle, ...props.containerCss }
  const inputCss = { ...inputStyle, ...props.inputCss }
  const labelCss = { ...labelStyle, ...props.labelCss }

  return (
    <label css={containerCss} tabIndex={tabIndex}>
      <input
        name={name}
        type="radio"
        value={value}
        css={inputCss}
        checked={checked}
        onChange={onChange}
      />
      <span css={labelCss}>{label}</span>
    </label>
  )
}
