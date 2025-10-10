import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import { useBookingStore } from '@/stores/bookingStore'
import {
  useThailandAddress,
  type District,
  type Subdistrict,
} from '@/hooks/useThailandAddress'
import DatePicker from '@/components/input/inputDatePicker/date_picker'
import TimePicker from '@/components/input/inputTimePicker/time_picker'
import InputField from '@/components/input/inputField/input_state'
import InputDropdown from '@/components/input/inputDropdown/input_dropdown'
import { format, parseISO } from 'date-fns'

const BookingDetailsForm: React.FC = () => {
  const { customerInfo, updateCustomerInfo } = useBookingStore()

  // ใช้ Thailand Address Hook
  const {
    provinces,
    getDistrictsByProvince,
    getSubdistrictsByDistrict,
    loading: addressLoading,
    error: addressError,
  } = useThailandAddress()

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
  const [districts, setDistricts] = useState<District[]>([])
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([])

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
  const handleProvinceChange = (provinceCode: string) => {
    const code = parseInt(provinceCode)
    setSelectedProvinceCode(provinceCode)
    setSelectedDistrictCode('')
    setSelectedSubdistrictCode('')

    // หาชื่อจังหวัด
    const provinceData = provinces.find(p => p.code === code)
    if (provinceData) {
      setProvince(provinceData.nameTh)
      // โหลดอำเภอ
      const districtsList = getDistrictsByProvince(code)
      setDistricts(districtsList)
      setSubdistricts([])
      // Reset ค่าอื่นๆ
      setDistrict('')
      setSubDistrict('')
    }
  }

  // Handle district selection
  const handleDistrictChange = (districtCode: string) => {
    const code = parseInt(districtCode)
    setSelectedDistrictCode(districtCode)
    setSelectedSubdistrictCode('')

    // หาชื่ออำเภอ
    const districtData = districts.find(d => d.code === code)
    if (districtData) {
      setDistrict(districtData.nameTh)
      // โหลดตำบล
      const subdistrictsList = getSubdistrictsByDistrict(code)
      setSubdistricts(subdistrictsList)
      // Reset ค่าอื่นๆ
      setSubDistrict('')
    }
  }

  // Handle subdistrict selection
  const handleSubdistrictChange = (subdistrictCode: string) => {
    const code = parseInt(subdistrictCode)
    setSelectedSubdistrictCode(subdistrictCode)
    // หาชื่อตำบล
    const subdistrictData = subdistricts.find(s => s.code === code)
    if (subdistrictData) {
      setSubDistrict(subdistrictData.nameTh)
    }
  }

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
    label: p.nameTh,
    value: p.code.toString(),
  }))

  const districtOptions = districts.map(d => ({
    label: d.nameTh,
    value: d.code.toString(),
  }))

  const subdistrictOptions = subdistricts.map(s => ({
    label: s.nameTh,
    value: s.code.toString(),
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
