import { useEffect, useMemo, useState } from 'react';
import { callNext, completeConsult, getDoctors, getQueue } from '../lib/api.js';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function DoctorQueuePanel({ user, token }) {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(todayIso());
  const [queue, setQueue] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    getDoctors()
      .then((data) => setDoctors(data.doctors || []))
      .catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    if (!doctors.length || !user || user.role !== 'doctor' || doctorId) return;
    const ownDoctor = doctors.find((doctor) => doctor.email?.toLowerCase() === user.email?.toLowerCase());
    if (ownDoctor) {
      setDoctorId(ownDoctor.id);
    }
  }, [doctors, user, doctorId]);

  useEffect(() => {
    if (!doctorId || !date) {
      setQueue(null);
      return;
    }

    setStatus('loading');
    setError(null);
    setMessage(null);

    getQueue(doctorId, date, token)
      .then((data) => setQueue(data))
      .catch((err) => setError(err.message || 'Unable to load queue'))
      .finally(() => setStatus('idle'));
  }, [doctorId, date, token]);

  const selectedDoctor = useMemo(() => doctors.find((doctor) => doctor.id === doctorId), [doctorId, doctors]);
  const canManageQueue = user?.role === 'doctor' && selectedDoctor?.email === user?.email;
  const currentConsult = queue?.currentConsult;
  const waitingQueue = queue?.queue?.filter((item) => item.status === 'IN_QUEUE') || [];

  const handleCallNext = async () => {
    if (!doctorId || !date) return;
    if (currentConsult) {
      setError('Please complete the current consultation first.');
      return;
    }

    setStatus('loading');
    setError(null);
    setMessage(null);

    try {
      await callNext(doctorId, date, token);
      await new Promise(r => setTimeout(r, 300));
      const refreshed = await getQueue(doctorId, date, token);
      setQueue(refreshed);
      setMessage('Patient called. Starting consultation...');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Unable to call next patient');
    } finally {
      setStatus('idle');
    }
  };

  const handleCompleteConsult = async () => {
    if (!currentConsult?.appointmentId) return;

    setStatus('loading');
    setError(null);
    setMessage(null);

    try {
      await completeConsult(currentConsult.appointmentId, token);
      await new Promise(r => setTimeout(r, 300));
      const refreshed = await getQueue(doctorId, date, token);
      setQueue(refreshed);
      setMessage('✓ Consultation completed. Patient discharged.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Unable to complete consultation');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <section className="card">
      <div className="mb-6 border-b border-slate-200 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-purple-600">Doctor dashboard</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">Consultation queue</h2>
            <p className="mt-2 text-sm text-slate-600">Manage your appointments and consultations with real-time status updates.</p>
          </div>
          <div className="rounded-full bg-purple-100 p-3">
            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Doctor & Date Selection */}
      <div className="grid gap-5 md:grid-cols-2 mb-6">
        <label className="label">
          {user?.role === 'doctor' ? 'Your doctor profile' : 'Select doctor'}
          <select
            value={doctorId}
            onChange={(event) => setDoctorId(event.target.value)}
            className="input"
            disabled={user?.role === 'doctor'}
          >
            <option value="">Choose a doctor...</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                Dr. {doctor.name ?? 'Doctor'} • {doctor.department}
              </option>
            ))}
          </select>
        </label>

        <label className="label">
          Consultation Date
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="input" />
        </label>
      </div>

      {/* Status Messages */}
      {error ? (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
            </svg>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      ) : null}

      {message ? (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex gap-3">
            <svg className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
            <p className="text-sm font-medium text-emerald-800">{message}</p>
          </div>
        </div>
      ) : null}

      {/* Main Content */}
      {status === 'loading' ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"></div>
          <p className="text-sm text-slate-600">Loading consultation data...</p>
        </div>
      ) : !doctorId ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-600">Select your doctor profile and date to view the consultation queue.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Currently Consulting Section */}
          <div className="rounded-lg border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-purple-600 mb-1">Currently Consulting</p>
                <h3 className="text-xl font-bold text-slate-900">
                  {currentConsult ? `Token #${currentConsult.tokenNumber}` : 'No one in consultation'}
                </h3>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-2 rounded-full bg-purple-200 px-4 py-2">
                  <div className="h-3 w-3 rounded-full bg-purple-600 animate-pulse"></div>
                  <span className="text-sm font-semibold text-purple-900">
                    {currentConsult ? 'IN SESSION' : 'IDLE'}
                  </span>
                </div>
              </div>
            </div>

            {currentConsult ? (
              <div className="mt-6 space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Patient Name</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {queue?.queue?.find(q => q.appointmentId === currentConsult.appointmentId)?.patientName || 'Patient'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Appointment Time</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {queue?.queue?.find(q => q.appointmentId === currentConsult.appointmentId)?.slotTime || '—'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Duration</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">In progress...</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCompleteConsult}
                  className="w-full button bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-base"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'Completing...' : '✓ Complete Consultation & Discharge Patient'}
                </button>
              </div>
            ) : (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleCallNext}
                  className="w-full button bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold text-base"
                  disabled={status === 'loading' || waitingQueue.length === 0}
                >
                  {status === 'loading' ? 'Calling...' : waitingQueue.length === 0 ? 'No Patients Waiting' : `📞 Call Next Patient (${waitingQueue.length} waiting)`}
                </button>
              </div>
            )}
          </div>

          {/* Waiting Queue Section */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Waiting Queue</h3>
                <p className="mt-1 text-sm text-slate-500">{waitingQueue.length} patient{waitingQueue.length !== 1 ? 's' : ''} waiting</p>
              </div>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                {waitingQueue.length}
              </span>
            </div>

            {waitingQueue.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5" />
                </svg>
                <p className="text-sm text-slate-600 font-medium">All patients have been seen</p>
              </div>
            ) : (
              <div className="space-y-3">
                {waitingQueue.map((item, index) => (
                  <div
                    key={item.appointmentId}
                    className={`rounded-lg border p-4 transition-all ${
                      index === 0
                        ? 'border-blue-300 bg-blue-50 shadow-md'
                        : 'border-slate-200 bg-white hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                            : 'bg-gradient-to-br from-slate-400 to-slate-500'
                        }`}>
                          {item.tokenNumber}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">{item.patientName || 'Patient'}</p>
                          <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {item.slotTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      {index === 0 && (
                        <span className="rounded-full bg-blue-200 px-3 py-1 text-xs font-semibold text-blue-700 whitespace-nowrap">
                          Next Up
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Queue Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Currently Consulting</p>
              <p className="mt-3 text-2xl font-bold text-slate-900">{currentConsult ? 1 : 0}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Waiting in Queue</p>
              <p className="mt-3 text-2xl font-bold text-slate-900">{waitingQueue.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Date</p>
              <p className="mt-3 text-sm font-semibold text-slate-900">{date}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
