import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getParcel, approveParcel } from '../api'

export default function ReviewParcel() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [parcel, setParcel] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    getParcel(id).then(setParcel).catch(() => setParcel(null))
  }, [id])

  const handleApprove = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      const updated = await approveParcel(id)
      setParcel(updated)
      setMessage({ type: 'success', text: `C of O verified. Digital land title fingerprint (SHA-256): ${updated.sha256Hash?.slice(0, 16)}…` })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (!parcel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    )
  }

  const isVerified = parcel.status === 'VERIFIED'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Review land parcel</h1>
            <p className="text-sm text-gray-300 font-mono">{parcel.landId}</p>
          </div>
          <Link to="/admin" className="text-sm underline">← Back to Admin</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
          <div className="p-6 border-b">
            <h2 className="font-semibold text-gray-800 mb-4">Owner & NIMC</h2>
            <dl className="grid gap-2 md:grid-cols-2">
              <div><dt className="text-gray-500 text-sm">Owner Name</dt><dd className="font-medium">{parcel.ownerName}</dd></div>
              <div><dt className="text-gray-500 text-sm">NIN (NIMC Identity Link)</dt><dd className="font-mono">{parcel.nin}</dd></div>
              <div><dt className="text-gray-500 text-sm">Phone</dt><dd>{parcel.phone}</dd></div>
            </dl>
          </div>
          <div className="p-6 border-b">
            <h2 className="font-semibold text-gray-800 mb-2">Land Description</h2>
            <p className="text-gray-700">{parcel.landDescription}</p>
          </div>
          <div className="p-6 border-b">
            <h2 className="font-semibold text-gray-800 mb-2">Geospatial coordinates</h2>
            <p className="font-mono">Lat: {parcel.latitude}, Long: {parcel.longitude}</p>
          </div>
          <div className="p-6 border-b">
            <h2 className="font-semibold text-gray-800 mb-2">Surveyor info</h2>
            <p>{parcel.surveyorName || '—'} · {parcel.surveyorLicense || '—'}</p>
          </div>
          {isVerified && (
            <div className="p-6 bg-green-50">
              <h2 className="font-semibold text-green-800 mb-2">C of O Status: Verified</h2>
              <p className="text-sm text-gray-600 mb-1">Digital land title fingerprint (SHA-256):</p>
              <p className="font-mono text-xs break-all">{parcel.sha256Hash}</p>
              {parcel.verifiedAt && <p className="text-sm text-gray-500 mt-2">Verified at: {new Date(parcel.verifiedAt).toLocaleString()}</p>}
            </div>
          )}
        </div>

        {!isVerified && (
          <div className="flex gap-4">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-ng-green text-white font-semibold hover:bg-ng-green-dark disabled:opacity-50"
            >
              {loading ? 'Approving…' : 'Approve (set Verified + generate SHA-256 fingerprint)'}
            </button>
            <Link to="/admin" className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
              Cancel
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
