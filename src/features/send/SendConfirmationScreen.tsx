import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { Address } from 'src/components/Address'
import { Button } from 'src/components/Button'
import ArrowBackIcon from 'src/components/icons/arrow_back_white.svg'
import QuestionIcon from 'src/components/icons/question_mark.svg'
import RequestPaymentIcon from 'src/components/icons/request_payment_white.svg'
import SendPaymentIcon from 'src/components/icons/send_payment_white.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { useModal } from 'src/components/modal/useModal'
import { MoneyValue } from 'src/components/MoneyValue'
import { Notification } from 'src/components/Notification'
import { estimateFeeActions } from 'src/features/fees/estimateFee'
import { useFee } from 'src/features/fees/utils'
import { sendCanceled, sendSucceeded } from 'src/features/send/sendSlice'
import { sendTokenActions } from 'src/features/send/sendToken'
import { TransactionType } from 'src/features/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'

export function SendConfirmationScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { transaction: tx, transactionError: txError } = useSelector(
    (state: RootState) => state.send
  )

  //-- need to make sure we belong on this screen
  useEffect(() => {
    if (!tx) {
      navigate('/send')
    }
  }, [tx])

  useEffect(() => {
    if (!tx) {
      return
    }
    const type = tx.comment
      ? TransactionType.StableTokenTransferWithComment
      : TransactionType.StableTokenTransfer
    dispatch(estimateFeeActions.trigger({ txs: [{ type }] }))
  }, [tx])

  const { amount, total, feeAmount, feeCurrency, feeEstimates } = useFee(tx?.amountInWei)

  const onGoBack = () => {
    dispatch(sendTokenActions.reset())
    dispatch(sendCanceled())
    navigate(-1)
  }

  const onSend = () => {
    if (!tx || !feeEstimates) return
    dispatch(sendTokenActions.trigger({ ...tx, feeEstimate: feeEstimates[0] }))
  }

  // TODO support requets
  const isRequest = false

  //TODO: Wrap the following in a hook to simplify?
  const { status: sagaStatus, error: sagaError } = useSelector(
    (state: RootState) => state.saga.sendToken
  )

  const isSagaWorking = sagaStatus === SagaStatus.Started

  const modal = useModal()

  const confirm = () => {
    modal.closeModal()
    modal.showModal('Payment Succeeded', 'Your payment has been successfully sent')
    dispatch(sendTokenActions.reset())
    dispatch(sendSucceeded())
    navigate('/')
  }

  const failure = (error: string | undefined) => {
    modal.closeModal()
    modal.showErrorModal('Payment Failed', 'Your payment could not be processed', error)
  }

  useEffect(() => {
    if (sagaStatus === SagaStatus.Started) modal.showWorkingModal('Sending Payment...')
    else if (sagaStatus === SagaStatus.Success) confirm()
    else if (sagaStatus === SagaStatus.Failure) failure(sagaError?.toString())
  }, [sagaStatus, sagaError])

  if (!tx) return null

  return (
    <ScreenContentFrame>
      {txError && <Notification message={txError.toString()} color={Color.borderError} />}
      <div css={style.content}>
        <h1 css={[Font.h2Green, style.pageTitle]}>Review {isRequest ? 'Request' : 'Payment'}</h1>

        <Box align="center" styles={style.inputRow}>
          <label css={[style.inputLabel, style.labelCol]}>Recipient</label>
          <Box direction="row" align="center" justify="end" styles={style.valueCol}>
            <Address address={tx.recipient} />
          </Box>
        </Box>

        <Box direction="row" styles={style.inputRow}>
          <label css={[style.inputLabel, style.labelCol]}>Comment</label>
          <label css={[style.valueLabel, style.valueCol]}>{tx.comment}</label>
        </Box>

        <Box direction="row" styles={style.inputRow}>
          <label css={[style.inputLabel, style.labelCol]}>Value</label>
          <Box justify="end" align="end" styles={style.valueCol}>
            <MoneyValue amountInWei={amount} currency={tx.currency} baseFontSize={1.2} />
          </Box>
        </Box>

        <Box direction="row" styles={{ ...style.inputRow, ...style.bottomBorder }} align="end">
          <Box
            direction="row"
            justify="between"
            align="end"
            styles={{ ...style.labelCol, width: '10em' }}
          >
            <label css={style.feeLabel}>
              Fee <img src={QuestionIcon} css={style.icon} />
            </label>
          </Box>
          {feeAmount && feeCurrency ? (
            <Box justify="end" align="end" styles={style.valueCol}>
              <label css={{ ...style.feeLabel, marginRight: '0.25em' }}>+</label>
              <MoneyValue amountInWei={feeAmount} currency={feeCurrency} baseFontSize={1.2} />
            </Box>
          ) : (
            // TODO a proper loader (need to update mocks)
            <div css={style.valueCol}>...</div>
          )}
        </Box>

        <Box direction="row" styles={style.inputRow}>
          <label css={{ ...style.totalLabel, ...style.labelCol, ...Font.bold }}>Total</label>
          <Box justify="end" align="end" styles={style.valueCol}>
            <MoneyValue
              amountInWei={total}
              currency={tx.currency}
              baseFontSize={1.2}
              fontWeight={700}
            />
          </Box>
        </Box>

        <Box direction="row" justify="between" margin={'3em 0 0 0'}>
          <Button
            type="button"
            size="m"
            color={Color.altGrey}
            onClick={onGoBack}
            icon={ArrowBackIcon}
            disabled={isSagaWorking || !feeAmount}
            margin="0 2em 0 0"
            width="6em"
          >
            Back
          </Button>
          <Button
            type="submit"
            size="m"
            onClick={onSend}
            icon={isRequest ? RequestPaymentIcon : SendPaymentIcon}
            disabled={isSagaWorking || !feeAmount}
          >
            Send {isRequest ? 'Request' : 'Payment'}
          </Button>
        </Box>
      </div>
    </ScreenContentFrame>
  )
}

const style: Stylesheet = {
  pageTitle: {
    marginTop: 0,
  },
  content: {
    width: '100%',
    maxWidth: '23em',
  },
  inputRow: {
    marginBottom: '1.25em',
  },
  labelCol: {
    width: '9em',
    marginRight: '1em',
  },
  valueCol: {
    width: '12em',
    textAlign: 'end',
  },
  inputLabel: {
    fontWeight: 300,
    fontSize: '1.1em',
  },
  totalLabel: {
    fontWeight: 700,
    fontSize: '1.1em',
    color: Color.primaryGrey,
  },
  valueLabel: {
    color: Color.primaryBlack,
    fontSize: '1.2em',
    fontWeight: 400,
  },
  feeLabel: {
    fontWeight: 300,
    fontSize: '1.1em',
  },
  bottomBorder: {
    paddingBottom: '0.25em',
    borderBottom: `1px solid ${Color.borderLight}`,
  },
  iconRight: {
    marginLeft: '0.5em',
  },
  icon: {
    marginBottom: '-0.3em',
  },
}
