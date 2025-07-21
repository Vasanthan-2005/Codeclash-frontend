import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CompleteProfile() {
  const params = new URLSearchParams(window.location.search);
  const userFromQuery = params.get('user');
  const token = params.get('token');
  if (token) localStorage.setItem('token', token);
  const initialUser = userFromQuery ? JSON.parse(userFromQuery) : {};
  const [username, setUsername] = useState(initialUser.username || '');
  const [avatar, setAvatar] = useState(initialUser.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', username);
      if (avatarFile) formData.append('avatar', avatarFile);
      formData.append('profileIncomplete', 'false');
      // Send PATCH request to backend to update user
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${initialUser._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Update localStorage user
      const updatedUser = { ...initialUser, username, avatar, profileIncomplete: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-lg max-w-md w-full text-center mt-20">
        <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
          <div>
            <label className="block mb-1 font-medium text-gray-300">Username</label>
            <input type="text" className="w-full border border-blue-700 bg-gray-800 text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-300">Profile Picture</label>
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="w-full" />
            {avatar && <img src={avatar} alt="Avatar Preview" className="w-20 h-20 rounded-full object-cover mx-auto mt-2" />}
          </div>
          {error && <div className="text-red-400 mb-2">{error}</div>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition" disabled={loading}>
            {loading ? 'Saving...' : 'Save and Continue'}
          </button>
        </form>
      </div>
    </div>
  );
} 