import React from 'react'
import { useRouter } from 'next/router'
import ServiceBookingPage from '@/components/ServiceBookingPage'

const ServiceDetailPage = () => {
  const router = useRouter()
  const { id } = router.query

  // Wait for router to be ready
  if (!router.isReady) {
    return null
  }

  // Convert and validate ID
  const serviceId = parseInt(id as string, 10)
  
  if (!id || Array.isArray(id) || isNaN(serviceId)) {
    router.push('/services')
    return null
  }

  return <ServiceBookingPage serviceId={serviceId} />
}

export default ServiceDetailPage