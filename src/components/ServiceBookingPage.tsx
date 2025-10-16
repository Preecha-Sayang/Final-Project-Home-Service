import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Stepper from '@/components/state_list and stepper/stepper'
import ServiceSelection from '@/components/ServiceSelection'
import BookingDetailsForm from '@/components/BookingForm'
import BookingFooter from '@/components/BookingFooter'
import OrderSummary from '@/components/ordersummary/order_summary'
import Breadcrumb from '@/components/breadcrump/bread_crump'
import { useBookingStore } from '@/stores/bookingStore'
import axios from 'axios'
import Navbar from '@/components/navbar/navbar'
import { isToday, isBefore, startOfDay } from 'date-fns'
import PaymentForm, { PaymentFormRef } from '@/components/payments/PaymentForm'
import { useAuth } from '@/context/AuthContext'

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
  const { isLoggedIn } = useAuth()
  const [currentStep, setCurrentStep] = useState<'items' | 'details' | 'payment'>('items')
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([])
  const [serviceName, setServiceName] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { customerInfo, resetForNewService, updateCartQuantity } = useBookingStore()
  const paymentFormRef = useRef<PaymentFormRef>(null)

  // Reset booking store และ selected items เมื่อเข้าหน้า service ใหม่หรือ reload
  useEffect(() => {
    resetForNewService()
    setSelectedItems([])
    setCurrentStep('items')
  }, [serviceId, resetForNewService])

  useEffect(() => {
    const fetchServiceName = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get(`/api/service-detail-options?serviceId=${serviceId}`)
        if (response.data.ok && response.data.options.length > 0) {
          setServiceName(response.data.options[0].service_name)
        } else {
          setError('ไม่พบข้อมูลบริการที่คุณต้องการ')
        }
      } catch (error) {
        console.error('Error fetching service name:', error)
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลบริการ')
      } finally {
        setLoading(false)
      }
    }

    fetchServiceName()
  }, [serviceId])

  const handleNext = () => {
    if (currentStep === 'items') {
      // ตรวจสอบว่า login แล้วหรือยัง ก่อนจะไป step 2
      if (!isLoggedIn) {
        // เก็บ path ปัจจุบันเพื่อให้กลับมาหลัง login
        const currentPath = router.asPath
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
        return
      }
      
      // อัพเดท booking store เมื่อเปลี่ยนจาก items → details
      console.log('=== UPDATING BOOKING STORE ===');
      console.log('Selected Items:', selectedItems);
      console.log('Selected Items Length:', selectedItems.length);
      
      selectedItems.forEach(item => {
        console.log('Updating cart item:', item);
        updateCartQuantity(item.service_option_id, item.quantity)
      })
      
      console.log('Booking store updated');
      console.log('========================');
      
      setCurrentStep('details')
    } else if (currentStep === 'details') {
      // Backup ข้อมูลก่อนไปหน้า payment
      console.log('=== BACKING UP DATA BEFORE PAYMENT ===');
      console.log('Selected Items:', selectedItems);
      console.log('Customer Info:', customerInfo);
      
      // อัพเดท booking store อีกครั้งก่อนไปหน้า payment
      selectedItems.forEach(item => {
        updateCartQuantity(item.service_option_id, item.quantity)
      })
      
      // Sync ข้อมูลกับ sessionStorage
      const currentData = sessionStorage.getItem('booking-storage');
      if (currentData) {
        try {
          const parsed = JSON.parse(currentData);
          // อัพเดท cart ใน sessionStorage
          parsed.state.cart = selectedItems.map(item => ({
            id: item.service_option_id,
            service_id: item.service_id,
            service_title: "บริการ",
            title: item.name,
            price: item.unit_price,
            unit: item.unit,
            quantity: item.quantity
          }));
          
          // บันทึกลง sessionStorage
          sessionStorage.setItem('booking-storage', JSON.stringify(parsed));
          console.log('Cart synced to sessionStorage:', parsed.state.cart);
        } catch (e) {
          console.error('Error syncing to sessionStorage:', e);
        }
      }
      
      console.log('Data backed up to booking store');
      console.log('==================================');
      
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
    
    // ไม่ต้องอัพเดท booking store ที่นี่ เพราะจะทำให้เกิด infinite loop
    // booking store จะถูกอัพเดทเมื่อผู้ใช้กดปุ่ม "ถัดไป" แทน
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
          <PaymentForm 
            ref={paymentFormRef}
            totalPrice={calculateTotal()}
            onPaymentSuccess={(bookingId, chargeId) => {
              // Redirect ไปหน้าสรุปใหม่พร้อม bookingId และ chargeId
              console.log('🔄 Redirecting to summary page with bookingId:', bookingId, 'chargeId:', chargeId);
              router.push(`/payment/summary?bookingId=${bookingId}&chargeId=${chargeId}`)
            }}
            onPaymentError={(error) => {
              console.error('Payment error:', error)
            }}
          />
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
          // ตรวจสอบว่ามีข้อมูลครบถ้วน
          const hasRequiredFields = !!(
            customerInfo.serviceDate &&
            customerInfo.serviceTime &&
            customerInfo.address &&
            customerInfo.province &&
            customerInfo.district &&
            customerInfo.subDistrict
          )
          
          if (!hasRequiredFields) return false
          
          // ตรวจสอบว่าวันที่และเวลาที่เลือกไม่ได้อยู่ในอดีต
          try {
            const selectedDate = customerInfo.serviceDate
            if (!selectedDate) return false
            
            const today = startOfDay(new Date())
            const selectedDay = startOfDay(selectedDate)
            
            // ถ้าเลือกวันในอดีต ไม่ให้ดำเนินการต่อ
            if (isBefore(selectedDay, today)) {
              console.warn('[ServiceBookingPage] Cannot proceed: selected date is in the past')
              return false
            }
            
            // ถ้าเลือกวันปัจจุบัน ต้องตรวจสอบเวลาด้วย
            if (isToday(selectedDate)) {
              const serviceTime = customerInfo.serviceTime
              if (!serviceTime) return false
              
              const now = new Date()
              const [selectedHour, selectedMinute] = serviceTime.split(':').map(Number)
              const currentHour = now.getHours()
              const currentMinute = now.getMinutes()
              
              // ถ้าเลือกเวลาที่ผ่านไปแล้ว ไม่ให้ดำเนินการต่อ
              if (selectedHour < currentHour || 
                  (selectedHour === currentHour && selectedMinute <= currentMinute)) {
                console.warn('[ServiceBookingPage] Cannot proceed: selected time is in the past')
                return false
              }
            }
            
            return true
          } catch (error) {
            console.error('[ServiceBookingPage] Error validating date/time:', error)
            return false
          }
        case 'payment':
          return true // ตรวจสอบข้อมูลการชำระเงินเมื่อมี
        default:
          return false
      }
    }

    // กำหนดข้อความปุ่ม Next
    const getNextButtonText = () => {
      if (currentStep === 'payment') return 'ชำระเงิน'
      if (currentStep === 'items' && !isLoggedIn && selectedItems.length > 0) return 'Login เพื่อดำเนินการต่อ'
      return 'ดำเนินการต่อ'
    }

    return (
      <BookingFooter
        onBack={handleBack}
        onNext={currentStep === 'payment' ? () => {
          // Call payment form's handlePayment when on payment step
          paymentFormRef.current?.handlePayment()
        } : handleNext}
        backText={currentStep === 'items' ? 'กลับไปหน้าบริการ' : 'ย้อนกลับ'}
        nextText={getNextButtonText()}
        nextDisabled={!canProceed()}
        showBack={true}
        showNext={true}
      />
    )
  }

  // Show loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="mt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูลบริการ...</p>
          </div>
        </div>
      </>
    )
  }

  // Show error state
  if (error) {
    return (
      <>
        <Navbar />
        <div className="mt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบบริการ</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/services')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              กลับไปหน้าบริการ
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative h-[200px] md:h-[250px] overflow-hidden shadow-sm">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/service_bg_banner.jpg"
            alt="บริการของเรา"
            className="w-full h-full object-cover"
            width={1920}
            height={250}
            priority
          />
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-blue-900" style={{ backgroundColor: 'rgba(0, 0, 128, 0.4)' }}></div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <Breadcrumb 
              root="บริการของเรา"
              rootLink="/services"
              current={serviceName}
            />
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Stepper currentStep={currentStep === 'items' ? 1 : currentStep === 'details' ? 2 : 3} />
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