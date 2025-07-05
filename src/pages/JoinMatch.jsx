import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ErrorAlert from '../components/ErrorAlert';

export default function JoinMatch() {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/matches/join`, {
        roomCode },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      navigate(`/lobby/${roomCode}`);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white py-10">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-xl shadow-xl border border-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-blue-200">Join a Match</h2>
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1 text-blue-100">Room Code</label>
            <input type="text" className="w-full border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value={roomCode} onChange={e => setRoomCode(e.target.value)} required />
          </div>
          <ErrorAlert message={error} />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold border border-blue-700 w-full" disabled={loading}>{loading ? 'Joining...' : 'Join Match'}</button>
        </form>
      </div>
    </div>
  );
} 