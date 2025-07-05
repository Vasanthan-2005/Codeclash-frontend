import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ErrorAlert from '../components/ErrorAlert';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        username,
        password,
      });
      if (res.data.role === 'admin') {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        navigate('/admin-dashboard');
      } else {
        setError('Not an admin account');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        console.error('Internal error:', err);
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white font-sans">
      {/* Top Navbar */}
      <nav className="w-full bg-gray-900 bg-opacity-95 shadow-lg px-8 py-3 flex items-center justify-between border-b border-gray-800">
        <Link to="/" className="text-2xl font-bold text-white">
          Code<span className="text-yellow-400">Clash</span>
        </Link>
        <div className="flex gap-2">
          <Link to="/" className="px-4 py-2 text-blue-200 rounded-md border border-blue-700 hover:bg-blue-900 hover:text-white transition text-sm font-medium">Home</Link>
          <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md border border-blue-700 hover:bg-blue-700 transition text-sm font-medium">Player Login</Link>
          <Link to="/register" className="px-4 py-2 border border-blue-700 text-blue-300 rounded-md hover:bg-blue-900 hover:text-white transition text-sm font-medium">Register</Link>
        </div>
      </nav>
      <div className="flex-1 flex flex-col items-center justify-center py-10">
        <div className="w-full max-w-md p-8 bg-gray-900 rounded-xl shadow-xl border border-gray-800">
          <h2 className="text-3xl font-bold text-blue-200 mb-6 text-center">Admin Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-blue-100 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-blue-100 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
                required
              />
            </div>
            <ErrorAlert message={error} />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded border border-blue-700"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 