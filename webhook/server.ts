import express from 'express'
import type { WebhookSignal } from '../core/types'

const app = express()
app.use(express.json())

const PORT = parseInt(process.env.WEBHOOK_PORT || '3001', 10)
const AUTH_TOKEN = process.env.WEBHOOK_AUTH_TOKEN || ''

function executeSignal(signal: WebhookSignal): { success: boolean; message: string } {
  const timestamp = signal.timestamp || Date.now()
  const time = new Date(timestamp).toISOString()

  console.log('')
  console.log('═══════════════════════════════════════════')
  console.log(`  SIGNAL RECEIVED @ ${time}`)
  console.log('───────────────────────────────────────────')
  console.log(`  Symbol:   ${signal.symbol}`)
  console.log(`  Action:   ${signal.action.toUpperCase()}`)
  console.log(`  Quantity: ${signal.quantity || 'N/A'}`)
  console.log(`  Price:    ${signal.price || 'MARKET'}`)
  console.log(`  Strategy: ${signal.strategy || 'manual'}`)
  console.log('═══════════════════════════════════════════')
  console.log('')

  return {
    success: true,
    message: `Signal processed: ${signal.action} ${signal.symbol}`,
  }
}

app.post('/webhook', (req, res) => {
  if (AUTH_TOKEN) {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (token !== AUTH_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  const signal = req.body as WebhookSignal

  if (!signal.symbol || !signal.action) {
    return res.status(400).json({
      error: 'Missing required fields: symbol, action',
      received: signal,
    })
  }

  const result = executeSignal(signal)
  res.json(result)
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', port: PORT })
})

app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`)
  console.log(`Send POST /webhook with JSON body:`)
  console.log(`  { "symbol": "BTCUSDT", "action": "buy", "quantity": "0.01" }`)
  if (AUTH_TOKEN) {
    console.log(`Auth: Bearer ${AUTH_TOKEN}`)
  }
})

export { executeSignal }
