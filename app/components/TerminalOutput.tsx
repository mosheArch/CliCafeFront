import React from 'react'

interface TerminalOutputProps {
  output: string[]
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ output }) => {
  return (
    <div className="font-mono text-sm">
      {output.map((line, index) => (
        <div key={index} className="mb-1">
          {line}
        </div>
      ))}
    </div>
  )
}

export default TerminalOutput

