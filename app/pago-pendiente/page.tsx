'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { registrarPagoPendiente } from '../utils/api'

export default function PagoPendiente() {
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
        await registrarPagoPendiente(paymentData)
      } catch (error) {
        console.error('Error al registrar pago pendiente:', error)
      }
    }

    registrarPago()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full text-yellow-400">
        <h1 className="text-2xl font-bold mb-4">Pago Pendiente</h1>
        <p>Tu pago está siendo procesado.</p>
        <p>Te notificaremos cuando se complete la transacción.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  )
}

