'use client'

import { useState, useEffect, useRef } from 'react'
import { processCommand } from '../utils/commandProcessor'
import TerminalLine from './TerminalLine'
import CoffeePopup from './CoffeePopup'
import UserManual from './UserManual'
import Image from 'next/image'
import { refreshToken, setAuthToken, removeAuthToken } from '../utils/api'

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

const SystemInfoTypingEffect: React.FC<{ info: { time: string; date: string; ip: string } }> = ({ info }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const fullText = `[${info.time}] ${info.date} - IP: ${info.ip}`;

  useEffect(() => {
    setCurrentIndex(0);
    setDisplayText('');
  }, [info]);

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, fullText]);

  return <div className="mb-2 font-mono text-sm opacity-80">{displayText}</div>;
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
  const [staticLines, setStaticLines] = useState<string[]>(['Bienvenido a CLIcafe Shop Terminal. Escribe "help" para ver los comandos disponibles.'])
  const [systemInfo, setSystemInfo] = useState({ time: '', date: '', ip: 'Cargando...' });
  const [currentInput, setCurrentInput] = useState('')
  const [currentPath, setCurrentPath] = useState('~')
  const [showPopup, setShowPopup] = useState(false)
  const [coffeeInfo, setCoffeeInfo] = useState<{ name: string; price: string; description: string; imageUrl?: string } | null>(null)
  const [terminalColor, setTerminalColor] = useState('green')
  const [showManual, setShowManual] = useState(false)
  const [showLoggingOut, setShowLoggingOut] = useState(false)
  const [systemHeader, setSystemHeader] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch IP only once when component mounts
  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const ip = data.ip;
        const now = new Date();
        const systemInfo = [
          `CLIcafe ip-${ip.replace(/\./g, '-')} 1.0.0-coffee-roast #1 SMP PREEMPT_DYNAMIC Arabica 1.0.1 (${now.toISOString().split('T')[0]}) x86_64`,
          '',
          'Los granos incluidos con el sistema CLIcafe son café de comercio justo;',
          'los términos exactos de distribución para cada variedad se describen en',
          'los archivos individuales en /usr/share/doc/*/origen-del-cafe.',
          '',
          'CLIcafe viene con ABSOLUTAMENTE NINGUNA GARANTÍA, en la medida',
          'permitida por la ley aplicable.',
          `Último inicio de sesión: ${now.toUTCString()} desde ${ip}`
        ];
        setSystemHeader(systemInfo);
        setSystemInfo(prev => ({ ...prev, ip }));
      } catch (error) {
        console.error('Error fetching IP:', error);
        setSystemInfo(prev => ({ ...prev, ip: 'No disponible' }));
      }
    };

    fetchSystemInfo();
  }, []);

  // Update time every second in the existing systemInfo line
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setSystemInfo(prev => ({
        ...prev,
        time: now.toLocaleTimeString(),
        date: now.toLocaleDateString(),
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
    }, 4 * 60 * 1000)

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
  }, [staticLines])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCommand = `${userData?.name || 'guest'}@clicafe:${currentPath}$ ${currentInput}`
    setStaticLines(prev => [...prev, fullCommand])
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
        setStaticLines(prev => [...prev, `Terminal color changed to ${newColor}`])
      } else {
        setStaticLines(prev => [...prev, 'Invalid color. Options: green, blue, red, yellow, purple'])
      }
      setCurrentInput('')
      return
    }
    const output = await processCommand(currentInput, currentPath, userData?.name)
    setStaticLines(prev => [...prev, ...output.output])
    setCurrentPath(output.newPath)
    setCurrentInput('')
    if (output.showPopup && output.coffeeInfo) {
      setShowPopup(true)
      setCoffeeInfo(output.coffeeInfo)
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

  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <>
      <div
        className={`terminal-window w-full max-w-4xl`}
        style={{
          '--matrix-green': `var(--terminal-${terminalColor})`,
          color: `var(--terminal-${terminalColor})`
        } as React.CSSProperties}
        onClick={handleTerminalClick}
      >
        <div className="terminal-header">
          <div className="flex">
            <div className="terminal-button terminal-close" onClick={handleCloseClick}></div>
            <div className="terminal-button terminal-minimize"></div>
            <div className="terminal-button terminal-maximize"></div>
          </div>
          <div className="terminal-title">CLIcafe Shop Terminal - {userData?.name || 'Guest'}</div>
          <div className="w-[68px]"></div>
        </div>
        <div
          ref={terminalRef}
          className="terminal-body"
        >
          {systemHeader.map((line, index) => (
            <div key={index} className="mb-1 font-mono text-sm opacity-80">{line}</div>
          ))}
          <SystemInfoTypingEffect info={systemInfo} />
          {staticLines.map((line, index) => (
            <TerminalLine
              key={index}
              content={line}
              isCommand={line.includes('@clicafe')}
            />
          ))}
          <form onSubmit={handleSubmit} className="flex items-center mt-2">
            <span className="terminal-prompt mr-2 whitespace-nowrap">
              {userData?.name || 'guest'}@clicafe:{currentPath}$
            </span>
            <input
              ref={inputRef}
              type="text"
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

