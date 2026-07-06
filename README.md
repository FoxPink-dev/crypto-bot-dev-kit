# Crypto Trading Bot Dev Kit

A minimal TypeScript toolkit for building Binance trading bots.

`
npm run bot:ema
`

## What's included

- Binance API client
- Webhook receiver (TradingView compatible)
- EMA / RSI strategies
- CLI runner
- Backtester

## Full version

The complete source code with documentation and updates is available here:
https://aduity.gumroad.com/l/mecaqk

## Architecture

`
core/       → Binance client + indicators
webhook/    → Signal receiver
strategies/ → Pluggable strategy functions
demo/       → CLI runner + backtester
`

## License

MIT
