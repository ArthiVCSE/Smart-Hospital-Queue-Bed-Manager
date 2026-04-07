import { io } from 'socket.io-client';
import { getApiBase } from './apiBase.js';

/**
 * @param {object} [opts]
 * @param {string | null | undefined} [opts.token] - JWT for admin bed channel / optional auth
 */
export function createSocket({ token } = {}) {
  return io(getApiBase(), {
    auth: token ? { token } : {},
    autoConnect: true,
    transports: ['websocket', 'polling'],
  });
}
