import { config } from 'src/config'

const Tips = [
  [
    'Transaction fees can be paid in any currency but they are smaller when paid with CELO.',
    'Consider keeping some CELO in your account to pay for fees. It will be used by default.',
  ],
  [
    "The cUSD currency is stable and unlimited; it's worth one United States Dollar.",
    'The CELO currency is unstable and limited, like Bitcoin; its value will change over time.',
  ],
  [
    'To keep your account safe, keep a copy of your Account Key in a private place.',
    'For even better security, consider using a Ledger hardware wallet.',
  ],
  [
    "Your wallet Address is public; it's like your username on the Celo network. Share it with your friends!",
    'Your Account Key is a secret; always keep it private.',
  ],
  [
    'Your wallet can be imported in many places at once.',
    'For example, you can import your Account Key into the Valora mobile app.',
  ],
  [
    'You can lock CELO to participate in Celo network elections and governance.',
    'Voting for validators that are elected will earn you free CELO rewards.',
  ],
]

const WebTips = [
  ...Tips,
  [
    'Using this wallet in a browser is only safe for small accounts or Ledger users.',
    'For large accounts, downloading the Desktop App is strongly recommended.',
  ],
]

export function useDailyTip() {
  const tips = config.isElectron ? Tips : WebTips
  const date = new Date().getDate()
  return tips[date % tips.length]
}
