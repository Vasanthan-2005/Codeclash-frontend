import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  UserPlus, 
  Users, 
  User,
  X
} from 'lucide-react';

export default function NewFollowersTab() {
  const [newFollowers, setNewFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNewFollowers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching new followers...');
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/suggestions/follow-back`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Response:', response.data);
      // Only get users who follow you but you don't follow back
      const followBackUsers = response.data.filter(user => user.isFollowBack);
      console.log('Follow back users:', followBackUsers);
      setNewFollowers(followBackUsers.slice(0, 5)); // Show max 5
    } catch (err) {
      console.error('Failed to fetch new followers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewFollowers();
  }, []);

  const handleFollowBack = async (userId) => {
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/${userId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Remove from new followers list
      setNewFollowers(prev => prev.filter(user => user._id !== userId));
    } catch (err) {
      console.error('Failed to follow back:', err);
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDismiss = (userId) => {
    setNewFollowers(prev => prev.filter(user => user._id !== userId));
  };

  // Always show the button, but with different states
  const hasNewFollowers = newFollowers.length > 0;

  console.log('NewFollowersTab rendering, hasNewFollowers:', hasNewFollowers, 'newFollowers:', newFollowers);
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full shadow-lg transition-colors relative ${
          hasNewFollowers 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
        }`}
      >
        <Users className="w-5 h-5" />
        {hasNewFollowers && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {newFollowers.length > 9 ? '9+' : newFollowers.length}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-gray-900 rounded-lg border border-gray-800 shadow-xl">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-semibold">New Followers</h3>
            <p className="text-gray-400 text-sm">People who followed you</p>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : hasNewFollowers ? (
              newFollowers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format'} 
                      alt={user.username} 
                      className="w-8 h-8 rounded-full object-cover border border-gray-600"
                    />
                    <div>
                      <h4 className="text-sm font-medium text-white">{user.username}</h4>
                      <p className="text-xs text-gray-400">Started following you</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleFollowBack(user._id)}
                      disabled={followLoading[user._id]}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium transition-colors disabled:opacity-50"
                    >
                      {followLoading[user._id] ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        'Follow Back'
                      )}
                    </button>
                    <button
                      onClick={() => handleDismiss(user._id)}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No new followers</p>
              </div>
            )}
          </div>
          
                    {hasNewFollowers && (
            <div className="p-3 border-t border-gray-800">
              <button
                onClick={() => navigate('/search-players')}
                className="w-full text-center text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                View All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 