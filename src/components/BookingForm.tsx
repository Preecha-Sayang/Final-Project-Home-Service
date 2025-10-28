import { useState, useEffect, useMemo } from 'react'
import { MapPin } from 'lucide-react'
import { useBookingStore } from '@/stores/bookingStore'
import DatePicker from '@/components/input/inputDatePicker/date_picker_select'
import TimePicker from '@/components/input/inputTimePicker/time_picker_select'
import InputField from '@/components/input/inputField/input_state'
import InputDropdown from '@/components/input/inputDropdown/input_dropdown'
import GoogleLocationPickerModal from '@/components/location/GoogleLocationPickerModal'
import type { GeoPoint } from '@/types/location'
import { format, parseISO, isToday, parse } from 'date-fns'
import { useAuth } from '@/context/AuthContext'

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

interface DefaultAddress {
  address: string
  province_code: number
  district_code: number
  subdistrict_code: number
}

const BookingDetailsForm: React.FC = () => {
  const { customerInfo, updateCustomerInfo } = useBookingStore()
  const { accessToken } = useAuth()

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

  // Default address state
  const [useDefaultAddress, setUseDefaultAddress] = useState(false)
  const [defaultAddress, setDefaultAddress] = useState<DefaultAddress | null>(null)
  const [loadingDefaultAddress, setLoadingDefaultAddress] = useState(false)
  const [hasDefaultAddress, setHasDefaultAddress] = useState(false)

  // 🗺️ Map modal state
  const [showMapModal, setShowMapModal] = useState(false)
  const [mapLocation, setMapLocation] = useState<{ point: GeoPoint; place_name?: string } | undefined>(
    customerInfo.latitude && customerInfo.longitude
      ? {
          point: { lat: customerInfo.latitude, lng: customerInfo.longitude },
          place_name: address,
        }
      : undefined
  )

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

  // Fetch default address when component mounts
  useEffect(() => {
    const fetchDefaultAddress = async () => {
      if (!accessToken) {
        console.log('[BookingForm] No access token, skipping default address fetch')
        return
      }

      try {
        setLoadingDefaultAddress(true)
        console.log('[BookingForm] Fetching default address...')

        const response = await fetch('/api/profile/default-address', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        console.log('[BookingForm] Response status:', response.status)

        if (!response.ok) {
          console.log('[BookingForm] No default address found or error occurred')
          setHasDefaultAddress(false)
          return
        }

        const data = await response.json()
        console.log('[BookingForm] Default address data:', data)

        if (data.hasAddress && data.address) {
          setDefaultAddress(data.address)
          setHasDefaultAddress(true)
          console.log('[BookingForm] Default address loaded successfully')
        } else {
          setHasDefaultAddress(false)
          console.log('[BookingForm] No address in response')
        }
      } catch (error) {
        console.error('[BookingForm] Error fetching default address:', error)
        setHasDefaultAddress(false)
      } finally {
        setLoadingDefaultAddress(false)
      }
    }

    fetchDefaultAddress()
  }, [accessToken])

  // Handle "ใช้ที่อยู่เริ่มต้น" checkbox
  const handleUseDefaultAddress = async (checked: boolean) => {
    console.log('[BookingForm] Checkbox changed:', checked)
    setUseDefaultAddress(checked)

    if (checked && defaultAddress) {
      console.log('[BookingForm] Filling form with default address:', defaultAddress)

      // กรอกที่อยู่
      setAddress(defaultAddress.address)

      // ตั้งค่า code
      const provCode = defaultAddress.province_code.toString()
      const distCode = defaultAddress.district_code.toString()
      const subdistCode = defaultAddress.subdistrict_code.toString()

      setSelectedProvinceCode(provCode)
      setSelectedDistrictCode(distCode)
      setSelectedSubdistrictCode(subdistCode)

      // ดึงชื่อจังหวัด
      const provinceData = provinces.find((p) => p.province_code === defaultAddress.province_code)
      if (provinceData) {
        setProvince(provinceData.province_name_th)
      }

      try {
        // โหลดอำเภอ
        const districtRes = await fetch(`/api/location/districts?province_code=${defaultAddress.province_code}`)
        if (districtRes.ok) {
          const districtData = await districtRes.json()
          setDistricts(districtData)

          // ดึงชื่ออำเภอ
          const districtInfo = districtData.find((d: District) => d.district_code === defaultAddress.district_code)
          if (districtInfo) {
            setDistrict(districtInfo.district_name_th)
          }
        }

        // โหลดตำบล
        const subdistrictRes = await fetch(`/api/location/subdistricts?district_code=${defaultAddress.district_code}`)
        if (subdistrictRes.ok) {
          const subdistrictData = await subdistrictRes.json()
          setSubdistricts(subdistrictData)

          // ดึงชื่อตำบล
          const subdistrictInfo = subdistrictData.find(
            (s: Subdistrict) => s.subdistrict_code === defaultAddress.subdistrict_code
          )
          if (subdistrictInfo) {
            setSubDistrict(subdistrictInfo.subdistrict_name_th)
          }
        }
      } catch (error) {
        console.error('[BookingForm] Error loading location data:', error)
      }
    } else if (!checked) {
      console.log('[BookingForm] Clearing form')
      // Clear form
      setAddress('')
      setProvince('')
      setDistrict('')
      setSubDistrict('')
      setSelectedProvinceCode('')
      setSelectedDistrictCode('')
      setSelectedSubdistrictCode('')
      setDistricts([])
      setSubdistricts([])
      // Clear map location
      setMapLocation(undefined)
    }
  }

  // 🔧 Update store when form values OR mapLocation change
  useEffect(() => {
    console.log('[BookingForm] Updating store with mapLocation:', mapLocation)
    updateCustomerInfo({
      serviceDate: serviceDate ? parseISO(serviceDate.split('-').reverse().join('-')) : null,
      serviceTime,
      address,
      province,
      district,
      subDistrict,
      additionalInfo,
      latitude: mapLocation?.point.lat ?? null,
      longitude: mapLocation?.point.lng ?? null,
    })
  }, [
    serviceDate,
    serviceTime,
    address,
    province,
    district,
    subDistrict,
    additionalInfo,
    mapLocation,
    updateCustomerInfo,
  ])

  // Handle province selection
  const handleProvinceChange = async (provinceCode: string) => {
    const code = parseInt(provinceCode)
    setSelectedProvinceCode(provinceCode)
    setSelectedDistrictCode('')
    setSelectedSubdistrictCode('')

    // หาชื่อจังหวัด
    const provinceData = provinces.find((p) => p.province_code === code)
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
      // Clear map location when address changes
      setMapLocation(undefined)
    }
  }

  // Handle district selection
  const handleDistrictChange = async (districtCode: string) => {
    const code = parseInt(districtCode)
    setSelectedDistrictCode(districtCode)
    setSelectedSubdistrictCode('')

    // หาชื่ออำเภอ
    const districtData = districts.find((d) => d.district_code === code)
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
      // Clear map location when address changes
      setMapLocation(undefined)
    }
  }

  // Handle subdistrict selection
  const handleSubdistrictChange = (subdistrictCode: string) => {
    const code = parseInt(subdistrictCode)
    setSelectedSubdistrictCode(subdistrictCode)

    // หาชื่อตำบล
    const subdistrictData = subdistricts.find((s) => s.subdistrict_code === code)
    if (subdistrictData) {
      setSubDistrict(subdistrictData.subdistrict_name_th)
      // Clear map location when address changes
      setMapLocation(undefined)
    }
  }

  // 🗺️ Handle map confirmation
  const handleMapConfirm = (picked: { point: GeoPoint; place_name?: string }) => {
    console.log('[BookingForm] Map location confirmed:', picked)
    setMapLocation(picked)

    // อัพเดทที่อยู่จาก place_name ถ้ามี
    if (picked.place_name && !address) {
      setAddress(picked.place_name)
    }
  }

  // 🗺️ Get center point for map
  const getMapCenter = (): GeoPoint => {
    // ถ้ามี mapLocation ให้ใช้
    if (mapLocation) {
      return mapLocation.point
    }
    // ถ้ามีใน customerInfo
    if (customerInfo.latitude && customerInfo.longitude) {
      return { lat: customerInfo.latitude, lng: customerInfo.longitude }
    }
    // Default: Bangkok
    return { lat: 13.736717, lng: 100.523186 }
  }

  // คำนวณเวลาขั้นต่ำสำหรับ TimePicker (ถ้าเลือกวันปัจจุบัน)
  const minTime = useMemo(() => {
    if (!serviceDate) return undefined
    try {
      const selectedDate = parse(serviceDate, 'dd-MM-yyyy', new Date())
      if (isToday(selectedDate)) {
        const now = new Date()
        const currentMinutes = now.getMinutes()
        const roundedMinutes = Math.ceil((currentMinutes + 15) / 15) * 15
        let hour = now.getHours()
        let minute = roundedMinutes

        // ถ้านาทีเกิน 60 ให้เพิ่มชั่วโมง
        if (minute >= 60) {
          hour += 1
          minute = minute % 60
        }

        // ถ้าเกิน 23:45 ไม่ให้เลือกเวลาเลย
        if (hour >= 24) {
          return '23:59'
        }

        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      }
    } catch (error) {
      console.error('Error parsing date:', error)
    }
    return undefined
  }, [serviceDate])

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
  const provinceOptions = provinces.map((p) => ({
    label: p.province_name_th,
    value: p.province_code.toString(),
  }))

  const districtOptions = districts.map((d) => ({
    label: d.district_name_th,
    value: d.district_code.toString(),
  }))

  const subdistrictOptions = subdistricts.map((s) => ({
    label: s.subdistrict_name_th,
    value: s.subdistrict_code.toString(),
  }))

  return (
    <>
      <div className="bg-white rounded-lg shadow p-4 md:p-6 space-y-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">กรอกข้อมูลบริการ</h2>

        {/* วันที่และเวลา */}
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

        {/* ที่อยู่ */}
        <div className="w-full">
          <InputField
            label="ที่อยู่*"
            placeholder="กรุณากรอกที่อยู่"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value)
              // Clear map location when address is manually changed
              if (e.target.value !== mapLocation?.place_name) {
                setMapLocation(undefined)
              }
            }}
            rightIcon={<MapPin className="h-4 w-4" />}
            disabled={useDefaultAddress}
          />
        </div>

        {/* จังหวัด > อำเภอ > ตำบล */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputDropdown
            label="จังหวัด*"
            value={selectedProvinceCode}
            onChange={handleProvinceChange}
            options={provinceOptions}
            placeholder="เลือกจังหวัด"
            disabled={useDefaultAddress}
          />
          <InputDropdown
            label="เขต / อำเภอ*"
            value={selectedDistrictCode}
            onChange={handleDistrictChange}
            options={districtOptions}
            placeholder="เลือกเขต / อำเภอ"
            disabled={!selectedProvinceCode || useDefaultAddress}
          />
          <InputDropdown
            label="แขวง / ตำบล*"
            value={selectedSubdistrictCode}
            onChange={handleSubdistrictChange}
            options={subdistrictOptions}
            placeholder="เลือกแขวง / ตำบล"
            disabled={!selectedDistrictCode || useDefaultAddress}
          />
        </div>

        {/* Checkbox ใช้ที่อยู่เริ่มต้น */}
        {hasDefaultAddress && defaultAddress && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="useDefaultAddress"
              checked={useDefaultAddress}
              onChange={(e) => handleUseDefaultAddress(e.target.checked)}
              disabled={loadingDefaultAddress}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <label
              htmlFor="useDefaultAddress"
              className="text-sm font-medium text-gray-700 cursor-pointer select-none flex-1"
            >
              <span className="text-gray-400 ">ใช้ที่อยู่เริ่มต้น</span>
            </label>
          </div>
        )}

        {/* 🗺️ ปุ่มเปิดแผนที่ */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowMapModal(true)}
            disabled={!address || !province || !district || !subDistrict}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
          >
            <MapPin className="h-5 w-5" />
            <span className="font-medium">
              {mapLocation ? 'ตรวจสอบตำแหน่งอีกครั้ง' : 'ระบุตำแหน่งบนแผนที่ (Required)'}
            </span>
          </button>

          {/* แสดงสถานะพิกัด */}
          {mapLocation && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <svg className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800">✅ ตำแหน่งถูกระบุแล้ว</p>
                <p className="text-xs text-green-600 mt-1 break-all">
                  พิกัด: {mapLocation.point.lat.toFixed(6)}, {mapLocation.point.lng.toFixed(6)}
                </p>
              </div>
            </div>
          )}

          {/* คำเตือนถ้ายังไม่ได้ระบุพิกัด */}
          {!mapLocation && address && province && district && subDistrict && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <svg className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-800">⚠️ กรุณาระบุตำแหน่งบนแผนที่</p>
                <p className="text-xs text-red-600 mt-1">
                  จำเป็นต้องระบุพิกัดเพื่อให้ช่างสามารถหาตำแหน่งของคุณได้อย่างถูกต้อง
                </p>
              </div>
            </div>
          )}
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

      {/* 🗺️ Map Modal */}
      <GoogleLocationPickerModal
        open={showMapModal}
        onClose={() => setShowMapModal(false)}
        onConfirm={handleMapConfirm}
        initial={mapLocation ?? { point: getMapCenter(), place_name: address }}
        hideHeader={false}
        hideActions={false}
      />
    </>
  )
}

export default BookingDetailsForm