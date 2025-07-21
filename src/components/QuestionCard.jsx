import { Link } from 'react-router-dom';
import { Clock, User, ChevronRight } from 'lucide-react';

const DIFFICULTY_COLORS = {
  Easy: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Hard: 'bg-red-100 text-red-800',
};

export default function QuestionCard({ question, onEdit, onDelete, onView, showActions = true }) {
  return (
    <div
      className="group bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-gray-800"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${DIFFICULTY_COLORS[question.difficulty]} transition-all`}>
            {question.difficulty}
          </span>
          <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded-full border border-blue-700">
            {question.category}
          </span>
        </div>
      </div>
      <Link 
        to={onView ? undefined : `/questions/${question._id}`}
        onClick={onView ? (e) => { e.preventDefault(); onView(question); } : undefined}
        className="block mb-3 group-hover:text-yellow-400 transition-colors text-left w-full"
      >
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
          {question.title}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
          {question.description}
        </p>
      </Link>
      <div className="flex flex-wrap gap-1 mb-4">
        {question.tags?.slice(0, 3).map(tag => (
          <span
            key={tag}
            className="bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded-lg text-xs font-medium border border-yellow-700"
          >
            {tag}
          </span>
        ))}
        {question.tags?.length > 3 && (
          <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded-lg text-xs">
            +{question.tags.length - 3} more
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <div className="flex items-center space-x-1">
          <User className="w-3 h-3" />
          <span>{question.owner?.username || 'Admin'}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{new Date(question.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {question.testCases?.length || 0} test cases
        </span>
        {showActions && (
          <div className="flex items-center space-x-2">
            <Link
              to={`/questions/${question._id}`}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
            >
              <span>View</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
            {onEdit && (
              <button
                onClick={() => onEdit(question)}
                className="bg-yellow-600 hover:bg-yellow-700 text-black px-3 py-2 rounded-lg text-sm font-medium transition-all"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(question)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 