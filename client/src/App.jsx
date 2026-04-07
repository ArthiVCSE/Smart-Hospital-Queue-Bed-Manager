import { useState } from 'react';
import { AuthPanel } from './components/AuthPanel.jsx';
import { BookingPanel } from './components/BookingPanel.jsx';
import { DoctorQueuePanel } from './components/DoctorQueuePanel.jsx';
import { BedManagementPanel } from './components/BedManagementPanel.jsx';
import { getMe } from './lib/api.js';
import { useEffect } from 'react';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  const [status, setStatus] = useState('loading');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!token) {
      setStatus('idle');
      setUser(null);
      return;
    }

    let isMounted = true;
    setStatus('loading');
    getMe(token)
      .then((data) => {
        if (isMounted) {
          setUser(data.user);
          setStatus('idle');
        }
      })
      .catch(() => {
        if (isMounted) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setStatus('idle');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleAuth = ({ token: authToken, user: authUser }) => {
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(authUser);
    setToast({ title: '✓ Signed in', message: `Welcome, ${authUser.name}!`, type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setToast({ title: '✓ Signed out', message: 'You have been logged out.', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const renderView = () => {
    if (!user) return <AuthPanel user={user} status={status} onAuth={handleAuth} />;

    if (user.role === 'patient') {
      return (
        <div className="space-y-6">
          <BookingPanel user={user} token={token} />
        </div>
      );
    }

    if (user.role === 'doctor') {
      return (
        <div className="space-y-6">
          <DoctorQueuePanel user={user} token={token} />
        </div>
      );
    }

    if (user.role === 'admin') {
      return (
        <div className="space-y-6">
          <BedManagementPanel user={user} token={token} />
        </div>
      );
    }

    return <div className="card">Unknown role: {user.role}</div>;
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-2.5">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Hospital Queue Manager</h1>
              <p className="text-xs text-slate-500">Queue • Beds • Bookings</p>
            </div>
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">{user.role}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Logout
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-600">Sign in to access your dashboard</p>
          )}
        </div>
      </header>

      {/* Toast */}
      {toast ? (
        <div className={`fixed top-4 right-4 rounded-lg border px-4 py-3 shadow-lg z-50 ${
          toast.type === 'success' 
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800' 
            : 'border-red-200 bg-red-50 text-red-800'
        }`}>
          <p className="font-semibold">{toast.title}</p>
          <p className="text-sm">{toast.message}</p>
        </div>
      ) : null}

      {/* Main content */}
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {status === 'loading' ? (
            <div className="card flex flex-col items-center justify-center gap-4 p-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500"></div>
              <p className="text-sm font-medium text-slate-600">Loading your dashboard...</p>
            </div>
          ) : (
            renderView()
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <p className="mx-auto max-w-7xl text-center text-xs text-slate-500">
          Hospital Queue & Bed Manager • React + Tailwind CSS • Node.js Backend
        </p>
      </footer>
    </div>
  );
}

export default App;
