import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import BookingStepper from '@/components/BookingStepper'
import ServiceSelection from '@/components/ServiceSelection'
import BookingDetailsForm from '@/components/BookingDetailsForm'
import BookingFooter from '@/components/BookingFooter'
import OrderSummary from '@/components/ordersummary/order_summary'
import Breadcrumb from '@/components/breadcrump/bread_crump'
import { useBookingStore } from '@/stores/bookingStore'
import axios from 'axios'
import Navbar from '@/components/navbar/navbar'

type CartItem = {
  service_option_id: number
  service_id: number
  name: string
  unit: string
  unit_price: number
  quantity: number
}

interface ServiceBookingPageProps {
  serviceId: number
}

const ServiceBookingPage: React.FC<ServiceBookingPageProps> = ({ serviceId }) => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<'items' | 'details' | 'payment'>('items')
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([])
  const [serviceName, setServiceName] = useState<string>('')
  const { customerInfo } = useBookingStore()

  useEffect(() => {
    const fetchServiceName = async () => {
      try {
        const response = await axios.get(`/api/service-detail-options?serviceId=${serviceId}`)
        if (response.data.ok && response.data.options.length > 0) {
          setServiceName(response.data.options[0].service_name)
        }
      } catch (error) {
        console.error('Error fetching service name:', error)
      }
    }

    fetchServiceName()
  }, [serviceId])

  const handleNext = () => {
    if (currentStep === 'items') {
      setCurrentStep('details')
    } else if (currentStep === 'details') {
      setCurrentStep('payment')
    }
  }

  const handleBack = () => {
    if (currentStep === 'details') {
      setCurrentStep('items')
    } else if (currentStep === 'payment') {
      setCurrentStep('details')
    } else {
      router.push('/services')
    }
  }

  const handleItemsChange = (items: CartItem[]) => {
    setSelectedItems(items)
  }

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + (item.unit_price * item.quantity), 0)
  }

  // Helper functions for formatting data
  const formatDate = (date: Date | null) => {
    if (!date) return "ยังไม่ได้เลือก"
    
    // ตรวจสอบว่า date เป็น valid Date object หรือไม่
    const dateObj = date instanceof Date ? date : new Date(date)
    
    // ตรวจสอบว่า date เป็น valid หรือไม่
    if (isNaN(dateObj.getTime())) {
      return "ยังไม่ได้เลือก"
    }
    
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj)
  }

  const formatTime = (time: string) => {
    if (!time) return "ยังไม่ได้เลือก"
    return time
  }

  const formatAddress = () => {
    if (!customerInfo.address) return "ยังไม่ได้เลือก"
    const parts = [
      customerInfo.address,
      customerInfo.subDistrict,
      customerInfo.district,
      customerInfo.province
    ].filter(Boolean)
    return parts.join(', ')
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'items':
        return (
          <ServiceSelection 
            serviceId={serviceId}
            onItemsChange={handleItemsChange}
          />
        )
      case 'details':
        return <BookingDetailsForm />
      case 'payment':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">ชำระเงิน</h2>
            <p className="text-gray-600">หน้าชำระเงินจะอยู่ที่นี่</p>
          </div>
        )
      default:
        return null
    }
  }

  const renderFooter = () => {
    const canProceed = () => {
      switch (currentStep) {
        case 'items':
          return selectedItems.length > 0
        case 'details':
          return !!(
            customerInfo.serviceDate &&
            customerInfo.serviceTime &&
            customerInfo.address &&
            customerInfo.province &&
            customerInfo.district &&
            customerInfo.subDistrict
          )
        case 'payment':
          return true // ตรวจสอบข้อมูลการชำระเงินเมื่อมี
        default:
          return false
      }
    }

    return (
      <BookingFooter
        onBack={handleBack}
        onNext={currentStep === 'payment' ? () => alert('ชำระเงินสำเร็จ!') : handleNext}
        backText={currentStep === 'items' ? 'กลับไปหน้าบริการ' : 'ย้อนกลับ'}
        nextText={currentStep === 'payment' ? 'ชำระเงิน' : 'ดำเนินการต่อ'}
        nextDisabled={!canProceed()}
        showBack={true}
        showNext={true}
      />
    )
  }

  return (
    <>
      <Navbar />
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <Breadcrumb 
            root="บริการของเรา"
            rootLink="/services"
            current={serviceName || "จองบริการ"}
          />
        </div>
      </div>

      {/* Stepper */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <BookingStepper currentStepId={currentStep} />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {renderStepContent()}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              items={selectedItems.map(item => ({
                name: item.name,
                quantity: item.quantity
              }))}
              total={calculateTotal()}
              date={formatDate(customerInfo.serviceDate)}
              time={formatTime(customerInfo.serviceTime)}
              address={formatAddress()}
              fallbackText="ยังไม่ได้เลือก"
            />
          </div>
        </div>
      </div>
      {/* Fixed Footer */}
      {renderFooter()}
    </div>
    </>
  )
}

export default ServiceBookingPage