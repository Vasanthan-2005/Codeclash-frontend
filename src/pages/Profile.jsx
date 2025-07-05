import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, LogOut, Plus, PlayCircle, BarChart3, Code, Trophy, Clock, Target, TrendingUp, Users, Award, Calendar, Eye, ChevronRight, Activity, ArrowLeft } from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';

export default function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', avatar: null });
  const userData = localStorage.getItem('user');
  const myId = userData ? JSON.parse(userData)._id : null;
  const isOwnProfile = myId && (myId === id || myId === user?._id);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/${id}/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUser(res.data);
        setEditForm({ username: res.data.username, avatar: null });
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
    }
    fetchProfile();
  }, [id]);

  useEffect(() => {
    async function fetchSocial() {
      if (!user) return;
      try {
        const [fRes, gRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user._id}/followers`, { 
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
          }),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user._id}/following`, { 
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
          }),
        ]);
        setFollowers(Array.isArray(fRes.data) ? fRes.data : []);
        setFollowing(Array.isArray(gRes.data) ? gRes.data : []);
        if (myId && Array.isArray(fRes.data)) {
          setIsFollowing(fRes.data.some(u => u._id === myId));
        }
      } catch {}
    }
    fetchSocial();
  }, [user, myId]);

  useEffect(() => {
    async function fetchRecentMatches() {
      if (!user) return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user._id}/matches`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setRecentMatches(res.data.played || []);
      } catch {}
    }
    fetchRecentMatches();
  }, [user]);

  const handleFollow = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user._id}/follow`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setIsFollowing(true);
      setFollowers(f => [...f, { _id: myId, username: localStorage.getItem('username') }]);
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user._id}/unfollow`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setIsFollowing(false);
      setFollowers(f => f.filter(u => u._id !== myId));
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append('username', editForm.username);
      if (editForm.avatar) {
        formData.append('avatar', editForm.avatar);
      }

      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/users/profile`, formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      setUser(res.data);
      setIsEditing(false);
      localStorage.setItem('username', res.data.username);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const getWinRate = () => {
    if (!user || user.matchesPlayed === 0) return 0;
    return ((user.winCount / user.matchesPlayed) * 100).toFixed(1);
  };

  const getRankBadge = () => {
    if (!user) return { name: 'Beginner', color: 'bg-gray-600' };
    if (user.winCount >= 50) return { name: 'Legend', color: 'bg-purple-600' };
    if (user.winCount >= 25) return { name: 'Master', color: 'bg-yellow-600' };
    if (user.winCount >= 10) return { name: 'Expert', color: 'bg-blue-600' };
    if (user.winCount >= 5) return { name: 'Veteran', color: 'bg-green-600' };
    return { name: 'Beginner', color: 'bg-gray-600' };
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-400 text-xl mb-4">Error loading profile</div>
        <div className="text-gray-400">{error}</div>
      </div>
    </div>
  );

  if (!user) return null;

  const rankBadge = getRankBadge();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <ErrorAlert message={error} />
      {/* Simple Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="text-xl font-bold text-white">
              Code<span className="text-yellow-400">Clash</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/create-match')}
              className="bg-yellow-600 hover:bg-yellow-700 text-black px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Create Match
            </button>
            <button 
              onClick={() => navigate('/join-match')}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Join Match
            </button>
          </div>
        </div>
      </div>

      {/* Profile Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="relative mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-48 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-end space-x-6">
                <div className="relative">
                  <img 
                    src={user.avatar || 'https://res.cloudinary.com/demo/image/upload/v1710000000/default-avatar.png'} 
                    alt="avatar" 
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                  {isOwnProfile && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${rankBadge.color}`}>
                      {rankBadge.name}
                    </span>
                    {user.role === 'admin' && (
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-600">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-6 text-white/80 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{followers.length} followers • {following.length} following</span>
                    </div>
                  </div>
                </div>
                {!isOwnProfile && (
                  <div className="flex space-x-3">
                    {isFollowing ? (
                      <button 
                        onClick={handleUnfollow}
                        className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-colors backdrop-blur-sm"
                      >
                        Unfollow
                      </button>
                    ) : (
                      <button 
                        onClick={handleFollow}
                        className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-2 rounded-lg transition-colors font-medium"
                      >
                        Follow
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Quick Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Cards */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <PlayCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300">Matches</span>
                  </div>
                  <span className="text-white font-bold">{user.matchesPlayed}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-600 p-2 rounded-lg">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300">Wins</span>
                  </div>
                  <span className="text-white font-bold">{user.winCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-600 p-2 rounded-lg">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300">Win Rate</span>
                  </div>
                  <span className="text-white font-bold">{getWinRate()}%</span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-400" />
                Achievements
              </h3>
              <div className="space-y-2">
                {user.achievements && user.achievements.length > 0 ? (
                  user.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg border border-yellow-500/30">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-white">{achievement}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <Award className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No achievements yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="flex border-b border-gray-800">
                {['overview', 'matches', 'social'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">About</h3>
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <p className="text-gray-300">
                          {user.bio || `${user.username} is a ${user.role} on CodeClash with ${user.matchesPlayed} matches played and ${user.winCount} victories.`}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Recent Activity</h3>
                      <div className="space-y-3">
                        {recentMatches.slice(0, 5).map((match, index) => (
                          <div key={match._id || index} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between border border-gray-700">
                            <div className="flex items-center space-x-4">
                              <div className={`w-3 h-3 rounded-full ${
                                match.winner === user._id ? 'bg-green-500' : 'bg-gray-500'
                              }`}></div>
                              <div>
                                <p className="text-white font-medium">{match.roomName}</p>
                                <p className="text-gray-400 text-sm">
                                  {new Date(match.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              match.winner === user._id 
                                ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                                : 'bg-gray-700 text-gray-300 border border-gray-600'
                            }`}>
                              {match.winner === user._id ? 'Victory' : 'Played'}
                            </span>
                          </div>
                        ))}
                        {recentMatches.length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <Activity className="w-12 h-12 mx-auto mb-4" />
                            <p>No matches played yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Matches Tab */}
                {activeTab === 'matches' && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Match History</h3>
                    <div className="space-y-3">
                      {recentMatches.map((match, index) => (
                        <div key={match._id || index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-white font-medium">{match.roomName}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              match.winner === user._id 
                                ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                                : 'bg-gray-700 text-gray-300 border border-gray-600'
                            }`}>
                              {match.winner === user._id ? 'Victory' : 'Defeat'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                            <div>
                              <span className="font-medium">Date:</span> {new Date(match.createdAt).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Players:</span> {match.players?.length || 0}
                            </div>
                            <div>
                              <span className="font-medium">Questions:</span> {match.questions?.length || 0}
                            </div>
                            <div>
                              <span className="font-medium">Status:</span> 
                              <span className={`ml-1 ${
                                match.status === 'closed' ? 'text-red-400' : 'text-green-400'
                              }`}>
                                {match.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {recentMatches.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          <Activity className="w-12 h-12 mx-auto mb-4" />
                          <p>No match history available</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Social Tab */}
                {activeTab === 'social' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Followers ({followers.length})</h3>
                        <div className="space-y-3">
                          {followers.map((follower) => (
                            <div key={follower._id} className="bg-gray-800 rounded-lg p-3 flex items-center space-x-3 border border-gray-700">
                              <img 
                                src={follower.avatar || 'https://res.cloudinary.com/demo/image/upload/v1710000000/default-avatar.png'} 
                                alt="avatar" 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <p className="text-white font-medium">{follower.username}</p>
                              </div>
                            </div>
                          ))}
                          {followers.length === 0 && (
                            <div className="text-center py-6 text-gray-400">
                              <Users className="w-8 h-8 mx-auto mb-2" />
                              <p>No followers yet</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Following ({following.length})</h3>
                        <div className="space-y-3">
                          {following.map((followed) => (
                            <div key={followed._id} className="bg-gray-800 rounded-lg p-3 flex items-center space-x-3 border border-gray-700">
                              <img 
                                src={followed.avatar || 'https://res.cloudinary.com/demo/image/upload/v1710000000/default-avatar.png'} 
                                alt="avatar" 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <p className="text-white font-medium">{followed.username}</p>
                              </div>
                            </div>
                          ))}
                          {following.length === 0 && (
                            <div className="text-center py-6 text-gray-400">
                              <Users className="w-8 h-8 mx-auto mb-2" />
                              <p>Not following anyone yet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.files[0] })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleProfileUpdate}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 