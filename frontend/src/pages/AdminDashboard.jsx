import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getParcels } from '../api'

export default function AdminDashboard() {
  const [pending, setPending] = useState([])

  useEffect(() => {
    getParcels({ status: 'PENDING' }).then(setPending).catch(() => setPending([]))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Ministry Admin Portal</h1>
            <p className="text-sm text-gray-300">Surveyor-General's Office — Pending land registrations</p>
          </div>
          <Link to="/" className="text-sm underline">Exit to home</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="bg-white rounded-xl shadow overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-800 p-4 border-b">Pending land registrations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Land ID</th>
                  <th className="text-left p-3">Owner</th>
                  <th className="text-left p-3">Surveyor</th>
                  <th className="text-left p-3">Submitted</th>
                  <th className="text-left p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.length === 0 && (
                  <tr><td colSpan={5} className="p-4 text-gray-500">No pending registrations.</td></tr>
                )}
                {pending.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3 font-mono">{p.landId}</td>
                    <td className="p-3">{p.ownerName}</td>
                    <td className="p-3">{p.surveyorName || p.surveyorLicense || '—'}</td>
                    <td className="p-3 text-gray-600">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <Link
                        to={`/admin/review/${p.id}`}
                        className="text-ng-green font-medium hover:underline"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
