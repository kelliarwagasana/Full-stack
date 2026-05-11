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
    <p className={`text-sm font-black uppercase tracking-[0.35em] ${light ? 'text-white' : 'text-[#f97316]'}`}>
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
    <div className="relative min-h-screen bg-white text-black">
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${listingsData[0].photos[0]?.url})` }}
      />
      <div
        className={`fixed inset-0 transition-all duration-500 ${
          isScrolled ? 'bg-white/95' : 'bg-black/55'
        }`}
      />
      <div
        className={`fixed inset-0 bg-gradient-to-b transition-all duration-500 ${
          isScrolled
            ? 'from-white/90 via-white/70 to-white/100'
            : 'from-black/10 via-black/30 to-black/95'
        }`}
      />

      <Navbar />

      <main className={`relative ${isScrolled ? 'pt-24' : ''}`}>
        <section className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-end gap-10 px-6 pb-16 pt-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="w-full max-w-4xl space-y-7 border-l-8 border-[#f97316] pl-6 text-left"
          >
            <motion.p
              variants={fadeUp}
              className={`text-sm font-semibold uppercase tracking-[0.35em] ${
                isScrolled ? 'text-black/70' : 'text-white/85'
              }`}
            >
              Orange-label stays worldwide
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className={`max-w-3xl text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl lg:text-7xl ${
                isScrolled ? 'text-black' : 'text-white'
              }`}
            >
              Stays with a sharper point of view.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className={`max-w-2xl text-base leading-8 text-xs ${
                isScrolled ? 'text-black/70' : 'text-white/85'
              }`}
            >
              Browse curated apartments, houses, villas, and cabins. Book securely and discover authentic experiences worldwide.
            </motion.p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="w-full border-2 border-black bg-white p-4 shadow-[12px_12px_0_#f97316] lg:ml-auto lg:max-w-md"
          >
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#f97316]">Start here</p>
            <h2 className="mt-3 text-3xl font-black text-black">Build your shortlist</h2>
            <div className="mt-6 grid gap-3">
              <label className="grid gap-2 border-2 border-black bg-white px-4 py-3">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-black/50">Search</span>
                <input
                  type="search"
                  placeholder="Search places, cities..."
                  className="w-full bg-transparent text-sm font-bold text-black outline-none placeholder:text-black/35"
                />
              </label>
              <label className="grid gap-2 border-2 border-black bg-white px-4 py-3 rounded-xl shadow-md">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-black/50">Location</span>
                <select className="w-full bg-transparent text-sm font-bold text-black outline-none">
                  <option>Location</option>
                  <option>Tulum, Mexico</option>
                  <option>Lisbon, Portugal</option>
                  <option>Tokyo, Japan</option>
                </select>
              </label>
              <Link
                to="/explore"
                className="inline-flex items-center justify-center border-2 border-black bg-[#f97316] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-black"
              >
                Explore stays
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="relative z-10 border-y-2 border-black bg-white">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <div className="mb-10 grid gap-6 border-b-2 border-black pb-8 md:grid-cols-[0.8fr_1.2fr_auto] md:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.35em] text-[#f97316]">Featured properties</p>
              </div>
              <h2 className="text-3xl font-black text-black sm:text-5xl">
                Handpicked homes, rebuilt into a bolder catalog.
              </h2>
              <Link
                to="/explore"
                className="inline-flex items-center justify-center border-2 border-black bg-black px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#f97316]"
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
        <section className="relative z-10 overflow-hidden border-b-2 border-black py-28 text-white">
          <img
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/75" />
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="relative mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-[0.45fr_1fr] md:items-end"
          >
            <div>
              <ScriptLabel>Testimonial</ScriptLabel>
              <h2 className="mt-3 text-5xl font-black leading-tight">A stay that matched the brief.</h2>
            </div>
            <div className="border-l-8 border-[#f97316] pl-6">
              <p className="max-w-4xl text-2xl leading-10 text-white/90">
                ListOn helped us find a stay that matched the photos, the neighborhood, and the mood of the trip.
              </p>
              <p className="mt-8 text-sm font-bold uppercase tracking-[0.24em] text-[#f97316]">Mark South Everett</p>
            </div>
          </motion.div>
        </section>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  )
}

