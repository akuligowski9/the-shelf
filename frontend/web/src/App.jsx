import { useEffect, useMemo, useState } from 'react'
import './App.css'

export default function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  async function load() {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch('/api/dashboard/today')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const activeTargets = useMemo(() => (data?.targets?.active ?? []), [data])
  const parkedTargets = useMemo(() => (data?.targets?.parked ?? []), [data])

  if (loading) return <div style={{ padding: 24 }}>Loading The Shelf…</div>

  if (err) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Couldn’t reach the Shelf API</h2>
        <p style={{ opacity: 0.8 }}>{err}</p>
        <button onClick={load}>Try again</button>
        <p style={{ marginTop: 12, opacity: 0.7 }}>
          Tip: make sure <code>backend/api</code> is running on port 3001.
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ margin: 0 }}>The Shelf</h1>
        <div style={{ opacity: 0.7 }}>{data?.date}</div>
      </header>

      <div style={{ marginTop: 16, display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
        <Card title="Habits">
          {data?.habits?.length ? (
            <ul>
              {data.habits.map((h) => (
                <li key={h.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{h.name}</span>
                  <span style={{ opacity: 0.7 }}>{h.target_minutes}m</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="No habits yet." />
          )}
        </Card>

        <Card title="Highlights (Recent)">
          {data?.highlights?.length ? (
            <ul>
              {data.highlights.map((e) => (
                <li key={e.id}>
                  <div>{e.practice}</div>
                  {e.note ? <div style={{ opacity: 0.75, fontSize: 14 }}>{e.note}</div> : null}
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="No highlights yet." />
          )}
        </Card>

        <Card title="On the Shelf (Active)">
          {activeTargets.length ? (
            <ul>
              {activeTargets.map((t) => (
                <li key={t.id}>
                  <div>{t.name}</div>
                  <div style={{ opacity: 0.75, fontSize: 14 }}>
                    {t.type} • {t.status}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="Nothing active yet." />
          )}
        </Card>

        <Card title="Parking Lot (Parked)">
          {parkedTargets.length ? (
            <ul>
              {parkedTargets.map((t) => (
                <li key={t.id}>
                  <div>{t.name}</div>
                  <div style={{ opacity: 0.75, fontSize: 14 }}>
                    {t.type} • {t.status}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="Parking lot is empty." />
          )}
        </Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <Card title="Entries (Today)">
          {data?.entries?.length ? (
            <ul>
              {data.entries.map((e) => (
                <li key={e.id}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                    <strong style={{ fontWeight: 600 }}>{e.practice}</strong>
                    {e.is_highlight ? <span title="Highlight">★</span> : null}
                    {e.duration_minutes != null ? (
                      <span style={{ opacity: 0.7 }}>{e.duration_minutes}m</span>
                    ) : null}
                  </div>
                  {e.note ? <div style={{ opacity: 0.75, fontSize: 14 }}>{e.note}</div> : null}
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="No entries yet." />
          )}
        </Card>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={load}>Refresh</button>
      </div>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <section
      style={{
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 12,
        padding: 16,
        background: 'rgba(255,255,255,0.6)',
      }}
    >
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </section>
  )
}

function Empty({ text }) {
  return <div style={{ opacity: 0.7 }}>{text}</div>
}
