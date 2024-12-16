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
  const [awaitingPassword, setAwaitingPassword] = useState<string | null>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
    if (awaitingPassword) {
      try {
        const { access, refresh, userProfile } = await login({ email: awaitingPassword, password: input })
        setIsConnecting(true)
        console.log('Login successful in AuthTerminal. User profile:', userProfile);
        setTimeout(() => {
          onLogin({
            ...userProfile,
            accessToken: access,
            refreshToken: refresh
          });
        }, 2000)
        setAwaitingPassword(null)
        return ['Por favor espere...']
      } catch (error) {
        console.error('Login error in AuthTerminal:', error);
        setAwaitingPassword(null)
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return ['Error: Credenciales incorrectas. Por favor, intente nuevamente.']
        } else {
          return ['Error: Ocurrió un problema durante el inicio de sesión. Por favor, intente nuevamente.']
        }
      }
    }

    const [command, ...args] = input.toLowerCase().split(' ')

    switch (command) {
      case 'ssh':
        if (args[0] === '-i' && args[1] && args[1].includes('@')) {
          setAwaitingPassword(args[1])
          return ['Ingrese la contraseña:']
        }
        return ['Uso: ssh -i correo@ejemplo.com']

      case 'register':
        setShowRegisterForm(true)
        return ['Abriendo formulario de registro...']

      case 'passwd':
        if (args[0] && args[0].includes('@')) {
          try {
            const response = await resetPassword(args[0])
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
        return ['Uso incorrecto. Utiliza: passwd correo@ejemplo.com']

      case 'help':
      case 'manual':
        return [
          'Comandos disponibles:',
          'ssh -i correo@ejemplo.com: Inicia sesión',
          'register: Inicia el proceso de registro',
          'passwd correo@ejemplo.com: Restablece la contraseña',
          'help o manual: Muestra esta lista de comandos'
        ]

      default:
        return ['Comando no reconocido. Escribe "help" para ver los comandos disponibles.']
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCommand = awaitingPassword ? '********' : `clicafe@auth:~$ ${currentInput}`
    setLines(prev => [...prev, fullCommand])
    const output = await processCommand(currentInput)
    setLines(prev => [...prev, ...output])
    setCurrentInput('')
  }

  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="relative w-full max-w-4xl">
      <div className={`terminal-window w-full`} onClick={handleTerminalClick}>
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
          <form onSubmit={handleSubmit} className="flex items-center mt-2">
            <span className="terminal-prompt mr-2 whitespace-nowrap">
              {awaitingPassword ? 'Password: ' : 'clicafe@auth:~$ '}
            </span>
            <input
              ref={inputRef}
              type={awaitingPassword ? 'password' : 'text'}
              value={currentInput}
              onChange={handleInputChange}
              className="flex-grow bg-transparent border-none outline-none"
              aria-label="Terminal input"
              style={{ wordBreak: 'break-all' }}
            />
            <button type="submit" className="sr-only">Enviar</button>
          </form>
        </div>
      </div>
      <div className="absolute top-20 right-12 m-60">
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

