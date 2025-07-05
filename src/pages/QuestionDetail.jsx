import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ErrorAlert from '../components/ErrorAlert';

export default function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchQuestion() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/questions/${id}`);
        if (!res.ok) throw new Error('Failed to fetch question');
        const data = await res.json();
        setQuestion(data);
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
    }
    fetchQuestion();
  }, [id]);

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;
  if (!question) return <div className="text-center mt-20 text-red-500">Question not found.</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white py-10">
      <ErrorAlert message={error} />
      <div className="w-full max-w-2xl p-8 bg-gray-900 rounded-xl shadow-xl border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-blue-200">{question.title}</h2>
        <div className="mb-2"><span className="font-semibold text-blue-100">Description:</span> {question.description}</div>
        <div className="mb-2"><span className="font-semibold text-blue-100">Constraints:</span> {question.constraints}</div>
        <div className="mb-2"><span className="font-semibold text-blue-100">Input Format:</span> {question.inputFormat}</div>
        <div className="mb-2"><span className="font-semibold text-blue-100">Output Format:</span> {question.outputFormat}</div>
        <div className="mb-2">
          <span className="font-semibold text-blue-100">Sample Test Cases:</span>
          <ul className="list-disc ml-6">
            {question.testCases.filter(tc => !tc.hidden).map((tc, i) => (
              <li key={i} className="mb-1">
                <div><span className="font-semibold">Input:</span> <pre className="inline bg-gray-800 px-2 py-1 rounded text-blue-300">{tc.input}</pre></div>
                <div><span className="font-semibold">Output:</span> <pre className="inline bg-gray-800 px-2 py-1 rounded text-blue-300">{tc.output}</pre></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 