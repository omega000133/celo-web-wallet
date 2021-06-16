import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from 'src/components/buttons/Button'
import { NumberInput } from 'src/components/input/NumberInput'
import { Box } from 'src/components/layout/Box'
import { useSagaStatus } from 'src/components/modal/useSagaStatusModal'
import { DeviceAnimation } from 'src/features/ledger/animation/DeviceAnimation'
import {
  importLedgerWalletActions,
  importLedgerWalletSagaName,
  ImportWalletParams,
  validate,
} from 'src/features/ledger/importWallet'
import { onboardingStyles } from 'src/features/onboarding/onboardingStyles'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'

const initialValues = { index: '0' }

export function LedgerImportForm() {
  const dispatch = useDispatch()

  const onSubmit = (values: ImportWalletParams) => {
    dispatch(importLedgerWalletActions.trigger(values))
  }

  const validateForm = (values: ImportWalletParams) => validate(values)

  const { values, errors, handleChange, handleSubmit } = useCustomForm<ImportWalletParams>(
    initialValues,
    onSubmit,
    validateForm
  )

  const navigate = useNavigate()
  const onSuccess = () => {
    navigate('/', { replace: true })
  }
  const status = useSagaStatus(
    importLedgerWalletSagaName,
    'Error Importing Wallet',
    'Something went wrong, sorry! Please ensure your Ledger is connected, unlocked, and running the latest Celo app.',
    onSuccess
  )

  return (
    <>
      <p css={onboardingStyles.description}>
        To import, connect your Ledger, open the Celo application, and verify the address.
      </p>
      <div css={style.animationContainer}>
        <DeviceAnimation xOffset={48} />
      </div>
      <form onSubmit={handleSubmit}>
        <Box direction="row" align="center" justify="center" styles={style.inputContainer}>
          <label css={style.inputLabel}>Address Index</label>
          <NumberInput
            name="index"
            value={'' + values.index}
            onChange={handleChange}
            width="2em"
            {...errors['index']}
          />
        </Box>
        <Button margin="2em 0 0 0" disabled={status === SagaStatus.Started} size="l" type="submit">
          Import Account
        </Button>
      </form>
    </>
  )
}

const style: Stylesheet = {
  animationContainer: {
    margin: '2em 1em',
  },
  inputContainer: {
    input: {
      textAlign: 'center',
    },
  },
  inputLabel: {
    ...Font.inputLabel,
    marginRight: '1.5em',
  },
}
