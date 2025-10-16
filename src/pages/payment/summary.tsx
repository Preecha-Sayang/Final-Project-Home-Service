import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import PaymentSummary from '@/components/payments/Payment_summary'
import Navbar from '@/components/navbar/navbar'
import { Footer } from '@/components/footer'

interface BookingData {
  booking_id: number
  service_name: string
  items: Array<{
    title: string
    price: number
    quantity: number
    unit: string
  }>
  total_amount: number
  discount_amount: number
  final_amount: number
  promo_code: string | null
  service_date: string
  service_time: string
  address: string
  province: string
  district: string
  subdistrict: string
  additional_info: string | null
  status: string
  charge_id: string | null
}

export default function PaymentSummaryPage() {
  const router = useRouter()
  const { bookingId, chargeId } = router.query
  const [isLoading, setIsLoading] = useState(true)
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (router.isReady) {
      console.log('=== SUMMARY PAGE LOADED ===');
      console.log('Current URL:', window.location.href);
      console.log('Router Query:', router.query);
      console.log('Booking ID:', bookingId);
      console.log('Charge ID:', chargeId);
      
      if (bookingId) {
        console.log('📋 Fetching booking data with ID:', bookingId);
        fetchBookingData(bookingId as string)
      } else if (chargeId) {
        console.log('💳 Verifying payment with Charge ID:', chargeId);
        verifyPayment(chargeId as string)
      } else {
        console.log('⚠️ No bookingId or chargeId found');
        setError('ไม่พบข้อมูลการจอง กรุณาตรวจสอบ URL');
        setIsLoading(false)
      }
    }
  }, [router.isReady, bookingId, chargeId, router.query])

  const fetchBookingData = async (bookingId: string) => {
    try {
      console.log('=== FETCHING BOOKING DATA ===');
      console.log('Booking ID:', bookingId);
      
      const response = await fetch(`/api/bookings/${bookingId}`)
      const data = await response.json()

      console.log('API Response Status:', response.status);
      console.log('API Response Data:', data);

      if (response.ok && data.success) {
        console.log('✅ Booking data fetched successfully:', data.booking);
        setBookingData(data.booking)
        setPaymentVerified(data.booking.status === 'confirmed')
      } else {
        console.error('❌ Failed to fetch booking:', data)
        setError('ไม่สามารถดึงข้อมูลการจองได้')
      }
    } catch (error) {
      console.error('❌ Error fetching booking:', error)
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลการจอง')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyPayment = async (chargeId: string) => {
    try {
      console.log('=== VERIFYING PAYMENT ===');
      console.log('Charge ID:', chargeId);
      
      const response = await fetch(`/api/verify-payment?chargeId=${chargeId}`)
      const data = await response.json()

      console.log('Payment Verification Response:', response.status);
      console.log('Payment Verification Data:', data);

      if (response.ok && data.status === 'success' && data.paid) {
        console.log('✅ Payment verified successfully');
        setPaymentVerified(true)
      } else {
        console.error('❌ Payment verification failed:', data)
        setError('ไม่สามารถตรวจสอบการชำระเงินได้')
      }
    } catch (error) {
      console.error('❌ Error verifying payment:', error)
      setError('เกิดข้อผิดพลาดในการตรวจสอบการชำระเงิน')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังตรวจสอบการชำระเงิน...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
            <div className="mb-4">
              <svg 
                className="w-16 h-16 text-red-400 mx-auto mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-800 mb-2">เกิดข้อผิดพลาด</h2>
            <p className="text-red-600 mb-6 text-sm">
              {error}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/services')}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                จองบริการใหม่
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                กลับหน้าหลัก
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // ตรวจสอบว่ามีข้อมูลการจองหรือไม่
  if (!bookingData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
            <div className="mb-4">
              <svg 
                className="w-16 h-16 text-gray-400 mx-auto mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">ไม่พบข้อมูลการจอง</h2>
            <p className="text-gray-600 mb-6 text-sm">
              ข้อมูลการจองอาจหมดอายุหรือถูกล้างไปแล้ว
              <br />
              กรุณาทำการจองใหม่อีกครั้ง
            </p>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/services')}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                จองบริการใหม่
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                กลับหน้าหลัก
              </button>
            </div>
            {chargeId && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>หมายเหตุ:</strong> การชำระเงินของคุณสำเร็จแล้ว
                  <br />
                  Charge ID: <code className="font-mono">{chargeId}</code>
                  <br />
                  หากต้องการตรวจสอบ กรุณาติดต่อฝ่ายสนับสนุน
                </p>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // แปลงข้อมูลให้ตรงกับ interface ของ PaymentSummary component
  const items = bookingData.items.map(item => ({
    name: `${item.title} (${item.unit})`,
    quantity: item.quantity
  }))

  const fullAddress = [
    bookingData.address,
    bookingData.subdistrict,
    bookingData.district,
    bookingData.province,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-2 md:px-4 py-8">
        <PaymentSummary
          status={paymentVerified ? 'ชำระเงินเรียบร้อย !' : 'สรุปการจอง'}
          items={items}
          date={bookingData.service_date ? new Date(bookingData.service_date) : undefined}
          time={bookingData.service_time}
          address={fullAddress}
          totalPrice={bookingData.final_amount}
        />
      </div>
      <Footer />
    </>
  )
}
