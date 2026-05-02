/**
 * Expand a compact metric string with a K/M/B suffix into a plain number.
 * If `data` is already a number (or a numeric string with no suffix), it is
 * returned as a float unchanged.
 *
 * @param data - A numeric value or a string such as `'1.5K'`, `'2.3M'`, `'1B'`.
 * @returns The full numeric value (e.g. `'1.5K'` → `1500`, `'2M'` → `2000000`).
 *
 * @example
 * expandMetric('1.5K')  // 1500
 * expandMetric('2.3M')  // 2300000
 * expandMetric(42)      // 42
 */
const expandMetric = (data: string | number): number => {
  const str = data + ''
  const checker = str.search(/[A-Za-z]/g)
  if (checker < 0) return parseFloat(str)

  const num = str.split('').slice(0, -1).join('')
  const postChar = str.split('').splice(-1, 1).join('')
  if (postChar === 'K') return parseFloat(num) * 1000
  if (postChar === 'M') return parseFloat(num) * 1000000
  if (postChar === 'B') return parseFloat(num) * 1000000000

  return parseFloat(num)
}

export { expandMetric }
