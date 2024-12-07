import React from 'react'

interface TerminalLineProps {
  content: string
  isCommand?: boolean
}

const TerminalLine: React.FC<TerminalLineProps> = ({ content, isCommand }) => {
  if (isCommand) {
    return (
      <div className="terminal-line">
        <span className="terminal-prompt">{content}</span>
      </div>
    )
  }

  if (content.startsWith('Molido/') || content.startsWith('Grano/')) {
    const items = content.split(' ')
    return (
      <div className="terminal-line">
        {items.map((item, index) => (
          <span key={index} className={item.endsWith('/') ? 'directory' : 'file'}>
            {item}&nbsp;
          </span>
        ))}
      </div>
    )
  }

  if (content.startsWith('Error:')) {
    return (
      <div className="terminal-line">
        <span className="error">{content}</span>
      </div>
    )
  }

  return (
    <div className="terminal-line">
      <span>{content}</span>
    </div>
  )
}

export default TerminalLine

