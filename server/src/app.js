import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import adminRoutes, { adminBootstrapRouter } from './routes/admin.routes.js';
import doctorRoutes from './routes/doctors.routes.js';
import appointmentRoutes from './routes/appointments.routes.js';
import queueRoutes from './routes/queue.routes.js';
import bedRoutes from './routes/beds.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || '*',
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10kb' }));

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/bootstrap', adminBootstrapRouter);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/queue', queueRoutes);
  app.use('/api/beds', bedRoutes);

  app.use((req, res, next) => {
    res.status(404).json({ status: 'error', message: 'Route not found' });
  });

  app.use(errorHandler);

  return app;
}
