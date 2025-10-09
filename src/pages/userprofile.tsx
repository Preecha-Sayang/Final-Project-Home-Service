import { Footer } from "@/components/footer";
import Navbar from "@/components/navbar/navbar";
import Image from "next/image";
import { useEffect, useState } from "react";
import OrderService from "@/pages/afterservice/index";
import InputDropdown from "@/components/input/inputDropdown/input_dropdown";
import ButtonPrimary from "@/components/button/buttonprimary";
import ButtonSecondary from "@/components/button/buttonsecondary";
import { useAuth } from "@/context/AuthContext";

type UserData = {
  user_id: number;
  fullname: string;
  email: string;
  phone_number: string;
  create_at: string;
};

type Province = {
  province_id: number;
  name: string;
};

type District = {
  district_id: number;
  province_id: number;
  name: string;
};

type UserProfileFormProps = {
  profileImage: string;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formData: {
    fullname: string;
    phone: string;
    email: string;
    address: string;
    province: string;
    district: string;
    subdistrict: string;
  };
  onChange: (field: string, value: string) => void;
  provinceList: Province[];
  districtList: District[];
  onSave: () => void;
  onCancel: () => void;
};

function UserProfileForm({ profileImage, onImageUpload, formData, onChange, provinceList, districtList, onSave, onCancel }: UserProfileFormProps) {
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
              onChange={onImageUpload}
            />
          </label>
        </div>
      </div>

      {/* ช่องกรอกข้อมูล / Form Fields */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-6">
        {/* ชื่อ / Full Name */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Image src="/images/icon_user.svg" alt="user" width={16} height={16} className="brightness-0" />
            <label className="text-sm font-semibold text-[var(--gray-900)]">ชื่อ</label>
          </div>
          <input
            type="text"
            placeholder="ชื่อ"
            value={formData.fullname}
            onChange={(e) => onChange("fullname", e.target.value)}
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
            onChange={(e) => onChange("phone", e.target.value)}
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
            onChange={(e) => onChange("email", e.target.value)}
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
            onChange={(e) => onChange("address", e.target.value)}
            required
            className="w-full h-[44px] px-4 border border-[var(--gray-300)] rounded-md text-base font-medium text-[var(--gray-900)]
              hover:border-[var(--gray-300)] focus:outline-none focus:ring-1 focus:ring-[var(--blue-600)]"
          />
        </div>

        {/* จังหวัด / Province */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Image src="/images/icon_pin.svg" alt="location" width={16} height={16} className="brightness-0" />
            <label className="text-sm font-semibold text-[var(--gray-900)]">จังหวัด Province</label>
          </div>
          <InputDropdown
            value={formData.province}
            onChange={(value) => onChange("province", value)}
            options={provinceList.map((province) => ({ label: province.name, value: province.province_id.toString() }))}
            placeholder="เลือกจังหวัด"
            className="h-[44px]"
          />
        </div>

        {/* เขต/อำเภอ / District */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Image src="/images/icon_pin.svg" alt="location" width={16} height={16} className="brightness-0" />
            <label className="text-sm font-semibold text-[var(--gray-900)]">แขวง/อำเภอ District</label>
          </div>
          <InputDropdown
            value={formData.district}
            onChange={(value) => onChange("district", value)}
            options={districtList.map((district) => ({ label: district.name, value: district.district_id.toString() }))}
            placeholder="เลือกแขวง/อำเภอ"
            className="h-[44px]"
          />
        </div>

        {/* แขวง/ตำบล / Subdistrict */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Image src="/images/icon_pin.svg" alt="location" width={16} height={16} className="brightness-0" />
            <label className="text-sm font-semibold text-[var(--gray-900)]">แขวง/ตำบล subdistrict</label>
          </div>
          <input
            value={formData.subdistrict}
            type="text"
            onChange={(e) => onChange("subdistrict", e.target.value)}
            placeholder="เลือกแขวง/ตำบล"
            className="w-full h-[44px] px-4 border border-[var(--gray-300)] rounded-md text-base font-medium text-[var(--gray-900)]
              hover:border-[var(--gray-300)] focus:outline-none focus:ring-1 focus:ring-[var(--blue-600)]"
          />
        </div>
      </div>

      {/* ปุ่มบันทึกและยกเลิก / Save and Cancel Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <ButtonPrimary onClick={onSave} className="w-[200px]">
          บันทึก
        </ButtonPrimary>
        <ButtonSecondary onClick={onCancel} className="w-[200px]">
          ยกเลิก
        </ButtonSecondary>
      </div>
    </div>
  );
}

function UserProfile() {
  const menuItems = [
    { label: "ข้อมูลผู้ใช้งาน", icon: "/images/icon_user.svg" },
    { label: "รายการคำสั่งซ่อม", icon: "/images/icon_tasklist.svg" },
    { label: "ประวัติการสั่งซ่อม", icon: "/images/icon_history.svg" },
  ];
  
  const [keyword, setkeyword] = useState("ข้อมูลผู้ใช้งาน");
  const [isLoading, setIsLoading] = useState(false);

  const [userData, setUserData] = useState<UserData | undefined>(undefined);
  const { isLoggedIn, accessToken, refreshToken, login, logout } = useAuth();

  useEffect(() => {
    if (!accessToken) return;
    fetch("/api/profile", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUserData(data))
      .catch(() => {});
  }, [accessToken]);

  const [provinceList, setProvinceList] = useState<Province[]>([]);
  useEffect(() => {
    fetch("/api/location/provinces")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setProvinceList(data))
      .catch(() => {});
  }, []);

  const [districtList, setDistrictList] = useState<District[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    email: "",
    address: "",
    province: "",
    district: "",
    subdistrict: "",
  });

  // Lazy load districts only after a province is selected and reset dependent fields
  useEffect(() => {
    const provinceId = formData.province;
    // Reset dependent selections when user changes province is handled in handleInputChange

    if (!provinceId) {
      setDistrictList([]);
      return;
    }
    fetch(`/api/location/districts?province_id=${encodeURIComponent(provinceId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setDistrictList(Array.isArray(data) ? data : []))
      .catch(() => setDistrictList([]));
  }, [formData.province]);

  const [profileImage, setProfileImage] = useState<string>("");

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Sync initial user data into form once loaded, including address
  useEffect(() => {
    if (!userData) return;
    const firstAddress = (userData as any)?.addresses?.[0] || undefined;
    setFormData((prev) => ({
      ...prev,
      fullname: userData.fullname ?? "",
      phone: userData.phone_number ?? "",
      email: userData.email ?? "",
      address: firstAddress?.address ?? "",
      province: firstAddress?.province_id ? String(firstAddress.province_id) : "",
      district: firstAddress?.district_id ? String(firstAddress.district_id) : "",
      subdistrict: firstAddress?.subdistrict ?? "",
    }));
  }, [userData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      if (field === "province") {
        return { ...prev, province: value, district: ""};
      }
      if (field === "district") {
        return { ...prev, district: value};
      }
      return { ...prev, [field]: value };
    });
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
    if (!accessToken) {
      console.warn("No access token");
      return;
    }
    if (!formData.address || formData.address.trim() === "") {
      alert("กรุณากรอกที่อยู่");
      return;
    }
    try {
      const payload = {
        fullname: formData.fullname || undefined,
        email: formData.email || undefined,
        phone_number: formData.phone || undefined,
        address: formData.address || undefined,
        province_id: formData.province || undefined,
        district_id: formData.district || undefined,
        subdistrict: formData.subdistrict || undefined,
      };
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Save failed (${res.status})`);
      }
      const data = await res.json();
      // Optionally sync the returned profile into local state
      if (data?.profile) {
        setUserData((prev) => ({ ...(prev as any), ...data.profile }));
      }
      console.log("Profile saved successfully");
    } catch (e) {
      console.error("Failed to save profile", e);
    }
  };

  const handleCancel = () => {
    console.log("Cancelled");
    // Reset or navigate away
  };



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
              <>
                {keyword === "ข้อมูลผู้ใช้งาน" ? (
                  <UserProfileForm
                    profileImage={profileImage}
                    onImageUpload={handleImageUpload}
                    formData={formData}
                    onChange={handleInputChange}
                    provinceList={provinceList}
                    districtList={districtList}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                ) : keyword === "รายการคำสั่งซ่อม" ? (
                    <p className="p-8">OrderService</p>
                ) : keyword === "ประวัติการสั่งซ่อม" ? (
                  <p className="p-8">กำลังคิดค้นนวัฒกรรม</p>
                ) : (
                  <p className="p-8">กรุณาเลือกนวัฒกรรมใหม่</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default UserProfile;
