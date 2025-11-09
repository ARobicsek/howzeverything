import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import './index.css'

// Initialize Eruda mobile debugger
// Access with ?debug=true in URL or in development mode
const params = new URLSearchParams(window.location.search);
const enableDebug = params.get('debug') === 'true' || import.meta.env.DEV;

if (enableDebug) {
  import('eruda').then(eruda => {
    eruda.default.init();
    console.log('📱 Eruda mobile debugger initialized - tap the floating button to open console');
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)