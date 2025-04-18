import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    // StrictMode is commented out to prevent double API calls in development
    // <React.StrictMode>
        <App />
    // </React.StrictMode>
)
