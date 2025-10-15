import { useState, useEffect, useMemo } from 'react'
import { MapPin } from 'lucide-react'
import { useBookingStore } from '@/stores/bookingStore'
import DatePicker from '@/components/input/inputDatePicker/date_picker_select'
import TimePicker from '@/components/input/inputTimePicker/time_picker_select'
import InputField from '@/components/input/inputField/input_state'
import InputDropdown from '@/components/input/inputDropdown/input_dropdown'
import { format, parseISO, isToday, parse } from 'date-fns'

// Types for location data
interface Province {
  province_code: number
  province_name_th: string
  province_name_en: string
}

interface District {
  district_code: number
  district_name_th: string
  district_name_en: string
}

interface Subdistrict {
  subdistrict_code: number
  subdistrict_name_th: string
  subdistrict_name_en: string
}

const BookingDetailsForm: React.FC = () => {
  const { customerInfo, updateCustomerInfo } = useBookingStore()

  // Form state
  const [serviceDate, setServiceDate] = useState<string>(
    customerInfo.serviceDate ? format(customerInfo.serviceDate, 'dd-MM-yyyy') : ''
  )
  const [serviceTime, setServiceTime] = useState<string>(customerInfo.serviceTime || '')
  const [address, setAddress] = useState<string>(customerInfo.address || '')
  const [province, setProvince] = useState<string>(customerInfo.province || '')
  const [district, setDistrict] = useState<string>(customerInfo.district || '')
  const [subDistrict, setSubDistrict] = useState<string>(customerInfo.subDistrict || '')
  const [additionalInfo, setAdditionalInfo] = useState<string>(customerInfo.additionalInfo || '')

  // State สำหรับเก็บ code ของที่เลือก
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('')
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('')
  const [selectedSubdistrictCode, setSelectedSubdistrictCode] = useState<string>('')
  
  // Location data from API
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([])
  const [addressLoading, setAddressLoading] = useState(true)
  const [addressError, setAddressError] = useState<string | null>(null)

  // Load provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setAddressLoading(true)
        const response = await fetch('/api/location/provinces')
        if (!response.ok) throw new Error('Failed to fetch provinces')
        const data = await response.json()
        setProvinces(data)
      } catch (error) {
        console.error('Error fetching provinces:', error)
        setAddressError('ไม่สามารถโหลดข้อมูลจังหวัดได้')
      } finally {
        setAddressLoading(false)
      }
    }
    fetchProvinces()
  }, [])

  // Update store when form values change
  useEffect(() => {
      updateCustomerInfo({
      serviceDate: serviceDate ? parseISO(serviceDate.split('-').reverse().join('-')) : null,
      serviceTime,
      address,
      province,
      district,
      subDistrict,
      additionalInfo,
      latitude: customerInfo.latitude,
      longitude: customerInfo.longitude,
    })
  }, [serviceDate, serviceTime, address, province, district, subDistrict, additionalInfo, updateCustomerInfo, customerInfo.latitude, customerInfo.longitude])

  // Handle province selection
  const handleProvinceChange = async (provinceCode: string) => {
    const code = parseInt(provinceCode)
    setSelectedProvinceCode(provinceCode)
    setSelectedDistrictCode('')
    setSelectedSubdistrictCode('')

    // หาชื่อจังหวัด
    const provinceData = provinces.find(p => p.province_code === code)
    if (provinceData) {
      setProvince(provinceData.province_name_th)
      
      // โหลดอำเภอจาก API
      try {
        const response = await fetch(`/api/location/districts?province_code=${code}`)
        if (!response.ok) throw new Error('Failed to fetch districts')
        const data = await response.json()
        setDistricts(data)
        setSubdistricts([])
      } catch (error) {
        console.error('Error fetching districts:', error)
        setDistricts([])
      }
      
      // Reset ค่าอื่นๆ
      setDistrict('')
      setSubDistrict('')
    }
  }

  // Handle district selection
  const handleDistrictChange = async (districtCode: string) => {
    const code = parseInt(districtCode)
    setSelectedDistrictCode(districtCode)
    setSelectedSubdistrictCode('')

    // หาชื่ออำเภอ
    const districtData = districts.find(d => d.district_code === code)
    if (districtData) {
      setDistrict(districtData.district_name_th)
      
      // โหลดตำบลจาก API
      try {
        const response = await fetch(`/api/location/subdistricts?district_code=${code}`)
        if (!response.ok) throw new Error('Failed to fetch subdistricts')
        const data = await response.json()
        setSubdistricts(data)
      } catch (error) {
        console.error('Error fetching subdistricts:', error)
        setSubdistricts([])
      }
      
      // Reset ค่าอื่นๆ
      setSubDistrict('')
    }
  }

  // Handle subdistrict selection
  const handleSubdistrictChange = (subdistrictCode: string) => {
    const code = parseInt(subdistrictCode)
    setSelectedSubdistrictCode(subdistrictCode)
    // หาชื่อตำบล
    const subdistrictData = subdistricts.find(s => s.subdistrict_code === code)
    if (subdistrictData) {
      setSubDistrict(subdistrictData.subdistrict_name_th)
    }
  }

  // คำนวณเวลาขั้นต่ำสำหรับ TimePicker (ถ้าเลือกวันปัจจุบัน)
  const minTime = useMemo(() => {
    if (!serviceDate) return undefined;
    
    try {
      // แปลงวันที่จาก dd-MM-yyyy เป็น Date object
      const selectedDate = parse(serviceDate, 'dd-MM-yyyy', new Date());
      
      // ถ้าเป็นวันปัจจุบัน ให้คำนวณเวลาขั้นต่ำ (ปัดขึ้นไปอีก 15 นาที)
      if (isToday(selectedDate)) {
        const now = new Date();
        const currentMinutes = now.getMinutes();
        const roundedMinutes = Math.ceil((currentMinutes + 15) / 15) * 15; // ปัดขึ้นทุก 15 นาที
        
        let hour = now.getHours();
        let minute = roundedMinutes;
        
        // ถ้านาทีเกิน 60 ให้เพิ่มชั่วโมง
        if (minute >= 60) {
          hour += 1;
          minute = minute % 60;
        }
        
        // ถ้าเกิน 23:45 ไม่ให้เลือกเวลาเลย
        if (hour >= 24) {
          return '23:59';
        }
        
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      }
    } catch (error) {
      console.error('Error parsing date:', error);
    }
    
    return undefined;
  }, [serviceDate]);

  if (addressLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูลที่อยู่...</p>
          </div>
        </div>
      </div>
    )
  }

  if (addressError) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">เกิดข้อผิดพลาดในการโหลดข้อมูลที่อยู่</p>
        </div>
      </div>
    )
  }

  // Prepare options for dropdowns
  const provinceOptions = provinces.map(p => ({
    label: p.province_name_th,
    value: p.province_code.toString(),
  }))

  const districtOptions = districts.map(d => ({
    label: d.district_name_th,
    value: d.district_code.toString(),
  }))

  const subdistrictOptions = subdistricts.map(s => ({
    label: s.subdistrict_name_th,
    value: s.subdistrict_code.toString(),
  }))

  return (
      <div className="bg-white rounded-lg shadow p-4 md:p-6 space-y-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">
          กรอกข้อมูลบริการ
        </h2>

      {/* วันที่และเวลา - แนวนอน */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DatePicker
          label="วันที่สะดวกใช้บริการ*"
          value={serviceDate}
          onChange={setServiceDate}
          placeholder="กรุณาเลือกวันที่"
          min={format(new Date(), 'dd-MM-yyyy')}
        />

        <TimePicker
          label="เวลาที่สะดวกใช้บริการ*"
          value={serviceTime}
          onChange={setServiceTime}
          placeholder="กรุณาเลือกเวลา"
          step={15}
          minTime={minTime}
        />
        </div>

      {/* ที่อยู่และแขวง/ตำบล - แนวนอน */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="ที่อยู่*"
          placeholder="กรุณากรอกที่อยู่"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rightIcon={<MapPin className="h-4 w-4" />}
        />

        <InputDropdown
          label="แขวง / ตำบล*"
          value={selectedSubdistrictCode}
          onChange={handleSubdistrictChange}
          options={subdistrictOptions}
          placeholder="เลือกแขวง / ตำบล"
          disabled={!selectedDistrictCode}
                      />
                    </div>

      {/* เขต/อำเภอ และ จังหวัด - แนวนอน */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputDropdown
          label="เขต / อำเภอ*"
          value={selectedDistrictCode}
          onChange={handleDistrictChange}
          options={districtOptions}
          placeholder="เลือกเขต / อำเภอ"
                  disabled={!selectedProvinceCode}
        />

        <InputDropdown
          label="จังหวัด*"
          value={selectedProvinceCode}
          onChange={handleProvinceChange}
          options={provinceOptions}
          placeholder="เลือกจังหวัด"
          />
        </div>


      {/* ข้อมูลเพิ่มเติม */}
      <InputField
        label="ระบุข้อมูลเพิ่มเติม"
        placeholder="กรุณากรอกข้อมูลเพิ่มเติม"
        value={additionalInfo}
        onChange={(e) => setAdditionalInfo(e.target.value)}
        textarea
        />
      </div>
  )
}

export default BookingDetailsForm
