'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { registrarPagoExitoso } from '../utils/api'
import Image from 'next/image'

export default function PagoExitoso() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const procesarPagoExitoso = async () => {
      try {
        // Obtener todos los parámetros relevantes
        const status = searchParams.get('status')
        const collection_status = searchParams.get('collection_status')
        const payment_id = searchParams.get('payment_id')

        console.log('Estado del pago:', { status, collection_status, payment_id });

        // Si el pago está aprobado
        if (status === 'approved' || collection_status === 'approved') {
          const paymentData = {
            payment_id: payment_id,
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

          // Registrar el pago exitoso
          await registrarPagoExitoso(paymentData)

          // Marcar el pago como exitoso y limpiar
          sessionStorage.setItem('paymentStatus', 'success')
          sessionStorage.removeItem('currentOrderId')

          // Redirigir al inicio
          router.push('/')
        } else {
          console.log('Pago no aprobado, redirigiendo a error');
          router.push('/error-pago')
        }
      } catch (error) {
        console.error('Error al procesar el pago:', error)
        //router.push('/error-pago')
      }
    }

    procesarPagoExitoso()
  }, [searchParams, router])

  // Mostrar un mensaje de carga mientras se procesa
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
            <p className="text-green-400 text-center">
              Procesando tu pago...
            </p>
          </div>
        </div>
      </div>
  )
}