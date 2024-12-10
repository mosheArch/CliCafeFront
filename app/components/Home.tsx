'use client'

import { useState, useEffect, useRef } from 'react'
import { processCommand } from '../utils/commandProcessor'
import TerminalLine from './TerminalLine'
import CoffeePopup from './CoffeePopup'
import UserManual from './UserManual'
import Image from 'next/image'
import { refreshToken, setAuthToken, removeAuthToken, getCategories, getProducts, getCart, addToCart, updateCartItem, removeCartItem, createOrderFromCart, processPayment } from '../utils/api'

const TypingEffect: React.FC<{ text: string }> = ({ text }) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, [text]);

  return (
    <div className="flex items-center">
      <span>{displayText}</span>
      <span className={`ml-1 w-2 h-5 bg-green-400 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}></span>
    </div>
  );
};

interface UserProfile {
  id: number;
  email: string;
  name: string;
  apellido_paterno: string;
  apellido_materno: string;
  phone: string | null;
  full_name: string;
}

interface HomeProps {
  onBack: () => void;
  onLogout: () => void;
  userData: UserProfile | null;
}

const Home: React.FC<HomeProps> = ({ onBack, onLogout, userData }) => {
  const [lines, setLines] = useState<string[]>(['Bienvenido a CLIcafe Shop Terminal. Escribe "help" para ver los comandos disponibles.'])
  const [currentInput, setCurrentInput] = useState('')
  const [currentPath, setCurrentPath] = useState('~')
  const [showPopup, setShowPopup] = useState(false)
  const [coffeeInfo, setCoffeeInfo] = useState<{ name: string; price: string; description: string; imageUrl: string } | null>(null)
  const [terminalColor, setTerminalColor] = useState('green')
  const [showManual, setShowManual] = useState(false)
  const [showLoggingOut, setShowLoggingOut] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const refreshTokenInterval = setInterval(async () => {
      try {
        const storedRefreshToken = localStorage.getItem('refreshToken')
        if (storedRefreshToken) {
          const response = await refreshToken(storedRefreshToken)
          setAuthToken(response.access)
          localStorage.setItem('refreshToken', response.refresh)
        }
      } catch (error) {
        console.error('Error refreshing token:', error)
        handleLogout()
      }
    }, 4 * 60 * 1000) // Refresh token every 4 minutes

    return () => clearInterval(refreshTokenInterval)
  }, [])

  const handleLogout = () => {
    removeAuthToken()
    localStorage.removeItem('refreshToken')
    onLogout()
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const fullCommand = `${userData?.name || 'guest'}@shop:${currentPath}$ ${currentInput}`
      setLines(prev => [...prev, fullCommand])
      if (currentInput.toLowerCase() === 'exit') {
        handleLogout();
        return
      }
      if (currentInput.toLowerCase() === 'manual') {
        setShowManual(true);
        setCurrentInput('');
        return;
      }
      if (currentInput.toLowerCase().startsWith('color ')) {
        const newColor = currentInput.toLowerCase().split(' ')[1]
        if (['green', 'blue', 'red', 'yellow', 'purple'].includes(newColor)) {
          setTerminalColor(newColor)
          setLines(prev => [...prev, `Terminal color changed to ${newColor}`])
        } else {
          setLines(prev => [...prev, 'Invalid color. Options: green, blue, red, yellow, purple'])
        }
        setCurrentInput('')
        return
      }
      const output = await processCommand(currentInput, currentPath, userData?.name)
      setLines(prev => [...prev, ...output.output])
      setCurrentPath(output.newPath)
      setCurrentInput('')
      if (output.showPopup && output.coffeeInfo) {
        setShowPopup(true)
        setCoffeeInfo(output.coffeeInfo)
      }
    } else if (e.key === 'Backspace') {
      setCurrentInput(prev => prev.slice(0, -1))
    } else if (e.key.length === 1) {
      setCurrentInput(prev => prev + e.key)
    }
  }

  const closePopup = () => {
    setShowPopup(false)
    setCoffeeInfo(null)
  }

  const handleCloseClick = () => {
    setShowLoggingOut(true);
    setTimeout(() => {
      setShowLoggingOut(false);
      handleLogout();
    }, 2000);
  };

  return (
    <>
      <div className={`terminal-window w-full max-w-4xl`} style={{
        '--matrix-green': `var(--terminal-${terminalColor})`,
        color: `var(--terminal-${terminalColor})`
      } as React.CSSProperties}>
        <div className="terminal-header">
          <div className="flex">
            <div className="terminal-button terminal-close" onClick={handleCloseClick}></div>
            <div className="terminal-button terminal-minimize"></div>
            <div className="terminal-button terminal-maximize"></div>
          </div>
          <div className="terminal-title">CLIcafe Shop Terminal</div>
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
              isCommand={line.includes('clicafe@shop')}
            />
          ))}
          <div className="terminal-line">
            <span className="terminal-prompt">
              {userData?.name || 'guest'}@shop:{currentPath}$&nbsp;
            </span>
            <span>{currentInput}</span>
            <span className="terminal-cursor"></span>
          </div>
        </div>
      </div>
      {showPopup && coffeeInfo && (
        <CoffeePopup
          name={coffeeInfo.name}
          price={coffeeInfo.price}
          description={coffeeInfo.description}
          imageUrl={coffeeInfo.imageUrl}
          onClose={closePopup}
        />
      )}
      {showManual && (
        <UserManual onClose={() => setShowManual(false)} />
      )}
      {showLoggingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg text-green-400 flex flex-col items-center">
            <Image
              src="/clicafe-logo.png"
              alt="CLIcafe Logo"
              width={100}
              height={100}
              className="mb-4"
            />
            <div className="flex items-center">
              <span className="mr-2">$</span>
              <TypingEffect text="Cerrando sesión..." />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Home

