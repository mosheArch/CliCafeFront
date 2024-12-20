'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { registrarPagoFallido } from '../utils/api'

export default function PagoFallido() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const registrarPago = async () => {
      const paymentData = {
        payment_id: searchParams.get('payment_id'),
        status: searchParams.get('status'),
        external_reference: searchParams.get('external_reference'),
        merchant_order_id: searchParams.get('merchant_order_id'),
      }

      if (!paymentData.payment_id || !paymentData.status) {
        console.error('Datos de pago incompletos');
        return;
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
        <p className="mb-4">Lo sentimos, hubo un problema al procesar tu pago.</p>
        <p className="mb-6">Por favor, intenta nuevamente más tarde.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  )
}

