import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f7f8fa]">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl font-bold text-slate-300">404</div>
        <div className="text-slate-700 font-semibold text-lg mt-2">
          Page not found
        </div>
        <div className="text-slate-500 text-sm mt-2">
          The page you're looking for doesn't exist.
        </div>
        <Link
          to="/"
          className="inline-block mt-4 px-4 py-2 bg-[#0b69ff] text-white rounded hover:opacity-90"
        >
          Back to Service Explorer
        </Link>
      </div>
    </div>
  );
}