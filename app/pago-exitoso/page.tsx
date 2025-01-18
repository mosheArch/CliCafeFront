'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { registrarPagoExitoso } from '../utils/api'
import Image from 'next/image'

export default function PagoExitoso() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const registrarPago = async () => {
      try {
        // Validate that we have an approved status
        const status = searchParams.get('status')
        const collection_status = searchParams.get('collection_status')

        if (status !== 'approved' && collection_status !== 'approved') {
          throw new Error('Estado de pago no válido');
        }

        const paymentData = {
          payment_id: searchParams.get('payment_id'),
          status: status,
          collection_status: collection_status,
          external_reference: searchParams.get('external_reference'),
          merchant_order_id: searchParams.get('merchant_order_id'),
          preference_id: searchParams.get('preference_id'),
          site_id: searchParams.get('site_id'),
          processing_mode: searchParams.get('processing_mode'),
          merchant_account_id: searchParams.get('merchant_account_id'),
          order_id: sessionStorage.getItem('currentOrderId')
        }

        console.log('Registrando pago exitoso con datos:', paymentData);

        if (!paymentData.payment_id) {
          throw new Error('ID de pago no encontrado');
        }

        await registrarPagoExitoso(paymentData)

        // Set payment status as success
        sessionStorage.setItem('paymentStatus', 'success');

        // Clear the order ID from session storage
        sessionStorage.removeItem('currentOrderId');

        // Start countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              router.push('/')
            }
            return prev - 1
          })
        }, 1000)

        return () => clearInterval(timer)
      } catch (error) {
        console.error('Error al procesar el pago:', error)
        setError('Hubo un error al procesar el pago. Por favor, contacte a soporte si el problema persiste.')
      }
    }

    registrarPago()
  }, [searchParams, router])

  if (error) {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full text-red-400">
            <h1 className="text-2xl font-bold mb-4">Error en el Proceso</h1>
            <p className="mb-4">{error}</p>
            <button
                onClick={() => router.push('/')}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
          <div className="flex flex-col items-center">
            <Image
                src="/clicafe-logo.png"
                alt="CLIcafe Logo"
                width={100}
                height={100}
                className="mb-6"
            />
            <h1 className="text-2xl font-bold mb-4 text-green-400">¡Pago Exitoso!</h1>
            <p className="mb-4 text-green-400">Tu pago ha sido procesado correctamente.</p>
            <p className="mb-4 text-green-400">Gracias por tu compra.</p>
            <p className="mb-4 text-center text-green-400">
              Serás redirigido a la página de inicio en {countdown} segundos...
            </p>
            <button
                onClick={() => router.push('/')}
                className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
              Volver al inicio ahora
            </button>
          </div>
        </div>
      </div>
  )
}