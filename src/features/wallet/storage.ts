import { getSigner, SignerType } from 'src/blockchain/signer'
import { config } from 'src/config'
import { storageProvider } from 'src/features/storage/storageProvider'
import { decryptMnemonic, encryptMnemonic } from 'src/features/wallet/encryption'
import { isValidMnemonic } from 'src/features/wallet/utils'
import { logger } from 'src/utils/logger'

const MNEMONIC_STORAGE_KEY = 'wallet/mnemonic' // for web
const MNEMONIC_FILENAME = 'mnemonic.enc' // for electron

function getWalletPath() {
  return config.isElectron ? MNEMONIC_FILENAME : MNEMONIC_STORAGE_KEY
}

export function isWalletInStorage() {
  return storageProvider.hasItem(getWalletPath())
}

export async function saveWallet(pincode: string, override = false) {
  try {
    const signer = getSigner()
    if (!signer) throw new Error('No signer found')
    if (signer.type !== SignerType.Local) throw new Error('Attempting to save non-local wallet')

    if (isWalletInStorage() && !override) throw new Error('Attempting to overwrite existing wallet')

    const mnemonic = signer.signer.mnemonic?.phrase
    if (!mnemonic) throw new Error('No signer mnemonic found')
    if (!isValidMnemonic(mnemonic)) throw new Error('Attempting to save invalid mnemonic')

    const encryptedMnemonic = await encryptMnemonic(mnemonic, pincode)

    storageProvider.setItem(getWalletPath(), encryptedMnemonic, override)
  } catch (error) {
    logger.error('Failed to save wallet to storage', error)
    throw new Error('Failure saving wallet')
  }
}

export async function loadWallet(pincode: string) {
  try {
    const encryptedMnemonic = storageProvider.getItem(getWalletPath())
    if (!encryptedMnemonic) {
      logger.warn('No wallet found in storage')
      return null
    }

    const mnemonic = await decryptMnemonic(encryptedMnemonic, pincode)
    return mnemonic
  } catch (error) {
    logger.error('Failed to load wallet from storage', error)
    return null
  }
}

export async function removeWallet() {
  try {
    await storageProvider.removeItem(getWalletPath())
  } catch (error) {
    logger.error('Failed to remove wallet from storage', error)
  }
}
