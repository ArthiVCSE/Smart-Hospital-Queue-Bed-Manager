import { useMemo, useState } from 'react';
import { loginUser, registerUser } from '../lib/api.js';

export function AuthPanel({ user, status, onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buttonLabel = mode === 'register' ? 'Create account' : 'Sign in';

  const onSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result =
        mode === 'register'
          ? await registerUser({ name, email, password })
          : await loginUser({ email, password });
      onAuth(result);
      setEmail('');
      setPassword('');
      setName('');
    } catch (err) {
      setError(err.message || 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card">
        {/* Tabs */}
        <div className="mb-8 flex gap-2 border-b border-slate-200 pb-4">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`pb-2 px-0 text-sm font-semibold transition ${
              mode === 'login'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`pb-2 px-0 text-sm font-semibold transition ${
              mode === 'register'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          {mode === 'register' ? (
            <label className="label">
              Full name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="input"
                placeholder="Your name"
                required
              />
            </label>
          ) : null}

          <label className="label">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input"
              placeholder="you@hospital.com"
              required
            />
          </label>

          <label className="label">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </label>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          ) : null}

          <button
            type="submit"
            className="button w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white"
            disabled={isSubmitting || status === 'loading'}
          >
            {isSubmitting ? 'Working…' : buttonLabel}
          </button>
        </form>

        {/* Helper text */}
        <p className="mt-6 text-center text-xs text-slate-500">
          {mode === 'register'
            ? 'Register as a patient to book appointments or as a staff member.'
            : 'Demo credentials: use any email + password (min 8 chars)'}
        </p>
      </div>
    </div>
  );
}
