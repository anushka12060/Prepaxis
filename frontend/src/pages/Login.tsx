import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Login failed');
      } else {
        setError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-[460px] flex border border-line rounded-md overflow-hidden">
        <div className="flex-1 p-9">
          <span className="font-display font-bold text-xl text-ink tracking-tight block mb-8">
            PrepAxis
          </span>

          <p className="font-mono text-[11px] text-[#8a8578] tracking-widest mb-1">
            SESSION LOG-IN
          </p>
          <h1 className="font-display font-bold text-2xl text-ink mb-7 leading-tight">
            Resume your prep.
          </h1>

          {error && (
            <div className="bg-stamp/10 border border-stamp text-stamp text-sm rounded px-3 py-2 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-xs text-[#6b675d] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full border-0 border-b border-line bg-transparent py-2 px-0.5 text-[15px] text-ink outline-none focus:border-ink transition-colors"
              />
            </div>

            <div className="mb-7">
              <label className="block text-xs text-[#6b675d] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border-0 border-b border-line bg-transparent py-2 px-0.5 text-[15px] text-ink outline-none focus:border-ink transition-colors"
              />
            </div>

            <div className="h-[76px]" />

            <button
              type="button"
              onClick={() => {
                setEmail('test1@example.com');
                setPassword('password123');
              }}
              className="w-full border border-line text-ink font-display font-medium text-sm py-2.5 rounded mb-3 hover:bg-ink/5 transition"
            >
              Fill demo credentials
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-paper font-display font-medium text-sm py-3 rounded disabled:opacity-50 hover:opacity-90 transition"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="text-center text-[13px] text-[#6b675d] mt-6">
            No account?{' '}
            <Link to="/signup" className="text-stamp font-medium">
              Create one
            </Link>
          </p>
        </div>

        <div className="w-14 bg-ink relative flex items-center justify-center border-l border-dashed border-gray-500">
          <span
            className="font-mono text-[10px] text-paper tracking-[0.2em]"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            WELCOME · BACK
          </span>
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-paper rounded-full" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-paper rounded-full" />
        </div>
      </div>
    </div>
  );
}