import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t-2 border-black bg-black px-6 py-14 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-white/20 pb-10 lg:grid-cols-[1.2fr_0.8fr_1fr]">
          <div>
            <Link to="/" className="text-5xl font-black uppercase tracking-tight">
              List<span className="text-[#f97316]">On.</span>
            </Link>
            <p className="mt-5 max-w-sm leading-7 text-white/70">
              Curated places, trusted hosts, and simple booking for memorable stays.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-black uppercase tracking-[0.12em] text-[#f97316]">Stay Connected</h3>
            <p className="mt-6 text-white/75">1123 Fictional St, San Francisco, CA 94103</p>
            <p className="mt-4 font-semibold">(123) 456-7890</p>
            <p className="mt-2 font-semibold">support@ListOn.com</p>
          </div>

          <div>
            <h3 className="text-xl font-black uppercase tracking-[0.12em] text-[#f97316]">Newsletter</h3>
            <div className="mt-6 flex border-2 border-white p-2">
              <input
                type="email"
                placeholder="name@example.com"
                className="min-h-12 flex-1 bg-transparent px-4 font-semibold text-white outline-none placeholder:text-white/55"
              />
              <button type="button" className="h-12 w-12 bg-[#f97316] font-black transition hover:bg-white hover:text-black">
                -&gt;
              </button>
            </div>
            <div className="mt-6 flex gap-3">
              {['ig', 'tw', 'fb', 'wa'].map((item) => (
                <span
                  key={item}
                  className="flex h-11 w-11 items-center justify-center border border-white/30 bg-white/10 text-sm font-bold uppercase transition hover:border-[#f97316] hover:text-[#f97316]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-7 text-white/65 md:flex-row md:items-center md:justify-between">
          <p>© 2026 ListOn - All Rights Reserved</p>
          <p>Privacy / Sitemap / Cookies</p>
        </div>
      </div>
    </footer>
  )
}

