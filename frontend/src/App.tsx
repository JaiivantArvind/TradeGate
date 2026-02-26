import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import CalculatorPage from './pages/CalculatorPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

