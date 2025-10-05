import React from 'react'
import { useRouter } from 'next/router'
import ServiceBookingPage from '@/components/ServiceBookingPage'

const ServiceDetailPage = () => {
  const router = useRouter()
  const { id } = router.query

  // Show loading while router is not ready
  if (!router.isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  // Show error if no service ID
  if (!id || Array.isArray(id)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบบริการ</h1>
          <p className="text-gray-600 mb-6">ไม่พบบริการที่คุณต้องการ</p>
          <button
            onClick={() => router.push('/services')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            กลับไปหน้าบริการ
          </button>
        </div>
      </div>
    )
  }

  // Convert string ID to number
  const serviceId = parseInt(id as string, 10)
  
  if (isNaN(serviceId)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ID บริการไม่ถูกต้อง</h1>
          <p className="text-gray-600 mb-6">ID บริการไม่ถูกต้อง</p>
          <button
            onClick={() => router.push('/services')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            กลับไปหน้าบริการ
          </button>
        </div>
      </div>
    )
  }

  return <ServiceBookingPage serviceId={serviceId} />
}

export default ServiceDetailPage