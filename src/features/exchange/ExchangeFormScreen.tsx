import { Fragment, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/Button'
import { CurrencyRadioBox } from 'src/components/input/CurrencyRadioBox'
import { MoneyValueInput } from 'src/components/input/MoneyValueInput'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { MoneyValue } from 'src/components/MoneyValue'
import { Currency } from 'src/consts'
import { fetchExchangeRateActions } from 'src/features/exchange/exchangeRate'
import { exchangeStarted } from 'src/features/exchange/exchangeSlice'
import { validate } from 'src/features/exchange/exchangeToken'
import { ExchangeTokenParams } from 'src/features/exchange/types'
import { PriceChartCelo } from 'src/features/tokenPrice/PriceChartCelo'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { fromWei, toWei, useExchangeValues } from 'src/utils/amount'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useInputValidation } from 'src/utils/validation'
interface ExchangeTokenForm extends Omit<ExchangeTokenParams, 'amountInWei'> {
  amount: number
}

const initialValues: ExchangeTokenForm = {
  amount: 0,
  fromCurrency: Currency.cUSD,
}

export function ExchangeFormScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const balances = useSelector((state: RootState) => state.wallet.balances)
  const { transaction: tx, cUsdToCelo } = useSelector((state: RootState) => state.exchange)

  useEffect(() => {
    dispatch(fetchExchangeRateActions.trigger({}))
  }, [])

  const onSubmit = (values: ExchangeTokenForm) => {
    if (areInputsValid()) {
      dispatch(exchangeStarted(toExchangeTokenParams(values)))
      navigate('/exchange-review')
    }
  }

  const { values, touched, handleChange, handleBlur, handleSubmit, resetValues } = useCustomForm<
    ExchangeTokenForm,
    any
  >(toExchangeTokenForm(tx) ?? initialValues, onSubmit)

  const { inputErrors, areInputsValid } = useInputValidation(touched, () =>
    validate(toExchangeTokenParams(values), balances)
  )

  const { to, from, rate } = useExchangeValues(
    values.amount,
    values.fromCurrency,
    cUsdToCelo,
    false
  )

  //-- If the txn gets cleared out in the slice, need to reset it in the screen
  useEffect(() => {
    if (tx === null) {
      resetValues(initialValues)
    }
  }, [tx])

  const onClose = () => {
    navigate('/')
  }

  return (
    <ScreenContentFrame onClose={onClose}>
      <h2 css={Font.h2Green}>Make an Exchange</h2>
      <Box styles={style.containerBox}>
        <Box direction="column" styles={style.txnColumn}>
          <form onSubmit={handleSubmit}>
            <Box direction="row" align="center" styles={style.inputRow}>
              <label css={style.inputLabel}>Amount to Exchange</label>
              <MoneyValueInput
                name="amount"
                width={150}
                onChange={handleChange}
                value={values.amount.toString()}
                onBlur={handleBlur}
                {...inputErrors['amount']}
              />
            </Box>
            <Box direction="row" align="center" styles={style.inputRow}>
              <label css={style.inputLabel}>Currency</label>
              <CurrencyRadioBox
                tabIndex={0}
                label="cUSD"
                value={Currency.cUSD}
                name="fromCurrency"
                checked={values.fromCurrency === Currency.cUSD}
                onChange={handleChange}
              />
              <CurrencyRadioBox
                tabIndex={1}
                label="CELO"
                value={Currency.CELO}
                name="fromCurrency"
                checked={values.fromCurrency === Currency.CELO}
                onChange={handleChange}
              />
            </Box>

            <Box direction="row" align="center" styles={style.inputRow}>
              <label css={style.inputLabel}>Output Amount</label>
              <MoneyValue amountInWei={to.weiAmount} currency={to.currency} baseFontSize={1.2} />
            </Box>

            <Button type="submit" size="m">
              Continue
            </Button>
          </form>
        </Box>
        <Box direction="column" styles={style.chartColumn}>
          <Box direction="row" align="center" styles={style.inputRow}>
            <label css={style.inputLabel}>Current Rate</label>
            {cUsdToCelo ? (
              <Fragment>
                <MoneyValue
                  amountInWei={rate.weiBasis}
                  currency={from.currency}
                  baseFontSize={1.2}
                />
                <span css={style.valueText}>to</span>
                <MoneyValue amountInWei={rate.weiRate} currency={to.currency} baseFontSize={1.2} />
              </Fragment>
            ) : (
              <span css={style.valueText}>Loading...</span>
            )}
          </Box>
          <PriceChartCelo containerCss={style.chartContainer} height={200} />
        </Box>
      </Box>
    </ScreenContentFrame>
  )
}

function toExchangeTokenParams(values: ExchangeTokenForm): ExchangeTokenParams {
  try {
    return {
      ...values,
      amountInWei: toWei(values.amount).toString(),
    }
  } catch (error) {
    return {
      ...values,
      amountInWei: '0', // TODO Makes this NaN?
    }
  }
}

function toExchangeTokenForm(values: ExchangeTokenParams | null): ExchangeTokenForm | null {
  if (!values) return null
  return {
    ...values,
    amount: fromWei(values.amountInWei),
  }
}

const style: Stylesheet = {
  containerBox: {
    flexDirection: 'column',
    [mq[1200]]: {
      flexDirection: 'row',
    },
  },
  inputRow: {
    marginBottom: '2em',
  },
  inputLabel: {
    fontWeight: 300,
    fontSize: '1.1em',
    width: '9em',
    marginRight: '1em',
  },
  valueText: {
    fontSize: '1.1em',
    fontWeight: 400,
    color: Color.primaryGrey,
    margin: '0 0.5em',
  },
  chartColumn: {
    marginTop: '3em',
    marginLeft: 0,
    width: '100%',
    [mq[1200]]: {
      marginLeft: '3em',
      marginTop: 0,
      width: 'calc(100% - 150px - 10em)',
    },
  },
  chartContainer: {
    minWidth: 300,
  },
}
