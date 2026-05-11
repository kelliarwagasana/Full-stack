import { useState, type ChangeEvent, type FormEvent } from 'react'
import { FiEdit3, FiSave, FiUpload, FiUser, FiX } from 'react-icons/fi'
import { useOutletContext } from 'react-router-dom'
import { updateProfile } from '../../auth/authStorage'
import type { DashboardOutletContext } from '../utils/dashboardUtils'
import UserAvatar from '../components/UserAvatar'

export default function ProfilePage() {
  const { currentUser } = useOutletContext<DashboardOutletContext>()
  const [name, setName] = useState(currentUser.name)
  const [username, setUsername] = useState(currentUser.username)
  const [phone, setPhone] = useState(currentUser.phone)
  const [avatar, setAvatar] = useState(currentUser.avatar ?? '')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [avatarFileName, setAvatarFileName] = useState('')

  const previewUser = {
    ...currentUser,
    name,
    avatar: avatar.trim() || undefined,
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')

    const result = updateProfile(currentUser.id, {
      name,
      username,
      phone,
      avatar,
    })

    if (!result.success) {
      setError(result.error)
      return
    }

    setMessage('Profile updated successfully.')
    setIsEditing(false)
  }

  const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setAvatar(String(reader.result))
      setAvatarFileName(file.name)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const handleCancelEdit = () => {
    setName(currentUser.name)
    setUsername(currentUser.username)
    setPhone(currentUser.phone)
    setAvatar(currentUser.avatar ?? '')
    setAvatarFileName('')
    setError('')
    setMessage('')
    setIsEditing(false)
  }

  return (
    <section className="rounded-2xl border border-[#eadfdb] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <UserAvatar user={previewUser} size="xl" className="ring-4 ring-[#ffe0d7]" />
          <div>
            <p className="text-sm font-semibold uppercase text-[#ff432e]">{currentUser.role}</p>
            <h2 className="mt-2 text-3xl font-bold text-[#292626]">{name || currentUser.name}</h2>
            <p className="mt-1 text-sm text-[#857d7a]">{currentUser.email}</p>
          </div>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setMessage('')
              setError('')
              setIsEditing(true)
            }}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#ff432e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e93623]"
          >
            <FiEdit3 />
            Update profile
          </button>
        )}
      </div>

      {isEditing && (
      <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-[#eadfdb] bg-[#fff8f5] p-5 md:col-span-2">
          <div className="grid gap-6 lg:grid-cols-[14rem_1fr] lg:items-center">
            <div className="mx-auto flex h-52 w-52 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-lg shadow-[#ffd6ce]">
              {avatar ? (
                <img src={avatar} alt={`${name || currentUser.name} preview`} className="h-full w-full object-cover" />
              ) : (
                <UserAvatar user={previewUser} size="xl" className="h-full w-full rounded-full text-4xl" />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold uppercase text-[#ff432e]">Avatar preview</p>
              <h3 className="mt-2 text-2xl font-bold text-[#292626]">
                Review your image before saving
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#857d7a]">
                Choose an image from your computer. It will be previewed here first, then saved to your profile when you click Save profile.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#ff432e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e93623]">
                  <FiUpload />
                  {avatar ? 'Change image' : 'Upload image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="sr-only"
                  />
                </label>

                {avatar && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatar('')
                      setAvatarFileName('')
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <FiX />
                    Remove image
                  </button>
                )}
              </div>

              <p className="mt-4 rounded-xl border border-[#eadfdb] bg-white px-4 py-3 text-sm font-semibold text-[#473f3d]">
                {avatarFileName || (avatar ? 'Current saved avatar' : 'No image selected yet')}
              </p>
            </div>
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Full name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#ff432e] focus:ring-2 focus:ring-[#ff432e]/20"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Username</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#ff432e] focus:ring-2 focus:ring-[#ff432e]/20"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Phone</span>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#ff432e] focus:ring-2 focus:ring-[#ff432e]/20"
            required
          />
        </label>

        <div className="rounded-xl border border-[#eadfdb] bg-[#fff8f5] p-5">
          <p className="text-sm font-medium text-[#857d7a]">Email</p>
          <p className="mt-2 font-semibold text-[#292626]">{currentUser.email}</p>
        </div>

        <div className="rounded-xl border border-[#eadfdb] bg-[#fff8f5] p-5">
          <p className="text-sm font-medium text-[#857d7a]">Role</p>
          <p className="mt-2 font-semibold text-[#292626]">{currentUser.role}</p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 md:col-span-2">
            {error}
          </p>
        )}

        {message && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 md:col-span-2">
            {message}
          </p>
        )}

        <div className="flex flex-wrap gap-3 md:col-span-2">
          <button
            type="submit"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#ff432e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e93623]"
          >
            <FiSave />
            Save profile
          </button>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <FiX />
            Cancel
          </button>
        </div>
      </form>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {[
          { label: 'Profile status', value: currentUser.isActive === false ? 'Inactive' : 'Active' },
          { label: 'Avatar', value: avatar ? 'Custom avatar set' : 'Using initials' },
          { label: 'Joined', value: new Date(currentUser.createdAt).toLocaleDateString() },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-[#eadfdb] bg-[#fff8f5] p-5">
            <FiUser className="mb-3 text-[#ff432e]" />
            <p className="text-sm font-medium text-[#857d7a]">{item.label}</p>
            <p className="mt-2 font-semibold text-[#292626]">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

