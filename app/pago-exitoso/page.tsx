'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [paymentInfo, setPaymentInfo] = useState({
    collectionId: '',
    status: '',
    paymentId: '',
    paymentType: '',
    merchantOrderId: ''
  })

  useEffect(() => {
    setPaymentInfo({
      collectionId: searchParams.get('collection_id') || '',
      status: searchParams.get('collection_status') || '',
      paymentId: searchParams.get('payment_id') || '',
      paymentType: searchParams.get('payment_type') || '',
      merchantOrderId: searchParams.get('merchant_order_id') || ''
    })
  }, [searchParams])

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full text-green-400 border-2 border-green-500">
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/clicafe-logo.png"
            alt="CLIcafe Logo"
            width={100}
            height={100}
            className="mb-4"
          />
          <h1 className="text-2xl font-bold mb-2">¡Pago Exitoso!</h1>
          <p className="text-center mb-4">
            Tu pago ha sido procesado correctamente.
          </p>
        </div>

        <div className="space-y-2 font-mono text-sm mb-6">
          <p>ID de Pago: {paymentInfo.paymentId}</p>
          <p>Estado: {paymentInfo.status}</p>
          <p>Tipo de Pago: {paymentInfo.paymentType}</p>
          <p>Orden: {paymentInfo.merchantOrderId}</p>
        </div>

        <div className="flex justify-center">
          <Link
            href="/"
            className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </main>
  )
}