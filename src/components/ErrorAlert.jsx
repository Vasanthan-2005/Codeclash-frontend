export default function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div className="bg-red-500/10 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
      {message}
    </div>
  );
} 