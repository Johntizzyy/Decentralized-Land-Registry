import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { createParcel, getParcels } from '../api'

const SURVEYOR_LICENSE = 'SURV-NG-001'

export default function SurveyorDashboard() {
  const [form, setForm] = useState({
    ownerName: '',
    nin: '',
    phone: '',
    landDescription: '',
    latitude: '',
    longitude: '',
    surveyorName: 'Licensed Surveyor',
    surveyorLicense: SURVEYOR_LICENSE,
  })
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const loadSubmissions = async () => {
    try {
      const data = await getParcels({ surveyorLicense: SURVEYOR_LICENSE })
      setSubmissions(data)
    } catch {
      setMessage({ type: 'error', text: 'Failed to load submissions' })
    }
  }

  useEffect(() => {
    loadSubmissions()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      await createParcel({
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      })
      setMessage({ type: 'success', text: 'Land parcel submitted to Pending queue (cryptographic signature applied).' })
      setForm({ ...form, ownerName: '', nin: '', phone: '', landDescription: '', latitude: '', longitude: '' })
      loadSubmissions()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-ng-green text-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Surveyor Portal</h1>
            <p className="text-sm text-green-100">Surveyor-General's Office — Register land parcel</p>
          </div>
          <Link to="/" className="text-sm underline">Exit to home</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Register new land parcel</h2>
          {message.text && (
            <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIN (NIMC Identity Link)</label>
              <input
                type="text"
                required
                placeholder="e.g. 12345678901"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={form.nin}
                onChange={(e) => setForm({ ...form, nin: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Land Description</label>
              <textarea
                required
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={form.landDescription}
                onChange={(e) => setForm({ ...form, landDescription: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 6.5244"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 3.3792"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-ng-green text-white font-semibold hover:bg-ng-green-dark disabled:opacity-50"
              >
                {loading ? 'Submitting…' : 'Submit (simulate signature → Pending)'}
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white rounded-xl shadow overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-800 p-4 border-b">My Submissions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Land ID</th>
                  <th className="text-left p-3">Owner</th>
                  <th className="text-left p-3">C of O Status</th>
                  <th className="text-left p-3">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 && (
                  <tr><td colSpan={4} className="p-4 text-gray-500">No submissions yet.</td></tr>
                )}
                {submissions.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3 font-mono">{p.landId}</td>
                    <td className="p-3">{p.ownerName}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded ${p.status === 'VERIFIED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {p.status === 'VERIFIED' ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{new Date(p.createdAt).toLocaleDateString()}</td>
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
