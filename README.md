# Bitcoin On-Chain Metrics Dashboard

A lightweight static dashboard for Bitcoin on-chain and market metrics.

## What it shows
- BTC price and market cap (CoinGecko)
- 7-day average hashrate snapshot and 180-day hashrate trend (Blockchain.com)
- Mempool transaction count (mempool.space)
- 30-day active addresses and transaction count (Blockchain.com)

## Run locally
Because this uses browser `fetch`, run it behind any static file server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
