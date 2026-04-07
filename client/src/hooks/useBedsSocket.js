import { useEffect, useState } from 'react';
import { createSocket } from '../lib/socket.js';

const TOKEN_KEY = 'token';

/**
 * Live bed board for admins (requires JWT with role admin on subscribe:beds).
 *
 * @param {boolean} enabled - when false, disconnects
 */
export function useBedsSocket(enabled) {
  const [bedPayload, setBedPayload] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setBedPayload(null);
      setConnected(false);
      setError(null);
      return undefined;
    }

    const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) {
      setError('Login as admin and store JWT in localStorage key "token"');
      return undefined;
    }

    setError(null);
    const socket = createSocket({ token });

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onBeds = (msg) => setBedPayload(msg?.data ?? null);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('bed:update', onBeds);

    socket.emit('subscribe:beds', {}, (ack) => {
      if (ack && ack.ok === false) setError(ack.error || 'subscribe:beds failed');
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('bed:update', onBeds);
      socket.disconnect();
    };
  }, [enabled]);

  return { bedPayload, connected, error };
}
