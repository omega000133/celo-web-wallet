import { BigNumber, providers, utils } from 'ethers'
import { RootState } from 'src/app/rootReducer'
import { getContract } from 'src/blockchain/contracts'
import { isSignerLedger } from 'src/blockchain/signer'
import { sendSignedTransaction, signTransaction } from 'src/blockchain/transaction'
import { CeloContract } from 'src/config'
import {
  MAX_COMMENT_CHAR_LENGTH,
  MAX_SEND_TOKEN_SIZE,
  MAX_SEND_TOKEN_SIZE_LEDGER,
} from 'src/consts'
import { Currency } from 'src/currency'
import { addPlaceholderTransaction } from 'src/features/feed/feedSlice'
import { createPlaceholderForTx } from 'src/features/feed/placeholder'
import { validateFeeEstimate } from 'src/features/fees/utils'
import { SendTokenParams } from 'src/features/send/types'
import { setNumSignatures } from 'src/features/txFlow/txFlowSlice'
import { TokenTransfer, TransactionType } from 'src/features/types'
import { fetchBalancesActions, fetchBalancesIfStale } from 'src/features/wallet/fetchBalances'
import { Balances } from 'src/features/wallet/types'
import {
  getAdjustedAmountFromBalances,
  validateAmount,
  validateAmountWithFees,
} from 'src/utils/amount'
import { logger } from 'src/utils/logger'
import { createMonitoredSaga } from 'src/utils/saga'
import { ErrorState, invalidInput, validateOrThrow } from 'src/utils/validation'
import { call, put, select } from 'typed-redux-saga'

export function validate(
  params: SendTokenParams,
  balances: Balances,
  validateMaxAmount = true,
  validateFee = false
): ErrorState {
  const { recipient, amountInWei, currency, comment, feeEstimate } = params
  let errors: ErrorState = { isValid: true }

  if (!amountInWei) {
    errors = { ...errors, ...invalidInput('amount', 'Amount Missing') }
  } else {
    const maxAmount = validateMaxAmount
      ? isSignerLedger()
        ? MAX_SEND_TOKEN_SIZE_LEDGER
        : MAX_SEND_TOKEN_SIZE
      : undefined
    errors = { ...errors, ...validateAmount(amountInWei, currency, balances, maxAmount) }
  }

  if (!utils.isAddress(recipient)) {
    logger.error(`Invalid recipient: ${recipient}`)
    errors = {
      ...errors,
      ...invalidInput('recipient', 'Invalid Recipient'),
    }
  } else if (!recipient) {
    logger.error(`Invalid recipient: ${recipient}`)
    errors = {
      ...errors,
      ...invalidInput('recipient', 'Recipient is required'),
    }
  }

  if (comment && comment.length > MAX_COMMENT_CHAR_LENGTH) {
    logger.error(`Invalid comment: ${comment}`)
    errors = {
      ...errors,
      ...invalidInput('comment', 'Comment is too long'),
    }
  }

  if (validateFee) {
    errors = {
      ...errors,
      ...validateFeeEstimate(feeEstimate),
      ...validateAmountWithFees(
        amountInWei,
        currency,
        balances,
        feeEstimate ? [feeEstimate] : undefined
      ),
    }
  }

  return errors
}

function* sendToken(params: SendTokenParams) {
  const balances = yield* call(fetchBalancesIfStale)
  const txSizeLimitEnabled = yield* select((state: RootState) => state.settings.txSizeLimitEnabled)

  validateOrThrow(() => validate(params, balances, txSizeLimitEnabled, true), 'Invalid transaction')

  const { signedTx, type } = yield* call(createSendTx, params, balances)
  yield* put(setNumSignatures(1))

  const txReceipt = yield* call(sendSignedTransaction, signedTx)
  logger.info(`Token transfer hash received: ${txReceipt.transactionHash}`)

  const placeholderTx = getPlaceholderTx(params, txReceipt, type)
  yield* put(addPlaceholderTransaction(placeholderTx))

  yield* put(fetchBalancesActions.trigger())
}

async function createSendTx(params: SendTokenParams, balances: Balances) {
  const { recipient, amountInWei, currency, comment, feeEstimate } = params
  if (!feeEstimate) throw new Error('Fee estimate is missing')

  // Need to account for case where user intends to send entire balance
  const adjustedAmount = getAdjustedAmountFromBalances(amountInWei, currency, balances, [
    feeEstimate,
  ])

  const { tx, type } = await getTokenTransferTx(currency, recipient, adjustedAmount, comment)

  logger.info(`Signing tx to send ${amountInWei} ${currency} to ${recipient}`)
  const signedTx = await signTransaction(tx, feeEstimate)
  return { signedTx, type }
}

async function getTokenTransferTx(
  currency: Currency,
  recipient: string,
  amountInWei: BigNumber,
  comment?: string
) {
  if (currency === Currency.CELO) {
    if (comment) {
      const goldToken = getContract(CeloContract.GoldToken)
      const tx = await goldToken.populateTransaction.transferWithComment(
        recipient,
        amountInWei,
        comment
      )
      return { tx, type: TransactionType.CeloTokenTransfer }
    } else {
      return {
        tx: {
          to: recipient,
          value: amountInWei,
        },
        type: TransactionType.CeloTokenTransfer,
      }
    }
  } else if (currency === Currency.cUSD) {
    const stableToken = getContract(CeloContract.StableToken)
    if (comment) {
      const tx = await stableToken.populateTransaction.transferWithComment(
        recipient,
        amountInWei,
        comment
      )
      return { tx, type: TransactionType.StableTokenTransfer }
    } else {
      const tx = await stableToken.populateTransaction.transfer(recipient, amountInWei)
      return { tx, type: TransactionType.StableTokenTransfer }
    }
  } else {
    throw new Error(`Unsupported currency: ${currency}`)
  }
}

function getPlaceholderTx(
  params: SendTokenParams,
  txReceipt: providers.TransactionReceipt,
  type: TransactionType
): TokenTransfer {
  if (!params.feeEstimate) {
    throw new Error('Params must have fee estimate to create placeholder tx')
  }

  const base = {
    ...createPlaceholderForTx(txReceipt, params.amountInWei, params.feeEstimate),
    isOutgoing: true,
    comment: params.comment,
  }

  if (type === TransactionType.CeloTokenTransfer) {
    return {
      ...base,
      type: TransactionType.CeloTokenTransfer,
      to: params.recipient,
      currency: Currency.CELO,
    }
  }

  if (type === TransactionType.StableTokenTransfer) {
    return {
      ...base,
      type: TransactionType.StableTokenTransfer,
      to: params.recipient,
      currency: Currency.cUSD,
    }
  }

  throw new Error(`Unsupported placeholder type: ${type}`)
}

export const {
  name: sendTokenSagaName,
  wrappedSaga: sendTokenSaga,
  reducer: sendTokenReducer,
  actions: sendTokenActions,
} = createMonitoredSaga<SendTokenParams>(sendToken, 'sendToken')
