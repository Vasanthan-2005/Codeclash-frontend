import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, Plus, Clock, User, ChevronRight, X } from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const CATEGORIES = ['DSA', 'SQL', 'Web', 'Other'];
const TAGS = ['Arrays', 'Hashmap', 'String', 'DP', 'Math', 'Tree', 'Graph', 'Sorting', 'Greedy', 'Backtracking', 'Stack', 'Queue', 'Heap', 'Recursion', 'Bit Manipulation'];
const DIFFICULTY_COLORS = {
  Easy: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Hard: 'bg-red-100 text-red-800',
};

export default function AdminQuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    else navigate('/login');
  }, [navigate]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (difficulty) params.difficulty = difficulty;
      if (category) params.category = category;
      if (tags.length) params.tags = tags.join(',');
      if (search) params.search = search;
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/questions/global`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params,
      });
      setQuestions(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') fetchQuestions();
  }, [user, difficulty, category, tags, search]);

  const handleTagChange = (tag) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const clearFilters = () => {
    setDifficulty('');
    setCategory('');
    setTags([]);
    setSearch('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/questions/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete question');
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center text-xl text-red-400">Admin access only</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <ErrorAlert message={error} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-80">
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Filter className="w-5 h-5 text-yellow-400" />
                  <span>Filters</span>
                </h3>
                {(difficulty || category || tags.length || search) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-400 hover:text-white underline transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-lg bg-gray-950 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
              {/* Difficulty */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                <div className="space-y-2">
                  {DIFFICULTIES.map(d => (
                    <label key={d} className="flex items-center space-x-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="difficulty"
                        value={d}
                        checked={difficulty === d}
                        onChange={e => setDifficulty(e.target.value)}
                        className="text-yellow-500 focus:ring-yellow-500"
                      />
                      <span className={`text-sm font-medium px-2 py-1 rounded transition-all ${
                        difficulty === d 
                          ? DIFFICULTY_COLORS[d].replace('bg-', 'bg-opacity-20 bg-').replace('text-', 'text-') + ' border border-yellow-400'
                          : 'text-gray-300 group-hover:text-white'
                      }`}>
                        {d}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-950 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Tags */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagChange(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all transform hover:scale-105 ${
                        tags.includes(tag)
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black shadow-lg'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">
                {questions.length} Global Questions
              </h2>
              <Link to="/questions/create" state={{ isGlobal: true }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold text-lg border border-blue-700 shadow-lg transition-all">
                <Plus className="w-5 h-5" />
                Add Global Question
              </Link>
            </div>
            {questions.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-12 text-center">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No questions found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your filters or add a new question!</p>
                <Link 
                  to="/questions/create"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105"
                  state={{ isGlobal: true }}
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Global Question</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {questions.map(q => (
                  <div
                    key={q._id}
                    className="group bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-800"
                    onMouseEnter={() => setHoveredCard(q._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${DIFFICULTY_COLORS[q.difficulty]} ${
                          hoveredCard === q._id ? 'shadow-xl scale-105' : ''
                        } transition-all`}>
                          {q.difficulty}
                        </span>
                        <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded-full border border-blue-700">
                          {q.category}
                        </span>
                      </div>
                    </div>

                    <Link 
                      to={`/questions/${q._id}`}
                      className="block mb-3 group-hover:text-yellow-400 transition-colors text-left w-full"
                    >
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                        {q.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                        {q.description}
                      </p>
                    </Link>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {q.tags?.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded-lg text-xs font-medium border border-yellow-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {q.tags?.length > 3 && (
                        <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded-lg text-xs">
                          +{q.tags.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{q.owner?.username || 'Admin'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {q.testCases?.length || 0} test cases
                      </span>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/questions/${q._id}`}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
                        >
                          <span>View</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                        <Link
                          to={`/questions/${q._id}/edit`}
                          className="bg-yellow-600 hover:bg-yellow-700 text-black px-3 py-2 rounded-lg text-sm font-medium transition-all"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(q._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </main>
    </div>
  );
} 