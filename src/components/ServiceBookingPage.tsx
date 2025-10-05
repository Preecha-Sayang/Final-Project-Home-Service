import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import BookingStepper from '@/components/BookingStepper'
import ServiceSelection from '@/components/ServiceSelection'
import BookingFooter from '@/components/BookingFooter'
import OrderSummary from '@/components/ordersummary/order_summary'
import Breadcrumb from '@/components/breadcrump/bread_crump'
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
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">กรอกข้อมูลบริการ</h2>
            <p className="text-gray-600">ฟอร์มกรอกข้อมูลจะอยู่ที่นี่</p>
          </div>
        )
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
          return true // ตรวจสอบข้อมูลในฟอร์มเมื่อมี
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
              date="ยังไม่ได้เลือก"
              time="ยังไม่ได้เลือก"
              address="ยังไม่ได้เลือก"
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