import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '../../../shared/components/Navbar'
import Footer from '../../../shared/components/Footer'
import ListingCard from '../../listings/components/ListingCard'
import { listingsData } from '../../../data/listings'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

function ScriptLabel({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <p className={`font-[cursive] text-3xl italic ${light ? 'text-white' : 'text-[#ff432e]'}`}>
      {children}
    </p>
  )
}

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const featuredListings = listingsData.slice(0, 4)


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative min-h-screen bg-white text-[#171b22]">
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${listingsData[0].photos[0]?.url})` }}
      />
      <div
        className={`fixed inset-0 transition-all duration-500 ${
          isScrolled ? 'bg-white/95' : 'bg-slate-900/40'
        }`}
      />
      <div
        className={`fixed inset-0 bg-gradient-to-b transition-all duration-500 ${
          isScrolled
            ? 'from-white/90 via-white/70 to-white/100'
            : 'from-transparent via-slate-900/30 to-slate-950/95'
        }`}
      />

      <Navbar />

      <main className={`relative ${isScrolled ? 'pt-24' : ''}`}>
        <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-24">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="mx-auto w-full max-w-4xl space-y-6 text-center"
          >
            <motion.p
              variants={fadeUp}
              className={`text-sm font-semibold uppercase tracking-[0.35em] ${
                isScrolled ? 'text-slate-600' : 'text-slate-200/90'
              }`}
            >
              Premium vacation rentals worldwide
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className={`text-5xl font-bold leading-tight tracking-[-0.04em] sm:text-6xl lg:text-7xl ${
                isScrolled ? 'text-slate-900' : 'text-white'
              }`}
            >
              Find your perfect stay
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className={`mx-auto max-w-2xl text-base leading-8 sm:text-lg ${
                isScrolled ? 'text-slate-600' : 'text-slate-200/90'
              }`}
            >
              Browse curated apartments, houses, villas, and cabins. Book securely and discover authentic experiences worldwide.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className={`mx-auto mt-10 flex w-full max-w-3xl flex-col gap-4 rounded-full border p-2 shadow-2xl backdrop-blur-xl sm:flex-row sm:px-4 ${
                isScrolled ? 'border-slate-200 bg-white/90' : 'border-white/10 bg-white/10'
              }`}
            >
              <label className={`flex flex-1 items-center gap-3 rounded-full px-4 py-4 shadow-sm ${isScrolled ? 'bg-slate-100' : 'bg-white/90'}`}>
                <input
                  type="search"
                  placeholder="Search places, cities..."
                  className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
              </label>
              <label className={`flex flex-1 items-center gap-3 rounded-full px-4 py-4 shadow-sm ${isScrolled ? 'bg-slate-100' : 'bg-white/90'}`}>
                <select className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none">
                  <option>Location</option>
                  <option>Tulum, Mexico</option>
                  <option>Lisbon, Portugal</option>
                  <option>Tokyo, Japan</option>
                </select>
              </label>
              <Link
                to="/explore"
                className="inline-flex min-w-[12rem] items-center justify-center rounded-full bg-[#ff432e] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#e93623] sm:min-w-[12rem]"
              >
                Explore stays
              </Link>
            </motion.div>
          </motion.div>
        </section>

        <section className="relative z-10 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#ff432e]">Featured properties</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                  Handpicked homes for your next adventure.
                </h2>
              </div>
              <Link
                to="/explore"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-white"
              >
                Explore more
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>    
        <section className="relative z-10 overflow-hidden py-28 text-center text-white">
          <img
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="relative mx-auto max-w-5xl px-6"
          >
            <ScriptLabel>Testimonial</ScriptLabel>
            <h2 className="mt-3 text-5xl font-semibold leading-tight">See What Our Clients Say About Us</h2>
            <p className="mx-auto mt-10 max-w-4xl text-2xl leading-10 text-white/90">
              ListOn helped us find a stay that matched the photos, the neighborhood, and the mood of the trip.
            </p>
            <p className="mt-8 text-sm font-bold uppercase tracking-[0.24em]">Mark South Everett</p>
          </motion.div>
        </section>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  )
}

