import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import socket from '../socket';
import { 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp, 
  Users, 
  UserPlus, 
  Award, 
  Calendar,
  PlayCircle,
  Plus,
  Settings,
  LogOut,
  User,
  Eye,
  ChevronRight,
  Activity,
  BarChart3,
  Code,
  Star
} from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';
import NewFollowersTab from '../components/NewFollowersTab';

const statIcons = {
  matches: <PlayCircle className="w-6 h-6 text-blue-400" />,
  wins: <Trophy className="w-6 h-6 text-green-400" />,
  time: <Clock className="w-6 h-6 text-orange-400" />,
  accuracy: <Target className="w-6 h-6 text-purple-400" />,
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [followersUsers, setFollowersUsers] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setMatchesLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const userRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);
        
        // Connect to socket and emit login event for online status
        socket.connect();
        socket.emit('user:login', userRes.data._id);
        
        // Followers/Following
        const followersRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/${userRes.data._id}/followers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowers(followersRes.data.length);
        setFollowersUsers(followersRes.data);
        const followingRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/${userRes.data._id}/following`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowing(followingRes.data.length);
        setFollowingUsers(followingRes.data);
        

        // Matches
        const matchesRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/matches/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatches(matchesRes.data || []);
      } catch (err) {
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          console.error('Internal error:', err);
          setError('Something went wrong. Please try again.');
        }
      } finally {
        setLoading(false);
        setMatchesLoading(false);
      }
    };
    fetchData();
    
    // Cleanup function to handle socket disconnection
    return () => {
      if (user?._id) {
        socket.emit('user:logout', user._id);
      }
    };
  }, []);

  // Calculate stats
  const matchesPlayed = matches.length;
  const wins = matches.filter(m => m.analytics?.accuracy === 100).length;
  const fastestTime = matches.reduce((min, m) => {
    const t = m.analytics?.fastestSubmission?.timeTaken;
    return (t !== undefined && t !== null && (min === null || t < min)) ? t : min;
  }, null);
  const accuracy = matchesPlayed ? Math.round((wins / matchesPlayed) * 100) : 0;

  const getResultBadge = (result) => {
    switch (result) {
      case 'win':
        return 'bg-green-900/30 text-green-400 border border-green-500/30';
      case 'loss':
        return 'bg-red-900/30 text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-800/50 text-gray-400 border border-gray-600/30';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <ErrorAlert message={error} />
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/') }>
                <span className="text-2xl font-bold text-white">
                  Code<span className="text-yellow-400">Clash</span>
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <button 
                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                onClick={() => navigate('/create-match')}
              >
                <Plus className="w-4 h-4" />
                Create Match
              </button>
              <button 
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                onClick={() => navigate('/join-match')}
              >
                <PlayCircle className="w-4 h-4" />
                Join Match
              </button>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format'} 
                  alt="avatar" 
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-600"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => navigate(`/profile/${user?._id}`)}
                >
                  <User className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => { 
                    // Emit logout event for online status
                    if (user?._id) {
                      socket.emit('user:logout', user._id);
                    }
                    localStorage.removeItem('token'); 
                    localStorage.removeItem('user'); 
                    navigate('/login'); 
                  }}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {user?.username || 'User'}!
              </h1>
              <p className="text-gray-400 mt-1">
                Track your progress and improve your coding skills
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
                onClick={() => navigate('/search-players')}
              >
                <Users className="w-4 h-4" />
                Search Players
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
                onClick={() => navigate('/questions')}
              >
                <Code className="w-4 h-4" />
                Question Bank
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { key: 'matches', label: 'Total Matches', value: matchesPlayed, icon: statIcons.matches, color: 'blue' },
            { key: 'wins', label: 'Problems Solved', value: wins, icon: statIcons.wins, color: 'green' },
            { key: 'time', label: 'Best Time', value: fastestTime !== null ? `${fastestTime}s` : '--', icon: statIcons.time, color: 'orange' },
            { key: 'accuracy', label: 'Success Rate', value: `${accuracy}%`, icon: statIcons.accuracy, color: 'purple' }
          ].map((stat) => (
            <div key={stat.key} className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:bg-gray-800 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {stat.icon}
                  <div>
                    <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
                <div className="text-right">
                  <TrendingUp className="w-4 h-4 text-green-400 ml-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>



        {/* Secondary Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Community</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Followers</span>
                <span className="font-semibold text-white">{followers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Following</span>
                <span className="font-semibold text-white">{following}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Achievements</h3>
            </div>
            <div className="space-y-2">
              {user?.achievements && user.achievements.length > 0 ? (
                user.achievements.slice(0, 3).map((achievement, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">{achievement}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No achievements yet. Keep coding!</p>
              )}
              {user?.achievements && user.achievements.length > 3 && (
                <p className="text-xs text-gray-500">+{user.achievements.length - 3} more</p>
              )}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            </div>
            <div className="space-y-2">
              {matches.slice(0, 3).map((match, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 truncate">{match.analytics?.fastestSubmission?.question || match._id}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getResultBadge(match.analytics?.accuracy === 100 ? 'win' : 'loss')}`}>
                    {match.analytics?.accuracy === 100 ? 'WIN' : 'LOSS'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Recent Matches</h3>
              <button 
                className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 font-medium text-sm"
                onClick={() => navigate('/match-history')}
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Problem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {matchesLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                        Loading matches...
                      </div>
                    </td>
                  </tr>
                ) : matches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Code className="w-8 h-8 text-gray-600" />
                        <p>No matches found. Start your coding journey!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  matches.slice(0, 10).map((match) => (
                    <tr key={match._id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {match.analytics?.fastestSubmission?.question || match._id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getResultBadge(match.analytics?.accuracy === 100 ? 'win' : 'loss')}`}>
                          {match.analytics?.accuracy === 100 ? 'WIN' : 'LOSS'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {match.analytics?.fastestSubmission?.timeTaken !== undefined ? `${match.analytics.fastestSubmission.timeTaken}s` : '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {formatDate(match.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 font-medium"
                          onClick={() => navigate(`/matches/${match._id}`)}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Following Section */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Following ({following})</h3>
              <button 
                className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 font-medium text-sm"
                onClick={() => navigate('/search-players')}
              >
                Find More Players
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {followingUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">You're not following anyone yet</p>
                <button 
                  onClick={() => navigate('/search-players')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mx-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  Find Players to Follow
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {followingUsers.slice(0, 6).map((user) => (
                  <div key={user._id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                    <img 
                      src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format'} 
                      alt={user.username} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">{user.username}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Trophy className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-gray-400">{user.winCount || 0} wins</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/profile/${user._id}`)}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Followers Section */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Followers ({followers})</h3>
            </div>
          </div>
          
          <div className="p-6">
            {followersUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No followers yet. Start playing matches to get noticed!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {followersUsers.slice(0, 6).map((user) => (
                  <div key={user._id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                    <img 
                      src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format'} 
                      alt={user.username} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">{user.username}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Trophy className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-gray-400">{user.winCount || 0} wins</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/profile/${user._id}`)}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Loading/Error Overlay */}
      {(loading || error) && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full mx-4 shadow-xl border border-gray-800">
            {loading ? (
              <div className="flex items-center gap-3 text-white">
                <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg font-medium">Loading dashboard...</span>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-400 text-xl">!</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Error</h3>
                <p className="text-gray-400">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* New Followers Tab */}
      <NewFollowersTab />
    </div>
  );
}