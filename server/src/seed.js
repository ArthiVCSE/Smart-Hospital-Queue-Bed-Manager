import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Doctor } from './models/Doctor.js';
import { Bed } from './models/Bed.js';
import { Appointment } from './models/Appointment.js';
import { TokenCounter } from './models/TokenCounter.js';
import { connectDb } from './config/db.js';

const DEMO_EMAILS = [
  'admin@demo.hospital',
  'dr.arya@demo.hospital',
  'dr.meera@demo.hospital',
  'patient1@demo.hospital',
  'patient2@demo.hospital',
];

async function seed() {
  await connectDb();

  const existingDemoUsers = await User.find({ email: { $in: DEMO_EMAILS } })
    .select('_id')
    .lean();
  const demoUserIds = existingDemoUsers.map((u) => u._id);

  if (demoUserIds.length) {
    const demoDoctors = await Doctor.find({ userId: { $in: demoUserIds } })
      .select('_id')
      .lean();
    const demoDoctorIds = demoDoctors.map((d) => d._id);

    await Appointment.deleteMany({
      $or: [{ patientId: { $in: demoUserIds } }, { doctorId: { $in: demoDoctorIds } }],
    });
    if (demoDoctorIds.length) {
      await TokenCounter.deleteMany({ doctorId: { $in: demoDoctorIds } });
    }
    await Doctor.deleteMany({ _id: { $in: demoDoctorIds } });
    await User.deleteMany({ _id: { $in: demoUserIds } });
  }

  await Bed.deleteMany({ bedCode: /^DEMO-/ });

  const admin = await User.create({
    name: 'Demo Admin',
    email: 'admin@demo.hospital',
    password: 'Admin1234!',
    role: 'admin',
  });

  const d1User = await User.create({
    name: 'Dr. Arya',
    email: 'dr.arya@demo.hospital',
    password: 'Doctor1234!',
    role: 'doctor',
  });
  const d2User = await User.create({
    name: 'Dr. Meera',
    email: 'dr.meera@demo.hospital',
    password: 'Doctor1234!',
    role: 'doctor',
  });

  await Doctor.create({
    userId: d1User._id,
    department: 'Cardiology',
    workingHours: { start: '09:00', end: '12:00' },
    slotMinutes: 30,
  });
  await Doctor.create({
    userId: d2User._id,
    department: 'Emergency',
    workingHours: { start: '09:00', end: '17:00' },
    slotMinutes: 30,
  });

  await User.create({
    name: 'Demo Patient One',
    email: 'patient1@demo.hospital',
    password: 'Patient1234!',
    role: 'patient',
  });
  await User.create({
    name: 'Demo Patient Two',
    email: 'patient2@demo.hospital',
    password: 'Patient1234!',
    role: 'patient',
  });

  const beds = [
    { bedCode: 'DEMO-ICU-1', type: 'ICU' },
    { bedCode: 'DEMO-ICU-2', type: 'ICU' },
    { bedCode: 'DEMO-GW-1', type: 'GENERAL' },
    { bedCode: 'DEMO-GW-2', type: 'GENERAL' },
    { bedCode: 'DEMO-GW-3', type: 'GENERAL' },
    { bedCode: 'DEMO-ER-1', type: 'EMERGENCY' },
    { bedCode: 'DEMO-ER-2', type: 'EMERGENCY' },
  ];
  await Bed.insertMany(beds.map((b) => ({ ...b, status: 'AVAILABLE' })));

  const today = new Date().toISOString().slice(0, 10);

  console.log('Seed complete.');
  console.log('--- Credentials (change after demo) ---');
  console.log(`Admin:    ${admin.email} / Admin1234!`);
  console.log(`Doctor 1: ${d1User.email} / Doctor1234!`);
  console.log(`Doctor 2: ${d2User.email} / Doctor1234!`);
  console.log('Patient:  patient1@demo.hospital / Patient1234!');
  console.log(`Use ?date=${today} for queue and slots.`);

  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
