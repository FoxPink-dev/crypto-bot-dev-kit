import 'dotenv/config'
import { BinanceClient } from '../core/binance'
import { runEMA } from '../strategies/ema'
import { runRSI } from '../strategies/rsi'

const SYMBOL = process.env.BOT_SYMBOL || 'BTCUSDT'
const QUANTITY = process.env.BOT_QUANTITY || '0.001'
const INTERVAL = (process.env.BOT_INTERVAL || '5m') as '1m' | '5m' | '15m' | '1h' | '4h' | '1d'

const strategies: Record<string, () => Promise<void>> = {
  async ema() {
    const signal = await runEMA(client, {
      symbol: SYMBOL,
      interval: INTERVAL,
      quantity: QUANTITY,
      fastPeriod: 9,
      slowPeriod: 21,
    })
    printSignal(signal)
  },

  async rsi() {
    const signal = await runRSI(client, {
      symbol: SYMBOL,
      interval: INTERVAL,
      quantity: QUANTITY,
      period: 14,
      oversoldThreshold: 30,
      overboughtThreshold: 70,
    })
    printSignal(signal)
  },
}

function printSignal(signal: { action: string; symbol: string; quantity: string; reason: string; price?: string }) {
  const time = new Date().toISOString()
  console.log('')
  console.log('═══════════════════════════════════════════')
  console.log(`  ${signal.action.toUpperCase()} SIGNAL @ ${time}`)
  console.log('───────────────────────────────────────────')
  console.log(`  Symbol:   ${signal.symbol}`)
  console.log(`  Action:   ${signal.action.toUpperCase()}`)
  console.log(`  Quantity: ${signal.quantity}`)
  console.log(`  Reason:   ${signal.reason}`)
  if (signal.price) console.log(`  Price:    ${signal.price}`)
  console.log('═══════════════════════════════════════════')
  console.log('')
}

if (!process.env.BINANCE_API_KEY) {
  console.log('No API key found — running in MOCK mode')
  console.log(`To use real data, create .env from .env.example`)
  console.log('')
}

const client = new BinanceClient({
  apiKey: process.env.BINANCE_API_KEY || 'mock',
  secretKey: process.env.BINANCE_SECRET_KEY || 'mock',
  testnet: process.env.BINANCE_TESTNET !== 'false',
})

function parseArg(key: string): string | undefined {
  const idx = process.argv.indexOf(`--${key}`)
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1]
  const found = process.argv.find((a) => a.startsWith(`--${key}=`))
  return found?.split('=')[1]
}

async function main() {
  const strategy = parseArg('strategy') || process.env.BOT_STRATEGY || 'ema'

  console.log('')
  console.log('╔══════════════════════════════════════════╗')
  console.log('║     Crypto Trading Bot — CLI Runner      ║')
  console.log('╠══════════════════════════════════════════╣')
  console.log(`║  Symbol:   ${SYMBOL.padEnd(30)}║`)
  console.log(`║  Strategy: ${strategy.padEnd(30)}║`)
  console.log(`║  Interval: ${INTERVAL.padEnd(30)}║`)
  console.log(`║  Quantity: ${QUANTITY.padEnd(30)}║`)
  console.log(`║  Mode:     ${(client.isTestnet() ? 'TESTNET' : 'LIVE').padEnd(30)}║`)
  console.log('╚══════════════════════════════════════════╝')

  const runner = strategies[strategy]
  if (!runner) {
    console.error(`Unknown strategy: "${strategy}"`)
    console.error(`Available: ${Object.keys(strategies).join(', ')}`)
    process.exit(1)
  }

  await runner()
}

main().catch((err) => {
  console.error('Bot error:', err)
  process.exit(1)
})
