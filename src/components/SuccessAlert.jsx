export default function SuccessAlert({ message }) {
  if (!message) return null;
  return (
    <div className="bg-green-500/10 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 text-center flex items-center justify-center gap-2">
      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      <span>{message}</span>
    </div>
  );
} 