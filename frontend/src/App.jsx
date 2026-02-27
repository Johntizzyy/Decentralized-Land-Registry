import { Routes, Route, Navigate } from 'react-router-dom'
import RoleSelect from './pages/RoleSelect'
import SurveyorDashboard from './pages/SurveyorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ReviewParcel from './pages/ReviewParcel'
import PublicVerify from './pages/PublicVerify'

function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelect />} />
      <Route path="/surveyor" element={<SurveyorDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/review/:id" element={<ReviewParcel />} />
      <Route path="/verify" element={<PublicVerify />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
