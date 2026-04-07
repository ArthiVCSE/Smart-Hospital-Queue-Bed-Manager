import { Server } from 'socket.io';
import { verifyToken } from '../utils/token.js';
import { formatDay, parseDay } from '../utils/date.js';
import { getQueueApiPayload } from '../services/queueService.js';
import { getBedsSnapshot } from '../services/bedSnapshot.js';

const BEDS_ROOM = 'beds:admin';

let io;

export function getIo() {
  return io;
}

export function queueRoom(doctorId, dateStr) {
  return `queue:${doctorId}:${dateStr}`;
}

function normalizeCorsOrigin() {
  const raw = process.env.CLIENT_ORIGIN;
  if (!raw || raw === '*') return true;
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return true;
  if (parts.length === 1) return parts[0];
  return parts;
}

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: normalizeCorsOrigin(),
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token ?? socket.handshake.query?.token;
    if (typeof token === 'string' && token.length > 0) {
      try {
        const p = verifyToken(token);
        socket.data.user = { id: p.sub, role: p.role };
      } catch {
        socket.data.user = null;
      }
    } else {
      socket.data.user = null;
    }
    next();
  });

  io.on('connection', (socket) => {
    socket.on('subscribe:queue', async (payload, cb) => {
      const doctorId = payload?.doctorId;
      const date = payload?.date;
      if (!doctorId || typeof doctorId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(doctorId)) {
        cb?.({ ok: false, error: 'Invalid doctorId' });
        return;
      }
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        cb?.({ ok: false, error: 'Invalid date (use YYYY-MM-DD)' });
        return;
      }
      const room = queueRoom(doctorId, date);
      socket.join(room);
      try {
        const day = parseDay(date);
        const snapshot = await getQueueApiPayload(doctorId, day);
        if (snapshot) socket.emit('queue:update', { data: snapshot });
      } catch {
        /* ignore snapshot errors; live updates still work */
      }
      cb?.({ ok: true, room });
    });

    socket.on('unsubscribe:queue', (payload) => {
      const doctorId = payload?.doctorId;
      const date = payload?.date;
      if (doctorId && date) socket.leave(queueRoom(doctorId, date));
    });

    socket.on('subscribe:beds', async (_payload, cb) => {
      if (socket.data.user?.role !== 'admin') {
        cb?.({ ok: false, error: 'Admin role required' });
        return;
      }
      socket.join(BEDS_ROOM);
      try {
        const data = await getBedsSnapshot({});
        socket.emit('bed:update', { data });
      } catch {
        /* ignore */
      }
      cb?.({ ok: true });
    });
  });

  return io;
}

export async function broadcastQueueState(doctorId, day) {
  if (!io) return;
  const payload = await getQueueApiPayload(doctorId, day);
  if (!payload) return;
  const dateStr = formatDay(day);
  const id = String(payload.doctorId);
  io.to(queueRoom(id, dateStr)).emit('queue:update', { data: payload });
}

export async function broadcastAppointmentBooked(doctorId, day, appointment) {
  if (!io) return;
  const dateStr = formatDay(day);
  const docId = String(doctorId);
  io.to(queueRoom(docId, dateStr)).emit('appointment:new', { data: { appointment } });
  await broadcastQueueState(doctorId, day);
}

export async function broadcastBedsState() {
  if (!io) return;
  const data = await getBedsSnapshot({});
  io.to(BEDS_ROOM).emit('bed:update', { data });
}
