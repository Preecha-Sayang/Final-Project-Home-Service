import React, { useEffect, useState, useCallback } from 'react'
import { Minus, Plus } from 'lucide-react'
import ButtonSecondary from '@/components/button/buttonsecondary'
import axios from 'axios'

type ServiceOption = {
  service_option_id: number
  service_id: number
  name: string
  unit: string
  unit_price: string
  service_name: string
}

type CartItem = {
  service_option_id: number
  service_id: number
  name: string
  unit: string
  unit_price: number
  quantity: number
}

interface ServiceItemProps {
  serviceId: number
  onItemsChange: (items: CartItem[]) => void
}

const ServiceItem: React.FC<ServiceItemProps> = ({
  serviceId,
  onItemsChange,
}) => {
  const [options, setOptions] = useState<ServiceOption[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServiceOptions = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/service-detail-options?serviceId=${serviceId}`)
      
      if (response.data.ok) {
        setOptions(response.data.options)
        // Initialize cart items with quantity 0
        const initialCartItems = response.data.options.map((option: ServiceOption) => ({
          service_option_id: option.service_option_id,
          service_id: option.service_id,
          name: option.name,
          unit: option.unit,
          unit_price: parseFloat(option.unit_price),
          quantity: 0
        }))
        setCartItems(initialCartItems)
      } else {
        setError(response.data.message || 'Failed to fetch service options')
      }
    } catch (err) {
      console.error('Error fetching service options:', err)
      setError('Failed to fetch service options')
    } finally {
      setLoading(false)
    }
  }, [serviceId])

  useEffect(() => {
    fetchServiceOptions()
  }, [fetchServiceOptions])

  const handleQuantityChange = (serviceOptionId: number, quantity: number) => {
    setCartItems(prev => {
      const updated = prev.map(item => 
        item.service_option_id === serviceOptionId 
          ? { ...item, quantity }
          : item
      )
      
      // เรียก onItemsChange เมื่อผู้ใช้กดปุ่ม + หรือ -
      const filteredItems = updated.filter(item => item.quantity > 0)
      onItemsChange(filteredItems)
      
      return updated
    })
  }

  // หยุดการเรียก onItemsChange ใน useEffect เพื่อป้องกัน infinite loop
  // onItemsChange จะถูกเรียกเมื่อผู้ใช้กดปุ่ม + หรือ - เท่านั้น

  if (loading) {
    return <div className="p-4 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">เกิดข้อผิดพลาด: {error}</div>
  }

  return (
    <div className="space-y-0">
      {options.map((option, index) => {
        const cartItem = cartItems.find(item => item.service_option_id === option.service_option_id)
        const quantity = cartItem?.quantity || 0
        const isLastItem = index === options.length - 1

        return (
          <div key={option.service_option_id} className={`flex flex-col sm:flex-row justify-between items-center p-4 gap-2 sm:gap-0 ${!isLastItem ? 'border-b border-gray-200' : ''}`}>
            <div className="w-full sm:w-auto flex flex-col items-start">
              <h6 className="text-medium font-semibold text-gray-800 mb-1">
                {option.name}
              </h6>
              <p className="text-sm text-gray-500">
                {parseFloat(option.unit_price).toFixed(2)} ฿ / {option.unit}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <ButtonSecondary
                onClick={() => handleQuantityChange(option.service_option_id, quantity - 1)}
                disabled={quantity === 0}
                className="!w-[40px] !h-[40px] !p-0 !min-w-0"
              >
                <Minus className="w-3 h-3" />
              </ButtonSecondary>
              <span className="text-lg font-medium w-8 text-center">
                {quantity}
              </span>
              <ButtonSecondary
                onClick={() => handleQuantityChange(option.service_option_id, quantity + 1)}
                className="!w-[40px] !h-[40px] !p-0 !min-w-0"
              >
                <Plus className="w-3 h-3" />
              </ButtonSecondary>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ServiceItem