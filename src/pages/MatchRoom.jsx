import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import ErrorAlert from '../components/ErrorAlert';
import socket from '../socket';
import { 
  Clock, 
  Play, 
  Send, 
  Trophy, 
  MessageCircle, 
  Copy, 
  Users, 
  CheckCircle, 
  XCircle, 
  Zap,
  Settings,
  Code,
  Timer,
  Crown,
  Medal,
  Star
} from 'lucide-react';
import Split from 'react-split';
import './MatchRoom.css';

const MatchRoom = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [activePanel, setActivePanel] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900);
  const [chatMessage, setChatMessage] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [currentRank, setCurrentRank] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [chat, setChat] = useState([]);
  const [error, setError] = useState('');
  const [matchEnded, setMatchEnded] = useState(false);
  const timerRef = useRef();
  const chatEndRef = useRef(null);
  const [roomName, setRoomName] = useState('');
  const [hostName, setHostName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [allowedLanguages, setAllowedLanguages] = useState([]);
  const [timeLimit, setTimeLimit] = useState(900);

  const languages = [
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'cpp', name: 'C++', icon: '⚡' },
    { id: 'c', name: 'C', icon: '💻' },
    { id: 'java', name: 'Java', icon: '☕' }
  ];

  const difficultyColors = {
    Easy: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Medium: 'bg-amber-100 text-amber-800 border-amber-200',
    Hard: 'bg-red-100 text-red-800 border-red-200'
  };

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    setUser(u);
    socket.emit('joinMatch', { roomCode, user: u });
    // --- Chat: use lobby:chat and lobby:update for chat messages ---
    socket.on('lobby:update', (data) => {
      if (data.chat) setChat(data.chat);
      if (data.leaderboard) setLeaderboard(data.leaderboard);
    });
    socket.on('lobby:chat', (chatData) => {
      setChat(chatData);
      // Debug log
      // console.log('Received chat:', chatData);
    });
    socket.on('leaderboardUpdate', setLeaderboard);
    socket.on('match:error', (data) => setError(data?.message || 'Match error.'));
    socket.on('matchEnded', () => setMatchEnded(true));
    // --- Timer: set only once from backend ---
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/matches/full/bycode/${roomCode}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => {
        setQuestions(res.data.questions || []);
        setCurrentQuestionIdx(0);
        setTimeLimit(res.data.timeLimit ? res.data.timeLimit * 60 : 900);
        setTimeLeft(prev => prev === 900 ? (res.data.timeLimit ? res.data.timeLimit * 60 : 900) : prev);
        setLeaderboard(res.data.leaderboard || []);
        setRoomName(res.data.roomName || '');
        setHostName(res.data.admin?.username || '');
        setIsHost(u?.username === res.data.admin?.username);
        // Set allowed languages
        if (Array.isArray(res.data.languages) && res.data.languages.length > 0) {
          setAllowedLanguages(res.data.languages);
          if (!res.data.languages.includes(selectedLanguage)) {
            setSelectedLanguage(res.data.languages[0]);
          }
        }
      })
      .catch(() => setQuestions([]));
    timerRef.current = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
    // --- Listen for match:ended event ---
    socket.on('match:ended', () => {
      navigate(`/match/${roomCode}/finish`);
    });
    return () => {
      socket.off('lobby:update');
      socket.off('lobby:chat');
      socket.off('leaderboardUpdate');
      socket.off('match:error');
      socket.off('matchEnded');
      socket.off('match:ended');
      clearInterval(timerRef.current);
    };
  }, [roomCode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // Set starter code when question/language changes
  useEffect(() => {
    if (questions.length && questions[currentQuestionIdx]?.starterCode) {
      const starter = questions[currentQuestionIdx].starterCode?.[selectedLanguage] || '';
      setCode(starter);
    }
    // eslint-disable-next-line
  }, [currentQuestionIdx, selectedLanguage, questions]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeStatus = () => {
    if (timeLeft > 300) return 'text-emerald-600';
    if (timeLeft > 120) return 'text-amber-600';
    return 'text-red-600';
  };

  const handleRunCode = async () => {
    setTestResults({ status: 'running', message: 'Running test cases...' });
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/matches/${roomCode}/run`, {
        code,
        language: selectedLanguage,
        user: user.username,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTestResults({
        status: Array.isArray(res.data.result) && res.data.result.every(r => r.passed) ? 'accepted' : 'partial',
        message: Array.isArray(res.data.result) && res.data.result.every(r => r.passed) ? 'All test cases passed! 🎉' : 'Some test cases failed.',
        cases: res.data.result,
      });
    } catch (err) {
      setTestResults({ status: 'error', message: 'Error running code.' });
    }
  };

  const handleSubmitCode = () => {
    setIsSubmitting(true);
    socket.emit('submitCode', { roomCode, submission: { user: user.username, code, language: selectedLanguage, time: timeLeft } });
    setTimeout(() => setIsSubmitting(false), 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      // Use lobby:chat for match chat
      socket.emit('lobby:chat', { roomCode, message: { user: user.username, text: chatMessage } }, (err) => {
        if (err) {
          setError('Failed to send message.');
          // console.error('Chat send error:', err);
        }
      });
      setChatMessage('');
    }
  };

  const copyRoomCode = () => navigator.clipboard.writeText(roomCode);

  const handleFinishMatch = () => {
    // Emit a match:finish event for the backend to handle (implement if needed)
    socket.emit('match:finish', { roomCode });
    // Optimistically navigate to finish page for host
    if (isHost) {
      navigate(`/match/${roomCode}/finish`);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-orange-500" />;
      default: return <Star className="w-5 h-5 text-gray-400" />;
    }
  };

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading questions...</p>
        </div>
      </div>
    );
  }
  const question = questions[currentQuestionIdx];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Professional Header */}
      <header className="bg-gray-900 border-b border-gray-800 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Brand and Room Info */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">CodeClash</h1>
                  <p className="text-sm text-gray-400">Competitive Programming Platform</p>
                </div>
              </div>
              
              <div className="h-8 w-px bg-gray-800"></div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-300">Room:</span>
                  <span className="px-2 py-1 bg-blue-900 text-blue-200 rounded-md text-sm font-medium">
                    {roomName}
                  </span>
                  <button
                    onClick={copyRoomCode}
                    className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
                    title="Copy Room Code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-300">Host:</span>
                  <span className="px-2 py-1 bg-green-900 text-green-200 rounded-md text-sm font-medium">
                    {hostName}
                  </span>
                </div>
              </div>
            </div>

            {/* Center - Timer */}
            <div className="flex items-center space-x-4 px-6 py-3 bg-gray-900 rounded-xl border border-gray-800 shadow-sm">
              <Timer className="w-5 h-5 text-gray-400" />
              <div className="text-center">
                <div className={`text-2xl font-mono font-bold ${getTimeStatus()}`}>{formatTime(timeLeft)}</div>
                <div className="text-xs text-gray-400">Time Remaining</div>
              </div>
            </div>

            {/* Right - Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActivePanel(activePanel === 'leaderboard' ? null : 'leaderboard')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-200 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Trophy className="w-4 h-4" />
                <span>Leaderboard</span>
              </button>
              
              <button
                onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-200 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat</span>
              </button>
              
              {isHost && (
                <button
                  onClick={handleFinishMatch}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Finish Match
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="h-[calc(100vh-88px)]">
        <Split
          className="flex h-full"
          minSize={400}
          sizes={[45, 55]}
          gutterSize={8}
          direction="horizontal"
          style={{ display: 'flex' }}
        >
          {/* Problem Panel */}
          <div className="bg-gray-900 border-r border-gray-800 overflow-y-auto text-white">
            <div className="p-6">
              {/* Question Tabs */}
              <div className="flex gap-2 mb-6">
                {questions.map((q, idx) => (
                  <button
                    key={q._id || idx}
                    className={`px-4 py-2 rounded-lg font-semibold border transition-all duration-150 ${
                      idx === currentQuestionIdx
                        ? 'bg-blue-700 border-blue-400 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                    }`}
                    onClick={() => setCurrentQuestionIdx(idx)}
                  >
                    Q{idx + 1}
                  </button>
                ))}
              </div>
              {/* Problem Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{question.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${difficultyColors[question.difficulty]}`}>{question.difficulty}</span>
              </div>
              {/* Problem Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                <div className="prose prose-invert prose-gray max-w-none">
                  <p className="text-gray-200 leading-relaxed">{question.description}</p>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Input Example</h3>
                {question.examples && question.examples.length > 0 ? (
                  question.examples.map((ex, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-blue-200 text-sm mb-1">{ex.input}</div>
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-green-200 text-sm mb-1">{ex.output}</div>
                      {ex.explanation && <div className="text-xs text-gray-400 mt-1"><span className="font-medium">Explanation:</span> {ex.explanation}</div>}
                    </div>
                  ))
                ) : <div className="text-gray-400">No examples provided.</div>}
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Constraints</h3>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-sm text-gray-300">
                  <ul className="space-y-1">
                    {question.constraints?.split('\n').map((constraint, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-gray-500 mr-2">•</span>
                        <span>{constraint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Sample Test Cases</h3>
                <div className="space-y-4">
                  {question.testCases?.filter(tc => tc.is_public !== false).map((example, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-gray-200">Input:</span>
                          <code className="ml-2 px-2 py-1 bg-gray-900 rounded text-blue-300 border border-gray-700">{example.input}</code>
                        </div>
                        <div>
                          <span className="font-medium text-gray-200">Output:</span>
                          <code className="ml-2 px-2 py-1 bg-gray-900 rounded text-green-300 border border-gray-700">{example.output}</code>
                        </div>
                        {example.explanation && (
                          <div className="text-xs text-gray-400 mt-1"><span className="font-medium">Explanation:</span> {example.explanation}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Test Results */}
              {testResults && (
                <div className={`p-4 rounded-lg border ${
                  testResults.status === 'accepted' 
                    ? 'bg-green-900/20 border-green-500' 
                    : testResults.status === 'partial' 
                    ? 'bg-yellow-900/20 border-yellow-500' 
                    : testResults.status === 'running' 
                    ? 'bg-blue-900/20 border-blue-500' 
                    : 'bg-red-900/20 border-red-500'
                }`}>
                  <div className="flex items-center space-x-2">
                    {testResults.status === 'accepted' && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {testResults.status === 'partial' && <XCircle className="w-5 h-5 text-yellow-400" />}
                    {testResults.status === 'running' && <Zap className="w-5 h-5 text-blue-400 animate-pulse" />}
                    {testResults.status === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
                    <span className={`font-medium ${
                      testResults.status === 'accepted' ? 'text-green-200' :
                      testResults.status === 'partial' ? 'text-yellow-200' :
                      testResults.status === 'running' ? 'text-blue-200' : 'text-red-200'
                    }`}>
                      {testResults.message}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Code Editor Panel */}
          <div className="bg-gray-900 flex flex-col text-white">
            {/* Editor Header */}
            <div className="border-b border-gray-800 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-gray-400" />
                    <select
                      value={selectedLanguage}
                      onChange={e => setSelectedLanguage(e.target.value)}
                      className="px-3 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white"
                    >
                      {(allowedLanguages.length ? allowedLanguages : languages.map(l => l.id)).map(lang => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleRunCode}
                    disabled={testResults?.status === 'running'}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors font-medium"
                  >
                    <Play className="w-4 h-4" />
                    <span>Run Code</span>
                  </button>
                  
                  <button
                    onClick={handleSubmitCode}
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors font-medium"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1">
              <Editor
                height="100%"
                language={selectedLanguage}
                value={code}
                onChange={v => setCode(v || '')}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </div>
          </div>
        </Split>
      </div>

      {/* Side Panel */}
      <div className={`fixed top-0 right-0 h-full w-96 transform transition-transform duration-300 ease-in-out z-50 ${
        activePanel ? 'translate-x-0' : 'translate-x-full'
      } bg-gray-900 border-l border-gray-800 shadow-xl`}>
        
        {/* Panel Header */}
        <div className="border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {activePanel === 'leaderboard' && (
                <>
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
                </>
              )}
              {activePanel === 'chat' && (
                <>
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Chat</h3>
                  <div className="flex items-center space-x-1 text-sm text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{leaderboard.length} online</span>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => setActivePanel(null)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Panel Content */}
        <div className="h-[calc(100vh-73px)] overflow-hidden">
          {/* Leaderboard */}
          {activePanel === 'leaderboard' && (
            <div className="h-full overflow-y-auto p-6">
              <div className="space-y-3">
                {leaderboard.map((player, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border transition-all ${
                      user && player.user === user.username
                        ? 'bg-blue-900/40 border-blue-500 ring-2 ring-blue-900'
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8">
                          {getRankIcon(idx + 1)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{player.user}</div>
                          <div className="text-sm text-gray-400">Score: {player.score}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-white">{player.time}s</div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          player.status === 'pass' 
                            ? 'bg-green-900 text-green-200' 
                            : 'bg-yellow-900 text-yellow-200'
                        }`}>
                          {player.status === 'pass' ? 'Solved' : 'Coding'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat */}
          {activePanel === 'chat' && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {chat.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      msg.user === user?.username
                        ? 'bg-blue-900/40 border-l-4 border-blue-500 ml-6'
                        : 'bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-blue-300">{msg.user}</span>
                    </div>
                    <div className="text-sm text-gray-200">{msg.text}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              <div className="border-t border-gray-800 p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={e => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-900 text-white"
                  />
                  <button
                    type="submit"
                    disabled={!chatMessage.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {activePanel && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setActivePanel(null)}
        />
      )}

      {/* Match End Notification */}
      {matchEnded && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6 z-50 max-w-sm">
          <div className="text-center">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Match Completed!</h3>
            <p className="text-gray-300">Your Final Rank: <span className="font-bold text-blue-300">#{currentRank}</span></p>
          </div>
        </div>
      )}

      <ErrorAlert message={error} />
    </div>
  );
};

export default MatchRoom