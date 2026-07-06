export interface TickerPrice {
  symbol: string
  price: string
}

export interface Kline {
  openTime: number
  open: string
  high: string
  low: string
  close: string
  volume: string
  closeTime: number
}

export interface OrderBook {
  lastUpdateId: number
  bids: [string, string][]
  asks: [string, string][]
}

export interface AccountInfo {
  balances: Balance[]
}

export interface Balance {
  asset: string
  free: string
  locked: string
}

export interface Position {
  symbol: string
  positionAmt: string
  entryPrice: string
  markPrice: string
  unRealizedProfit: string
  liquidationPrice: string
  leverage: string
}

export interface NewOrderParams {
  symbol: string
  side: 'BUY' | 'SELL'
  type: 'MARKET' | 'LIMIT'
  quantity: string
  price?: string
  timeInForce?: 'GTC' | 'IOC' | 'FOK'
}

export interface Order {
  symbol: string
  orderId: number
  clientOrderId: string
  transactTime: number
  price: string
  origQty: string
  executedQty: string
  status: 'NEW' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELED' | 'REJECTED'
  side: 'BUY' | 'SELL'
}

export interface WebhookSignal {
  symbol: string
  action: 'buy' | 'sell' | 'close'
  quantity?: string
  price?: string
  strategy?: string
  timestamp?: number
}

export type KlineInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d'

export interface StrategyConfig {
  symbol: string
  interval: KlineInterval
  quantity: string
  [key: string]: string | number | boolean
}

export interface StrategySignal {
  action: 'buy' | 'sell' | 'close' | 'hold'
  symbol: string
  quantity: string
  reason: string
  price?: string
}
