import { useMemo, useState } from 'react';
import { useQueueSocket } from '../hooks/useQueueSocket.js';
import { useBedsSocket } from '../hooks/useBedsSocket.js';
import { getApiBase } from '../lib/apiBase.js';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function RealtimePanel() {
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(todayIso);
  const [bedsOn, setBedsOn] = useState(false);

  const { queuePayload, lastBooking, connected: qConn, error: qErr } = useQueueSocket(
    doctorId.trim() || null,
    date.trim() || null
  );
  const { bedPayload, connected: bConn, error: bErr } = useBedsSocket(bedsOn);

  const queueLen = queuePayload?.queue?.length;
  const currentToken = queuePayload?.currentConsult?.tokenNumber;

  const preview = useMemo(() => JSON.stringify(queuePayload, null, 2), [queuePayload]);
  const bedsPreview = useMemo(() => JSON.stringify(bedPayload, null, 2), [bedPayload]);

  return (
    <section
      className="realtime-panel"
      style={{
        marginTop: '1.5rem',
        padding: '1rem',
        border: '1px solid #c8d4e4',
        borderRadius: 8,
        background: '#f6f9fc',
        maxWidth: 720,
        textAlign: 'left',
        fontSize: 14,
      }}
    >
      <h2 style={{ margin: '0 0 0.5rem', fontSize: 18 }}>Socket.IO — live data</h2>
      <p style={{ margin: '0 0 1rem', color: '#456' }}>
        API base: <code>{getApiBase()}</code> · Set <code>VITE_API_URL</code> in <code>.env</code>{' '}
        if needed.
      </p>

      <h3 style={{ fontSize: 15, margin: '0.75rem 0 0.35rem' }}>Queue</h3>
      <label style={{ display: 'block', marginBottom: 6 }}>
        Doctor Mongo ID
        <input
          type="text"
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          placeholder="e.g. 64a1b2c3d4e5f6789012345"
          style={{
            width: '100%',
            marginTop: 4,
            padding: '6px 8px',
            boxSizing: 'border-box',
          }}
        />
      </label>
      <label style={{ display: 'block', marginBottom: 8 }}>
        Date
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            marginTop: 4,
            padding: '6px 8px',
          }}
        />
      </label>
      <p style={{ margin: '0.25rem 0' }}>
        <strong>Queue channel:</strong> {qConn ? 'connected' : 'disconnected'}
        {qErr ? ` — ${qErr}` : ''}
      </p>
      {queuePayload ? (
        <p style={{ margin: '0.25rem 0' }}>
          Entries: {queueLen ?? 0}
          {currentToken != null ? ` · Now serving token ${currentToken}` : ''}
        </p>
      ) : null}
      {lastBooking ? (
        <p style={{ margin: '0.25rem 0', color: '#0a5' }}>
          Latest booking: token {lastBooking.tokenNumber} @ {lastBooking.slotTime}
        </p>
      ) : null}
      {queuePayload ? (
        <pre
          style={{
            margin: '0.5rem 0 0',
            padding: 8,
            background: '#fff',
            borderRadius: 6,
            maxHeight: 220,
            overflow: 'auto',
            fontSize: 12,
          }}
        >
          {preview}
        </pre>
      ) : (
        <p style={{ margin: '0.5rem 0 0', color: '#678' }}>Enter a doctor id to subscribe.</p>
      )}

      <h3 style={{ fontSize: 15, margin: '1rem 0 0.35rem' }}>Beds (admin)</h3>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="checkbox" checked={bedsOn} onChange={(e) => setBedsOn(e.target.checked)} />
        Subscribe to <code>bed:update</code> (requires admin JWT in <code>localStorage.token</code>)
      </label>
      <p style={{ margin: '0.25rem 0' }}>
        <strong>Beds channel:</strong> {bedsOn ? (bConn ? 'connected' : 'connecting…') : 'off'}
        {bErr ? ` — ${bErr}` : ''}
      </p>
      {bedPayload ? (
        <pre
          style={{
            margin: '0.5rem 0 0',
            padding: 8,
            background: '#fff',
            borderRadius: 6,
            maxHeight: 220,
            overflow: 'auto',
            fontSize: 12,
          }}
        >
          {bedsPreview}
        </pre>
      ) : null}
    </section>
  );
}
