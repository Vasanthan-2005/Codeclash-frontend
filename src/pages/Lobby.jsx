import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../socket'; // Use a singleton socket instance
import ErrorAlert from '../components/ErrorAlert';

const EMOJIS = ['😀','😂','😍','😎','😭','😡','👍','🎉','🔥','❤️','🙏','🤔','😅','🥳','😇','😜'];

export default function Lobby() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [hostId, setHostId] = useState(null);
  const [readyPlayers, setReadyPlayers] = useState([]);
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [roomClosed, setRoomClosed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const chatEndRef = useRef(null);
  const [closeConfirm, setCloseConfirm] = useState(false);
  const [closeCountdown, setCloseCountdown] = useState(5);
  const [error, setError] = useState('');

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    let userObj = u?.user ? u.user : u;
    if (!userObj?._id && u?.user?._id) userObj._id = u.user._id;
    if (!userObj?._id && u?._id) userObj._id = u._id;
    setUser(userObj);
    console.log('[Lobby] Sending user to backend:', userObj);
    console.log('[Lobby] Emitting lobby:join with:', { roomCode, user: userObj });
    if (!userObj || !userObj._id) {
      alert('User ID missing. Please log in again.');
      navigate('/login');
      return;
    }
    setLoading(true);
    socket.emit('lobby:join', { roomCode, user: userObj });
    socket.on('lobby:update', ({ players, hostId, readyPlayers, chat }) => {
      console.log('[Lobby] Received lobby:update:', { players, hostId, readyPlayers, chat });
      setPlayers(players);
      setHostId(hostId?._id || hostId);
      setReadyPlayers(readyPlayers || []);
      setLoading(false);
      setIsReady(readyPlayers?.includes(userObj._id));
      if (chat) setChat(chat);
    });
    socket.on('lobby:chat', (chatArr) => {
      setChat(chatArr);
    });
    socket.on('lobby:closed', () => {
      setRoomClosed(true);
    });
    socket.on('lobby:countdown', (seconds) => {
      setCountdown(seconds);
    });
    socket.on('lobby:start', () => {
      navigate(`/match/${roomCode}`);
    });
    socket.on('lobby:error', (data) => {
      if (data?.message) {
        setError(data.message);
      } else {
        setError('Room error.');
      }
    });
    return () => {
      if (userObj?._id) socket.emit('lobby:leave', { roomCode, userId: userObj._id });
      socket.off('lobby:update');
      socket.off('lobby:chat');
      socket.off('lobby:closed');
      socket.off('lobby:countdown');
      socket.off('lobby:start');
      socket.off('lobby:error');
      setLoading(false);
      setRoomClosed(false);
    };
  }, [roomCode, navigate]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat]);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('lobby:chat', {
        roomCode,
        message: {
          user: user._id,
          username: user.username,
          avatar: user.avatar,
          text: message,
        },
      });
      setMessage('');
      setShowEmojis(false);
    }
  };

  const handleLeave = () => {
    socket.emit('lobby:leave', { roomCode, userId: user._id });
    navigate('/dashboard');
  };

  const handleCloseRoom = () => {
    setCloseConfirm(true);
    setCloseCountdown(5);
    const interval = setInterval(() => {
      setCloseCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          socket.emit('lobby:close', { roomCode, userId: user._id });
          setCloseConfirm(false);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleConfirmClose = () => {
    socket.emit('lobby:close', { roomCode, userId: user._id });
    setCloseConfirm(false);
    setCloseCountdown(5);
  };

  const handleReady = () => {
    socket.emit(isReady ? 'lobby:unready' : 'lobby:ready', { roomCode, userId: user._id });
    setIsReady(r => !r);
  };

  const handleStart = () => {
    socket.emit('lobby:start', { roomCode });
  };
  
  // Separate host and other players
  const hostPlayer = players.find(p => (p._id === (hostId?._id || hostId)));
  const otherPlayers = players.filter(p => p._id !== (hostId?._id || hostId));

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center py-10">
      <ErrorAlert message={error} />
      <div className="w-full max-w-4xl bg-gray-900 rounded-xl shadow-xl border border-gray-800 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-blue-200">Match Lobby</h2>
            <div className="text-gray-400 mt-1">Room Code: <span className="font-mono text-lg bg-gray-800 px-2 py-1 rounded text-blue-300">{roomCode}</span></div>
            {user && <h2 className="text-blue-100">{user.username}</h2>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Players:</span>
            <span className="font-bold text-blue-400">{players.length}</span>
            <button className="ml-4 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded border border-gray-700" onClick={handleLeave} disabled={countdown !== null}>Leave Room</button>
            {user && user._id === (hostId?._id || hostId) && (
              <>
                <button
                  className="ml-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded border border-red-700"
                  onClick={handleCloseRoom}
                  disabled={countdown !== null}
                >
                  Close Room
                </button>
                <button
                  className={`ml-2 px-3 py-1 rounded border font-semibold ${readyPlayers.length !== players.length ? 'bg-gray-600 text-gray-400 border-gray-700 cursor-not-allowed' : 'bg-green-600 text-white border-green-700'}`}
                  onClick={handleStart}
                  disabled={readyPlayers.length !== players.length || countdown !== null}
                >
                  Start Match
                </button>
              </>
            )}
            <button
              className={`ml-2 px-3 py-1 rounded border font-semibold ${isReady ? 'bg-yellow-500 text-black border-yellow-700' : 'bg-gray-700 text-white border-gray-700'}`}
              onClick={handleReady}
              disabled={countdown !== null}
            >
              {isReady ? 'Ready!' : 'Ready'}
            </button>
          </div>
        </div>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="font-semibold mb-2 text-blue-200">Players</div>
            <ul className="flex flex-wrap gap-4">
              {hostPlayer && (
                <li key={hostPlayer._id} className="flex flex-col items-center relative border-2 border-yellow-400 p-2 rounded-lg bg-gray-800">
                  <img src={hostPlayer.avatar || '/default-avatar.png'} alt="avatar" className="w-16 h-16 rounded-full border-2 border-blue-400 shadow" />
                  <span className="font-semibold mt-1 text-blue-100">{hostPlayer.username}</span>
                  <span className="absolute top-0 right-0 bg-yellow-400 text-xs px-2 py-0.5 rounded font-bold text-black">Host</span>
                  {readyPlayers.includes(hostPlayer._id) && <span className="absolute bottom-0 right-0 bg-green-400 text-xs px-2 py-0.5 rounded font-bold text-black">Ready</span>}
                </li>
              )}
              {otherPlayers.map(p => (
                <li key={p._id} className="flex flex-col items-center relative">
                  <img src={p.avatar || '/default-avatar.png'} alt="avatar" className="w-16 h-16 rounded-full border-2 border-blue-400 shadow" />
                  <span className="font-semibold mt-1 text-blue-100">{p.username}</span>
                  {readyPlayers.includes(p._id) && <span className="absolute bottom-0 right-0 bg-green-400 text-xs px-2 py-0.5 rounded font-bold text-black">Ready</span>}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2 text-blue-200">Chat</div>
            <div className="bg-gray-800 rounded p-2 h-48 overflow-y-auto mb-2 border border-gray-700" style={{maxHeight:'200px'}}>
              {chat.map((m, i) => (
                <div key={m.id || i} className="flex items-center gap-2 mb-1">
                  <img src={m.avatar || '/default-avatar.png'} alt="avatar" className="w-6 h-6 rounded-full" />
                  <span className="font-bold text-blue-400">{m.username}:</span>
                  <span className="text-gray-100">{m.text}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSend} className="flex gap-2">
              <input type="text" className="flex-1 border border-gray-700 bg-gray-900 text-white px-2 py-1 rounded" value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." />
              <button type="button" className="bg-gray-700 text-white px-2 py-1 rounded font-semibold border border-gray-700" onClick={()=>setShowEmojis(e=>!e)}>60a</button>
              <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded font-semibold border border-blue-700">Send</button>
            </form>
            {showEmojis && (
              <div className="flex flex-wrap gap-1 mt-2 bg-gray-800 p-2 rounded border border-gray-700">
                {EMOJIS.map(e => (
                  <button key={e} type="button" className="text-2xl" onClick={()=>setMessage(m=>m+e)}>{e}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Countdown Animation */}
      {countdown !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-gray-900 bg-opacity-90 rounded-xl p-12 shadow-2xl border-4 border-blue-600 flex flex-col items-center">
            <h2 className="text-4xl font-bold text-blue-300 mb-4 animate-pulse">Match Starting In</h2>
            <div className="text-7xl font-extrabold text-green-400 animate-bounce mb-2">{countdown}</div>
            <p className="text-lg text-blue-200">Get Ready!</p>
          </div>
        </div>
      )}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-950 bg-opacity-80">
          <div className="text-2xl text-blue-300 font-bold animate-pulse">Loading lobby...</div>
        </div>
      )}
      {closeConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-950 bg-opacity-90">
          <div className="bg-gray-900 rounded-xl p-8 shadow-2xl border-4 border-red-600 flex flex-col items-center">
            <h2 className="text-3xl font-bold text-red-300 mb-4">Close Room?</h2>
            <div className="text-lg text-red-200 mb-6">This will close the room for all players.</div>
            <div className="text-2xl font-bold text-yellow-400 mb-6">Closing in {closeCountdown} seconds...</div>
            <div className="flex gap-4">
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold border border-red-700"
                onClick={handleConfirmClose}
              >
                Confirm Close
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded font-semibold border border-gray-700"
                onClick={() => {
                  setCloseConfirm(false);
                  setCloseCountdown(5);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {roomClosed && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-950 bg-opacity-90">
          <div className="bg-gray-900 rounded-xl p-12 shadow-2xl border-4 border-red-600 flex flex-col items-center relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
              onClick={() => navigate('/dashboard')}
            >
              ×
            </button>
            <h2 className="text-4xl font-bold text-red-300 mb-4 animate-pulse">Room Closed</h2>
            <div className="text-lg text-red-200">The host has closed the room.<br/>You will be redirected to the dashboard.</div>
          </div>
        </div>
      )}
    </div>
  );
}