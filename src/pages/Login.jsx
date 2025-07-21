import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import socket from '../socket';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, { email, password });
      if (!res.data.token) throw new Error('Login failed: No token received');
      setSuccess('Login successful!');
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      
      // Robust userId extraction
      const userId = res.data.user?._id || res.data._id;
      if (userId) {
        socket.connect();
        socket.emit('user:login', userId);
      }
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950">
      {/* Top Navbar */}
      <nav className="w-full bg-gray-900 bg-opacity-95 shadow-lg px-8 py-3 flex items-center justify-between border-b border-gray-800 fixed top-0 left-0 z-10">
        <Link to="/" className="text-2xl font-bold text-white">
          Code<span className="text-yellow-400">Clash</span>
        </Link>

        <div className="flex gap-2">
          <Link to="/" className="px-4 py-2 text-blue-200 rounded-md border border-blue-700 hover:bg-blue-900 hover:text-white transition text-sm font-medium">Home</Link>
          <Link to="/admin-login" className="px-4 py-2 text-blue-200 rounded-md border border-blue-700 hover:bg-blue-900 transition text-sm font-medium">Admin Login</Link>
          <Link to="/register" className="px-4 py-2 border border-blue-700 text-blue-300 rounded-md hover:bg-blue-900 hover:text-white transition text-sm font-medium">Register</Link>
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="w-full max-w-md p-8 rounded-xl shadow-lg bg-gray-900 border border-gray-800 mt-20">
          <h2 className="text-3xl font-bold text-blue-200 mb-6 text-center">Player Login</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 font-medium text-gray-300">Email</label>
              <input type="email" className="w-full border border-blue-700 bg-gray-800 text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-300">Password</label>
              <input type="password" className="w-full border border-blue-700 bg-gray-800 text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <ErrorAlert message={error} />
            <SuccessAlert message={success} />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition border border-blue-700" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-700" />
            <span className="mx-3 text-gray-400 text-sm">or</span>
            <div className="flex-grow h-px bg-gray-700" />
          </div>
          <button
            onClick={() => window.location.href = 'http://localhost:5000/api/auth/google-login'}
            className="w-full flex items-center justify-center gap-3 py-2 rounded font-semibold border border-blue-700 bg-gray-800 hover:bg-blue-900 text-blue-200 hover:text-white transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ fontSize: '1rem' }}
          >
            <svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_17_40)"><path d="M47.5 24.552C47.5 22.864 47.345 21.232 47.06 19.667H24V28.334H37.19C36.62 31.334 34.77 33.814 32.02 35.48V41.048H39.78C44.22 37.048 47.5 31.334 47.5 24.552Z" fill="#4285F4"/><path d="M24 48C30.48 48 35.98 45.864 39.78 41.048L32.02 35.48C30.02 36.814 27.29 37.668 24 37.668C17.76 37.668 12.36 33.334 10.52 27.668H2.48V33.384C6.26 41.048 14.48 48 24 48Z" fill="#34A853"/><path d="M10.52 27.668C10.04 26.334 9.76 24.934 9.76 23.334C9.76 21.734 10.06 20.334 10.52 19L2.48 13.284C0.9 16.334 0 19.834 0 23.334C0 26.834 0.9 30.334 2.48 33.384L10.52 27.668Z" fill="#FBBC05"/><path d="M24 8.334C27.77 8.334 31.02 9.667 33.47 11.934L40.02 5.384C35.98 1.667 30.48 0 24 0C14.48 0 6.26 6.952 2.48 13.284L10.52 19C12.36 13.334 17.76 8.334 24 8.334Z" fill="#EA4335"/></g><defs><clipPath id="clip0_17_40"><rect width="48" height="48" fill="white"/></clipPath></defs></svg>
            <span>Login with Google</span>
          </button>
          <div className="mt-6 text-center">
            <span className="text-gray-400">Don't have an account?</span>
            <button className="ml-2 text-blue-400 hover:underline" onClick={() => navigate('/register')}>Register</button>
          </div>
        </div>
      </div>
    </div>
  );
} 
