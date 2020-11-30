import Chart from 'src/components/icons/chart.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { HeaderSection } from 'src/features/home/HeaderSection'
import { HeaderSectionEmpty } from 'src/features/home/HeaderSectionEmpty'
import { PriceChartCelo } from 'src/features/tokenPrice/PriceChartCelo'
import { useAreBalancesEmpty } from 'src/features/wallet/utils'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function HomeScreen() {
  const isWalletEmpty = useAreBalancesEmpty()

  return (
    <ScreenContentFrame>
      <div css={style.container}>
        {!isWalletEmpty && <HeaderSection />}
        {isWalletEmpty && <HeaderSectionEmpty />}

        <hr css={style.divider} />
        <Box direction="row" align="end" styles={{ marginBottom: '2em' }}>
          <img src={Chart} css={style.icon} alt="Price chart" />
          <label css={[Font.body, Font.bold]}>Celo Prices</label>
        </Box>

        <PriceChartCelo />
      </div>
    </ScreenContentFrame>
  )
}

const style: Stylesheet = {
  container: {
    maxWidth: '55rem',
  },
  icon: {
    marginRight: '0.5em',
    height: '2em',
    width: '2em',
  },
  divider: {
    width: '100%',
    height: 1,
    border: 'none',
    backgroundColor: Color.altGrey,
    color: Color.altGrey, //for IE
    margin: '3em 0',
  },
}
