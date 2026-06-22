const holdings = [
  { ticker: "VTI", name: "US Total Market ETF", value: "$96,420", weight: "22.5%", change: 1.2 },
  { ticker: "AAPL", name: "Apple Inc.", value: "$62,840", weight: "14.7%", change: 0.8 },
  { ticker: "MSFT", name: "Microsoft Corp.", value: "$58,110", weight: "13.5%", change: 1.7 },
  { ticker: "NVDA", name: "NVIDIA Corp.", value: "$44,900", weight: "10.5%", change: -0.6 },
  { ticker: "BND", name: "Total Bond Market ETF", value: "$38,720", weight: "9.0%", change: 0.2 },
];

const allocation = [
  { label: "US equities", value: "42%", color: "#0f8f8c" },
  { label: "Global equities", value: "26%", color: "#3867d6" },
  { label: "Fixed income", value: "16%", color: "#1c9a67" },
  { label: "Alternatives", value: "9%", color: "#c88a24" },
  { label: "Cash", value: "7%", color: "#7257c8" },
];

const watchlist = [
  { ticker: "SCHD", name: "Dividend quality", signal: "Near target" },
  { ticker: "GOOGL", name: "Megacap growth", signal: "Momentum rising" },
  { ticker: "VNQ", name: "Real estate ETF", signal: "Yield watch" },
];

const portfolio = [100, 103, 101, 108, 112, 116, 114, 121, 126, 124, 131, 137];
const benchmark = [100, 101, 100, 104, 107, 109, 108, 112, 116, 115, 119, 123];

function currencyTrend(value) {
  const className = value >= 0 ? "positive" : "negative";
  const sign = value >= 0 ? "+" : "";
  return `<span class="${className}">${sign}${value.toFixed(1)}%</span>`;
}

function renderHoldings() {
  const rows = holdings
    .map(
      (item) => `
        <tr>
          <td>
            <div class="asset-cell">
              <span class="ticker">${item.ticker.slice(0, 2)}</span>
              <div>
                <strong>${item.ticker}</strong><br />
                <span>${item.name}</span>
              </div>
            </div>
          </td>
          <td>${item.value}</td>
          <td>${item.weight}</td>
          <td>${currencyTrend(item.change)}</td>
        </tr>
      `
    )
    .join("");

  document.querySelector("#holdingsRows").innerHTML = rows;
}

function renderAllocation() {
  const items = allocation
    .map(
      (item) => `
        <li>
          <span><i style="background:${item.color}"></i> ${item.label}</span>
          <strong>${item.value}</strong>
        </li>
      `
    )
    .join("");

  document.querySelector("#allocationLegend").innerHTML = items;
}

function renderWatchlist() {
  const cards = watchlist
    .map(
      (item) => `
        <div class="watch-card">
          <div>
            <strong>${item.ticker}</strong>
            <small>${item.name}</small>
          </div>
          <span>${item.signal}</span>
        </div>
      `
    )
    .join("");

  document.querySelector("#watchlistCards").innerHTML = cards;
}

function makePath(points, width, height, padding) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  return points
    .map((point, index) => {
      const x = padding + (index * (width - padding * 2)) / (points.length - 1);
      const y = height - padding - ((point - min) / (max - min)) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function renderChart() {
  const svg = document.querySelector("#lineChart");
  const width = 720;
  const height = 300;
  const padding = 36;
  const portfolioPath = makePath(portfolio, width, height, padding);
  const benchmarkPath = makePath(benchmark, width, height, padding);
  const areaPath = `${portfolioPath} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;

  const gridlines = [0, 1, 2, 3]
    .map((index) => {
      const y = padding + index * ((height - padding * 2) / 3);
      return `<line class="gridline" x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" />`;
    })
    .join("");

  svg.innerHTML = `
    ${gridlines}
    <path class="area-fill" d="${areaPath}" />
    <path class="line-benchmark" d="${benchmarkPath}" />
    <path class="line-portfolio" d="${portfolioPath}" />
    <circle cx="${width - padding}" cy="54" r="6" fill="#0f8f8c" />
    <text x="${width - padding - 110}" y="58" fill="#17202a" font-size="14" font-weight="800">Portfolio</text>
    <circle cx="${width - padding}" cy="82" r="6" fill="#c88a24" />
    <text x="${width - padding - 110}" y="86" fill="#17202a" font-size="14" font-weight="800">Benchmark</text>
  `;
}

renderHoldings();
renderAllocation();
renderWatchlist();
renderChart();
