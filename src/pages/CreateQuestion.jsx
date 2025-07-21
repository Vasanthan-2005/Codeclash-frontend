import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ErrorAlert from '../components/ErrorAlert';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const CATEGORIES = ['DSA', 'SQL', 'Web', 'Other'];
const TAGS = ['Arrays', 'Hashmap', 'String', 'DP', 'Math', 'Tree', 'Graph', 'Sorting', 'Greedy', 'Backtracking', 'Stack', 'Queue', 'Heap', 'Recursion', 'Bit Manipulation'];
const LANGUAGES = ['Java', 'Python', 'C++', 'C'];

function QuestionPreviewModal({ question, onClose }) {
  if (!question) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative shadow-2xl">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl" onClick={onClose} aria-label="Close">×</button>
        <h2 className="text-2xl font-bold mb-2 text-blue-200">{question.title}</h2>
        <div className="mb-2 text-blue-100 font-semibold">{question.difficulty} | {question.category} | {question.tags?.join(', ')}</div>
        {question.topic && <div className="mb-2 text-gray-300"><b>Topic:</b> {question.topic}</div>}
        <div className="mb-2"><b>Description:</b><br /><span className="text-gray-200 whitespace-pre-line">{question.description}</span></div>
        <div className="mb-2"><b>Input Format:</b> <span className="text-gray-200">{question.inputFormat}</span></div>
        <div className="mb-2"><b>Output Format:</b> <span className="text-gray-200">{question.outputFormat}</span></div>
        <div className="mb-2"><b>Constraints:</b> <span className="text-gray-200">{question.constraints}</span></div>
        {question.examples && question.examples.length > 0 && (
          <div className="mb-2"><b>Examples:</b>
            <ul className="list-disc ml-6">
              {question.examples.map((ex, i) => (
                <li key={i}><b>Input:</b> {ex.input} <b>Output:</b> {ex.output} <b>Explanation:</b> {ex.explanation}</li>
              ))}
            </ul>
          </div>
        )}
        {question.starterCode && Object.keys(question.starterCode).length > 0 && (
          <div className="mb-2"><b>Starter Code:</b>
            <ul className="list-disc ml-6">
              {Object.entries(question.starterCode).map(([lang, code]) => (
                <li key={lang}><b>{lang}:</b><pre className="bg-gray-800 p-2 rounded whitespace-pre-wrap text-blue-300">{code}</pre></li>
              ))}
            </ul>
          </div>
        )}
        {question.testCases && question.testCases.length > 0 && (
          <div className="mb-2"><b>Test Cases:</b>
            <ul className="list-disc ml-6">
              {question.testCases.map((tc, i) => (
                <li key={i}><b>Input:</b> {tc.input} <b>Output:</b> {tc.output} <b>Public:</b> {tc.is_public ? 'Yes' : 'No'}</li>
              ))}
            </ul>
          </div>
        )}
        {question.notes && <div className="mb-2"><b>Notes:</b> <span className="text-gray-200">{question.notes}</span></div>}
      </div>
    </div>
  );
}

export default function CreateQuestion({ onCreated, modalMode }) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [tags, setTags] = useState([]);
  const [category, setCategory] = useState('DSA');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [constraints, setConstraints] = useState('');
  const [examples, setExamples] = useState([{ input: '', output: '', explanation: '' }]);
  const [starterCode, setStarterCode] = useState({});
  const [notes, setNotes] = useState('');
  const [testCases, setTestCases] = useState([{ input: '', output: '', is_public: true }]);
  const [status, setStatus] = useState('draft');
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const navigate = useNavigate();
  const [isGlobal, setIsGlobal] = useState(false); // For admin: global or personal
  const [user, setUser] = useState(null);
  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    // Default to global for admin, personal for others
    if (u && JSON.parse(u).role === 'admin') setIsGlobal(true);
  }, []);

  // Tag selection
  const handleTagChange = (tag) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // Example management
  const addExample = () => setExamples(prev => [...prev, { input: '', output: '', explanation: '' }]);
  const removeExample = (idx) => setExamples(prev => prev.filter((_, i) => i !== idx));
  const handleExampleChange = (idx, field, value) => {
    setExamples(prev => {
      const arr = [...prev];
      arr[idx][field] = value;
      return arr;
    });
  };

  // Starter code per language
  const handleStarterCodeChange = (lang, value) => {
    setStarterCode(prev => ({ ...prev, [lang]: value }));
  };

  // Test case management
  const addTestCase = () => setTestCases(prev => [...prev, { input: '', output: '', is_public: true }]);
  const removeTestCase = (idx) => setTestCases(prev => prev.filter((_, i) => i !== idx));
  const handleTestCaseChange = (idx, field, value) => {
    setTestCases(prev => {
      const arr = [...prev];
      arr[idx][field] = value;
      return arr;
    });
  };

  // Validation
  const validate = () => {
    if (!title.trim() || !description.trim() || !inputFormat.trim() || !outputFormat.trim() || !constraints.trim()) return 'Please fill all required fields.';
    if (examples.some(e => !e.input.trim() || !e.output.trim())) return 'All examples must have input and output.';
    if (testCases.some(tc => !tc.input.trim() || !tc.output.trim())) return 'All test cases must have input and output.';
    return '';
  };

  // Submit
  const handleSubmit = async (publish = false) => {
    const err = validate();
    if (err) return setError(err);
    setError('');
    setLoading(true);
    try {
      // Ensure starterCode has all languages
      const fullStarterCode = { ...starterCode };
      LANGUAGES.forEach(lang => { if (!fullStarterCode[lang]) fullStarterCode[lang] = ''; });
      const payload = {
        title,
        difficulty,
        tags,
        category,
        topic,
        description,
        inputFormat,
        outputFormat,
        constraints,
        examples,
        starterCode: fullStarterCode,
        notes,
        status: publish ? 'published' : 'draft',
        testCases,
      };
      if (user && user.role === 'admin') payload.isGlobal = isGlobal;
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/questions`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.data || !res.data._id) throw new Error('Failed to save question');
      if (onCreated) {
        // Reset form
        setTitle(''); setDifficulty('Easy'); setTags([]); setCategory('DSA'); setTopic(''); setDescription(''); setInputFormat(''); setOutputFormat(''); setConstraints(''); setExamples([{ input: '', output: '', explanation: '' }]); setStarterCode({}); setNotes(''); setTestCases([{ input: '', output: '', is_public: true }]); setStatus('draft'); setPreview(false); setError('');
        onCreated(res.data);
      } else {
        navigate('/questions');
      }
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
  };

  // Preview panel (for modal)
  const previewData = {
    title,
    difficulty,
    tags,
    category,
    topic,
    description,
    inputFormat,
    outputFormat,
    constraints,
    examples,
    starterCode,
    notes,
    testCases,
  };

  return (
    <div className={modalMode ? 'max-h-[70vh] overflow-y-auto text-white' : 'min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white py-10'}>
      <div className={modalMode ? 'bg-gray-900 p-6 rounded-xl border border-gray-800 w-full max-w-2xl mx-auto mb-4' : 'w-full max-w-3xl p-8 bg-gray-900 rounded-xl shadow-xl border border-gray-800'}>
        <h2 className="text-2xl font-bold mb-6 text-blue-200">Create a New Question</h2>
        {/* Admin: Global/Personal Toggle */}
        {user && user.role === 'admin' && (
          <div className="mb-4">
            <label className="font-semibold text-blue-100">Question Bank</label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-2">
                <input type="radio" name="isGlobal" checked={isGlobal} onChange={() => setIsGlobal(true)} />
                Admin (Global)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="isGlobal" checked={!isGlobal} onChange={() => setIsGlobal(false)} />
                Personal
              </label>
            </div>
          </div>
        )}
        <div className="mb-2 text-xs text-gray-400">
          {user && user.role === 'admin'
            ? (isGlobal ? 'This question will be added to the global (admin) bank.' : 'This question will be added to your personal bank.')
            : 'This question will be added to your personal bank.'}
        </div>
        {/* Preview Modal */}
        {showPreviewModal && <QuestionPreviewModal question={previewData} onClose={() => setShowPreviewModal(false)} />}
        <form onSubmit={e => { e.preventDefault(); handleSubmit(false); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-blue-100">Title</label>
              <input type="text" className="w-full border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="font-semibold text-blue-100">Difficulty</label>
              <select className="w-full border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="font-semibold text-blue-100">Tags</label>
              <div className="flex flex-wrap gap-2">
                {TAGS.map(tag => (
                  <label key={tag} className={`px-2 py-1 rounded border cursor-pointer ${tags.includes(tag) ? 'bg-blue-900 border-blue-400 text-blue-200' : 'bg-gray-800 border-gray-700 text-gray-300'}`}>
                    <input type="checkbox" className="mr-1" checked={tags.includes(tag)} onChange={() => handleTagChange(tag)} />{tag}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="font-semibold text-blue-100">Category</label>
              <select className="w-full border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="font-semibold text-blue-100">Topic <span className="text-gray-400 text-xs">(optional)</span></label>
              <input type="text" className="w-full border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded" value={topic} onChange={e => setTopic(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="font-semibold text-blue-100">Description (Markdown supported)</label>
            <textarea className="w-full border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded min-h-[80px]" value={description} onChange={e => setDescription(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-blue-100">Input Format</label>
              <input type="text" className="w-full border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded" value={inputFormat} onChange={e => setInputFormat(e.target.value)} required />
            </div>
            <div>
              <label className="font-semibold text-blue-100">Output Format</label>
              <input type="text" className="w-full border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded" value={outputFormat} onChange={e => setOutputFormat(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="font-semibold text-blue-100">Constraints</label>
            <textarea className="w-full border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded min-h-[40px]" value={constraints} onChange={e => setConstraints(e.target.value)} required />
          </div>
          <div>
            <label className="font-semibold text-blue-100">Examples with Explanation</label>
            {examples.map((ex, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-2 mb-2">
                <input type="text" placeholder="Input" className="border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded flex-1" value={ex.input} onChange={e => handleExampleChange(idx, 'input', e.target.value)} required />
                <input type="text" placeholder="Output" className="border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded flex-1" value={ex.output} onChange={e => handleExampleChange(idx, 'output', e.target.value)} required />
                <input type="text" placeholder="Explanation" className="border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded flex-1" value={ex.explanation} onChange={e => handleExampleChange(idx, 'explanation', e.target.value)} />
                <button type="button" className="text-red-400" onClick={() => removeExample(idx)} disabled={examples.length === 1}>Remove</button>
              </div>
            ))}
            <button type="button" className="text-blue-400 text-xs" onClick={addExample}>+ Add Example</button>
          </div>
          <div>
            <label className="font-semibold text-blue-100">Starter Code (per language)</label>
            {LANGUAGES.map(lang => (
              <div key={lang} className="mb-2">
                <label className="block text-sm font-semibold mb-1">{lang}</label>
                <textarea className="w-full border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded font-mono min-h-[40px]" value={starterCode[lang] || ''} onChange={e => handleStarterCodeChange(lang, e.target.value)} placeholder={`Starter code for ${lang}`} />
              </div>
            ))}
          </div>
          <div>
            <label className="font-semibold text-blue-100">Test Cases</label>
            {testCases.map((tc, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <input type="text" placeholder="Input" className="border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded flex-1" value={tc.input} onChange={e => handleTestCaseChange(idx, 'input', e.target.value)} required />
                <input type="text" placeholder="Expected Output" className="border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded flex-1" value={tc.output} onChange={e => handleTestCaseChange(idx, 'output', e.target.value)} required />
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={tc.is_public} onChange={e => handleTestCaseChange(idx, 'is_public', e.target.checked)} /> Public
                </label>
                <button type="button" className="text-red-400 text-xs" onClick={() => removeTestCase(idx)} disabled={testCases.length === 1}>Remove</button>
              </div>
            ))}
            <button type="button" className="text-blue-400 text-xs" onClick={addTestCase}>+ Add Test Case</button>
          </div>
          <div>
            <label className="font-semibold text-blue-100">Notes / Clarifications <span className="text-gray-400 text-xs">(optional)</span></label>
            <textarea className="w-full border border-gray-700 bg-gray-800 text-white px-2 py-1 rounded min-h-[40px]" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <ErrorAlert message={error} />
          <div className="flex gap-4 mt-4">
            <button type="button" className="bg-gray-800 text-gray-300 px-4 py-2 rounded border border-gray-700" onClick={() => handleSubmit(false)} disabled={loading}>Save as Draft</button>
            <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded border border-blue-700" onClick={() => handleSubmit(true)} disabled={loading}>Publish Question</button>
            <button type="button" className="bg-green-600 text-white px-4 py-2 rounded border border-green-700" onClick={() => setShowPreviewModal(true)}>{showPreviewModal ? 'Hide Preview' : 'Preview'}</button>
          </div>
        </form>
      </div>
    </div>
  );
} 