import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateQuestion from './CreateQuestion';
import ErrorAlert from '../components/ErrorAlert';
import MatchSettingsCard from '../components/MatchSettingsCard';
import QuestionSourceTabs from '../components/QuestionSourceTabs';
import SelectedQuestionsList from '../components/SelectedQuestionsList';
import LoadingSpinner from '../components/LoadingSpinner';

const LANGUAGES = [
  { label: 'C', value: 'c' },
  { label: 'C++', value: 'cpp' },
  { label: 'Java', value: 'java' },
  { label: 'Python', value: 'python' },
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DIFFICULTY_KEYS = ['easy', 'medium', 'hard'];
const CATEGORIES = ['DSA', 'SQL', 'Web', 'Other'];

// QuestionPreviewModal component
function QuestionPreviewModal({ question, onClose }) {
  if (!question) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative shadow-2xl">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl" onClick={onClose} aria-label="Close">×</button>
        <h2 className="text-2xl font-bold mb-2 text-blue-200">{question.title}</h2>
        <div className="mb-2 text-blue-100 font-semibold">{question.difficulty} | {question.category} | {question.tags?.join(', ')}</div>
        {question.topic && <div className="mb-2 text-gray-300"><b>Topic:</b> {question.topic}</div>}
        <div className="mb-2"><b>Description:</b><br /><span className="text-gray-200 whitespace-pre-line">{question.description}</span></div>
        <div className="mb-2"><b>Input Format:</b> <span className="text-gray-200">{question.inputFormat}</span></div>
        <div className="mb-2"><b>Output Format:</b> <span className="text-gray-200">{question.outputFormat}</span></div>
        <div className="mb-2"><b>Constraints:</b> <span className="text-gray-200">{question.constraints}</span></div>
        {question.examples && question.examples.length > 0 && (
          <div className="mb-2"><b>Examples:</b>
            <ul className="list-disc ml-6">
              {question.examples.map((ex, i) => (
                <li key={i}><b>Input:</b> {ex.input} <b>Output:</b> {ex.output} <b>Explanation:</b> {ex.explanation}</li>
              ))}
            </ul>
          </div>
        )}
        {question.starterCode && Object.keys(question.starterCode).length > 0 && (
          <div className="mb-2"><b>Starter Code:</b>
            <ul className="list-disc ml-6">
              {Object.entries(question.starterCode).map(([lang, code]) => (
                <li key={lang}><b>{lang}:</b><pre className="bg-gray-800 p-2 rounded whitespace-pre-wrap text-blue-300">{code}</pre></li>
              ))}
            </ul>
          </div>
        )}
        {question.testCases && question.testCases.length > 0 && (
          <div className="mb-2"><b>Test Cases:</b>
            <ul className="list-disc ml-6">
              {question.testCases.map((tc, i) => (
                <li key={i}><b>Input:</b> {tc.input} <b>Output:</b> {tc.output} <b>Public:</b> {tc.is_public ? 'Yes' : 'No'}</li>
              ))}
            </ul>
          </div>
        )}
        {question.notes && <div className="mb-2"><b>Notes:</b> <span className="text-gray-200">{question.notes}</span></div>}
      </div>
    </div>
  );
}

export default function CreateMatch() {
  const [roomName, setRoomName] = useState('');
  const [numQuestions, setNumQuestions] = useState(1);
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [timeLimit, setTimeLimit] = useState(30);
  const [languages, setLanguages] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionModalTab, setQuestionModalTab] = useState('bank');
  const [questionBank, setQuestionBank] = useState([]);
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionFilters, setQuestionFilters] = useState({ difficulty: '', category: '', tags: [] });
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [questionSource, setQuestionSource] = useState('custom'); // 'custom' or 'random'
  const [randomCounts, setRandomCounts] = useState({ easy: 0, medium: 0, hard: 0 });
  const navigate = useNavigate();

  // Fetch question bank
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const params = {};
        if (questionFilters.difficulty) params.difficulty = questionFilters.difficulty;
        if (questionFilters.category) params.category = questionFilters.category;
        if (questionFilters.tags.length) params.tags = questionFilters.tags.join(',');
        if (questionSearch) params.search = questionSearch;
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/questions`, { params });
        setQuestionBank(res.data);
      } catch {}
    }
    if (showQuestionModal && questionModalTab === 'bank') fetchQuestions();
  }, [questionFilters, questionSearch, showQuestionModal, questionModalTab]);

  // Helper to check if a question is new (no _id)
  const isNewQuestion = (q) => !q._id;

  // Add from question bank
  const addFromBank = (q) => {
    if (!questions.some(qq => qq._id === q._id) && questions.length < numQuestions) {
      setQuestions(prev => {
        const updated = [...prev, { ...q, isNew: false }];
        if (updated.length === Number(numQuestions)) setShowQuestionModal(false);
        return updated;
      });
    }
  };

  // Handle new question creation
  const handleNewQuestionCreated = (newQ) => {
    if (questions.length < numQuestions) {
      setQuestions(prev => [...prev, { ...newQ, isNew: false }]);
      setQuestionBank(prev => [newQ, ...prev]);
    }
    setShowQuestionModal(false);
  };

  // Remove selected question
  const removeSelectedQuestion = (idx) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  // Validation
  const validateMatch = () => {
    if (!roomName.trim()) return 'Room name is required.';
    if (!numQuestions || numQuestions < 1) return 'Number of questions required.';
    if (!maxPlayers || maxPlayers < 2) return 'At least 2 players required.';
    if (!timeLimit || timeLimit < 1) return 'Time limit required.';
    if (!languages.length) return 'Select at least one language.';
    if (questionSource === 'custom' && questions.length !== Number(numQuestions)) return `You must add exactly ${numQuestions} question(s).`;
    if (questionSource === 'random') {
      const total = randomCounts.easy + randomCounts.medium + randomCounts.hard;
      if (total !== Number(numQuestions)) return `Total random questions must equal ${numQuestions}.`;
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const validationError = validateMatch();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }
    try {
      let matchPayload = {
        roomName,
        timeLimit,
        maxPlayers,
        languages,
      };
      if (questionSource === 'custom') {
        // 1. POST only new questions
        const questionIds = [];
        for (const q of questions) {
          if (isNewQuestion(q)) {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/questions`, q, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            questionIds.push(res.data._id);
          } else {
            questionIds.push(q._id);
          }
        }
        matchPayload.questions = questionIds;
      } else if (questionSource === 'random') {
        matchPayload.randomQuestions = { ...randomCounts };
      }
      // 2. Create match in backend
      const matchRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/matches/create`, matchPayload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setRoomCode(matchRes.data.roomCode);
      setSuccess('Match created successfully!');
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

  // After match creation, redirect to lobby
  useEffect(() => {
    if (roomCode) {
      const timeout = setTimeout(() => {
        navigate(`/lobby/${roomCode}`);
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [roomCode, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white py-10">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Room Info & Settings */}
        <div className="space-y-6">
          <MatchSettingsCard
            roomName={roomName}
            setRoomName={setRoomName}
            numQuestions={numQuestions}
            setNumQuestions={setNumQuestions}
            maxPlayers={maxPlayers}
            setMaxPlayers={setMaxPlayers}
            timeLimit={timeLimit}
            setTimeLimit={setTimeLimit}
            languages={languages}
            setLanguages={setLanguages}
          />
          <QuestionSourceTabs
            questionSource={questionSource}
            setQuestionSource={setQuestionSource}
            randomCounts={randomCounts}
            setRandomCounts={setRandomCounts}
            numQuestions={numQuestions}
          />
          <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl border border-blue-700 font-bold text-lg mt-4 shadow-lg" disabled={loading || (questionSource === 'custom' && questions.length !== Number(numQuestions))} onClick={handleSubmit}>{loading ? <LoadingSpinner className="h-6" /> : 'Create Match'}</button>
          {error && <div className="text-red-400 mt-2">{error}</div>}
          {success && <div className="text-green-400 mt-2">{success}</div>}
          {roomCode && (
            <div className="text-center mt-6">
              <div className="text-lg font-semibold mb-2 text-blue-100">Room Code:</div>
              <div className="text-3xl font-mono bg-gray-800 p-4 rounded mb-4 text-blue-300 border border-gray-700 inline-block">{roomCode}</div>
              <button
                className="ml-2 bg-yellow-600 hover:bg-yellow-700 text-black px-4 py-2 rounded font-semibold border border-yellow-700 transition-colors"
                onClick={async () => {
                  await navigator.clipboard.writeText(roomCode);
                  navigate(`/lobby/${roomCode}`);
                }}
              >
                Copy & Join Lobby
              </button>
            </div>
          )}
        </div>
        {/* Right: Add Questions */}
        {questionSource === 'custom' && (
          <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 p-6 flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-blue-200">Add Questions</h2>
            <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded border border-blue-700 font-semibold mb-4 self-start" onClick={() => setShowQuestionModal(true)} disabled={questions.length >= numQuestions}>+ Add Questions</button>
            <SelectedQuestionsList questions={questions} onRemove={removeSelectedQuestion} onPreview={setPreviewQuestion} />
          </div>
        )}
        {/* Question Modal */}
        {showQuestionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 w-full max-w-3xl min-h-[60vh] max-h-[80vh] flex flex-col relative shadow-2xl">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl" onClick={() => setShowQuestionModal(false)} aria-label="Close">×</button>
              <h3 className="text-2xl font-bold text-blue-200 mb-6">Add Questions</h3>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button className={`flex-1 px-4 py-2 rounded font-semibold border transition-colors ${questionModalTab === 'bank' ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-800 text-gray-300 border-gray-700'}`} onClick={() => setQuestionModalTab('bank')}>From Question Bank</button>
                <button className={`flex-1 px-4 py-2 rounded font-semibold border transition-colors ${questionModalTab === 'new' ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-800 text-gray-300 border-gray-700'}`} onClick={() => setQuestionModalTab('new')}>New Question</button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2">
                {questionModalTab === 'bank' && (
                  <div>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      <input type="text" placeholder="Search questions..." className="flex-1 border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded" value={questionSearch} onChange={e => setQuestionSearch(e.target.value)} />
                      <select className="border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded" value={questionFilters.difficulty} onChange={e => setQuestionFilters(f => ({ ...f, difficulty: e.target.value }))}>
                        <option value="">All Difficulties</option>
                        {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                      </select>
                      <select className="border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded" value={questionFilters.category} onChange={e => setQuestionFilters(f => ({ ...f, category: e.target.value }))}>
                        <option value="">All Categories</option>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="max-h-64 overflow-y-auto border border-gray-800 rounded mb-4 bg-gray-950">
                      {questionBank.length === 0 && <div className="text-gray-400 p-4">No questions found.</div>}
                      {questionBank.map(q => (
                        <div key={q._id} className="flex items-center justify-between px-4 py-2 border-b border-gray-800 hover:bg-gray-900 transition">
                          <div>
                            <div className="font-semibold text-blue-200">{q.title}</div>
                            <div className="text-xs text-gray-400">{q.difficulty} | {q.category} | {q.tags?.join(', ')}</div>
                          </div>
                          <button className="bg-blue-600 text-white px-3 py-1 rounded border border-blue-700 text-sm font-semibold" onClick={() => addFromBank(q)} disabled={questions.some(qq => qq._id === q._id) || questions.length >= numQuestions}>Add</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {questionModalTab === 'new' && (
                  <CreateQuestion onCreated={handleNewQuestionCreated} modalMode />
                )}
              </div>
            </div>
          </div>
        )}
        {/* Preview Modal */}
        <QuestionPreviewModal question={previewQuestion} onClose={() => setPreviewQuestion(null)} />
      </div>
      <ErrorAlert message={error} />
    </div>
  );
} 