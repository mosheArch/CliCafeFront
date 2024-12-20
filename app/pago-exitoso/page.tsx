'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { registrarPagoExitoso } from '../utils/api'

export default function PagoExitoso() {
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
        router.push('/error-pago');
        return;
      }

      try {
        await registrarPagoExitoso(paymentData)
      } catch (error) {
        console.error('Error al registrar pago exitoso:', error)
        router.push('/error-pago');
      }
    }

    registrarPago()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full text-green-400">
        <h1 className="text-2xl font-bold mb-4">¡Pago Exitoso!</h1>
        <p>Tu pago ha sido procesado correctamente.</p>
        <p>Gracias por tu compra.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  )
}

