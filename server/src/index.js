import 'dotenv/config';
import http from 'http';
import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { initSocket } from './realtime/socket.js';

const port = Number(process.env.PORT) || 5000;

async function main() {
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  await connectDb();
  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);
  server.listen(port, () => {
    console.log(`API + Socket.IO on port ${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
