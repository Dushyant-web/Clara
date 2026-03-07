import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { ThemeProvider } from './contexts/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <NotificationProvider>
                    <ThemeProvider>
                        <App />
                    </ThemeProvider>
                </NotificationProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
