import { useState, type ChangeEvent, type FormEvent } from 'react'
import { FiImage, FiUpload, FiX } from 'react-icons/fi'
import { AnimatePresence, motion } from 'framer-motion'
import type { Listing } from '../../listings/types'

interface AddListingFormProps {
  listing?: Listing | null
  onClose?: () => void
}

export default function AddListingForm({ listing, onClose }: AddListingFormProps) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [photos, setPhotos] = useState(() =>
    listing?.photos.map((photo) => ({
      id: photo.id,
      url: photo.url,
      name: 'Saved listing image',
    })) ?? [],
  )
  const isEditing = Boolean(listing)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (photos.length === 0) {
      setError('Please upload at least one listing image from your computer.')
      setMessage('')
      return
    }

    setError('')
    setMessage(isEditing ? 'Listing updated as a mock draft.' : 'Listing saved as a mock draft.')
  }

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])

    if (files.length === 0) {
      return
    }

    const invalidFile = files.find((file) => !file.type.startsWith('image/'))

    if (invalidFile) {
      setError('Please upload image files only.')
      return
    }

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        setPhotos((current) => [
          ...current,
          {
            id: `${file.name}-${file.lastModified}-${Date.now()}`,
            url: String(reader.result),
            name: file.name,
          },
        ])
        setError('')
      }
      reader.readAsDataURL(file)
    })

    event.target.value = ''
  }

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((current) => current.filter((photo) => photo.id !== photoId))
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#eadfdb] bg-white p-6 shadow-sm">
      <motion.div
        className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.24 }}
      >
        <div>
          <p className="text-sm font-semibold uppercase text-[#f97316]">
            {isEditing ? 'Update listing' : 'New listing'}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#292626]">
            {isEditing ? listing?.title : 'Add listing'}
          </h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            aria-label="Close listing form"
          >
            <FiX />
          </button>
        )}
      </motion.div>

      <motion.div
        className="mt-6 grid gap-5 md:grid-cols-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.035,
              delayChildren: 0.12,
            },
          },
        }}
      >
        {[
          { label: 'Title', name: 'title', defaultValue: listing?.title },
          { label: 'Location', name: 'location', defaultValue: listing?.location },
          { label: 'Price per night', name: 'price', type: 'number', defaultValue: listing?.pricePerNight },
          { label: 'Guests', name: 'guests', type: 'number', defaultValue: listing?.guest },
        ].map((field) => (
          <motion.label
            key={field.name}
            className="block"
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <span className="text-sm font-semibold text-slate-700">{field.label}</span>
            <input
              name={field.name}
              type={field.type ?? 'text'}
              defaultValue={field.defaultValue}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20"
              required
            />
          </motion.label>
        ))}

        <motion.label
          className="block"
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <span className="text-sm font-semibold text-slate-700">Type</span>
          <select
            name="type"
            defaultValue={listing?.type ?? ''}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20"
            required
          >
            <option value="">Select type</option>
            <option value="APARTMENT">Apartment</option>
            <option value="HOUSE">House</option>
            <option value="VILLA">Villa</option>
            <option value="CABIN">Cabin</option>
          </select>
        </motion.label>

        <motion.div
          className="md:col-span-2"
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <span className="text-sm font-semibold text-slate-700">Listing images</span>
          <div className="mt-2 rounded-2xl border border-dashed border-[#fed7aa] bg-[#fff8f5] p-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-white bg-white px-5 py-8 text-center shadow-sm transition hover:border-[#fed7aa] hover:bg-[#fff7ed]">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff7ed] text-xl text-[#f97316]">
                <FiUpload />
              </span>
              <span className="mt-3 text-sm font-bold text-slate-950">Upload images from computer</span>
              <span className="mt-1 text-xs font-medium text-slate-500">
                JPG, PNG, or WEBP. You can select more than one image.
              </span>
              <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="sr-only" />
            </label>

            {photos.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {photos.map((photo) => (
                    <motion.div
                      key={photo.id}
                      layout
                      initial={{ opacity: 0, y: 16, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.22 }}
                      className="group relative overflow-hidden rounded-xl border border-white bg-white shadow-sm"
                    >
                      <img src={photo.url} alt={photo.name} className="h-36 w-full object-cover" />
                      <div className="flex items-center justify-between gap-3 p-3">
                        <p className="truncate text-xs font-bold text-slate-700">{photo.name}</p>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
                          aria-label={`Remove ${photo.name}`}
                        >
                          <FiX />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                className="mt-4 flex items-center gap-3 rounded-xl border border-[#eadfdb] bg-white px-4 py-3 text-sm font-semibold text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <FiImage className="text-[#f97316]" />
                No listing image selected yet.
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.label
          className="block md:col-span-2"
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <span className="text-sm font-semibold text-slate-700">Amenities</span>
          <input
            name="amenities"
            placeholder="WiFi, Pool, Parking"
            defaultValue={listing?.amenities.join(', ')}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20"
            required
          />
        </motion.label>
      </motion.div>

      <AnimatePresence>
        {message && (
          <motion.p
            className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {message}
          </motion.p>
        )}

        {error && (
          <motion.p
            className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        className="mt-6 rounded-xl bg-[#f97316] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#000000]"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        {isEditing ? 'Update listing' : 'Save listing'}
      </motion.button>
    </form>
  )
}

