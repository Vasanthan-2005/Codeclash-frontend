import React from 'react';

const LANGUAGES = [
  { label: 'C', value: 'c' },
  { label: 'C++', value: 'cpp' },
  { label: 'Java', value: 'java' },
  { label: 'Python', value: 'python' },
];

export default function MatchSettingsCard({
  roomName, setRoomName,
  numQuestions, setNumQuestions,
  maxPlayers, setMaxPlayers,
  timeLimit, setTimeLimit,
  languages, setLanguages
}) {
  return (
    <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-blue-200">Room Info</h2>
      <div className="mb-4">
        <label className="block font-semibold mb-1 text-blue-100">Room Name</label>
        <input type="text" className="w-full border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded" value={roomName} onChange={e => setRoomName(e.target.value)} required placeholder="Enter a room name" />
      </div>
      <div className="mb-4 flex gap-4">
        <div>
          <label className="block font-semibold mb-1 text-blue-100"># Questions</label>
          <input type="number" min={1} max={10} className="w-24 border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded" value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))} required />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-blue-100">Max Players</label>
          <input type="number" min={2} max={100} className="w-24 border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded" value={maxPlayers} onChange={e => setMaxPlayers(Number(e.target.value))} required />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-blue-100">Time (min)</label>
          <input type="number" min={1} max={180} className="w-24 border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded" value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} required />
        </div>
      </div>
      <div>
        <label className="block font-semibold mb-1 text-blue-100">Allowed Languages</label>
        <div className="flex gap-4 flex-wrap">
          {LANGUAGES.map(lang => (
            <label key={lang.value} className="flex items-center gap-1 text-gray-200">
              <input type="checkbox" checked={languages.includes(lang.value)} onChange={() => setLanguages(prev => prev.includes(lang.value) ? prev.filter(l => l !== lang.value) : [...prev, lang.value])} /> {lang.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
} 