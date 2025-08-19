import React, { useEffect, useMemo, useState } from 'react'
import { Quote } from './types'
import StockChart from './components/StockChart'

const DEFAULT_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA'] as const

type SortKey = 'symbol' | 'price' | 'changesPercentage'
type SortDir = 'asc' | 'desc'

export default function App() {
  const [tickers, setTickers] = useState<string[]>([...DEFAULT_TICKERS])
  const [inputTickers, setInputTickers] = useState(tickers.join(','))
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('symbol')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selectedForChart, setSelectedForChart] = useState<string>('AAPL')

  const apiKey = import.meta.env.VITE_ALPHA_API_KEY

  async function fetchQuotes(symbols: string[]) {
  if (!symbols.length) return setQuotes([])
  setLoading(true)
  setError(null)

  try {
    const results: Quote[] = []
    for (const sym of symbols) {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(sym)}&apikey=${apiKey}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const q = data['Global Quote']
      if (q) {
        results.push({
          symbol: q['01. symbol'],
          price: Number(q['05. price']),
          changesPercentage: parseFloat((q['10. change percent'] || '0').replace('%', '')),
        })
      }
    }
    setQuotes(results)
  } catch (e: any) {
    setError(e.message || 'Failed to fetch Alpha Vantage data')
  } finally {
    setLoading(false)
  }
}


  useEffect(() => {
    fetchQuotes(tickers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickers.join(',')])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const arr = q
      ? quotes.filter(r => r.symbol.toLowerCase().includes(q) || (r.name || '').toLowerCase().includes(q))
      : quotes.slice()
    arr.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'symbol') return a.symbol.localeCompare(b.symbol) * dir
      if (sortKey === 'price') return ((a.price ?? 0) - (b.price ?? 0)) * dir
      return ((a.changesPercentage ?? 0) - (b.changesPercentage ?? 0)) * dir
    })
    return arr
  }, [quotes, search, sortKey, sortDir])

  function handleTickersUpdate() {
    const parsed = inputTickers
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(Boolean)
    setTickers(parsed)
    if (!parsed.includes(selectedForChart) && parsed.length) {
      setSelectedForChart(parsed[0])
    }
  }

  function setSort(nextKey: SortKey) {
    if (sortKey === nextKey) setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(nextKey)
      setSortDir('asc')
    }
  }

  return (
    <div className="container py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Stock Price Dashboard</h1>
        <p className="text-gray-600">Data source: Financial Modeling Prep (free demo key by default).</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="bg-white rounded-2xl shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tickers (comma separated)</label>
          <div className="flex gap-2">
            <input
              value={inputTickers}
              onChange={e => setInputTickers(e.target.value)}
              placeholder="AAPL,MSFT,GOOGL"
              className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleTickersUpdate}
              className="rounded-xl px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              Update
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Tip: you can also set VITE_FMP_API_KEY in a .env file.</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by symbol or name"
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => fetchQuotes(tickers)}
              className="rounded-xl px-3 py-2 bg-gray-100 hover:bg-gray-200"
              aria-label="Refresh quotes"
            >
              Refresh
            </button>
            {loading && <span className="text-sm text-gray-500 animate-pulse">Loading…</span>}
            {error && <span className="text-sm text-red-600">Error: {error}</span>}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => setSort('symbol')}>
                  Symbol {sortKey === 'symbol' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => setSort('price')}>
                  Price {sortKey === 'price' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => setSort('changesPercentage')}>
                  Change % {sortKey === 'changesPercentage' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => {
                const pct = row.changesPercentage ?? 0
                const pctFmt = Number.isFinite(pct) ? pct.toFixed(2) : '—'
                const priceFmt = Number.isFinite(row.price) ? row.price.toFixed(2) : '—'
                return (
                  <tr key={row.symbol} className="border-t">
                    <td className="px-4 py-3 font-semibold">{row.symbol}</td>
                    <td className="px-4 py-3">{row.name || '—'}</td>
                    <td className="px-4 py-3 tabular-nums">${priceFmt}</td>
                    <td className={"px-4 py-3 tabular-nums " + (pct > 0 ? "text-green-600" : pct < 0 ? "text-red-600" : "")}>
                      {Number.isFinite(pct) ? `${pctFmt}%` : '—'}
                    </td>
                  </tr>
                )
              })}
              {!loading && !filtered.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">No results</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 bg-white rounded-2xl shadow p-4">
        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm font-medium text-gray-700">Chart (optional bonus):</label>
          <select
            value={selectedForChart}
            onChange={e => setSelectedForChart(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {tickers.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <StockChart symbol={selectedForChart} apiKey={apiKey} />
      </section>

      <footer className="mt-10 text-center text-xs text-gray-500">
        Built with React, Vite, Tailwind, and Chart.js. Not investment advice.
      </footer>
    </div>
  )
}