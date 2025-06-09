import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { MusicProvider } from './contexts/MusicContext'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <MusicProvider>
    <App />
    </MusicProvider>
  </BrowserRouter>
);
