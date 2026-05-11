import { useOutletContext } from 'react-router-dom'
import type { DashboardOutletContext } from '../utils/dashboardUtils'
import UserAvatar from '../components/UserAvatar'

export default function GuestsPage() {
  const { dashboardData } = useOutletContext<DashboardOutletContext>()

  return (
    <section className="overflow-hidden rounded-2xl border border-[#eadfdb] bg-white shadow-sm">
      <div className="border-b border-[#f0e5e1] px-6 py-5">
        <h2 className="text-xl font-bold text-[#292626]">Guest list</h2>
        <p className="mt-1 text-sm text-[#857d7a]">{dashboardData.guests.length} guests with bookings</p>
      </div>
      <div className="overflow-hidden bg-[#f8fafc] px-3 py-3">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left text-sm whitespace-nowrap">
          <thead className="text-xs uppercase tracking-[0.16em] text-white">
            <tr className="bg-slate-950 shadow-sm">
              <th className="rounded-l-xl px-5 py-4 font-semibold">Guest</th>
              <th className="px-5 py-4 font-semibold">Email</th>
              <th className="px-5 py-4 font-semibold">Phone</th>
              <th className="rounded-r-xl px-5 py-4 font-semibold">Role</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.guests.map((guest, index) => (
              <tr
                key={guest.id}
                className={`shadow-sm transition hover:bg-[#fff1ec] ${
                  index % 2 === 0 ? 'bg-white' : 'bg-[#fff8f5]'
                }`}
              >
                <td className="rounded-l-xl px-5 py-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={guest} size="md" />
                    <span className="font-semibold text-[#292626]">{guest.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-600">{guest.email}</td>
                <td className="px-5 py-4 text-slate-600">{guest.phone}</td>
                <td className="rounded-r-xl px-5 py-4">
                  <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                    {guest.role}
                  </span>
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

