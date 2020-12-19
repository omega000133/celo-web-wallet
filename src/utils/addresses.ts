import { utils } from 'ethers'
import { logger } from 'src/utils/logger'

function validateAddress(address: string, context: string) {
  if (!address || !utils.isAddress(address)) {
    const errorMsg = `Invalid addresses for ${context}: ${address}`
    logger.error(errorMsg)
    throw new Error(errorMsg)
  }
}

export function normalizeAddress(address: string) {
  validateAddress(address, 'normalize')
  return utils.getAddress(address)
}

export function shortenAddress(address: string, elipsis?: boolean) {
  validateAddress(address, 'shorten')
  return normalizeAddress(address).substr(0, 8) + (elipsis ? '...' : '')
}

export function areAddressesEqual(a1: string, a2: string) {
  validateAddress(a1, 'compare')
  validateAddress(a2, 'compare')
  return utils.getAddress(a1) === utils.getAddress(a2)
}

export function trimLeading0x(input: string) {
  return input.startsWith('0x') ? input.substring(2) : input
}

export function ensureLeading0x(input: string) {
  return input.startsWith('0x') ? input : `0x${input}`
}
