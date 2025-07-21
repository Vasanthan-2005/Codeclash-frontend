import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function OAuthHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const user = params.get('user');
    const token = params.get('token');
    const errorParam = params.get('error');
    if (user && token) {
      localStorage.setItem('user', user);
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } else if (errorParam) {
      if (errorParam === 'User already exists. Please login with Google.') {
        setError('An account with this Google account already exists. Please log in instead.');
      } else if (errorParam === 'No account found. Please sign up with Google.') {
        setError('No account found for this Google account. Please sign up first.');
      } else {
        setError('Google authentication failed. Please try again.');
      }
    }
  }, [navigate, location]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Google Authentication Error</h2>
          <p className="mb-6 text-red-400">{error}</p>
          {error.includes('log in') && (
            <button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold">Go to Login</button>
          )}
          {error.includes('sign up') && (
            <button onClick={() => navigate('/register')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold">Go to Sign Up</button>
          )}
        </div>
      </div>
    );
  }

  return null; // Optionally, show a loading spinner
} 