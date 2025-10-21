export const moneyFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
  notation: 'compact',
})

export const percentFormat = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

export const countFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

export const damageFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
  notation: 'compact',
})

export const formatters = {
  money: moneyFormat,
  percent: percentFormat,
  count: countFormat,
  damage: damageFormat,
} as const satisfies Record<string, Intl.NumberFormat>

export type FormatType = keyof typeof formatters
