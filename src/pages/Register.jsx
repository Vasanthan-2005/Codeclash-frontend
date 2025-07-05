import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setAvatarPreview(null);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!avatar) {
      setError('Profile picture is required.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('avatar', avatar);
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, formData);
      setSuccess('Registration successful! You can now login.');
      setUsername(''); setEmail(''); setPassword(''); setAvatar(null); setAvatarPreview(null);
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
          <Link to="/login" className="px-4 py-2 text-white rounded-md border border-blue-700 hover:bg-blue-900 transition text-sm font-medium">Player Login</Link>
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="w-full max-w-md p-8 rounded-xl shadow-lg bg-gray-900 border border-gray-800 mt-20">
          <h2 className="text-3xl font-bold text-blue-200 mb-8 text-center flex items-center justify-center gap-2">
            Register
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
            <div>
              <label className="block mb-1 font-medium text-gray-300">Username</label>
              <input type="text" className="w-full border border-blue-700 bg-gray-800 text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Choose a username" />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-300">Email</label>
              <input type="email" className="w-full border border-blue-700 bg-gray-800 text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@email.com" />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-300">Password</label>
              <input type="password" className="w-full border border-blue-700 bg-gray-800 text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-300">Profile Picture <span className="text-red-400">*</span></label>
              <div className="flex flex-col items-center gap-2">
                <button type="button" onClick={handleAvatarClick} className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-semibold shadow transition mb-2">
                  {avatar ? 'Change Image' : 'Choose Image'}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" required />
                {avatarPreview && (
                  <img src={avatarPreview} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover border-2 border-blue-700 shadow-lg mt-2" />
                )}
              </div>
            </div>
            <ErrorAlert message={error} />
            <SuccessAlert message={success} />
            {success && (
              <div className="flex justify-center mt-2">
                <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition border border-blue-700" onClick={() => navigate('/login')}>
                  Login now
                </button>
              </div>
            )}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition text-lg shadow border border-blue-700" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <span className="text-gray-400">Already have an account?</span>
            <button className="ml-2 text-blue-400 hover:underline" onClick={() => navigate('/login')}>Login</button>
          </div>
        </div>
      </div>
    </div>
  );
} 