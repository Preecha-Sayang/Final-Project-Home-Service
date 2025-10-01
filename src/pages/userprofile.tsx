import { useState } from "react";
import Navbar from "@/components/navbar/navbar";
import InputField from "@/components/input/inputField/input_state";
import InputDropdown from "@/components/input/inputDropdown/input_dropdown";
import ButtonPrimary from "@/components/button/buttonprimary";
import ButtonSecondary from "@/components/button/buttonsecondary";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Camera,
  FileText,
  Clock
} from "lucide-react";

export default function UserProfile() {
  // สถานะของฟอร์มข้อมูลผู้ใช้ (Form state)
  const [formData, setFormData] = useState({
    firstName: "Vahi",
    lastName: "ok",
    phone: "096 686 1234",
    email: "22whiskey.smd@gmail.com",
    address: "กรอกที่อยู่",
    province: "",
    district: "",
    subdistrict: ""
  });

  // สถานะการนำทางเมนู (Navigation state)
  const [activeTab, setActiveTab] = useState("user-info");

  // ตัวเลือกจังหวัด (ข้อมูลตัวอย่าง) - Province options (sample data)
  const provinceOptions = [
    { label: "กรุงเทพมหานคร", value: "bangkok" },
    { label: "เชียงใหม่", value: "chiangmai" },
    { label: "ขอนแก่น", value: "khonkaen" },
    { label: "สงขลา", value: "songkhla" },
  ];

  // ตัวเลือกเขต/อำเภอ (ข้อมูลตัวอย่าง) - District options (sample data)
  const districtOptions = [
    { label: "เขตจตุจักร", value: "chatuchak" },
    { label: "เขตบางรัก", value: "bangrak" },
    { label: "เขตสาทร", value: "sathorn" },
    { label: "เขตวัฒนา", value: "watthana" },
  ];

  // ตัวเลือกแขวง/ตำบล (ข้อมูลตัวอย่าง) - Sub-district options (sample data)
  const subdistrictOptions = [
    { label: "แขวงลาดยาว", value: "latyao" },
    { label: "แขวงเสนานิคม", value: "senanikom" },
    { label: "แขวงจตุจักร", value: "chatuchak" },
    { label: "แขวงจันทรเกษม", value: "chanthrakasem" },
  ];

  // ฟังก์ชันจัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม (Handle input change)
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ฟังก์ชันบันทึกข้อมูลโปรไฟล์ (Save profile function)
  const handleSave = () => {
    // จัดการการบันทึกข้อมูลที่นี่ (Handle save logic here)
    console.log("กำลังบันทึกโปรไฟล์:", formData);
  };

  // ฟังก์ชันยกเลิกการแก้ไข (Cancel function)
  const handleCancel = () => {
    // จัดการการยกเลิกที่นี่ (Handle cancel logic here)
    console.log("กำลังยกเลิกการเปลี่ยนแปลง");
  };

  return (
    <div className="min-h-screen bg-[var(--gray-100)]">
      <Navbar />
      
      {/* ส่วนหัวข้อ - Header Section */}
      <div className="bg-[var(--blue-600)] py-2">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-lg font-bold text-white text-center">
            รายละเอียดบัญชี
          </h1>
        </div>
      </div>

      {/* เนื้อหาหลัก - Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* แถบนำทางด้านซ้าย - Left Sidebar Navigation */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[var(--gray-900)] mb-6">
                บัญชีผู้ใช้
              </h2>
              
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("user-info")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === "user-info"
                      ? "bg-[var(--blue-100)] text-[var(--blue-600)]"
                      : "text-[var(--gray-600)] hover:bg-[var(--gray-100)]"
                  }`}
                >
                  <User className={`w-5 h-5 ${activeTab === "user-info" ? "text-[var(--blue-600)]" : "text-[var(--gray-500)]"}`} />
                  <span className="font-medium">ข้อมูลผู้ใช้งาน</span>
                </button>

                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === "orders"
                      ? "bg-[var(--blue-100)] text-[var(--blue-600)]"
                      : "text-[var(--gray-600)] hover:bg-[var(--gray-100)]"
                  }`}
                >
                  <FileText className={`w-5 h-5 ${activeTab === "orders" ? "text-[var(--blue-600)]" : "text-[var(--gray-500)]"}`} />
                  <span className="font-medium">รายการค้าสั่งซ่อม</span>
                </button>

                <button
                  onClick={() => setActiveTab("history")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === "history"
                      ? "bg-[var(--blue-100)] text-[var(--blue-600)]"
                      : "text-[var(--gray-600)] hover:bg-[var(--gray-100)]"
                  }`}
                >
                  <Clock className={`w-5 h-5 ${activeTab === "history" ? "text-[var(--blue-600)]" : "text-[var(--gray-500)]"}`} />
                  <span className="font-medium">ประวัติการซ่อม</span>
                </button>
              </nav>
            </div>
          </div>

          {/* พื้นที่เนื้อหาหลัก - Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {/* รูปโปรไฟล์ผู้ใช้ - User Avatar */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-32 h-32 bg-[var(--gray-400)] rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">Vo</span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--blue-600)] rounded-full flex items-center justify-center hover:bg-[var(--blue-700)] transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* ช่องกรอกข้อมูล - Form Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* คอลัมน์ซ้าย - Left Column */}
                <div className="space-y-6">
                  {/* ชื่อ - First Name */}
                  <div>
                    <InputField
                      label="ชื่อ"
                      placeholder="กรอกชื่อ"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      leftIcon={<User className="w-4 h-4" />}
                    />
                  </div>

                  {/* เบอร์โทรศัพท์ - Phone */}
                  <div>
                    <InputField
                      label="เบอร์โทรศัพท์"
                      placeholder="กรอกเบอร์โทรศัพท์"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      leftIcon={<Phone className="w-4 h-4" />}
                    />
                  </div>

                  {/* ที่อยู่ - Address */}
                  <div>
                    <InputField
                      label="ที่อยู่"
                      placeholder="กรอกที่อยู่"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      leftIcon={<MapPin className="w-4 h-4" />}
                    />
                  </div>

                  {/* เขต/อำเภอ - District */}
                  <div>
                    <InputDropdown
                      label="เขต/อำเภอ"
                      value={formData.district}
                      onChange={(value) => handleInputChange("district", value)}
                      options={districtOptions}
                      placeholder="เลือกเขต/อำเภอ"
                    />
                  </div>
                </div>

                {/* คอลัมน์ขวา - Right Column */}
                <div className="space-y-6">
                  {/* นามสกุล - Last Name */}
                  <div>
                    <InputField
                      label="นามสกุล"
                      placeholder="กรอกนามสกุล"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      leftIcon={<User className="w-4 h-4" />}
                    />
                  </div>

                  {/* อีเมล - Email */}
                  <div>
                    <InputField
                      label="อีเมล"
                      placeholder="กรอกอีเมล"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      leftIcon={<Mail className="w-4 h-4" />}
                    />
                  </div>

                  {/* จังหวัด - Province */}
                  <div>
                    <InputDropdown
                      label="จังหวัด"
                      value={formData.province}
                      onChange={(value) => handleInputChange("province", value)}
                      options={provinceOptions}
                      placeholder="เลือกจังหวัด"
                    />
                  </div>

                  {/* แขวง/ตำบล - Sub-district */}
                  <div>
                    <InputDropdown
                      label="แขวง/ตำบล"
                      value={formData.subdistrict}
                      onChange={(value) => handleInputChange("subdistrict", value)}
                      options={subdistrictOptions}
                      placeholder="เลือกแขวง/ตำบล"
                    />
                  </div>
                </div>
              </div>

              {/* ปุ่มดำเนินการ - Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <ButtonPrimary onClick={handleSave} className="!w-auto">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                    </svg>
                    บันทึก
                  </div>
                </ButtonPrimary>
                
                <ButtonSecondary onClick={handleCancel} className="!w-auto">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                    ยกเลิก
                  </div>
                </ButtonSecondary>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
