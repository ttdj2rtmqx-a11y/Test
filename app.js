const fmtCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const fmtNumber = (value) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);

const state = {
  charts: {},
};

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

function setStatus(message, isError = false) {
  const el = document.getElementById("status");
  el.textContent = message;
  el.className = isError ? "error" : "";
}

function upsertChart(canvasId, label, data, color) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const config = {
    type: "line",
    data: {
      datasets: [
        {
          label,
          data,
          borderColor: color,
          backgroundColor: `${color}33`,
          fill: true,
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      parsing: false,
      scales: {
        x: {
          type: "time",
          time: { unit: "day" },
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(255,255,255,0.05)" },
        },
        y: {
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(255,255,255,0.05)" },
        },
      },
      plugins: {
        legend: {
          labels: { color: "#e5e7eb" },
        },
      },
    },
  };

  if (state.charts[canvasId]) {
    state.charts[canvasId].data = config.data;
    state.charts[canvasId].update();
  } else {
    state.charts[canvasId] = new Chart(ctx, config);
  }
}

async function loadDashboard() {
  try {
    setStatus("Loading on-chain metrics…");

    const [market, blockchainStats, mempool, hashRateHistory] = await Promise.all([
      fetchJson("https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false"),
      fetchJson("https://api.blockchain.info/stats?cors=true"),
      fetchJson("https://mempool.space/api/mempool"),
      fetchJson("https://api.blockchain.info/charts/hash-rate?timespan=180days&format=json&cors=true"),
    ]);

    document.getElementById("price").textContent = fmtCurrency(market.market_data.current_price.usd);
    document.getElementById("marketCap").textContent = fmtCurrency(market.market_data.market_cap.usd);
    document.getElementById("hashRate").textContent = fmtNumber(blockchainStats.hash_rate / 1_000_000_000_000_000_000);
    document.getElementById("mempoolTxCount").textContent = fmtNumber(mempool.count);

    const txHistory = await fetchJson("https://api.blockchain.info/charts/n-transactions?timespan=30days&format=json&cors=true");
    const activeAddresses = await fetchJson("https://api.blockchain.info/charts/n-unique-addresses?timespan=30days&format=json&cors=true");
    const btcPriceHistory = await fetchJson("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30");

    upsertChart(
      "activeAddressesChart",
      "Active Addresses",
      activeAddresses.values.map((p) => ({ x: p.x * 1000, y: p.y })),
      "#60a5fa"
    );

    upsertChart(
      "txCountChart",
      "Transactions",
      txHistory.values.map((p) => ({ x: p.x * 1000, y: p.y })),
      "#f59e0b"
    );

    upsertChart(
      "hashRateChart",
      "Hash Rate (GH/s)",
      hashRateHistory.values.map((p) => ({ x: p.x * 1000, y: p.y })),
      "#34d399"
    );

    upsertChart(
      "priceChart",
      "BTC Price (USD)",
      btcPriceHistory.prices.map((p) => ({ x: p[0], y: p[1] })),
      "#f97316"
    );

    setStatus(`Updated at ${new Date().toLocaleString()}`);
  } catch (error) {
    console.error(error);
    setStatus(`Error loading dashboard: ${error.message}`, true);
  }
}

loadDashboard();
setInterval(loadDashboard, 5 * 60 * 1000);
