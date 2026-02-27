import { useState } from 'react'
import { Link } from 'react-router-dom'
import { verifyLand } from '../api'

export default function PublicVerify() {
  const [input, setInput] = useState('')
  const [byHash, setByHash] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    setLoading(true)
    setSearched(true)
    setResult(null)
    try {
      const data = await verifyLand(input.trim(), byHash)
      setResult(data)
    } catch {
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-ng-green text-white shadow">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Public Verification</h1>
            <p className="text-sm text-green-100">C of O Status · Surveyor-General's Office</p>
          </div>
          <Link to="/" className="text-sm underline">Home</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-gray-600 mb-6">
          Enter a Land ID or scan a simulated QR code (paste Land ID or SHA-256 hash below) to verify status.
        </p>

        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex gap-2 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={!byHash} onChange={() => setByHash(false)} />
              <span>Land ID</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={byHash} onChange={() => setByHash(true)} />
              <span>SHA-256 Hash</span>
            </label>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={byHash ? 'Paste SHA-256 hash' : 'e.g. NG-LAND-XXXX-XXXX'}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-ng-green text-white font-medium hover:bg-ng-green-dark disabled:opacity-50"
            >
              {loading ? 'Checking…' : 'Verify'}
            </button>
          </div>
        </form>

        {searched && (
          <div className="bg-white rounded-xl shadow p-6">
            {result ? (
              <>
                <h2 className="font-semibold text-gray-800 mb-4">Verification result</h2>
                <dl className="space-y-2">
                  <div><dt className="text-gray-500 text-sm">Land ID</dt><dd className="font-mono">{result.landId}</dd></div>
                  <div><dt className="text-gray-500 text-sm">Owner Name</dt><dd className="font-medium">{result.ownerName}</dd></div>
                  <div><dt className="text-gray-500 text-sm">C of O Status</dt>
                    <dd>
                      <span className={`px-2 py-1 rounded ${result.status === 'VERIFIED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {result.status === 'VERIFIED' ? 'Verified' : 'Pending'}
                      </span>
                    </dd>
                  </div>
                  {result.sha256Hash && (
                    <div><dt className="text-gray-500 text-sm">Digital fingerprint (SHA-256)</dt><dd className="font-mono text-xs break-all">{result.sha256Hash}</dd></div>
                  )}
                </dl>
              </>
            ) : (
              <p className="text-gray-500">No land record found for the supplied details.</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
