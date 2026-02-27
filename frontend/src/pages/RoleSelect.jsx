import { Link } from 'react-router-dom'

export default function RoleSelect() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ng-green to-ng-green-dark flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Decentralized Land Registry System
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Surveyor-General's Office · NIMC Identity Link
        </p>

        <Link
          to="/surveyor"
          className="block w-full py-4 px-6 mb-4 rounded-xl bg-ng-green text-white font-semibold hover:bg-ng-green-dark transition"
        >
          Login as Surveyor
        </Link>
        <Link
          to="/admin"
          className="block w-full py-4 px-6 mb-4 rounded-xl bg-gray-700 text-white font-semibold hover:bg-gray-800 transition"
        >
          Login as Ministry Admin
        </Link>
        <Link
          to="/verify"
          className="block w-full py-3 px-6 rounded-xl border-2 border-ng-green text-ng-green font-semibold hover:bg-ng-green hover:text-white transition"
        >
          Public Verification (C of O Status)
        </Link>
      </div>
    </div>
  )
}
