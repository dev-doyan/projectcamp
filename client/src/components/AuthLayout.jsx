import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div className="hidden lg:block">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Project management made simple
          </div>
          <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-white">
            Plan, ship, and collaborate in one place.
          </h1>
          <p className="mt-4 max-w-lg text-lg text-slate-300">
            Organize projects, assign tasks, invite your team, and attach files —
            all connected to your ProjectCamp backend.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-black/20">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-sm font-bold text-white">
                PC
              </span>
              <span className="text-xl font-bold text-slate-900">ProjectCamp</span>
            </Link>
            <h2 className="mt-6 text-2xl font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthInput({ label, id, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        id={id}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
        {...props}
      />
    </label>
  );
}

export function AuthButton({ children, loading, ...props }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}

export function AuthError({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {message}
    </div>
  );
}
