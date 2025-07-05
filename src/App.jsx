import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Questions from './pages/Questions';
import QuestionDetail from './pages/QuestionDetail';
import CreateMatch from './pages/CreateMatch';
import CreateQuestion from './pages/CreateQuestion';
import Profile from './pages/Profile';
import Lobby from './pages/Lobby';
import MatchRoom from './pages/MatchRoom';
import JoinMatch from './pages/JoinMatch';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <div className="min-h-screen w-full bg-[#181c2f] text-white flex flex-col">
      <Router>
        <div className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/questions/:id" element={<QuestionDetail />} />
            <Route path="/create-match" element={<CreateMatch />} />
            <Route path="/questions/create" element={<CreateQuestion />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/lobby/:roomCode" element={<Lobby />} />
            <Route path="/match/:roomCode" element={<MatchRoom />} />
            <Route path="/join-match" element={<JoinMatch />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}
