# Crypto Dev Pack

**Build and run crypto trading bots in 30 minutes. No infrastructure. No monthly fees.**

Get running signals from your machine in under 5 minutes.

---

## One command to start

```bash
npm run bot:ema
```

That's it. You'll see live signals in your terminal.

---

## What you get

- **Binance client** — typed, production-ready, handles auth and errors
- **Pre-built strategies** — EMA Cross, RSI Filter, ready to run
- **Webhook receiver** — connect TradingView or any signal source
- **Backtester** — test strategies across multiple symbols and timeframes
- **Mock mode** — runs without API keys so you can try before you configure

---

## Quick start

```bash
git clone <repo>
cd crypto-dev-pack
npm install
cp .env.example .env    # optional — mock mode works without config
npm run bot:ema         # run EMA strategy on BTCUSDT
```

```bash
# Try RSI strategy
npm run bot:rsi

# Start webhook server (connect TradingView alerts)
npm run webhook

# Backtest EMA against 10+ pairs
npm run backtest
```

---

## How it works

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│ Binance API  │────▶│  Strategy    │────▶│  Signal      │
│ (price data) │     │  Engine      │     │  Output      │
└─────────────┘     └──────────────┘     └──────────────┘
                                    │
                                    ▼
                           ┌────────────────┐
                           │ Terminal / Log  │
                           │ or Webhook POST │
                           └────────────────┘
```

---

## Strategies included

| Strategy | Parameters | Timeframes |
|----------|-----------|------------|
| EMA Cross | Fast: 9, Slow: 21 | 1m, 5m, 15m, 1h, 4h, 1d |
| RSI Filter | Period: 14, OB: 70, OS: 30 | 1m, 5m, 15m, 1h, 4h, 1d |

---

## Connect TradingView

1. Start webhook server: `npm run webhook`
2. Create alert in TradingView with "Webhook URL" = `http://your-ip:3001/webhook`
3. Alert message (JSON):
```json
{
  "symbol": "BTCUSDT",
  "action": "buy",
  "quantity": "0.01",
  "strategy": "tradingview-alert"
}
```

---

## Project structure

```
crypto-dev-pack/
  core/
    binance.ts    # API client + indicators (EMA, RSI, SMA)
    types.ts      # shared types (Order, Signal, Kline, etc.)
  webhook/
    server.ts     # Express server for TradingView alerts
  strategies/
    ema.ts        # EMA crossover strategy
    rsi.ts        # RSI overbought/oversold strategy
  demo/
    run.ts        # CLI runner
    backtest.ts   # Multi-symbol backtester
```

---

## Pricing

| Tier | Price | What you get |
|------|-------|-------------|
| Basic | $49 | Source code + 2 strategies + docs |
| Pro | $79 | Everything + 5 extra strategies + webhook |
| Premium | $149 | Everything + custom strategy built for you |

---

## License

MIT — do whatever you want with the code.
