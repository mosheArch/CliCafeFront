'use client'

import { useEffect, useRef } from 'react'

interface SoundEffectProps {
  play: boolean
}

const SoundEffect: React.FC<SoundEffectProps> = ({ play }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (play && audioRef.current) {
      audioRef.current.play()
    }
  }, [play])

  return (
    <audio ref={audioRef} src="/keypress.mp3" />
  )
}

export default SoundEffect

