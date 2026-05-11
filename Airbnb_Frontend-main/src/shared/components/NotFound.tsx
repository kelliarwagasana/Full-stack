import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-10 shadow-lg shadow-slate-200/30">
          <p className="text-sm uppercase tracking-[0.35em] text-[#ff432e] font-semibold">404</p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900">Page not found</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            The page you are looking for does not exist or may have been moved.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex rounded-full bg-[#ff432e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e93623]"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  )
}

