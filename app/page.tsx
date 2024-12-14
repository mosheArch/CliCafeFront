'use client'

import React, { useState, useEffect } from 'react'
import MatrixBackground from './components/MatrixBackground'
import MainMenu from './components/MainMenu'
import Home from './components/Home'
import AuthTerminal from './components/AuthTerminal'
import { setAuthToken, UserProfile, getUserProfile } from './utils/api'
import axios from 'axios';

export default function Page() {
  const [currentView, setCurrentView] = useState<'auth' | 'menu' | 'prepare'>('auth')
  const [loggedInUser, setLoggedInUser] = useState<UserProfile | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken')
    if (storedToken) {
      setAuthToken(storedToken)
      getUserProfile().then(profile => {
        console.log('User profile loaded:', profile);
        setLoggedInUser(profile)
        setCurrentView('prepare')
      }).catch(error => {
        console.error('Error fetching user profile:', error)
        // Si hay un error 403, eliminamos el token y volvemos a la pantalla de autenticación
        if (axios.isAxiosError(error) && error.response && error.response.status === 403) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          setAuthToken('')
        }
        setCurrentView('auth')
      })
    }
  }, [])

  const handleLogin = async (userData: UserProfile & { accessToken: string; refreshToken: string }) => {
    console.log('User logged in:', userData);
    setLoggedInUser(userData);
    setCurrentView('menu');
    setShowWelcome(true);
    localStorage.setItem('accessToken', userData.accessToken);
    localStorage.setItem('refreshToken', userData.refreshToken);
    setAuthToken(userData.accessToken);

    try {
      const profile = await getUserProfile();
      console.log('User profile after login:', profile);
      setLoggedInUser(profile);
    } catch (error) {
      console.error('Error fetching user profile after login:', error);
      // Manejar el error aquí, posiblemente mostrando un mensaje al usuario
    }

    setTimeout(() => {
      setShowWelcome(false);
      setTimeout(() => setCurrentView('prepare'), 500);
    }, 3000);
  };

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
            <MainMenu username={loggedInUser?.name} />
          </div>
        )}
        {currentView === 'prepare' && (
          <Home onBack={handleBack} onLogout={handleLogout} userData={loggedInUser} />
        )}
      </div>
    </main>
  )
}

