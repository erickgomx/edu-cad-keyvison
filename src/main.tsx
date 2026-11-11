import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { SchoolProvider } from './context/SchoolContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SchoolProvider>
      <App />
    </SchoolProvider>
  </React.StrictMode>,
)
