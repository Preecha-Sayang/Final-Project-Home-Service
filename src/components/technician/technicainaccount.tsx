import { useState } from "react";
import InputField from "@/components/input/inputField/input_state";
import ButtonPrimary from "@/components/button/buttonprimary";
import { User, Phone, MapPin, RefreshCw } from "lucide-react";

// Validation functions
const required = (v: string) => (v.trim() ? null : "กรุณาระบุข้อมูล");
const phoneValidation = (v: string) => /^[0-9]{10}$/.test(v) ? null : "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก";

export default function TechnicianAccount() {
    const [formData, setFormData] = useState({
        firstName: "สมาน",
        lastName: "เยี่ยมยอด",
        phone: "0890002345",
        address: "332 อาคารเดอะไนน์ทาวเวอร์ เสนานิคม จตุจักร กรุงเทพฯ",
    });
    
    const [isReadyToServe, setIsReadyToServe] = useState(false);
    const [selectedServices, setSelectedServices] = useState({
        "ล้างแอร์": true,
        "ติดตั้งแอร์": true,
        "ทำความสะอาดทั่วไป": true,
        "ซ่อมแอร์": true,
        "ซ่อมเครื่องซักผ้า": true,
        "ติดตั้งเครื่องดูดควัน": true,
        "ติดตั้งเครื่องทำน้ำอุ่น": true,
        "ติดตั้งเตาแก๊ส": false,
        "ติดตั้งชักโครก": false,
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleServiceToggle = (service: string) => {
        setSelectedServices(prev => ({
            ...prev,
            [service]: !prev[service]
        }));
    };

    const handleRefreshLocation = () => {
        // Here you would typically get current location
        console.log("Refreshing location...");
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            // Here you would typically send the data to your API
            console.log("Form data:", formData);
            console.log("Ready to serve:", isReadyToServe);
            console.log("Selected services:", selectedServices);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            alert("บันทึกข้อมูลสำเร็จ");
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--gray-50)] py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[var(--gray-800)] mb-2">
                        ข้อมูลบัญชีช่าง
                    </h1>
                    <p className="text-[var(--gray-600)]">
                        จัดการข้อมูลส่วนตัวและบริการของคุณ
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="max-w-xl mx-auto space-y-8">
                        
                        {/* รายละเอียดบัญชี Section */}
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--gray-800)] mb-6">
                                รายละเอียดบัญชี
                            </h2>
                            <div className="space-y-4">
                                {/* Name Fields */}
                                <div className="space-y-4">
                                    <div>
                                        <InputField
                                            label="ชื่อ*"
                                            placeholder="กรุณากรอกชื่อ"
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                                            validate={required}
                                            leftIcon={<User className="h-4 w-4" />}
                                        />
                                    </div>
                                    <div>
                                        <InputField
                                            label="นามสกุล*"
                                            placeholder="กรุณากรอกนามสกุล"
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                                            validate={required}
                                        />
                                    </div>
                                </div>

                                {/* Phone Field */}
                                <div>
                                    <InputField
                                        label="เบอร์ติดต่อ*"
                                        placeholder="กรุณากรอกเบอร์โทรศัพท์"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        validate={phoneValidation}
                                        leftIcon={<Phone className="h-4 w-4" />}
                                        inputMode="numeric"
                                        maxLength={10}
                                    />
                                </div>

                                {/* Address Field with Refresh Button */}
                                <div>
                                    <InputField
                                        label="ตำแหน่งที่อยู่ปัจจุบัน*"
                                        placeholder="กรุณากรอกที่อยู่"
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange("address", e.target.value)}
                                        validate={required}
                                        leftIcon={<MapPin className="h-4 w-4" />}
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="button"
                                            onClick={handleRefreshLocation}
                                            className="flex items-center gap-2 px-4 py-2 bg-[var(--blue-100)] text-[var(--blue-600)] rounded-lg hover:bg-[var(--blue-200)] transition-colors"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                            รีเฟรช
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* สถานะบัญชี Section */}
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--gray-800)] mb-6">
                                สถานะบัญชี
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsReadyToServe(!isReadyToServe)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            isReadyToServe ? 'bg-[var(--blue-600)]' : 'bg-[var(--gray-300)]'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                isReadyToServe ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                    <span className="text-[var(--gray-800)] font-medium">พร้อมให้บริการ</span>
                                </div>
                                <p className="text-sm text-[var(--gray-600)] ml-16">
                                    ระบบจะแสดงคำสั่งซ่อมในบริเวณใกล้เคียงตำแหน่งที่อยู่ปัจจุบัน ให้สามารถเลือกรับงานได้
                                </p>
                            </div>
                        </div>

                        {/* บริการที่รับซ่อม Section */}
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--gray-800)] mb-6">
                                บริการที่รับซ่อม
                            </h2>
                            <div className="space-y-3">
                                {Object.entries(selectedServices).map(([service, isSelected]) => (
                                    <label key={service} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleServiceToggle(service)}
                                            className="w-4 h-4 text-[var(--blue-600)] bg-gray-100 border-gray-300 rounded focus:ring-[var(--blue-500)] focus:ring-2"
                                        />
                                        <span className="text-[var(--gray-700)]">{service}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center mt-8 pt-6 border-t border-[var(--gray-200)]">
                        <ButtonPrimary
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-48"
                        >
                            {isLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                        </ButtonPrimary>
                    </div>
                </div>
            </div>
        </div>
    );
}
