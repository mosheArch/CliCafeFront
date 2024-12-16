'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { registrarPagoFallido } from '../utils/api'

export default function PagoFallido() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const registrarPago = async () => {
      const paymentData = {
        payment_id: searchParams.get('payment_id'),
        status: searchParams.get('status'),
        external_reference: searchParams.get('external_reference'),
        merchant_order_id: searchParams.get('merchant_order_id'),
      }

      try {
        await registrarPagoFallido(paymentData)
      } catch (error) {
        console.error('Error al registrar pago fallido:', error)
      }
    }

    registrarPago()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full text-red-400">
        <h1 className="text-2xl font-bold mb-4">Pago Fallido</h1>
        <p>Lo sentimos, hubo un problema al procesar tu pago.</p>
        <p>Por favor, intenta nuevamente más tarde.</p>
      </div>
    </div>
  )
}

