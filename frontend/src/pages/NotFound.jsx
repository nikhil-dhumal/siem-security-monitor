import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center shadow-xl">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-4 text-slate-400">Page not found.</p>
        <Link to="/" className="mt-6 inline-flex rounded-xl bg-sky-500 px-5 py-3 text-base font-semibold text-slate-950 hover:bg-sky-400">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
