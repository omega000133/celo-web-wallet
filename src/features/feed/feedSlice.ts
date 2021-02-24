import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage'
import { CeloTransaction, TransactionMap } from 'src/features/types'

export interface TransactionFeed {
  transactions: TransactionMap
  lastUpdatedTime: number | null
  lastBlockNumber: number | null
  openTransaction: string | null // hash of transaction selected from the feed
  showAdvancedDetails: boolean
}

export const feedInitialState: TransactionFeed = {
  transactions: {},
  lastUpdatedTime: null,
  lastBlockNumber: null,
  openTransaction: null,
  showAdvancedDetails: false,
}

const feedSlice = createSlice({
  name: 'feed',
  initialState: feedInitialState,
  reducers: {
    addTransactions: (
      state,
      action: PayloadAction<{
        txs: TransactionMap
        lastUpdatedTime: number
        lastBlockNumber: number
      }>
    ) => {
      if (Object.keys(action.payload.txs).length > 0) {
        state.transactions = { ...state.transactions, ...action.payload.txs }
      }
      state.lastUpdatedTime = action.payload.lastUpdatedTime
      state.lastBlockNumber = action.payload.lastBlockNumber
    },
    addPlaceholderTransaction: (state, action: PayloadAction<CeloTransaction>) => {
      const newTx = action.payload
      if (!state.transactions[newTx.hash]) {
        state.transactions = { ...state.transactions, [newTx.hash]: newTx }
      }
    },
    openTransaction: (state, action: PayloadAction<string | null>) => {
      if (action.payload && state.transactions[action.payload]) {
        state.openTransaction = action.payload
      } else {
        state.openTransaction = null
      }
    },
    toggleAdvancedDetails: (state) => {
      state.showAdvancedDetails = !state.showAdvancedDetails
    },
    resetFeed: () => feedInitialState,
  },
})

export const {
  addTransactions,
  addPlaceholderTransaction,
  openTransaction,
  toggleAdvancedDetails,
  resetFeed,
} = feedSlice.actions

const feedReducer = feedSlice.reducer

const feedPersistConfig = {
  key: 'feed',
  storage: storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['transactions', 'lastUpdatedTime', 'lastBlockNumber'],
}
export const persistedFeedReducer = persistReducer<ReturnType<typeof feedReducer>>(
  feedPersistConfig,
  feedReducer
)
