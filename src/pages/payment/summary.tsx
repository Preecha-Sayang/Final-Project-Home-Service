import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Navbar from '@/components/navbar/navbar'
import PaymentSummary from '@/components/payments/Payment_summary'

type Item = {
  name: string
  quantity: number
}

interface SummaryData {
  serviceName: string
  items: Item[]
  totalPrice: number
  date?: string
  time?: string
  address?: string
}

export default function PaymentSummaryPage() {
  const router = useRouter()
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)

  useEffect(() => {
    // รับข้อมูลจาก query parameters
    if (router.isReady) {
      const { serviceName, items, totalPrice, date, time, address } = router.query
      
      if (serviceName && items && totalPrice) {
        try {
          // แปลง JSON string กลับมาเป็น array
          const parsedItems = JSON.parse(items as string) as Item[]
          
          setSummaryData({
            serviceName: serviceName as string,
            items: parsedItems,
            totalPrice: parseFloat(totalPrice as string),
            date: date as string,
            time: time as string,
            address: address as string
          })
        } catch (error) {
          console.error('Error parsing items:', error)
          router.push('/services')
        }
      } else {
        // ถ้าไม่มีข้อมูลให้ redirect กลับไปหน้าหลัก
        router.push('/services')
      }
    }
  }, [router])

  if (!summaryData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
            <PaymentSummary 
              status="ชำระเงินเรียบร้อย !"
              items={summaryData.items}
              date={summaryData.date ? new Date(summaryData.date) : undefined}
              time={summaryData.time}
              address={summaryData.address}
              totalPrice={summaryData.totalPrice}
            />
          </div>
        </div>
    </>
  )
}
