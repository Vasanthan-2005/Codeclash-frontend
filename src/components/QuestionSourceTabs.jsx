import React from 'react';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DIFFICULTY_KEYS = ['easy', 'medium', 'hard'];

export default function QuestionSourceTabs({
  questionSource, setQuestionSource,
  randomCounts, setRandomCounts,
  numQuestions
}) {
  const totalRandom = randomCounts.easy + randomCounts.medium + randomCounts.hard;
  return (
    <div className="mb-6">
      <label className="block font-semibold mb-2 text-blue-100">Question Source</label>
      <div className="flex gap-4 mb-4">
        <button
          className={`flex-1 px-4 py-2 rounded font-semibold border transition-colors ${questionSource === 'custom' ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-800 text-gray-300 border-gray-700'}`}
          onClick={() => setQuestionSource('custom')}
        >
          Create Questions
        </button>
        <button
          className={`flex-1 px-4 py-2 rounded font-semibold border transition-colors ${questionSource === 'random' ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-800 text-gray-300 border-gray-700'}`}
          onClick={() => setQuestionSource('random')}
        >
          Random from Admin QB
        </button>
      </div>
      {questionSource === 'random' && (
        <div className="mb-2">
          <label className="block font-semibold mb-1 text-blue-100">Random Question Breakdown</label>
          <div className="flex gap-4">
            {DIFFICULTY_KEYS.map((key, idx) => (
              <div key={key} className="flex flex-col items-center">
                <span className="text-blue-200">{DIFFICULTIES[idx]}</span>
                <input
                  type="number"
                  min={0}
                  max={numQuestions}
                  className="w-16 border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded mt-1"
                  value={randomCounts[key]}
                  onChange={e => {
                    const val = Math.max(0, Math.min(Number(e.target.value), numQuestions));
                    setRandomCounts(rc => ({ ...rc, [key]: val }));
                  }}
                />
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-1">Total: {totalRandom} / {numQuestions}</div>
        </div>
      )}
    </div>
  );
} 