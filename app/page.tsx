'use client'

import React, { useState, useEffect } from 'react'
import MatrixBackground from './components/MatrixBackground'
import MainMenu from './components/MainMenu'
import Home from './components/Home'
import AuthTerminal from './components/AuthTerminal'
import { setAuthToken } from './utils/api'

export default function Page() {
  const [currentView, setCurrentView] = useState<'auth' | 'menu' | 'prepare'>('auth')
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken')
    if (storedToken) {
      setAuthToken(storedToken)
      setCurrentView('prepare')
    }
  }, [])

  const handleLogin = (username: string, accessToken: string, refreshToken: string) => {
    setLoggedInUser(username)
    setCurrentView('menu')
    setShowWelcome(true)
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setAuthToken(accessToken)

    // Change to prepare view after 3 seconds
    setTimeout(() => {
      setShowWelcome(false)
      setTimeout(() => setCurrentView('prepare'), 500) // Wait for transition to finish
    }, 3000)
  }

  const handleBack = () => {
    setCurrentView('menu')
  }

  const handleLogout = () => {
    setLoggedInUser(null)
    setCurrentView('auth')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  return (
    <main className="relative w-full min-h-screen overflow-hidden">
      <MatrixBackground />
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
        {currentView === 'auth' && (
          <AuthTerminal onLogin={handleLogin} />
        )}
        {currentView === 'menu' && (
          <div className={`transition-opacity duration-500 ${showWelcome ? 'opacity-100' : 'opacity-0'}`}>
            <MainMenu username={loggedInUser} />
          </div>
        )}
        {currentView === 'prepare' && (
          <Home onBack={handleBack} onLogout={handleLogout} username={loggedInUser || 'guest'} />
        )}
      </div>
    </main>
  )
}