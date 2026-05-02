import { expandMetric } from '../../src/helpers/expandMetric'

describe('expandMetric', () => {
  it('returns numeric strings as floats', () => {
    expect(expandMetric('42.5')).toBe(42.5)
  })

  it('returns numeric values unchanged', () => {
    expect(expandMetric(42.5)).toBe(42.5)
    expect(expandMetric(1234)).toBe(1234)
  })

  it('expands K suffix to thousands', () => {
    expect(expandMetric('10K')).toBe(10000)
    expect(expandMetric('1.5K')).toBe(1500)
  })

  it('expands M suffix to millions', () => {
    expect(expandMetric('2M')).toBe(2000000)
    expect(expandMetric('0.5M')).toBe(500000)
  })

  it('expands B suffix to billions', () => {
    expect(expandMetric('1B')).toBe(1000000000)
    expect(expandMetric('1.5B')).toBe(1500000000)
  })
})
