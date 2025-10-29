import React, { useState, useEffect } from 'react'
import ServiceItem from './ServiceItem'
import axios from 'axios'

type CartItem = {
  service_option_id: number
  service_id: number
  name: string
  unit: string
  unit_price: number
  quantity: number
}

interface ServiceSelectionProps {
  serviceId: number
  onItemsChange: (items: CartItem[]) => void
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({ 
  serviceId, 
  onItemsChange 
}) => {
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div>
        <p className="text-medium font-semibold mb-1 text-gray-500">
          เลือกรายการบริการ{serviceName}
        </p>
        
        {/* Service Items */}
        <ServiceItem
          serviceId={serviceId}
          onItemsChange={onItemsChange}
        />
      </div>
    </div>
  )
}

export default ServiceSelection