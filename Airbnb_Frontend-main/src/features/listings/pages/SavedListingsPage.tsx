import Navbar from '../../../shared/components/Navbar'
import SavedListings from '../components/SavedListings'

export default function SavedListingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar variant="solid" />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#ff432e]">Saved</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Listings to book later</h1>
        </div>
        <SavedListings />
      </main>
    </div>
  )
}

