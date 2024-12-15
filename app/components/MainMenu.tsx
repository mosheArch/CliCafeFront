import React, { useState, useEffect } from 'react'
import Image from 'next/image'

interface MainMenuProps {
  username: string | null | undefined;
}

const MainMenu: React.FC<MainMenuProps> = ({ username }) => {
  const [cursorVisible, setCursorVisible] = useState(true);
  const [text, setText] = useState('');
  const fullText = '>';

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);

    let index = 0;
    const textInterval = setInterval(() => {
      if (index < fullText.length) {
        setText(prev => prev + fullText[index]);
        index++;
      } else {
        clearInterval(textInterval);
      }
    }, 150);

    return () => {
      clearInterval(cursorInterval);
      clearInterval(textInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4 bg-black/80 backdrop-blur-sm p-8 rounded-lg shadow-lg border-2 border-green-500">
      <h1 className="text-4xl font-bold text-green-400 mb-8 animate-neonPulse">
        CLIcafe Terminal
      </h1>
      {username && (
        <p className="text-green-400 mb-4">Welcome, {username}!</p>
      )}
      <div className="flex items-center">
        <span className="text-green-400">$</span>
        <span className="ml-2 text-green-400">
          {text}
        </span>
        <span className={`ml-0.5 w-3 h-5 bg-green-400 ${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}></span>
      </div>
      <div className="mt-8">
        <Image
          src="/CliCafelogo.png"
          alt="CLIcafe Logo"
          width={200}
          height={200}
          className="mx-auto"
        />
      </div>
    </div>
  )
}

export default MainMenu

