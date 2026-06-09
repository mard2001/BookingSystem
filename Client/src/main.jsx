import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext.jsx';


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Toaster position="top-right" richColors />
      <AuthProvider>
        <App />
      </AuthProvider>
  </BrowserRouter>,
)
