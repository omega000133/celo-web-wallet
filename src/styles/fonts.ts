import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'

export const Font: Stylesheet = {
  body: {
    fontSize: '1.1em',
    fontWeight: 400,
    color: Color.primaryBlack,
  },
  body2: {
    fontSize: '1em',
    fontWeight: 400,
    color: Color.primaryBlack,
  },
  subtitle: {
    fontSize: '0.9em',
    fontWeight: 300,
    color: Color.textGrey,
  },
  h1: {
    fontSize: '1.6em',
    fontWeight: 400,
    marginBottom: '1em',
    color: Color.primaryBlack,
  },
  h1Green: {
    fontSize: '1.6em',
    fontWeight: 400,
    margin: '0 0 1em 0',
    color: Color.primaryGreen,
    textAlign: 'center',
  },
  h2: {
    fontSize: '1.4em',
    fontWeight: 400,
    color: Color.primaryBlack,
  },
  h2Green: {
    fontSize: '1.4em',
    fontWeight: 400,
    color: Color.primaryGreen,
    marginTop: 0,
    marginBottom: '1em',
  },
  h3: {
    fontSize: '1.2em',
    fontWeight: 400,
  },
  label: {
    fontSize: '1em',
    fontWeight: 500,
    letterSpacing: '0.04em',
    color: Color.textGrey,
  },
  inputLabel: {
    fontWeight: 400,
    fontSize: '1.1em',
  },
  linkLight: {
    textDecoration: 'underline',
    color: Color.textGrey,
    ':hover': {
      color: Color.primaryBlack,
    },
  },
  bold: {
    fontWeight: 500,
  },
  extraBold: {
    fontWeight: 600,
  },
}
