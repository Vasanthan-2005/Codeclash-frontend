import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  UserPlus, 
  UserMinus, 
  Users, 
  Trophy, 
  PlayCircle,
  User,
  RefreshCw
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export default function FollowBackSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followLoading, setFollowLoading] = useState({});
  const navigate = useNavigate();

  const fetchSuggestions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/suggestions/follow-back`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuggestions(response.data);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to load suggestions. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleFollow = async (userId) => {
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/${userId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Update the suggestions to reflect the follow status
      setSuggestions(prev => 
        prev.map(user => 
          user._id === userId ? { ...user, isFollowing: true, isFollowBack: false } : user
        )
      );
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to follow user. Please try again.');
      }
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnfollow = async (userId) => {
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/${userId}/unfollow`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Update the suggestions to reflect the unfollow status
      setSuggestions(prev => 
        prev.map(user => 
          user._id === userId ? { ...user, isFollowing: false } : user
        )
      );
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to unfollow user. Please try again.');
      }
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Follow Back Suggestions</h3>
          <button 
            onClick={fetchSuggestions}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Follow Back Suggestions</h3>
          <button 
            onClick={fetchSuggestions}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchSuggestions}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Follow Back Suggestions</h3>
        <button 
          onClick={fetchSuggestions}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No suggestions available</p>
          <p className="text-sm text-gray-500">Follow more people to get personalized suggestions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((user) => (
            <div key={user._id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <img 
                  src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format'} 
                  alt={user.username} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-white">{user.username}</h4>
                    {user.isFollowBack && (
                      <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-full border border-blue-500/30">
                        Follows you
                      </span>
                    )}
                    {user.mutualFollowers > 0 && (
                      <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full border border-green-500/30">
                        {user.mutualFollowers} mutual
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Trophy className="w-3 h-3" />
                      <span className="text-xs">{user.winCount || 0} wins</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <PlayCircle className="w-3 h-3" />
                      <span className="text-xs">{user.matchesPlayed || 0} matches</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Users className="w-3 h-3" />
                      <span className="text-xs">{user.followers?.length || 0} followers</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/profile/${user._id}`)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                >
                  <User className="w-4 h-4" />
                </button>
                
                {user.isFollowing ? (
                  <button
                    onClick={() => handleUnfollow(user._id)}
                    disabled={followLoading[user._id]}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    {followLoading[user._id] ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <UserMinus className="w-3 h-3" />
                    )}
                    Unfollow
                  </button>
                ) : (
                  <button
                    onClick={() => handleFollow(user._id)}
                    disabled={followLoading[user._id]}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 ${
                      user.isFollowBack 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {followLoading[user._id] ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <UserPlus className="w-3 h-3" />
                    )}
                    {user.isFollowBack ? 'Follow Back' : 'Follow'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 