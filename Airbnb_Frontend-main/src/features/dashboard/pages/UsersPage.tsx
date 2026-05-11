import { useEffect, useState } from 'react'
import { FiPower, FiUserCheck } from 'react-icons/fi'
import { useOutletContext } from 'react-router-dom'
import { getAuthUsers, subscribeToAuthChange, updateUserStatus } from '../../auth/authStorage'
import type { User } from '../../auth/types'
import type { DashboardOutletContext } from '../utils/dashboardUtils'
import UserAvatar from '../components/UserAvatar'

export default function UsersPage() {
  const { dashboardData, currentUser } = useOutletContext<DashboardOutletContext>()
  const [users, setUsers] = useState<User[]>(dashboardData.users)

  useEffect(() => {
    return subscribeToAuthChange(() => setUsers(getAuthUsers()))
  }, [])

  const handleStatusToggle = (user: User) => {
    updateUserStatus(user.id, user.isActive === false)
    setUsers(getAuthUsers())
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#eadfdb] bg-white shadow-sm">
      <div className="border-b border-[#f0e5e1] px-6 py-5">
        <h2 className="text-xl font-bold text-[#292626]">Users list</h2>
        <p className="mt-1 text-sm text-[#857d7a]">{users.length} registered mock users</p>
      </div>
      <div className="overflow-hidden bg-[#f8fafc] px-3 py-3">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-separate border-spacing-y-2 text-left text-sm whitespace-nowrap">
          <thead className="text-xs uppercase tracking-[0.16em] text-white">
            <tr className="bg-slate-950 shadow-sm">
              <th className="rounded-l-xl px-5 py-4 font-semibold">User</th>
              <th className="px-5 py-4 font-semibold">Email</th>
              <th className="px-5 py-4 font-semibold">Role</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Phone</th>
              <th className="px-5 py-4 font-semibold">Joined</th>
              <th className="rounded-r-xl px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user.id}
                className={`shadow-sm transition hover:bg-[#fff1ec] ${
                  index % 2 === 0 ? 'bg-white' : 'bg-[#fff8f5]'
                }`}
              >
                <td className="rounded-l-xl px-5 py-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} size="md" />
                    <div className="min-w-0">
                      <p className="max-w-44 truncate font-semibold text-[#292626]">{user.name}</p>
                      <p className="max-w-44 truncate text-xs text-slate-500">@{user.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-600">{user.email}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-lg border px-3 py-1 text-xs font-semibold ${
                    user.isActive === false
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}>
                    {user.isActive === false ? 'Inactive' : 'Active'}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-600">{user.phone}</td>
                <td className="px-5 py-4 text-slate-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="rounded-r-xl px-5 py-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleStatusToggle(user)}
                      disabled={user.id === currentUser.id}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        user.isActive === false
                          ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {user.isActive === false ? <FiUserCheck /> : <FiPower />}
                      {user.isActive === false ? 'Activate' : 'Deactivate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </section>
  )
}

