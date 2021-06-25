import { useNavigate } from 'react-router-dom'
import { useLogoutModal } from 'src/app/logout/useLogoutModal'
import { transparentButtonStyles } from 'src/components/buttons/Button'
import { useFundWalletModal } from 'src/components/FundWalletModal'
import { AccountMenuItem } from 'src/components/header/AccountMenuItem'
import AvatarSwapIcon from 'src/components/icons/avatar_swap.svg'
import { ChevronIcon } from 'src/components/icons/Chevron'
import CoinSwapIcon from 'src/components/icons/coin_swap.svg'
import HelpIcon from 'src/components/icons/help.svg'
import IdCardIcon from 'src/components/icons/id_card.svg'
import Discord from 'src/components/icons/logos/discord.svg'
import Github from 'src/components/icons/logos/github.svg'
import SettingsIcon from 'src/components/icons/settings.svg'
import SignPostIcon from 'src/components/icons/sign_post.svg'
import { Identicon } from 'src/components/Identicon'
import { Box } from 'src/components/layout/Box'
import { DropdownBox, useDropdownBox } from 'src/components/modal/DropdownBox'
import { ModalLinkGrid } from 'src/components/modal/ModalLinkGrid'
import { useModal } from 'src/components/modal/useModal'
import { config } from 'src/config'
import { useChooseAccountModal } from 'src/features/wallet/accounts/ChooseAccountModal'
import { useWalletAddress } from 'src/features/wallet/hooks'
import { Color } from 'src/styles/Color'
import { mq, useIsMobile } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { shortenAddress } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'

const MenuItems = [
  { id: 'switch', label: 'Switch Account', icon: AvatarSwapIcon },
  { id: 'account', label: 'Account Details', icon: IdCardIcon },
  { id: 'fund', label: 'Fund Wallet', icon: CoinSwapIcon },
  { id: 'help', label: 'Help', icon: HelpIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, iconWidth: '1.8em' },
  { id: 'logout', label: 'Logout', icon: SignPostIcon },
]

export const AccountMenu = () => {
  const { isDropdownVisible, showDropdown, hideDropdown } = useDropdownBox()

  const isMobile = useIsMobile()
  const identiconSize = isMobile ? 28 : 38

  const { showModalWithContent } = useModal()
  const onLogout = useLogoutModal()

  const address = useWalletAddress()
  const addressStub = shortenAddress(address, false, true)
  const showFundModal = useFundWalletModal()
  const showAccountsModal = useChooseAccountModal()

  const navigate = useNavigate()
  const onItemClick = (key: string) => async () => {
    switch (key) {
      case 'account':
        navigate('/wallet')
        break
      case 'switch':
        showAccountsModal()
        break
      case 'settings':
        navigate('/settings')
        break
      case 'fund':
        showFundModal(address)
        break
      case 'logout':
        await onLogout()
        break
      case 'help':
        showModalWithContent({
          head: 'Need some help?',
          content: <HelpModal />,
          subHead:
            'See the Frequently Asked Questions (FAQ) on Github or join Discord to chat with the Celo community.',
        })
        break
      default:
        logger.info('Unknown Menu Item Clicked: ', key)
        break
    }
    hideDropdown()
  }

  return (
    <>
      <button css={style.container} onClick={showDropdown}>
        <Box styles={style.caretContainer} align="center">
          <ChevronIcon width="14px" height="8px" direction={isDropdownVisible ? 'n' : 's'} />
        </Box>
        <Box styles={style.addressContainer} align="center">
          <span css={style.address}>{addressStub}</span>
        </Box>
        <Identicon address={address} size={identiconSize} styles={style.identicon} />
      </button>
      {isDropdownVisible && (
        <DropdownBox hide={hideDropdown} styles={style.menu}>
          {MenuItems.map((item) => (
            <AccountMenuItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              iconWidth={item.iconWidth}
              onClick={onItemClick(item.id)}
            />
          ))}
        </DropdownBox>
      )}
    </>
  )
}

function HelpModal() {
  const links = [
    {
      url: 'https://github.com/celo-tools/celo-web-wallet/blob/master/FAQ.md',
      imgSrc: Github,
      text: 'FAQ on Github',
      altText: 'Github',
    },
    {
      url: config.discordUrl,
      imgSrc: Discord,
      text: 'Chat on Discord',
      altText: 'Discord',
    },
  ]
  return <ModalLinkGrid links={links} />
}

const style: Stylesheet = {
  container: {
    ...transparentButtonStyles,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    cursor: 'pointer',
    borderRadius: 22,
    background: Color.fillLighter,
    ':hover': {
      backgroundColor: Color.fillLight,
    },
  },
  addressContainer: {
    display: 'none',
    [mq[768]]: {
      display: 'inline',
      paddingRight: 10,
    },
  },
  address: {
    fontSize: '1.25em',
    letterSpacing: '0.06em',
  },
  caretContainer: {
    padding: '3px 9px 0 14px',
  },
  identicon: {
    border: `4px solid ${Color.primaryWhite}`,
    borderRadius: '50%',
    marginTop: -2,
    marginRight: -3,
  },
  menu: {
    display: 'flex',
    flexDirection: 'column',
    top: '4em',
    right: '1em',
    minWidth: '15em',
    borderRadius: 5,
    boxShadow: '2px 4px 2px -2px #ccc',
  },
}
