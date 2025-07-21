import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  UserPlus, 
  UserMinus, 
  Users, 
  Trophy, 
  PlayCircle,
  ArrowLeft,
  User
} from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import NewFollowersTab from '../components/NewFollowersTab';

export default function SearchPlayers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [followLoading, setFollowLoading] = useState({});
  const navigate = useNavigate();

  const handleSearch = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/search?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(response.data);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to search users. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/${userId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Update the search results to reflect the follow status
      setSearchResults(prev => 
        prev.map(user => 
          user._id === userId ? { ...user, isFollowing: true } : user
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
      
      // Update the search results to reflect the unfollow status
      setSearchResults(prev => 
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

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <ErrorAlert message={error} />
      
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button */}
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
            </div>

            {/* Title */}
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-semibold text-white">Search Players</h1>
            </div>

            {/* Spacer */}
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* Search Input */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search players by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-400 mt-2">
              {searchResults.length} player{searchResults.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {/* Search Results */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : searchQuery && searchQuery.trim().length >= 2 && searchResults.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No players found matching "{searchQuery}"</p>
            </div>
          ) : searchQuery && searchQuery.trim().length >= 2 ? (
            searchResults.map((user) => (
              <div key={user._id} className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:bg-gray-800 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format'} 
                      alt={user.username} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{user.username}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Trophy className="w-4 h-4" />
                          <span className="text-sm">{user.winCount || 0} wins</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <PlayCircle className="w-4 h-4" />
                          <span className="text-sm">{user.matchesPlayed || 0} matches</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">{user.followers?.length || 0} followers</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/profile/${user._id}`)}
                      className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      View Profile
                    </button>
                    
                    {user.isFollowing ? (
                      <button
                        onClick={() => handleUnfollow(user._id)}
                        disabled={followLoading[user._id]}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {followLoading[user._id] ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <UserMinus className="w-4 h-4" />
                        )}
                        Unfollow
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollow(user._id)}
                        disabled={followLoading[user._id]}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {followLoading[user._id] ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                        Follow
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Start typing to search for players</p>
              <p className="text-sm text-gray-500 mt-1">Enter at least 2 characters</p>
            </div>
          )}
        </div>
      </main>
      
      {/* New Followers Tab */}
      <NewFollowersTab />
    </div>
  );
} 