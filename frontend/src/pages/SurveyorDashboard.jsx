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
    // Minna / UTM polygon points (Easting / Northing)
    points: [
      { easting: '', northing: '' },
      { easting: '', northing: '' },
      { easting: '', northing: '' },
      { easting: '', northing: '' },
    ],
    surveyorName: 'Licensed Surveyor',
    surveyorLicense: SURVEYOR_LICENSE,
    hasSurveyPlan: false,
    surveyPlanNumber: '',
    hasDeedOfAssignment: false,
    deedOfAssignmentDate: '',
    hasTaxClearance: false,
    taxClearanceYear: '',
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
      const cleanedPoints = form.points
        .map((p) => ({
          easting: parseFloat(p.easting),
          northing: parseFloat(p.northing),
        }))
        .filter(
          (p) =>
            Number.isFinite(p.easting) &&
            Number.isFinite(p.northing)
        )

      if (cleanedPoints.length < 4) {
        setLoading(false)
        setMessage({
          type: 'error',
          text: 'Please provide at least 4 valid Minna / UTM points (Easting and Northing).',
        })
        return
      }

      await createParcel({
        ...form,
        points: cleanedPoints,
      })
      setMessage({ type: 'success', text: 'Land parcel submitted to Pending queue (cryptographic signature applied).' })
      setForm({
        ...form,
        ownerName: '',
        nin: '',
        phone: '',
        landDescription: '',
        points: [
          { easting: '', northing: '' },
          { easting: '', northing: '' },
          { easting: '', northing: '' },
          { easting: '', northing: '' },
        ],
      })
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
            <div className="md:col-span-2 border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Supporting documents (prototype)</h3>
              <p className="text-xs text-gray-600 mb-3">
                This section mirrors key Nigerian land registration documents for demo purposes only. It does <strong>not</strong> replace
                official state land registry processes.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={form.hasSurveyPlan}
                      onChange={(e) => setForm({ ...form, hasSurveyPlan: e.target.checked })}
                    />
                    <span>Survey Plan available</span>
                  </label>
                  {form.hasSurveyPlan && (
                    <input
                      type="text"
                      placeholder="Survey Plan No. / File Ref"
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={form.surveyPlanNumber}
                      onChange={(e) => setForm({ ...form, surveyPlanNumber: e.target.value })}
                    />
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={form.hasDeedOfAssignment}
                      onChange={(e) => setForm({ ...form, hasDeedOfAssignment: e.target.checked })}
                    />
                    <span>Deed of Assignment / Conveyance</span>
                  </label>
                  {form.hasDeedOfAssignment && (
                    <input
                      type="date"
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={form.deedOfAssignmentDate}
                      onChange={(e) => setForm({ ...form, deedOfAssignmentDate: e.target.value })}
                    />
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={form.hasTaxClearance}
                      onChange={(e) => setForm({ ...form, hasTaxClearance: e.target.checked })}
                    />
                    <span>Tax Clearance on file</span>
                  </label>
                  {form.hasTaxClearance && (
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      placeholder="Tax year (e.g. 2025)"
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={form.taxClearanceYear}
                      onChange={(e) => setForm({ ...form, taxClearanceYear: e.target.value })}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="md:col-span-2 border border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Coordinate points (Minna / UTM)</h3>
              <p className="text-xs text-gray-600 mb-3">
                Enter at least 4 survey points using Nigerian Minna Datum (UTM) coordinates. Each point is a pair of Easting (X) and
                Northing (Y). These points form the polygon used by the blockchain logic for area and overlap checks.
              </p>
              <div className="space-y-3">
                {form.points.map((pt, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                    <div className="text-xs text-gray-500 font-medium md:col-span-1 flex items-center justify-between">
                      Point {idx + 1}
                      {form.points.length > 4 && (
                        <button
                          type="button"
                          className="text-[11px] text-red-600 hover:underline ml-2"
                          onClick={() => {
                            const next = form.points.filter((_, i) => i !== idx)
                            setForm({ ...form, points: next })
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Easting (X)</label>
                      <input
                        type="number"
                        step="any"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        value={pt.easting}
                        onChange={(e) => {
                          const next = [...form.points]
                          next[idx] = { ...next[idx], easting: e.target.value }
                          setForm({ ...form, points: next })
                        }}
                      />
                    </div>
                    <div className="md:col-span-1 md:col-start-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Northing (Y)</label>
                      <input
                        type="number"
                        step="any"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        value={pt.northing}
                        onChange={(e) => {
                          const next = [...form.points]
                          next[idx] = { ...next[idx], northing: e.target.value }
                          setForm({ ...form, points: next })
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mt-3 text-xs font-medium text-ng-green hover:underline"
                onClick={() =>
                  setForm({
                    ...form,
                    points: [...form.points, { easting: '', northing: '' }],
                  })
                }
              >
                + Add another point (irregular plot)
              </button>
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
