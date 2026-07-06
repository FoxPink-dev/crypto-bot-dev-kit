import axios, { AxiosInstance } from 'axios'
import crypto from 'node:crypto'
import { type Kline, type KlineInterval, type NewOrderParams, type Order, type OrderBook, type TickerPrice } from './types'

export class BinanceClient {
  private http: AxiosInstance
  private testnet: boolean

  constructor(options: { apiKey: string; secretKey: string; testnet?: boolean }) {
    this.testnet = options.testnet ?? true
    const baseURL = this.testnet
      ? 'https://testnet.binance.vision/api'
      : 'https://api.binance.com/api'

    this.http = axios.create({
      baseURL,
      headers: { 'X-MBX-APIKEY': options.apiKey },
    })
  }

  isTestnet(): boolean {
    return this.testnet
  }

  private signParams(params: Record<string, string | number>): string {
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      query.append(key, String(value))
    }
    const signature = crypto
      .createHmac('sha256', process.env.BINANCE_SECRET_KEY || '')
      .update(query.toString())
      .digest('hex')
    query.append('signature', signature)
    return query.toString()
  }

  private async signedGet<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const query = this.signParams(params)
    const { data } = await this.http.get<T>(`${endpoint}?${query}`)
    return data
  }

  private async signedPost<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const query = this.signParams(params)
    const { data } = await this.http.post<T>(`${endpoint}?${query}`)
    return data
  }

  async getPrice(symbol: string): Promise<TickerPrice> {
    const { data } = await this.http.get<TickerPrice>('/v3/ticker/price', {
      params: { symbol: symbol.toUpperCase() },
    })
    return data
  }

  async getKlines(symbol: string, interval: KlineInterval, limit = 100): Promise<Kline[]> {
    const { data } = await this.http.get<unknown[][]>('/v3/klines', {
      params: { symbol: symbol.toUpperCase(), interval, limit },
    })
    return data.map((k) => ({
      openTime: k[0] as number,
      open: k[1] as string,
      high: k[2] as string,
      low: k[3] as string,
      close: k[4] as string,
      volume: k[5] as string,
      closeTime: k[6] as number,
    }))
  }

  async getOrderBook(symbol: string, limit = 100): Promise<OrderBook> {
    const { data } = await this.http.get<OrderBook>('/v3/depth', {
      params: { symbol: symbol.toUpperCase(), limit },
    })
    return data
  }

  async getAccountInfo(): Promise<{ balances: { asset: string; free: string; locked: string }[] }> {
    return this.signedGet('/v3/account')
  }

  async placeOrder(params: NewOrderParams): Promise<Order> {
    const body: Record<string, string | number> = {
      symbol: params.symbol.toUpperCase(),
      side: params.side,
      type: params.type,
      quantity: params.quantity,
    }
    if (params.price) body.price = params.price
    if (params.timeInForce) body.timeInForce = params.timeInForce
    if (params.type === 'LIMIT' && !params.timeInForce) body.timeInForce = 'GTC'
    return this.signedPost('/v3/order', body)
  }

  async cancelOrder(symbol: string, orderId: number): Promise<void> {
    await this.signedPost('/v3/order', {
      symbol: symbol.toUpperCase(),
      orderId,
    })
  }

  async getOpenOrders(symbol?: string): Promise<Order[]> {
    const params: Record<string, string | number> = {}
    if (symbol) params.symbol = symbol.toUpperCase()
    return this.signedGet('/v3/openOrders', params)
  }
}

export function calculateEMA(prices: number[], period: number): number[] {
  const multiplier = 2 / (period + 1)
  const ema: number[] = []
  const sliced = prices.slice(0, period)
  const sum = sliced.reduce((a, b) => a + b, 0)
  ema.push(sum / period)
  for (let i = period; i < prices.length; i++) {
    ema.push((prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1])
  }
  return ema
}

export function calculateRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50
  const deltas: number[] = []
  for (let i = 1; i < prices.length; i++) {
    deltas.push(prices[i] - prices[i - 1])
  }
  const gains = deltas.slice(-period).map((d) => (d > 0 ? d : 0))
  const losses = deltas.slice(-period).map((d) => (d < 0 ? Math.abs(d) : 0))
  const avgGain = gains.reduce((a, b) => a + b, 0) / period
  const avgLoss = losses.reduce((a, b) => a + b, 0) / period
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

export function calculateSMA(prices: number[], period: number): number {
  const sliced = prices.slice(-period)
  return sliced.reduce((a, b) => a + b, 0) / period
}
