'use client'

import React from 'react'
import Image from 'next/image'

const MatrixBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-10">
      <Image
        src="/wallpaper.jpg"
        alt="Coffee Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        priority
      />
      <div className="absolute inset-0 bg-black opacity-50"></div>
    </div>
  )
}

export default MatrixBackground

