import { useEffect, useMemo, useState } from 'react';
import { createBed, dischargeBed, getBeds, assignBed, reserveBed } from '../lib/api.js';

export function BedManagementPanel({ user, token }) {
  const [beds, setBeds] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [bedCode, setBedCode] = useState('');
  const [type, setType] = useState('GENERAL');
  const [patientId, setPatientId] = useState('');
  const [selection, setSelection] = useState('');
  const [message, setMessage] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    refreshBeds();
  }, [user, token]);

  const refreshBeds = async () => {
    setStatus('loading');
    setError(null);
    try {
      const data = await getBeds(token);
      setBeds(data.beds || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || 'Unable to fetch beds');
    } finally {
      setStatus('idle');
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setStatus('loading');

    try {
      await createBed({ bedCode, type }, token);
      setBedCode('');
      setType('GENERAL');
      setMessage('✓ Bed created successfully.');
      await refreshBeds();
    } catch (err) {
      setError(err.message || 'Unable to create bed');
    } finally {
      setStatus('idle');
    }
  };

  const handleAction = async (bedId, action) => {
    setError(null);
    setMessage(null);
    setStatus('loading');

    try {
      if (action === 'assign') {
        await assignBed(bedId, { patientId }, token);
        setMessage('✓ Bed assigned to patient.');
      } else if (action === 'reserve') {
        await reserveBed(bedId, token);
        setMessage('✓ Bed reserved.');
      } else if (action === 'discharge') {
        await dischargeBed(bedId, token);
        setMessage('✓ Bed discharged.');
      }
      setPatientId('');
      await refreshBeds();
    } catch (err) {
      setError(err.message || 'Unable to perform action');
    } finally {
      setStatus('idle');
    }
  };

  const summary = useMemo(() => {
    return beds.reduce(
      (acc, bed) => {
        acc[bed.type] = acc[bed.type] || { total: 0, available: 0, occupied: 0, reserved: 0 };
        acc[bed.type].total += 1;
        acc[bed.type][bed.status.toLowerCase()] += 1;
        return acc;
      },
      {}
    );
  }, [beds]);

  return (
    <section className="card">
      <div className="mb-6 border-b border-slate-200 pb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">Admin panel</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">Bed management</h2>
            <p className="mt-2 text-sm text-slate-600">Create, assign, reserve, and discharge beds.</p>
            <p className="mt-3 text-sm text-slate-500">Welcome back, {user?.name}. Manage bed availability and patient assignments from one dashboard.</p>
          </div>
          <div className="rounded-full bg-amber-100 p-3">
            <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      {user?.role !== 'admin' ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">Sign in with an admin account to manage beds.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick stats */}
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(summary).map(([typeName, stats]) => (
              <div key={typeName} className="rounded-lg border border-slate-200 bg-white p-5">
                <p className="text-sm font-medium text-slate-600">{typeName}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {stats.available} free
                  </span>
                  <span className="inline-block rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                    {stats.occupied} occupied
                  </span>
                  <span className="inline-block rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {stats.reserved} reserved
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Create bed form */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-sm font-semibold text-slate-900">Add a new bed</h3>
            <form className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleCreate}>
              <input
                type="text"
                value={bedCode}
                onChange={(event) => setBedCode(event.target.value)}
                className="input"
                placeholder="Bed code (e.g., BED-101)"
                required
              />
              <select value={type} onChange={(event) => setType(event.target.value)} className="input">
                <option>GENERAL</option>
                <option>ICU</option>
                <option>EMERGENCY</option>
              </select>
              <button type="submit" className="button bg-amber-500 hover:bg-amber-600 text-white" disabled={status === 'loading'}>
                Create
              </button>
            </form>
          </div>

          {/* Messages */}
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          ) : null}
          {message ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-sm font-medium text-emerald-800">{message}</p>
            </div>
          ) : null}

          {/* Beds table */}
          <div className="overflow-x-auto">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">All beds</h3>
                {lastUpdated ? (
                  <p className="text-xs text-slate-500">Last refreshed at {lastUpdated}</p>
                ) : (
                  <p className="text-xs text-slate-500">Refresh to load the latest bed state.</p>
                )}
              </div>
              <button type="button" className="secondary-button text-xs" onClick={refreshBeds} disabled={status === 'loading'}>
                Refresh
              </button>
            </div>
            <table className="w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700">Bed</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Type</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Patient</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {beds.map((bed) => (
                  <tr key={bed.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-semibold text-slate-900">{bed.bedCode}</td>
                    <td className="px-4 py-4 text-slate-700">{bed.type}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        bed.status === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : bed.status === 'OCCUPIED'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {bed.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600 text-xs">{bed.patientId ? bed.patientId.slice(0, 8) : '—'}</td>
                    <td className="px-4 py-4 space-x-2">
                      <button
                        className="secondary-button text-xs"
                        onClick={() => handleAction(bed.id, 'reserve')}
                        disabled={status === 'loading' || bed.status !== 'AVAILABLE'}
                      >
                        Reserve
                      </button>
                      <button
                        className="secondary-button text-xs"
                        onClick={() => handleAction(bed.id, 'discharge')}
                        disabled={status === 'loading' || bed.status === 'AVAILABLE'}
                      >
                        Discharge
                      </button>
                      <button
                        className="secondary-button text-xs"
                        onClick={() => setSelection(bed.id)}
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Assign section */}
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">Assign bed to patient</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <input
                type="text"
                value={patientId}
                onChange={(event) => setPatientId(event.target.value)}
                className="input"
                placeholder="Patient Mongo ID"
              />
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 flex items-center text-sm text-slate-600">
                {selection ? `Bed: ${beds.find(b => b.id === selection)?.bedCode}` : 'Select a bed above'}
              </div>
              <button
                type="button"
                className="button bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => handleAction(selection, 'assign')}
                disabled={status === 'loading' || !selection || !patientId}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
