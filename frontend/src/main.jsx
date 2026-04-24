import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import GlobalErrorBoundary from './components/ui/GlobalErrorBoundary'
import App from './App.jsx'
import './index.css'

// PWA registration disabled — vite-plugin-pwa@1.2.0 is incompatible with Vite 8
// Re-enable when the plugin adds Vite 8 support

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <GlobalErrorBoundary>
              <App />
            </GlobalErrorBoundary>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
