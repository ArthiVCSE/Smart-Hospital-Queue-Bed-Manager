import { useEffect, useState } from 'react';
import { bookAppointment, getDoctorSlots, getDoctors } from '../lib/api.js';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function BookingPanel({ user, token }) {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(todayIso());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDoctors()
      .then((data) => setDoctors(data.doctors || []))
      .catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    setSlots([]);
    setSelectedSlot('');
    if (!doctorId || !date) return;

    getDoctorSlots(doctorId, date)
      .then((data) => {
        setSlots(data.availableSlots || []);
      })
      .catch((err) => {
        setSlots([]);
        setError(err.message);
      });
  }, [doctorId, date]);

  const handleBooking = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setStatus('loading');

    try {
      const data = await bookAppointment({ doctorId, date, slotTime: selectedSlot }, token);
      setMessage(`✓ Booked! Token #${data.appointment.tokenNumber} at ${data.appointment.slotTime}`);
      setSelectedSlot('');
    } catch (err) {
      setError(err.message || 'Unable to book appointment');
    } finally {
      setStatus('idle');
    }
  };

  const isPatient = user?.role === 'patient';

  return (
    <section className="card">
      <div className="mb-6 border-b border-slate-200 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Patient booking</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">Book an appointment</h2>
            <p className="mt-2 text-sm text-slate-600">Select a doctor, pick a date, and reserve your appointment slot.</p>
          </div>
          <div className="rounded-full bg-blue-100 p-3">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {!user ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-900">Sign in as a patient to book appointments.</p>
        </div>
      ) : !isPatient ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">Only patients can book appointments. Please register as a patient.</p>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleBooking}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="label">
              Doctor
              <select value={doctorId} onChange={(event) => setDoctorId(event.target.value)} className="input" required>
                <option value="">Choose a doctor...</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.name ?? 'Doctor'} • {doctor.department}
                  </option>
                ))}
              </select>
            </label>

            <label className="label">
              Date
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="input" required />
            </label>
          </div>

          <label className="label">
            Available time slot
            <select
              value={selectedSlot}
              onChange={(event) => setSelectedSlot(event.target.value)}
              className="input"
              required
              disabled={!slots.length}
            >
              <option value="">Choose a time...</option>
              {slots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center justify-between gap-4">
            <div className="text-sm">
              <p className="text-slate-600">
                {slots.length ? (
                  <span className="font-semibold text-emerald-600">{slots.length} available slot(s)</span>
                ) : (
                  <span className="text-slate-500">Select a doctor and date to see available slots</span>
                )}
              </p>
            </div>
            <button
              type="submit"
              className="button bg-gradient-to-r from-blue-500 to-blue-600 text-white"
              disabled={status === 'loading' || !selectedSlot || !doctorId}
            >
              {status === 'loading' ? 'Booking…' : 'Reserve appointment'}
            </button>
          </div>

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
        </form>
      )}
    </section>
  );
}
