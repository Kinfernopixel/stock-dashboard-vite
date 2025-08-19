import React, { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

type Props = { symbol: string; apiKey: string }

export default function StockChart({ symbol, apiKey }: Props) {
  const [labels, setLabels] = useState<string[]>([])
  const [values, setValues] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let aborted = false
    async function fetchHistory() {
  setLoading(true)
  setError(null)
  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${encodeURIComponent(symbol)}&outputsize=compact&apikey=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const series = data['Time Series (Daily)'] || {}
    const lbls: string[] = []
    const vals: number[] = []
    for (const [date, val] of Object.entries<any>(series)) {
      lbls.push(date)
      vals.push(Number(val['4. close']))
    }
    // reverse so oldest → newest
    lbls.reverse()
    vals.reverse()
    setLabels(lbls)
    setValues(vals)
  } catch (e: any) {
    setError(e.message || 'Failed to load Alpha Vantage chart')
  } finally {
    setLoading(false)
  }
}

    fetchHistory()
    return () => { aborted = true }
  }, [symbol, apiKey])

  if (loading) return <p className="text-sm text-gray-500">Loading chart…</p>
  if (error) return <p className="text-sm text-red-600">Chart error: {error}</p>
  if (!labels.length) return <p className="text-sm text-gray-500">No chart data.</p>

  return (
    <div className="w-full">
      <Line
        data={{
          labels,
          datasets: [
            {
              label: symbol,
              data: values,
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.2,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
            tooltip: { enabled: true },
          },
          scales: {
            x: { display: true, title: { display: false } },
            y: { display: true, title: { display: false }, ticks: { callback: (v) => `$${v}` } },
          },
        }}
        height={320}
      />
    </div>
  )
}