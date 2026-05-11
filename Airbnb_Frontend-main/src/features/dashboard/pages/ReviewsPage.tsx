import { useOutletContext } from 'react-router-dom'
import type { DashboardOutletContext } from '../utils/dashboardUtils'

export default function ReviewsPage() {
  const { dashboardData } = useOutletContext<DashboardOutletContext>()

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-950">Reviews</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {dashboardData.visibleReviews.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No reviews yet.</p>
        ) : (
          dashboardData.visibleReviews.map((review) => {
            const listing = dashboardData.visibleListings.find((item) => item.id === review.listingId)

            return (
              <div key={review.id} className="p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold text-slate-950">{listing?.title ?? 'Listing'}</p>
                  <p className="text-sm font-semibold text-[#f97316]">{review.rating}/5</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p>
                <p className="mt-3 text-sm text-slate-500">
                  {review.user.name} - {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}

