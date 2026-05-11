import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FiBriefcase, FiEdit3, FiSave, FiUpload, FiUser, FiX } from 'react-icons/fi'
import Navbar from '../../../shared/components/Navbar'
import UserAvatar from '../../dashboard/components/UserAvatar'
import { becomeHost, getCurrentUser, subscribeToAuthChange, updateProfile } from '../authStorage'

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser())
  const [name, setName] = useState(currentUser?.name ?? '')
  const [username, setUsername] = useState(currentUser?.username ?? '')
  const [phone, setPhone] = useState(currentUser?.phone ?? '')
  const [avatar, setAvatar] = useState(currentUser?.avatar ?? '')
  const [avatarFileName, setAvatarFileName] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    return subscribeToAuthChange(() => {
      const user = getCurrentUser()
      setCurrentUser(user)

      if (user && !isEditing) {
        setName(user.name)
        setUsername(user.username)
        setPhone(user.phone)
        setAvatar(user.avatar ?? '')
      }
    })
  }, [isEditing])

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f7f3f0] text-slate-900">
        <Navbar variant="solid" />
        <main className="mx-auto max-w-3xl px-5 py-16">
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-3xl font-black text-slate-950">Login required</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Please login to view and update your profile.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex rounded-xl bg-[#f97316] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#000000]"
            >
              Login
            </Link>
          </section>
        </main>
      </div>
    )
  }

  const previewUser = {
    ...currentUser,
    name,
    avatar: avatar.trim() || undefined,
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

    setCurrentUser(result.user)
    setMessage('Profile updated successfully.')
    setAvatarFileName('')
    setIsEditing(false)
  }

  const handleCancel = () => {
    setName(currentUser.name)
    setUsername(currentUser.username)
    setPhone(currentUser.phone)
    setAvatar(currentUser.avatar ?? '')
    setAvatarFileName('')
    setError('')
    setMessage('')
    setIsEditing(false)
  }

  const handleBecomeHost = () => {
    setMessage('')
    setError('')

    const result = becomeHost(currentUser.id)

    if (!result.success) {
      setError(result.error)
      return
    }

    setCurrentUser(result.user)
    setMessage('You are now a host. Open the dashboard to add and manage listings.')
  }

  return (
    <div className="min-h-screen bg-[#f7f3f0] text-slate-900">
      <Navbar variant="solid" />
      <main className="mx-auto max-w-6xl px-5 py-8">
        <section className="overflow-hidden rounded-3xl border border-[#eadfdb] bg-white shadow-xl shadow-slate-900/5">
          <div className="bg-slate-950 px-6 py-10 text-white md:px-10">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#f97316]">Guest profile</p>
            <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <UserAvatar user={previewUser} size="xl" className="ring-4 ring-white/20" />
                <div>
                  <h1 className="text-4xl font-black tracking-tight">{name || currentUser.name}</h1>
                  <p className="mt-2 text-sm text-white/70">{currentUser.email}</p>
                </div>
              </div>
              {!isEditing && (
                <div className="flex flex-wrap gap-3">
                  {currentUser.role === 'GUEST' && (
                    <button
                      type="button"
                      onClick={handleBecomeHost}
                      className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                    >
                      <FiBriefcase />
                      Become host
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMessage('')
                      setError('')
                      setIsEditing(true)
                    }}
                    className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#f97316] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#000000]"
                  >
                    <FiEdit3 />
                    Update profile
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 md:p-10">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-[#eadfdb] bg-[#fff8f5] p-5 md:col-span-2">
                  <div className="grid gap-6 lg:grid-cols-[14rem_1fr] lg:items-center">
                    <div className="mx-auto flex h-52 w-52 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-lg shadow-[#fed7aa]">
                      {avatar ? (
                        <img src={avatar} alt={`${name || currentUser.name} preview`} className="h-full w-full object-cover" />
                      ) : (
                        <UserAvatar user={previewUser} size="xl" className="h-full w-full rounded-full text-4xl" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#f97316]">Avatar preview</p>
                      <h2 className="mt-2 text-2xl font-black text-slate-950">Upload from your computer</h2>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                        Pick an image, preview it here, then save your profile when it looks right.
                      </p>
                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#f97316] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#000000]">
                          <FiUpload />
                          {avatar ? 'Change image' : 'Upload image'}
                          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="sr-only" />
                        </label>
                        {avatar && (
                          <button
                            type="button"
                            onClick={() => {
                              setAvatar('')
                              setAvatarFileName('')
                            }}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
                          >
                            <FiX />
                            Remove image
                          </button>
                        )}
                      </div>
                      <p className="mt-4 rounded-xl border border-[#eadfdb] bg-white px-4 py-3 text-sm font-bold text-slate-700">
                        {avatarFileName || (avatar ? 'Current saved avatar' : 'No image selected yet')}
                      </p>
                    </div>
                  </div>
                </div>

                <ProfileInput label="Full name" value={name} onChange={setName} />
                <ProfileInput label="Username" value={username} onChange={setUsername} />
                <ProfileInput label="Phone" value={phone} onChange={setPhone} />

                <div className="rounded-xl border border-[#eadfdb] bg-[#fff8f5] p-5">
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="mt-2 font-bold text-slate-950">{currentUser.email}</p>
                </div>

                {error && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 md:col-span-2">
                    {error}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 md:col-span-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#f97316] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#000000]"
                  >
                    <FiSave />
                    Save profile
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <FiX />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                {message && (
                  <p className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                    {message}
                  </p>
                )}

                {error && (
                  <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {error}
                  </p>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { label: 'Username', value: currentUser.username },
                    { label: 'Phone', value: currentUser.phone },
                    { label: 'Joined', value: new Date(currentUser.createdAt).toLocaleDateString() },
                    { label: 'Role', value: currentUser.role },
                    { label: 'Status', value: currentUser.isActive === false ? 'Inactive' : 'Active' },
                    { label: 'Avatar', value: currentUser.avatar ? 'Custom avatar set' : 'Using initials' },
                    { label: 'Hosting', value: currentUser.role === 'HOST' ? 'Host access enabled' : 'Guest account' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-[#eadfdb] bg-[#fff8f5] p-5">
                      <FiUser className="mb-3 text-[#f97316]" />
                      <p className="text-sm font-medium text-slate-500">{item.label}</p>
                      <p className="mt-2 font-bold text-slate-950">{item.value}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

function ProfileInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20"
        required
      />
    </label>
  )
}
