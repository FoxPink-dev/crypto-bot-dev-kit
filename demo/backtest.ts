import 'dotenv/config'
import { BinanceClient, calculateEMA, calculateRSI } from '../core/binance'

const client = new BinanceClient({
  apiKey: process.env.BINANCE_API_KEY || 'mock',
  secretKey: process.env.BINANCE_SECRET_KEY || 'mock',
  testnet: true,
})

interface Trade {
  entryTime: number
  exitTime: number
  side: 'long' | 'short'
  entryPrice: number
  exitPrice: number
  pnl: number
  pnlPercent: number
}

async function backtestEMA(
  symbol: string,
  interval: '5m' | '15m' | '1h' | '4h' | '1d',
  fastPeriod: number,
  slowPeriod: number,
) {
  const klines = await client.getKlines(symbol, interval, 500)
  const closes = klines.map((k) => parseFloat(k.close))
  const times = klines.map((k) => k.openTime)

  const fastEMA = calculateEMA(closes, fastPeriod)
  const slowEMA = calculateEMA(closes, slowPeriod)

  const trades: Trade[] = []
  let position: 'long' | 'short' | null = null
  let entryPrice = 0
  let entryTime = 0

  const offset = slowPeriod
  for (let i = offset + 1; i < closes.length; i++) {
    const prevFast = fastEMA[i - 1 - offset + fastPeriod]
    const prevSlow = slowEMA[i - 1 - offset + slowPeriod]
    const currFast = fastEMA[i - offset + fastPeriod]
    const currSlow = slowEMA[i - offset + slowPeriod]

    if (!position && prevFast <= prevSlow && currFast > currSlow) {
      position = 'long'
      entryPrice = closes[i]
      entryTime = times[i]
    } else if (position === 'long' && prevFast >= prevSlow && currFast < currSlow) {
      const pnl = ((closes[i] - entryPrice) / entryPrice) * 100
      trades.push({
        entryTime,
        exitTime: times[i],
        side: 'long',
        entryPrice,
        exitPrice: closes[i],
        pnl: closes[i] - entryPrice,
        pnlPercent: pnl,
      })
      position = null
    }
  }

  return trades
}

async function main() {
  const pairs = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT']
  const intervals: ('5m' | '15m' | '1h' | '4h' | '1d')[] = ['5m', '15m', '1h', '4h', '1d']

  for (const symbol of pairs) {
    for (const interval of intervals) {
      console.log(`\nBacktesting EMA(9,21) on ${symbol} ${interval}...`)
      const trades = await backtestEMA(symbol, interval, 9, 21)

      if (trades.length === 0) {
        console.log('  No trades found')
        continue
      }

      const wins = trades.filter((t) => t.pnlPercent > 0).length
      const winRate = (wins / trades.length) * 100
      const avgPnl = trades.reduce((s, t) => s + t.pnlPercent, 0) / trades.length
      const totalPnl = trades.reduce((s, t) => s + t.pnlPercent, 0)

      console.log(`  Trades: ${trades.length}`)
      console.log(`  Win rate: ${winRate.toFixed(1)}%`)
      console.log(`  Avg PnL: ${avgPnl.toFixed(2)}%`)
      console.log(`  Total PnL: ${totalPnl.toFixed(2)}%`)
      console.log(`  Best: ${Math.max(...trades.map((t) => t.pnlPercent)).toFixed(2)}%`)
      console.log(`  Worst: ${Math.min(...trades.map((t) => t.pnlPercent)).toFixed(2)}%`)
    }
  }
}

main().catch(console.error)
