import React from 'react'
import Image from 'next/image'

interface CoffeePopupProps {
  name: string
  price: string
  description: string
  onClose: () => void
}

const CoffeePopup: React.FC<CoffeePopupProps> = ({ name, price, description, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-green-400 mb-4">{name}</h2>
        <div className="relative w-full h-48 mb-4">
          <Image
            src={'/CliCafelogo.png'}
            alt={name}
            layout="fill"
            objectFit="cover"
            className="rounded"
          />
        </div>
        <p className="text-green-300 mb-2">Precio: {price}</p>
        <p className="text-green-200 mb-4">{description}</p>
        <button
          onClick={onClose}
          className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded w-full"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}

export default CoffeePopup
