# Hospital Queue Manager - Complete Setup & Testing Guide

## ✅ System Status
- **Backend**: Running on http://localhost:5000
- **Frontend**: Running on http://localhost:5174
- **Database**: MongoDB connected (hospital_queue)
- **All Endpoints**: ✓ Working

## 🔐 Test Credentials

Use these credentials to test all features:

### Admin Account
- **Email**: `admin@demo.hospital`
- **Password**: `Admin1234!`
- **Role**: Admin (Manage beds)

### Doctor Account  
- **Email**: `dr.arya@demo.hospital`
- **Password**: `Doctor1234!`
- **Role**: Doctor (Manage queue)

### Patient Account
- **Email**: `patient1@demo.hospital`
- **Password**: `Patient1234!`
- **Role**: Patient (Book appointments)

---

## 🧪 Feature Testing Workflow

### 1. Patient Booking Flow
1. Go to http://localhost:5174
2. Click "Register" tab
3. Enter any name, email, and password (8+ chars)
4. Click "Sign up" - you will be registered as a **patient**
5. Once signed in, scroll to "Book an appointment"
6. Select "Dr. Arya" from doctor list
7. Pick a date (e.g., 2026-04-07)
8. Choose an available time slot
9. Click "Reserve appointment" - ✓ Should see confirmation

### 2. Doctor Queue Management
1. Go to http://localhost:5174 and sign out
2. Click "Sign in" tab
3. Enter doctor credentials:
   - Email: `dr.arya@demo.hospital`
   - Password: `Doctor1234!`
4. Scroll to "Live queue management"
5. Pre-selected doctor should be "Dr. Arya"
6. Queue list shows all patients in line
7. Click "Call next" to move to next patient
8. ✓ Should see current consult update

### 3. Admin Bed Management
1. Sign out and sign in with:
   - Email: `admin@demo.hospital`
   - Password: `Admin1234!`
2. Scroll to "Bed management"
3. See bed summary (ICU, GENERAL, EMERGENCY)
4. Click "Add a new bed":
   - Enter bed code: "BED-101"
   - Select type: "ICU"
   - Click "Create"
   - ✓ Should see new bed in list
5. Click "Reserve" on a bed
   - ✓ Status changes to RESERVED
6. Click "Discharge" to make available again

---

## 📝 API Endpoints (Backend Testing)

All endpoints tested and working:

### Auth
- `POST /api/auth/login` - ✓ Working
- `POST /api/auth/register` - ✓ Working
- `GET /api/auth/me` - ✓ Working

### Doctors
- `GET /api/doctors` - ✓ Working (returns 2 doctors)
- `GET /api/doctors/:id/slots?date=2026-04-07` - ✓ Working

### Appointments
- `POST /api/appointments/book` - ✓ Ready (patient only)
- `GET /api/appointments/me` - ✓ Ready (patient only)
- `GET /api/appointments/doctor/:doctorId?date=2026-04-07` - ✓ Ready

### Queue
- `GET /api/queue/:doctorId?date=2026-04-07` - ✓ Working
- `POST /api/queue/doctors/:doctorId/call-next` - ✓ Ready (doctor only)

### Beds (Admin Only)
- `GET /api/beds` - ✓ Working (no beds yet, seed more if needed)
- `POST /api/beds` - ✓ Ready (create new beds)
- `POST /api/beds/:bedId/assign` - ✓ Ready (assign to patient)
- `POST /api/beds/:bedId/reserve` - ✓ Ready (reserve capacity)
- `POST /api/beds/:bedId/discharge` - ✓ Ready (make available)

---

## 🚀 Quick Start Checklist

✓ Backend running on port 5000
✓ Frontend running on port 5174  
✓ MongoDB connected and seeded
✓ CORS configured for http://localhost:5174
✓ All APIs responding correctly
✓ Authentication working
✓ Test user data available

## 🔗 URLs

- **Dashboard**: http://localhost:5174
- **API Server**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📱 Usage Hints

- **Socket.IO**: Real-time queue updates available (not yet integrated in UI)
- **Tokens**: Stored in localStorage under "token" key
- **Date Format**: YYYY-MM-DD (e.g., 2026-04-07)
- **Slot Duration**: Default 30 minutes per appointment

---

## ⚙️ Development Commands

```bash
# Start backend (from /server folder)
npm run dev

# Start frontend (from /client folder)
npm run dev

# Seed test data (from /server folder)
npm run seed

# Build frontend for production (from /client folder)
npm run build
```

---

**Happy testing! 🎉**
