'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { registrarPagoExitoso } from '../utils/api'

export default function PagoExitoso() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const procesarPagoExitoso = async () => {
      try {
        // Check if payment was approved
        const status = searchParams.get('status')
        const collection_status = searchParams.get('collection_status')

        // If payment is approved, register it and redirect
        if (status === 'approved' || collection_status === 'approved') {
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

          // Register the successful payment
          await registrarPagoExitoso(paymentData)

          // Set success status and clean up
          sessionStorage.setItem('paymentStatus', 'success')
          sessionStorage.removeItem('currentOrderId')

          // Redirect to home immediately
          router.push('/')
        } else {
          // If not approved, redirect to error page
          router.push('/error-pago')
        }
      } catch (error) {
        console.error('Error al procesar el pago:', error)
        router.push('/error-pago')
      }
    }

    procesarPagoExitoso()
  }, [searchParams, router])

  // Return null since we're immediately redirecting
  return null
}

