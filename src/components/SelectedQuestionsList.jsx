import React from 'react';
import QuestionCard from './QuestionCard';

export default function SelectedQuestionsList({ questions, onRemove, onPreview }) {
  return (
    <div className="space-y-2 flex-1 overflow-y-auto">
      {questions.length === 0 && <div className="text-gray-400">No questions added yet.</div>}
      {questions.map((q, idx) => (
        <div key={q._id || idx} className="relative">
          <QuestionCard question={q} showActions={false} />
          <div className="absolute top-2 right-2 flex gap-2">
            <button type="button" className="text-blue-400 text-xs underline" onClick={() => onPreview(q)}>Preview</button>
            <button type="button" className="text-red-400 text-xs" onClick={() => onRemove(idx)}>Remove</button>
          </div>
        </div>
      ))}
    </div>
  );
} 