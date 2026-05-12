import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { FederacionProvider } from './context/FederacionContext'
import { AppShell } from './pages/AppShell'
import { EquipoFormPage } from './pages/EquipoFormPage'
import { EquiposPage } from './pages/EquiposPage'
import { InicioPage } from './pages/InicioPage'
import { LandingPage } from './pages/LandingPage'
import { RegistroFederacionPage } from './pages/RegistroFederacionPage'
import { ReportesPage } from './pages/ReportesPage'

export default function App() {
  return (
    <FederacionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/registro-federacion" element={<RegistroFederacionPage />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Navigate to="inicio" replace />} />
            <Route path="inicio" element={<InicioPage />} />
            <Route path="equipos" element={<EquiposPage />} />
            <Route path="equipos/nuevo" element={<EquipoFormPage />} />
            <Route path="equipos/:id/editar" element={<EquipoFormPage />} />
            <Route path="reportes" element={<ReportesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </FederacionProvider>
  )
}
