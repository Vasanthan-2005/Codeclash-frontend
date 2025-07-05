import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// Monaco Editor import (assume monaco is installed)
import Editor from '@monaco-editor/react';
import ErrorAlert from '../components/ErrorAlert';
import socket from '../socket';

export default function MatchRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [leaderboard, setLeaderboard] = useState([]);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(0);
  const [matchEnded, setMatchEnded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    setUser(u);
    socket.emit('joinMatch', { roomCode, user: u });
    socket.on('playerJoined', () => {});
    socket.on('playerRejoined', () => {});
    socket.on('chatUpdate', setChat);
    socket.on('leaderboardUpdate', setLeaderboard);
    socket.on('codeSubmitted', (submission) => {
      // Optionally show feedback
    });
    socket.on('match:error', (data) => {
      if (data?.message) {
        setError(data.message);
      } else {
        setError('Match error.');
      }
    });
    // Fetch question for the match (simulate API)
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/matches/${roomCode}`)
      .then(res => setQuestion(res.data.questions[0]))
      .catch(() => setQuestion(null));
    // Timer logic
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => {
      socket.off('playerJoined');
      socket.off('playerRejoined');
      socket.off('chatUpdate');
      socket.off('leaderboardUpdate');
      socket.off('codeSubmitted');
      socket.off('match:error');
      clearInterval(timerRef.current);
    };
  }, [roomCode]);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('sendChat', { roomCode, message: { user: user.username, text: message } });
      setMessage('');
    }
  };
  const handleSubmit = async () => {
    setSubmitting(true);
    socket.emit('submitCode', { roomCode, submission: { user: user.username, code, language, time: timer } });
    // Optionally call backend for Judge0 evaluation
    setSubmitting(false);
  };

  if (!question) return <div className="text-center mt-20 text-white">Loading question...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white py-10">
      <ErrorAlert message={error} />
      <div className="w-full max-w-5xl p-8 bg-gray-900 rounded-xl shadow-xl border border-gray-800 flex flex-col md:flex-row gap-8">
        {/* Left: Question */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2 text-blue-200">{question.title}</h2>
          <div className="mb-2"><b className="text-blue-100">Description:</b> {question.description}</div>
          <div className="mb-2"><b className="text-blue-100">Input Format:</b> {question.inputFormat}</div>
          <div className="mb-2"><b className="text-blue-100">Output Format:</b> {question.outputFormat}</div>
          <div className="mb-2"><b className="text-blue-100">Constraints:</b> {question.constraints}</div>
          <div className="mb-2"><b className="text-blue-100">Sample Test Cases:</b>
            <ul className="list-disc ml-6">
              {question.testCases?.filter(tc => !tc.hidden).map((tc, i) => (
                <li key={i}><b>Input:</b> <span className="bg-gray-800 px-2 py-1 rounded text-blue-300">{tc.input}</span> <b>Output:</b> <span className="bg-gray-800 px-2 py-1 rounded text-blue-300">{tc.output}</span></li>
              ))}
            </ul>
          </div>
          <div className="mb-2"><b className="text-blue-100">Timer:</b> {timer}s</div>
        </div>
        {/* Right: Editor, Leaderboard, Chat */}
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <label className="font-semibold text-blue-100">Language:</label>
            <select className="ml-2 border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded" value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="java">Java</option>
            </select>
          </div>
          <Editor
            height="250px"
            defaultLanguage={language}
            value={code}
            onChange={v => setCode(v || '')}
            theme="vs-dark"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded mt-2 border border-blue-700 font-semibold" onClick={handleSubmit} disabled={submitting}>Submit Code</button>
          <div className="bg-gray-800 rounded p-2 mt-4 border border-gray-700">
            <div className="font-semibold mb-2 text-blue-200">Leaderboard</div>
            <ul>
              {leaderboard.map((entry, i) => (
                <li key={i}>{entry.user}: {entry.score} pts ({entry.time}s)</li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-800 rounded p-2 mt-4 border border-gray-700">
            <div className="font-semibold mb-2 text-blue-200">Chat</div>
            <div className="h-24 overflow-y-auto mb-2">
              {chat.map((m, i) => (
                <div key={i}><b className="text-blue-400">{m.user}:</b> <span className="text-gray-100">{m.text}</span></div>
              ))}
            </div>
            <form onSubmit={handleSend} className="flex gap-2">
              <input type="text" className="flex-1 border border-gray-700 bg-gray-900 text-white px-2 py-1 rounded" value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." />
              <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded border border-blue-700 font-semibold">Send</button>
            </form>
          </div>
          {matchEnded && <div className="text-center text-green-400 font-bold">Match Ended!</div>}
        </div>
      </div>
    </div>
  );
} 