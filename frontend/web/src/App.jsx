import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from './api';
import './App.css';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const json = await apiFetch('/dashboard/today');
      setData(json);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const activeTargets = useMemo(
    () => data?.targets?.active ?? [],
    [data]
  );

  const parkedTargets = useMemo(
    () => data?.targets?.parked ?? [],
    [data]
  );

  if (loading) {
    return <div style={{ padding: 24 }}>Loading The Shelf…</div>;
  }

  if (err) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Couldn’t reach the Shelf API</h2>
        <p style={{ opacity: 0.8 }}>{err}</p>
        <button onClick={load}>Try again</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>The Shelf</h1>
        <div style={{ opacity: 0.7 }}>{data?.date}</div>
      </header>

      <section>
        <h2>Habits</h2>
        <ul>
          {data?.habits?.map((h) => (
            <li key={h.id}>
              {h.name} — {h.target_minutes}m
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Active Targets</h2>
        <ul>
          {activeTargets.map((t) => (
            <li key={t.id}>{t.name}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Parking Lot</h2>
        <ul>
          {parkedTargets.map((t) => (
            <li key={t.id}>{t.name}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Entries (Today)</h2>
        <ul>
          {data?.entries?.map((e) => (
            <li key={e.id}>
              <strong>{e.practice}</strong>
              {e.duration_minutes ? ` (${e.duration_minutes}m)` : ''}
              {e.note ? ` — ${e.note}` : ''}
            </li>
          ))}
        </ul>
      </section>

      <button onClick={load}>Refresh</button>
    </div>
  );
}
