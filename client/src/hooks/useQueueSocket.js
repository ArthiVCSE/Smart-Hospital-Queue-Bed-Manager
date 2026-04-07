import { useEffect, useState } from 'react';
import { createSocket } from '../lib/socket.js';

const TOKEN_KEY = 'token';

/**
 * Subscribe to live queue + new appointments for one doctor/day.
 * Uses JWT from localStorage if present (optional for public queue view).
 *
 * @param {string | null | undefined} doctorId - Mongo ObjectId string
 * @param {string | null | undefined} date - YYYY-MM-DD
 */
export function useQueueSocket(doctorId, date) {
  const [queuePayload, setQueuePayload] = useState(null);
  const [lastBooking, setLastBooking] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!doctorId || !date) {
      setQueuePayload(null);
      setLastBooking(null);
      setConnected(false);
      setError(null);
      return undefined;
    }

    setError(null);
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    const socket = createSocket({ token: token || undefined });

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onQueueUpdate = (msg) => {
      setQueuePayload(msg?.data ?? null);
    };
    const onAppointmentNew = (msg) => {
      setLastBooking(msg?.data?.appointment ?? null);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('queue:update', onQueueUpdate);
    socket.on('appointment:new', onAppointmentNew);

    socket.emit('subscribe:queue', { doctorId, date }, (ack) => {
      if (ack && ack.ok === false) setError(ack.error || 'subscribe failed');
    });

    return () => {
      socket.emit('unsubscribe:queue', { doctorId, date });
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('queue:update', onQueueUpdate);
      socket.off('appointment:new', onAppointmentNew);
      socket.disconnect();
    };
  }, [doctorId, date]);

  return { queuePayload, lastBooking, connected, error };
}
