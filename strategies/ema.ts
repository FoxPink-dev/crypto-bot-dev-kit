import { BinanceClient, calculateEMA } from '../core/binance'
import type { StrategySignal } from '../core/types'

export interface EMAConfig {
  symbol: string
  interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
  quantity: string
  fastPeriod: number
  slowPeriod: number
}

export async function runEMA(
  client: BinanceClient,
  config: EMAConfig,
): Promise<StrategySignal> {
  const klines = await client.getKlines(config.symbol, config.interval, config.slowPeriod + 50)
  const closes = klines.map((k) => parseFloat(k.close))

  const fastEMA = calculateEMA(closes, config.fastPeriod)
  const slowEMA = calculateEMA(closes, config.slowPeriod)

  const lastFast = fastEMA[fastEMA.length - 1]
  const lastSlow = slowEMA[slowEMA.length - 1]
  const prevFast = fastEMA[fastEMA.length - 2]
  const prevSlow = slowEMA[slowEMA.length - 2]

  if (prevFast <= prevSlow && lastFast > lastSlow) {
    return {
      action: 'buy',
      symbol: config.symbol,
      quantity: config.quantity,
      reason: `EMA crossover: ${config.fastPeriod}EMA(${lastFast.toFixed(2)}) crossed above ${config.slowPeriod}EMA(${lastSlow.toFixed(2)})`,
    }
  }

  if (prevFast >= prevSlow && lastFast < lastSlow) {
    return {
      action: 'sell',
      symbol: config.symbol,
      quantity: config.quantity,
      reason: `EMA crossunder: ${config.fastPeriod}EMA(${lastFast.toFixed(2)}) crossed below ${config.slowPeriod}EMA(${lastSlow.toFixed(2)})`,
    }
  }

  return {
    action: 'hold',
    symbol: config.symbol,
    quantity: '0',
    reason: `No crossover. ${config.fastPeriod}EMA: ${lastFast.toFixed(2)}, ${config.slowPeriod}EMA: ${lastSlow.toFixed(2)}`,
  }
}
