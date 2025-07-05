import { Link } from 'react-router-dom';

// Example SVG icons (replace with Heroicons/Lucide in a real project)
const IconBattle = () => (
  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#60a5fa" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 17l6-6m0 0l6-6m-6 6l6 6m-6-6l-6 6" /></svg>
);
const IconLeaderboard = () => (
  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m0 0v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2m6 0h4m0 0v-2a2 2 0 012-2h2a2 2 0 012 2v2m0 0v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2" /></svg>
);
const IconHistory = () => (
  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#f472b6" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const IconProfile = () => (
  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#38bdf8" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75V19.5z" /></svg>
);

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-950 text-gray-100 font-sans">
      {/* Top Navbar */}
      <nav className="w-full bg-gray-900 bg-opacity-95 shadow-lg px-8 py-3 flex items-center justify-between border-b border-gray-800">
        <Link to="/" className="text-2xl font-bold text-white">
          Code<span className="text-yellow-400">Clash</span>
        </Link>
        <Link
          to="/admin-login"
          className="text-sm font-medium px-4 py-2 bg-gray-800 text-blue-200 rounded-md border border-blue-700 hover:bg-blue-900 hover:text-white transition"
        >
          Admin Login
        </Link>
      </nav>

      {/* Center Content */}
      <div className="flex flex-col items-center flex-1 justify-center">
        <h1 className="text-5xl font-extrabold text-center text-blue-200 tracking-tight mb-2">Code. Compete. Conquer.</h1>
        <p className="mt-2 text-lg text-gray-400 text-center max-w-xl mx-auto">
          Challenge friends in real-time coding battles with live scoring and leaderboards.
        </p>
        <div className="flex justify-center mt-8 gap-4">
          <Link
            to="/login"
            className="px-6 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition font-semibold border border-blue-700"
          >
            Player Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-2 border border-blue-700 text-blue-300 rounded-md hover:bg-blue-900 hover:text-white transition font-semibold"
          >
            Register
          </Link>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="flex flex-wrap justify-center gap-8 py-10 bg-gray-900 border-t border-gray-800">
        <div className="rounded-xl p-6 bg-gray-800 hover:bg-gray-700 transition text-center max-w-xs border border-blue-800 shadow-md flex flex-col items-center">
          <IconBattle />
          <div className="font-semibold text-blue-200 mt-2">Live Coding Battles</div>
          <div className="text-gray-400 text-sm mt-1">Compete in real time with friends.</div>
        </div>
        <div className="rounded-xl p-6 bg-gray-800 hover:bg-gray-700 transition text-center max-w-xs border border-blue-800 shadow-md flex flex-col items-center">
          <IconLeaderboard />
          <div className="font-semibold text-purple-200 mt-2">Leaderboard</div>
          <div className="text-gray-400 text-sm mt-1">See who ranks highest based on speed & accuracy.</div>
        </div>
        <div className="rounded-xl p-6 bg-gray-800 hover:bg-gray-700 transition text-center max-w-xs border border-blue-800 shadow-md flex flex-col items-center">
          <IconHistory />
          <div className="font-semibold text-pink-200 mt-2">Match History</div>
          <div className="text-gray-400 text-sm mt-1">Track your performance over time.</div>
        </div>
        <div className="rounded-xl p-6 bg-gray-800 hover:bg-gray-700 transition text-center max-w-xs border border-blue-800 shadow-md flex flex-col items-center">
          <IconProfile />
          <div className="font-semibold text-cyan-200 mt-2">Profiles & Stats</div>
          <div className="text-gray-400 text-sm mt-1">Win count, coding time, avatars.</div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-500 text-sm bg-gray-900 border-t border-gray-800">
        <div className="mb-2">
          <a href="#" className="mx-2 hover:underline">Privacy</a>
          <a href="#" className="mx-2 hover:underline">Terms</a>
          <a href="#" className="mx-2 hover:underline">GitHub</a>
          <a href="#" className="mx-2 hover:underline">Contact</a>
        </div>
        <div>Powered by MERN Stack</div>
      </footer>
    </div>
  );
} 