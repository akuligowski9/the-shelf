import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import './index.css'

import { AuthProvider } from './context/AuthContext'
import AppShell from './components/layout/AppShell'
import ShelfView from './views/ShelfView'
import TodayView from './views/TodayView'
import ProgressView from './views/ProgressView'
import ReviewView from './views/ReviewView'
import AttentionView from './views/AttentionView'
import SettingsView from './views/SettingsView'
import LoginView from './views/LoginView'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/shelf" replace />} />
            <Route path="shelf" element={<ShelfView />} />
            <Route path="today" element={<TodayView />} />
            <Route path="progress" element={<ProgressView />} />
            <Route path="review" element={<ReviewView />} />
            <Route path="attention" element={<AttentionView />} />
            <Route path="settings" element={<SettingsView />} />
            <Route path="login" element={<LoginView />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
