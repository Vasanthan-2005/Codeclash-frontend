import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';
import ErrorAlert from '../components/ErrorAlert';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userMatches, setUserMatches] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [expandedSections, setExpandedSections] = useState({
    hosted: false,
    played: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin-login');
      return;
    }

    // Fetch users
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        setUsers(res.data);
        // Initialize online users set
        const onlineSet = new Set();
        res.data.forEach(user => {
          if (user.isOnline) {
            onlineSet.add(user._id);
          }
        });
        setOnlineUsers(onlineSet);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          console.error('Internal error:', err);
          setError('Something went wrong. Please try again.');
        }
        setLoading(false);
      });

    // Socket connection for real-time online status
    socket.connect();

    // Listen for user status updates
    socket.on('user:status', ({ userId, isOnline }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (isOnline) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });

      // Update user in the list
      setUsers(prev => prev.map(user => 
        user._id === userId 
          ? { ...user, isOnline, lastSeen: new Date() }
          : user
      ));
    });

    // Get initial online users
    socket.emit('admin:getOnlineUsers');
    socket.on('admin:onlineUsers', (onlineUsersList) => {
      const onlineSet = new Set(onlineUsersList.map(user => user._id));
      setOnlineUsers(onlineSet);
    });

    return () => {
      socket.off('user:status');
      socket.off('admin:onlineUsers');
    };
  }, [navigate]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setUserMatches(null);
    const token = localStorage.getItem('token');
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user._id}/matches`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setUserMatches(res.data))
      .catch(() => setUserMatches({ error: 'Failed to fetch matches' }));
  };

  const handleLogout = () => {
    // Emit logout event for online status
    if (selectedUser?._id) {
      socket.emit('user:logout', selectedUser._id);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin-login');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Never';
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <div className="text-white text-lg">Loading users...</div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <ErrorAlert message={error} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Manage and monitor player activities</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{onlineUsers.size}</div>
              <div className="text-xs text-gray-400">Online</div>
            </div>
            <button 
              onClick={handleLogout} 
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 py-3 rounded-lg text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Players List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-blue-300">All Players</h2>
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {users.length}
                </span>
              </div>
              
              <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                {users.map(user => (
                  <div 
                    key={user._id} 
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                      selectedUser?._id === user._id 
                        ? 'bg-blue-600/20 border-blue-500 shadow-lg' 
                        : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={user.avatar} 
                          alt="avatar" 
                          className="w-12 h-12 rounded-full border-2 border-gray-600 object-cover"
                        />
                        {/* Online status indicator */}
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                          onlineUsers.has(user._id) ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate flex items-center gap-2">
                          {user.username}
                          {onlineUsers.has(user._id) && (
                            <span className="text-xs text-green-400">●</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 truncate">{user.email}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-red-500/20 text-red-300' 
                              : 'bg-green-500/20 text-green-300'
                          }`}>
                            {user.role}
                          </span>
                          <span className="text-xs text-gray-500">
                            {user.matchesPlayed || 0} matches
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {onlineUsers.has(user._id) ? 'Online' : `Last seen: ${formatLastSeen(user.lastSeen)}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700">
              {selectedUser ? (
                <div>
                  {/* User Header */}
                  <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-700">
                    <div className="relative">
                      <img 
                        src={selectedUser.avatar} 
                        alt="avatar" 
                        className="w-20 h-20 rounded-full border-4 border-blue-500 object-cover"
                      />
                      {/* Online status indicator */}
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-gray-800 ${
                        onlineUsers.has(selectedUser._id) ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                      }`}></div>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        {selectedUser.username}
                        {onlineUsers.has(selectedUser._id) && (
                          <span className="text-green-400 text-sm">● Online</span>
                        )}
                      </h2>
                      <p className="text-gray-400">{selectedUser.email}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedUser.role === 'admin' 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                            : 'bg-green-500/20 text-green-300 border border-green-500/30'
                        }`}>
                          {selectedUser.role}
                        </span>
                        <span className="text-sm text-gray-400">
                          {onlineUsers.has(selectedUser._id) ? 'Currently online' : `Last seen: ${formatLastSeen(selectedUser.lastSeen)}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30">
                      <div className="text-3xl font-bold text-blue-300">{selectedUser.matchesPlayed || 0}</div>
                      <div className="text-gray-400 text-sm">Matches Played</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/30">
                      <div className="text-3xl font-bold text-green-300">{selectedUser.winCount || 0}</div>
                      <div className="text-gray-400 text-sm">Wins</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30">
                      <div className="text-3xl font-bold text-purple-300">
                        {selectedUser.achievements?.length || 0}
                      </div>
                      <div className="text-gray-400 text-sm">Achievements</div>
                    </div>
                  </div>

                  {/* Achievements */}
                  {selectedUser.achievements && selectedUser.achievements.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-white mb-4">Achievements</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.achievements.map((achievement, index) => (
                          <span 
                            key={index}
                            className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm border border-yellow-500/30"
                          >
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matches Section */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Match History</h3>
                    {userMatches ? (
                      userMatches.error ? (
                        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-300">
                          {userMatches.error}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Hosted Matches Dropdown */}
                          <div className="bg-gray-700/30 rounded-lg border border-gray-600">
                            <button
                              onClick={() => toggleSection('hosted')}
                              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                <h4 className="text-lg font-semibold text-blue-300">
                                  Hosted Matches ({userMatches.hosted.length})
                                </h4>
                              </div>
                              <svg
                                className={`w-5 h-5 text-gray-400 transition-transform ${
                                  expandedSections.hosted ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {expandedSections.hosted && (
                              <div className="px-4 pb-4 space-y-2">
                                {userMatches.hosted.length > 0 ? (
                                  userMatches.hosted.map(match => (
                                    <div key={match._id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <div className="font-medium text-white">{match.roomName}</div>
                                          <div className="text-sm text-gray-400">Room Code: {match.roomCode}</div>
                                          <div className="text-xs text-gray-500">
                                            {new Date(match.createdAt).toLocaleDateString()}
                                          </div>
                                        </div>
                                        <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                          Host
                                        </span>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-gray-500 text-center py-4">No hosted matches</div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Played Matches Dropdown */}
                          <div className="bg-gray-700/30 rounded-lg border border-gray-600">
                            <button
                              onClick={() => toggleSection('played')}
                              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <h4 className="text-lg font-semibold text-green-300">
                                  Played Matches ({userMatches.played.length})
                                </h4>
                              </div>
                              <svg
                                className={`w-5 h-5 text-gray-400 transition-transform ${
                                  expandedSections.played ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {expandedSections.played && (
                              <div className="px-4 pb-4 space-y-2">
                                {userMatches.played.length > 0 ? (
                                  userMatches.played.map(match => (
                                    <div key={match._id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <div className="font-medium text-white">{match.roomName}</div>
                                          <div className="text-sm text-gray-400">Room Code: {match.roomCode}</div>
                                          <div className="text-xs text-gray-500">
                                            {new Date(match.createdAt).toLocaleDateString()}
                                          </div>
                                        </div>
                                        <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                                          Player
                                        </span>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-gray-500 text-center py-4">No played matches</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-lg">Select a user to view their match history</div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👤</div>
                  <div className="text-gray-400 text-lg">Select a player to view their activity</div>
                  <div className="text-gray-500 text-sm mt-2">Click on any player from the list to see detailed information</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  );
} 