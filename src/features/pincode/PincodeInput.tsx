import { HelpText } from 'src/components/input/HelpText'
import { getSharedInputStyles } from 'src/components/input/styles'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export enum PincodeInputType {
  NewPincode,
  CurrentPincode,
  NewPassword,
  CurrentPassword,
}

interface Props {
  name: string
  type: PincodeInputType
  value?: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  error?: boolean
  helpText?: string
  autoFocus?: boolean
}

export function PincodeInput(props: Props) {
  const { name, type, value, onChange, error, helpText, autoFocus } = props

  const { placeholder, autoComplete, inputMode } = getPropsForInputType(type)

  // Wrap the provided onChange to validate input
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event?.target?.value
    if (value) {
      if (inputMode === 'numeric') {
        value = value.substring(0, 6).replace(/[^0-9]/g, '')
      } else {
        value = value.replace(/[\s]/g, '')
      }
      event.target.value = value
    }
    onChange(event)
  }

  const sharedStyles = getSharedInputStyles(error)
  return (
    <Box direction="column">
      <input
        type="password"
        name={name}
        css={{ ...sharedStyles, ...style.input }}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        inputMode={inputMode as any}
        autoComplete={autoComplete}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
        autoFocus={autoFocus}
      />
      {helpText && <HelpText>{helpText}</HelpText>}
    </Box>
  )
}

function getPropsForInputType(type: PincodeInputType) {
  if (type === PincodeInputType.NewPincode || type === PincodeInputType.CurrentPincode) {
    return {
      placeholder: '123456',
      inputMode: 'numeric',
      autoComplete: 'off',
    }
  }
  if (type === PincodeInputType.NewPassword) {
    return {
      placeholder: undefined,
      inputMode: 'text',
      autoComplete: 'new-password',
    }
  }
  if (type === PincodeInputType.CurrentPassword) {
    return {
      placeholder: undefined,
      inputMode: 'text',
      autoComplete: 'current-password',
    }
  }

  throw new Error(`Unsupported Pincode Type: ${type}`)
}

export function PincodeInputRow(props: Props & { label: string }) {
  const { label, ...passThroughProps } = props
  return (
    <Box align="center" styles={style.inputContainer}>
      <span css={style.inputLabel}>{label}</span>
      <PincodeInput {...passThroughProps} />
    </Box>
  )
}

const style: Stylesheet = {
  inputContainer: {
    marginTop: '1.5em',
    textAlign: 'right',
  },
  inputLabel: {
    width: '6em',
    paddingRight: '1em',
    [mq[480]]: {
      width: '8em',
    },
  },
  input: {
    width: '8.6em',
    height: '1.8em',
    textAlign: 'center',
    letterSpacing: '0.6em',
    fontSize: '1.4em',
    '::placeholder': {
      letterSpacing: '0.3em',
      color: Color.borderInactive,
      opacity: 1 /* Firefox */,
    },
    ':focus': {
      '::placeholder': {
        color: Color.primaryWhite,
        opacity: 0,
      },
    },
  },
}
