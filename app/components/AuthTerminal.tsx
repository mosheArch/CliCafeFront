'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import TerminalLine from './TerminalLine'
import UserManual from './UserManual'
import RegisterForm from './RegisterModal'
import { register, login, resetPassword, setAuthToken, UserProfile } from '../utils/api'
import axios from 'axios';

interface AuthTerminalProps {
  onLogin: (userData: UserProfile & { accessToken: string; refreshToken: string }) => void;
}

const AuthTerminal: React.FC<AuthTerminalProps> = ({ onLogin }) => {
  const [lines, setLines] = useState<string[]>(['Bienvenido a CLIcafe Terminal. Escribe "help" para ver los comandos disponibles.'])
  const [currentInput, setCurrentInput] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showManual, setShowManual] = useState(false)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  useEffect(() => {
    if (isConnecting) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            clearInterval(timer)
            setIsConnecting(false)
            return 0
          }
          const diff = Math.random() * 10
          return Math.min(oldProgress + diff, 100)
        })
      }, 200)

      return () => {
        clearInterval(timer)
      }
    }
  }, [isConnecting])

  const processCommand = async (input: string) => {
    const [command, ...args] = input.toLowerCase().split(' ')

    switch (command) {
      case 'login':
        const loginUser = args.find(arg => arg.startsWith('--user='))?.split('=')[1]
        const loginPassword = args.find(arg => arg.startsWith('--password='))?.split('=')[1]
        if (loginUser && loginPassword) {
          try {
            const { access, refresh, userProfile } = await login({ email: loginUser, password: loginPassword })
            setIsConnecting(true)
            console.log('Login successful in AuthTerminal. User profile:', userProfile);
            setTimeout(() => {
              onLogin({
                ...userProfile,
                accessToken: access,
                refreshToken: refresh
              });
            }, 2000)
            return ['Iniciando sesión...', 'Por favor espere...']
          } catch (error) {
            console.error('Login error in AuthTerminal:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
              return ['Error: Credenciales incorrectas. Por favor, intente nuevamente.']
            } else {
              return ['Error: Ocurrió un problema durante el inicio de sesión. Por favor, intente nuevamente.']
            }
          }
        }
        return ['Uso: login --user=correo@ejemplo.com --password=contraseña']

      case 'register':
        setShowRegisterForm(true)
        return ['Abriendo formulario de registro...']

      case 'reset-password':
        const resetUser = args.find(arg => arg.startsWith('--user='))?.split('=')[1]
        if (resetUser) {
          try {
            const response = await resetPassword(resetUser)
            return [`Respuesta del servidor: ${JSON.stringify(response)}`]
          } catch (error) {
            if (axios.isAxiosError(error)) {
              if (error.response) {
                return [`Error del servidor: ${error.response.status} - ${JSON.stringify(error.response.data)}`]
              } else if (error.request) {
                return ['Error: No se recibió respuesta del servidor. Por favor, verifique su conexión a internet.']
              } else {
                return [`Error al configurar la solicitud: ${error.message}`]
              }
            } else {
              return [`Error inesperado: ${error instanceof Error ? error.message : String(error)}`]
            }
          }
        }
        return ['Uso incorrecto. Utiliza: reset-password --user=correoelectronico']

      case 'help':
      case 'manual':
        return [
          'Comandos disponibles:',
          'login --user=correo@ejemplo.com --password=contraseña: Inicia sesión',
          'register: Inicia el proceso de registro',
          'reset-password --user=correo@ejemplo.com: Restablece la contraseña',
          'help o manual: Muestra esta lista de comandos'
        ]

      default:
        return ['Comando no reconocido. Escribe "help" para ver los comandos disponibles.']
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const fullCommand = `clicafe@auth:~$ ${currentInput}`
      setLines(prev => [...prev, fullCommand])
      const output = await processCommand(currentInput)
      setLines(prev => [...prev, ...output])
      setCurrentInput('')
    } else if (e.key === 'Backspace') {
      setCurrentInput(prev => prev.slice(0, -1))
    } else if (e.key.length === 1) {
      setCurrentInput(prev => prev + e.key)
    }
  }

  return (
    <div className="relative w-full max-w-4xl">
      <div className={`terminal-window w-full`}>
        <div className="terminal-header">
          <div className="flex">
            <div className="terminal-button terminal-close"></div>
            <div className="terminal-button terminal-minimize"></div>
            <div className="terminal-button terminal-maximize"></div>
          </div>
          <div className="terminal-title">CLIcafe Authentication Terminal</div>
          <div className="w-[68px]"></div>
        </div>
        <div
          ref={terminalRef}
          className="terminal-body"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {lines.map((line, index) => (
            <TerminalLine
              key={index}
              content={line}
              isCommand={line.includes('@')}
            />
          ))}
          {isConnecting && (
            <div className="my-2">
              <div className="h-5 bg-gray-700 rounded overflow-hidden">
                <div
                  className="h-full bg-green-500 flex items-center transition-all duration-200"
                  style={{ width: `${progress}%` }}
                >
                  {Array.from({ length: Math.floor(progress / 5) }).map((_, index) => (
                    <span key={index} className="text-black font-bold">{'>>'}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="terminal-line">
            <span className="terminal-prompt">
              clicafe@auth:~$&nbsp;
            </span>
            <span>{currentInput}</span>
            <span className="terminal-cursor"></span>
          </div>
        </div>
      </div>
      <div className="absolute top-80 right-10 m-18">
        <Image
          src="/TazaCafelogo.png"
          alt="CLIcafe Logo"
          width={250}
          height={250}
          className="rounded-full"
        />
      </div>
      {showManual && (
        <UserManual onClose={() => setShowManual(false)} />
      )}
      {showRegisterForm && (
        <RegisterForm
          onClose={() => setShowRegisterForm(false)}
          onRegisterSuccess={() => {
            setShowRegisterForm(false);
            setLines(prev => [...prev, 'Registro exitoso. Por favor, inicie sesión con sus nuevas credenciales.']);
          }}
        />
      )}
    </div>
  )
}

export default AuthTerminal

