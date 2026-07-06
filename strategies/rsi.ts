import { BinanceClient, calculateRSI } from '../core/binance'
import type { StrategySignal } from '../core/types'

export interface RSIConfig {
  symbol: string
  interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
  quantity: string
  period: number
  oversoldThreshold: number
  overboughtThreshold: number
}

export async function runRSI(
  client: BinanceClient,
  config: RSIConfig,
): Promise<StrategySignal> {
  const klines = await client.getKlines(config.symbol, config.interval, config.period + 50)
  const closes = klines.map((k) => parseFloat(k.close))

  const rsi = calculateRSI(closes, config.period)
  const currentPrice = parseFloat(klines[klines.length - 1].close)

  const prevRSI = calculateRSI(closes.slice(0, -1), config.period)

  if (prevRSI < config.oversoldThreshold && rsi >= config.oversoldThreshold) {
    return {
      action: 'buy',
      symbol: config.symbol,
      quantity: config.quantity,
      reason: `RSI exit oversold: ${rsi.toFixed(2)} (threshold: ${config.oversoldThreshold})`,
      price: currentPrice.toFixed(8),
    }
  }

  if (prevRSI > config.overboughtThreshold && rsi <= config.overboughtThreshold) {
    return {
      action: 'sell',
      symbol: config.symbol,
      quantity: config.quantity,
      reason: `RSI exit overbought: ${rsi.toFixed(2)} (threshold: ${config.overboughtThreshold})`,
      price: currentPrice.toFixed(8),
    }
  }

  return {
    action: 'hold',
    symbol: config.symbol,
    quantity: '0',
    reason: `RSI: ${rsi.toFixed(2)} (oversold: ${config.oversoldThreshold}, overbought: ${config.overboughtThreshold})`,
  }
}
