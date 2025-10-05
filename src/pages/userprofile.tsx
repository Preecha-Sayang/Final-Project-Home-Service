import { Footer } from "@/components/footer";
import Navbar from "@/components/navbar/navbar";
import Image from "next/image";
import { useEffect, useState } from "react";
import OrderService from "./afterservice/orderservices";
import InputDropdown from "@/components/input/inputDropdown/input_dropdown";
import ButtonPrimary from "@/components/button/buttonprimary";
import ButtonSecondary from "@/components/button/buttonsecondary";

function UserProfile() {
  const menuItems = [
    { label: "ข้อมูลผู้ใช้งาน", icon: "/images/icon_user.svg" },
    { label: "รายการคำสั่งซ่อม", icon: "/images/icon_tasklist.svg" },
    { label: "ประวัติการสั่งซ่อม", icon: "/images/icon_history.svg" },
  ];
  
  const [keyword, setkeyword] = useState("ข้อมูลผู้ใช้งาน");
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: "Vaha",
    lastName: "ok",
    phone: "096 686 1234",
    email: "22melkitty.smtp@gmail.com",
    address: "กรุงเทพ",
    province: "",
    district: "",
    subdistrict: "",
  });

  const [profileImage, setProfileImage] = useState<string>("");

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    console.log("Saving profile:", formData);
    // Add your save logic here
  };

  const handleCancel = () => {
    console.log("Cancelled");
    // Reset or navigate away
  };

  function UserProfileForm() {
    return (
      <div className="w-full h-full bg-[var(--white)] p-8 overflow-y-auto">
        {/* รูปโปรไฟล์ / Profile Picture Section */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-[var(--gray-300)] flex items-center justify-center text-4xl font-medium text-[var(--gray-600)] overflow-hidden">
              {profileImage ? (
                <Image src={profileImage} alt="Profile" width={128} height={128} className="object-cover" />
              ) : (
                <span>Vo</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-[var(--white)] rounded-full p-2 cursor-pointer shadow-md hover:bg-[var(--gray-100)]">
              <Image src="/images/icon_gallery.svg" alt="Upload" width={20} height={20} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>
        </div>

        {/* ช่องกรอกข้อมูล / Form Fields */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-6">
          {/* ชื่อ / First Name */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Image src="/images/icon_user.svg" alt="user" width={16} height={16} className="brightness-0" />
              <label className="text-sm font-semibold text-[var(--gray-900)]">ชื่อ</label>
            </div>
            <input
              type="text"
              placeholder="ชื่อ"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="w-full h-[44px] px-4 border border-[var(--gray-300)] rounded-md text-base font-medium text-[var(--gray-900)]
                hover:border-[var(--gray-300)] focus:outline-none focus:ring-1 focus:ring-[var(--blue-600)]"
            />
          </div>

          {/* นามสกุล / Last Name */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Image src="/images/icon_user.svg" alt="user" width={16} height={16} className="brightness-0" />
              <label className="text-sm font-semibold text-[var(--gray-900)]">นามสกุล</label>
            </div>
            <input
              type="text"
              placeholder="นามสกุล"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="w-full h-[44px] px-4 border border-[var(--gray-300)] rounded-md text-base font-medium text-[var(--gray-900)]
                hover:border-[var(--gray-300)] focus:outline-none focus:ring-1 focus:ring-[var(--blue-600)]"
            />
          </div>

          {/* หมายเลขโทรศัพท์ / Phone Number */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Image src="/images/icon_phone.svg" alt="phone" width={16} height={16} className="brightness-0" />
              <label className="text-sm font-semibold text-[var(--gray-900)]">หมายเลขโทรศัพท์</label>
            </div>
            <input
              type="text"
              placeholder="หมายเลขโทรศัพท์"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full h-[44px] px-4 border border-[var(--gray-300)] rounded-md text-base font-medium text-[var(--gray-900)]
                hover:border-[var(--gray-300)] focus:outline-none focus:ring-1 focus:ring-[var(--blue-600)]"
            />
          </div>

          {/* อีเมล / Email */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Image src="/images/icon_mail.svg" alt="email" width={16} height={16} className="brightness-0" />
              <label className="text-sm font-semibold text-[var(--gray-900)]">อีเมล</label>
            </div>
            <input
              type="email"
              placeholder="อีเมล"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full h-[44px] px-4 border border-[var(--gray-300)] rounded-md text-base font-medium text-[var(--gray-900)]
                hover:border-[var(--gray-300)] focus:outline-none focus:ring-1 focus:ring-[var(--blue-600)]"
            />
          </div>

          {/* ที่อยู่ / Address - Full Width */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Image src="/images/icon_pin.svg" alt="address" width={16} height={16} className="brightness-0" />
              <label className="text-sm font-semibold text-[var(--gray-900)]">ที่อยู่</label>
            </div>
            <input
              type="text"
              placeholder="ที่อยู่"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="w-full h-[44px] px-4 border border-[var(--gray-300)] rounded-md text-base font-medium text-[var(--gray-900)]
                hover:border-[var(--gray-300)] focus:outline-none focus:ring-1 focus:ring-[var(--blue-600)]"
            />
          </div>

          {/* เขต/อำเภอ / District */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Image src="/images/icon_pin.svg" alt="location" width={16} height={16} className="brightness-0" />
              <label className="text-sm font-semibold text-[var(--gray-900)]">แขวง/อำเภอ</label>
            </div>
            <InputDropdown
              value={formData.district}
              onChange={(value) => handleInputChange("district", value)}
              options={[
                { label: "เขตห้วยขวาง", value: "huaykhwang" },
                { label: "เขตบางกะปิ", value: "bangkapi" },
                { label: "เขตดินแดง", value: "dindaeng" },
              ]}
              placeholder="เลือกแขวง/อำเภอ"
              className="h-[44px]"
            />
          </div>

          {/* จังหวัด / Province */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Image src="/images/icon_pin.svg" alt="location" width={16} height={16} className="brightness-0" />
              <label className="text-sm font-semibold text-[var(--gray-900)]">จังหวัด</label>
            </div>
            <InputDropdown
              value={formData.province}
              onChange={(value) => handleInputChange("province", value)}
              options={[
                { label: "กรุงเทพมหานคร", value: "bangkok" },
                { label: "เชียงใหม่", value: "chiangmai" },
                { label: "ภูเก็ต", value: "phuket" },
                { label: "ขอนแก่น", value: "khonkaen" },
              ]}
              placeholder="เลือกจังหวัด"
              className="h-[44px]"
            />
          </div>

          {/* แขวง/ตำบล / Subdistrict */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Image src="/images/icon_pin.svg" alt="location" width={16} height={16} className="brightness-0" />
              <label className="text-sm font-semibold text-[var(--gray-900)]">แขวง/ตำบล</label>
            </div>
            <InputDropdown
              value={formData.subdistrict}
              onChange={(value) => handleInputChange("subdistrict", value)}
              options={[
                { label: "ห้วยขวาง", value: "huaykhwang" },
                { label: "บางกะปิ", value: "bangkapi" },
                { label: "ดินแดง", value: "dindaeng" },
              ]}
              placeholder="เลือกแขวง/ตำบล"
              className="h-[44px]"
            />
          </div>
        </div>

        {/* ปุ่มบันทึกและยกเลิก / Save and Cancel Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <ButtonPrimary onClick={handleSave} className="w-[200px]">
            บันทึก
          </ButtonPrimary>
          <ButtonSecondary onClick={handleCancel} className="w-[200px]">
            ยกเลิก
          </ButtonSecondary>
        </div>
      </div>
    );
  }

  function RenderContent() {
    switch (keyword) {
      case "ข้อมูลผู้ใช้งาน":
        return <UserProfileForm />;

      case "รายการคำสั่งซ่อม":
        return <OrderService />;

      case "ประวัติการสั่งซ่อม":
        return <p className="p-8">กำลังคิดค้นนวัฒกรรม</p>;

      default:
        return <p className="p-8">กรุณาเลือกนวัฒกรรมใหม่</p>;
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="h-[100px] w-[100%] bg-[var(--blue-600)] flex justify-center items-center">
        <p className="text-[32px] font-[500] text-[var(--white)]">{keyword}</p>
      </div>

      <div className="flex-grow bg-[var(--gray-100)]">
        <div className="flex flex-row justify-center gap-[35px] my-[30px]">
          <div
            id="category-select"
            className="w-[250px] h-fit bg-[var(--white)] flex flex-col gap-[16px]
                    px-[25px] pt-[25px] border-[1px] border-[var(--gray-300)]"
          >
            <p className="text-[var(--gray-700)] text-[20px] font-[400]">
              บัญชีผู้ใช้
            </p>
            <div className="border bg-[var(--gray-100)]"></div>
            <div>
              {menuItems.map((item) => (
                <div
                  key={item.label}
                  id={item.label}
                  className={`flex flex-row items-center h-[50px] gap-[12px] px-[16px] w-full
                    hover:cursor-pointer hover:bg-[var(--gray-200)] transition-colors
                    ${keyword === item.label ? "bg-[var(--blue-100)] text-[var(--blue-600)]" : ""}`}
                  onClick={() => setkeyword(item.label)}
                >
                  <Image
                    src={item.icon}
                    alt={`${item.label}_icon`}
                    width={24}
                    height={24}
                  />
                  <p>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="w-[800px] min-h-[600px] bg-[var(--white)] shadow-sm">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center w-[100%] h-[600px]">
                <div className="w-8 h-8 border-4 border-[var(--gray-300)] border-t-[var(--blue-500)] rounded-full animate-spin"></div>
              </div>
            ) : (
              <RenderContent />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default UserProfile;
