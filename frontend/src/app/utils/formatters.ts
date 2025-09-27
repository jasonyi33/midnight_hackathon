export const formatAddress = (address: string): string => {
  if (!address) return 'Unknown address'
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export const formatBalance = (lovelaceHex: string): string => {
  if (!lovelaceHex) return '0 tDUST'
  try {
    const lovelace = BigInt(lovelaceHex)
    const dust = Number(lovelace) / 1_000_000
    return `${dust.toFixed(2)} tDUST`
  } catch (error) {
    console.error('Failed to format balance', error)
    return '0 tDUST'
  }
}
