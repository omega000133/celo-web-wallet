import { PropsWithChildren } from 'react'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import { BadBrowserScreen } from 'src/app/BadBrowserScreen'
import { useDeepLinkHandler } from 'src/app/deepLink'
import { ErrorBoundary } from 'src/app/FailScreen'
import { NotFoundScreen } from 'src/app/NotFoundScreen'
import { useSplashScreen } from 'src/app/splash'
import { UpdateBanner } from 'src/app/UpdateBanner'
import { ModalProvider } from 'src/components/modal/modalContext'
import { config } from 'src/config'
import { ExchangeConfirmationScreen } from 'src/features/exchange/ExchangeConfirmationScreen'
import { ExchangeFormScreen } from 'src/features/exchange/ExchangeFormScreen'
import { TransactionReview } from 'src/features/feed/TransactionReview'
import { GovernanceConfirmationScreen } from 'src/features/governance/GovernanceConfirmationScreen'
import { GovernanceFormScreen } from 'src/features/governance/GovernanceFormScreen'
import { HomeNavigator } from 'src/features/home/HomeNavigator'
import { HomeScreen } from 'src/features/home/HomeScreen'
import { LockConfirmationScreen } from 'src/features/lock/LockConfirmationScreen'
import { LockFormScreen } from 'src/features/lock/LockFormScreen'
import { ImportChoiceScreen } from 'src/features/onboarding/import/ImportChoiceScreen'
import { ImportWalletScreen } from 'src/features/onboarding/import/ImportWalletScreen'
import { LedgerImportScreen } from 'src/features/onboarding/import/LedgerImportScreen'
import { NewWalletScreen } from 'src/features/onboarding/new/NewWalletScreen'
import { OnboardingNavigator } from 'src/features/onboarding/OnboardingNavigator'
import { SetPasswordScreen } from 'src/features/onboarding/password/SetPasswordScreen'
import { WelcomeScreen } from 'src/features/onboarding/welcome/WelcomeScreen'
import { ChangePasswordScreen } from 'src/features/password/ChangePasswordScreen'
import { SendConfirmationScreen } from 'src/features/send/SendConfirmationScreen'
import { SendFormScreen } from 'src/features/send/SendFormScreen'
import { SettingsScreen } from 'src/features/settings/SettingsScreen'
import { ExploreValidatorsScreen } from 'src/features/validators/ExploreValidatorsScreen'
import { StakeConfirmationScreen } from 'src/features/validators/StakeConfirmationScreen'
import { StakeFormScreen } from 'src/features/validators/StakeFormScreen'
import { AccountsNavigator } from 'src/features/wallet/accounts/AccountsNavigator'
import { AddAccountScreen } from 'src/features/wallet/accounts/AddAccountScreen'
import { AddCreateScreen } from 'src/features/wallet/accounts/AddCreateScreen'
import { AddDeriveScreen } from 'src/features/wallet/accounts/AddDeriveScreen'
import { AddImportScreen } from 'src/features/wallet/accounts/AddImportScreen'
import { AddLedgerScreen } from 'src/features/wallet/accounts/AddLedgerScreen'
import { ManageAccountsScreen } from 'src/features/wallet/accounts/ManageAccountsScreen'
import { ViewAccountScreen } from 'src/features/wallet/accounts/ViewAccountScreen'
import { BalanceDetailsScreen } from 'src/features/wallet/balances/BalanceDetailsScreen'
import { WalletConnectStatusBox } from 'src/features/walletConnect/WalletConnectStatusBox'
import { useBrowserFeatureChecks } from 'src/utils/browsers'

function Router(props: PropsWithChildren<any>) {
  // The BrowserRouter works everywhere except Windows OS so using hash for electron
  return config.isElectron ? (
    <HashRouter>{props.children}</HashRouter>
  ) : (
    <BrowserRouter>{props.children}</BrowserRouter>
  )
}

function DeepLinkHandler() {
  useDeepLinkHandler()
  return null
}

export const App = () => {
  const showSplash = useSplashScreen()
  const isBrowserSupported = useBrowserFeatureChecks()

  // Don't load the app until we're done with the splash screen
  if (showSplash) return null

  if (!isBrowserSupported) return <BadBrowserScreen />

  return (
    <ErrorBoundary>
      <Router>
        <ModalProvider>
          <DeepLinkHandler />
          <UpdateBanner />
          <Routes>
            <Route path="/" element={<HomeNavigator />}>
              <Route path="/" element={<HomeScreen />} />
              <Route path="tx" element={<TransactionReview />} />
              <Route path="send" element={<SendFormScreen />} />
              <Route path="send-review" element={<SendConfirmationScreen />} />
              <Route path="exchange-review" element={<ExchangeConfirmationScreen />} />
              <Route path="exchange" element={<ExchangeFormScreen />} />
              <Route path="lock" element={<LockFormScreen />} />
              <Route path="lock-review" element={<LockConfirmationScreen />} />
              <Route path="validators" element={<ExploreValidatorsScreen />} />
              <Route path="stake" element={<StakeFormScreen />} />
              <Route path="stake-review" element={<StakeConfirmationScreen />} />
              <Route path="governance" element={<GovernanceFormScreen />} />
              <Route path="governance-review" element={<GovernanceConfirmationScreen />} />
              <Route path="balances" element={<BalanceDetailsScreen />} />
              <Route path="account" element={<ViewAccountScreen />} />
              <Route path="accounts" element={<AccountsNavigator />}>
                <Route path="/" element={<ManageAccountsScreen />} />
                <Route path="add" element={<AddAccountScreen />} />
                <Route path="create" element={<AddCreateScreen />} />
                <Route path="derive" element={<AddDeriveScreen />} />
                <Route path="import" element={<AddImportScreen />} />
                <Route path="ledger" element={<AddLedgerScreen />} />
              </Route>
              <Route path="settings" element={<SettingsScreen />} />
            </Route>

            <Route path="/setup" element={<OnboardingNavigator />}>
              <Route path="/" element={<WelcomeScreen />} />
              <Route path="new" element={<NewWalletScreen />} />
              <Route path="existing" element={<ImportChoiceScreen />} />
              <Route path="import" element={<ImportWalletScreen />} />
              <Route path="ledger" element={<LedgerImportScreen />} />
              <Route path="set-pin" element={<SetPasswordScreen />} />
            </Route>

            <Route path="change-pin" element={<ChangePasswordScreen />} />

            {/* To faciliatate testing */}
            {/* <Route path="/dev/home" element={<HomeScreen />} />
            <Route path="/dev/modals" element={<ModalTestScreen />} />
            <Route path="/dev/tools" element={<DevTools />} /> */}

            <Route path="*" element={<NotFoundScreen />} />
          </Routes>
          <WalletConnectStatusBox />
        </ModalProvider>
      </Router>
    </ErrorBoundary>
  )
}
