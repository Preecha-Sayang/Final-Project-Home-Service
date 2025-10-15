
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import InputDropdown from "@/components/input/inputDropdown/input_dropdown";
import ButtonPrimary from "@/components/button/buttonprimary";
import ButtonSecondary from "@/components/button/buttonsecondary";
import { Save, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type UserData = {
  user_id: number;
  fullname: string;
  email: string;
  phone_number: string;
  create_at: string;
};

type Province = {
  province_code: number,
  province_name_th: string,
  province_name_en: string,
};

type District = {
  district_code: number;
  district_name_th: string,
  district_name_en: string,
};

type Subdistrict = {
  subdistrict_code: number;
  subdistrict_name_th: string,
  subdistrict_name_en: string,
};

type UserProfileFormProps = {
  profileImage: string; // URL รูปที่มีอยู่แล้ว (ถ้ามี)
  imageFile: File | null; // ไฟล์รูปที่เลือกใหม่
  onImageFileChange: (file: File | null) => void;
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
  subdistrictList: Subdistrict[];
  onSave: () => void;
  onCancel: () => void;
  addressError: string;
};


function UserProfileForm({ profileImage, imageFile, onImageFileChange, formData, onChange, provinceList, districtList, subdistrictList, onSave, onCancel, addressError }: UserProfileFormProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const objectUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : ""), [imageFile]);
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
  function showError(msg: string) {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 3000);
  }
  function rejectIfInvalid(f: File) {
    const okTypes = ["image/jpeg", "image/png"];
    if (!okTypes.includes(f.type)) {
      showError("รองรับเฉพาะไฟล์ JPG หรือ PNG");
      return true;
    }
    if (f.size > MAX_SIZE) {
      showError("ไฟล์รูปต้องไม่เกิน 2 MB");
      return true;
    }
    return false;
  }

  const pick = () => inputRef.current?.click();
  const onFileSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (rejectIfInvalid(f)) {
      e.currentTarget.value = "";
      return;
    }
    onImageFileChange(f);
  };

  const onDragOverBox: React.DragEventHandler<HTMLDivElement> = (ev) => {
    ev.preventDefault(); ev.stopPropagation(); setDragOver(true);
  };
  const onDragLeaveBox: React.DragEventHandler<HTMLDivElement> = (ev) => {
    ev.preventDefault(); ev.stopPropagation(); setDragOver(false);
  };
  const onDropBox: React.DragEventHandler<HTMLDivElement> = (ev) => {
    ev.preventDefault(); ev.stopPropagation(); setDragOver(false);
    const f = ev.dataTransfer?.files?.[0];
    if (f && !rejectIfInvalid(f)) onImageFileChange(f);
  };

  return (
    <div className="w-full h-full bg-[var(--white)] p-8">
      {/* รูปโปรไฟล์ */}
      <div className="flex justify-center mb-8">
        <div className="flex flex-col items-center gap-3">
    
          {/* รูปอวาตาร์แบบวงกลมคลิกได้พร้อมแสดงตัวอย่างและลากวางได้ */}
          <div
            className={`w-32 h-32 rounded-full border-2 ${dragOver ? 'border-[var(--blue-400)] bg-[var(--blue-100)]' : 'border-[var(--gray-300)]'} overflow-hidden flex items-center justify-center cursor-pointer relative`}
            onClick={pick}
            onDragOver={onDragOverBox}
            onDragLeave={onDragLeaveBox}
            onDrop={onDropBox}
            title="คลิกเพื่ออัปโหลดรูป"
          >
            {imageFile ? (
              <Image src={objectUrl} alt="Profile preview" width={512} height={512} className="object-cover w-full h-full" />
            ) : profileImage ? (
              <Image src={profileImage} alt="Profile" width={512} height={512} className="object-cover w-full h-full" />
            ) : (
              <span className="text-4xl font-medium text-[var(--gray-600)]">Vo</span>
            )}

            {/* ชั้นทับโปร่งแสงเมื่อ hover */}
            <div className="absolute inset-0 bg-[var(--black)]/0 hover:bg-[var(--black)]/10 transition-colors" />
          </div>
          
          {/* ช่องเลือกไฟล์แบบซ่อน */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileSelected}
          />

          {/* Error message */}
          {errorMsg && (
            <div className="text-xs text-[var(--red)] mt-1" role="alert" aria-live="polite">{errorMsg}</div>
          )}
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
            className={`w-full h-[44px] px-4 border rounded-md text-base font-medium text-[var(--gray-900)]
              hover:border-[var(--gray-300)] focus:outline-none focus:ring-1 focus:ring-[var(--blue-600)]
              ${addressError ? 'border-[var(--red)]' : 'border-[var(--gray-300)]'}`}
          />
          {/* ข้อความแสดงข้อผิดพลาดของที่อยู่ */}
          {addressError && (
            <div className="text-xs text-[var(--red)] mt-1" role="alert" aria-live="polite">
              {addressError}
            </div>
          )}
        </div>

        {/* จังหวัด / Province */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Image src="/images/icon_pin.svg" alt="location" width={16} height={16} className="brightness-0" />
            <label className="text-sm font-semibold text-[var(--gray-900)]">จังหวัด</label>
          </div>
          <InputDropdown
            value={formData.province}
            onChange={(value) => onChange("province", value)}
            options={provinceList.map((province) => ({ label: province.province_name_th, value: province.province_code.toString() }))}
            placeholder="เลือกจังหวัด"
            className="h-[44px]"
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
            onChange={(value) => onChange("district", value)}
            options={districtList.map((district) => ({ label: district.district_name_th, value: district.district_code.toString() }))}
            placeholder="เลือกแขวง/อำเภอ"
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
              onChange={(value) => onChange("subdistrict", value)}
              options={subdistrictList.map((subdistrict) => ({ label: subdistrict.subdistrict_name_th, value: subdistrict.subdistrict_code.toString() }))}
              placeholder="เลือกแขวง/ตำบล"
              className="h-[44px]"
          />

        </div>
      </div>

      {/* ปุ่มบันทึกและยกเลิก / Save and Cancel Buttons */}
      <div className="grid grid-cols-2 gap-x-6 mt-8">
        <ButtonPrimary onClick={onSave} className="w-full">
          <span className="flex items-center justify-center gap-2">
            <Save size={16} />
            <span>บันทึก</span>
          </span>
        </ButtonPrimary>
        <ButtonSecondary onClick={onCancel} className="w-full">
          <span className="flex items-center justify-center gap-2 text-[var(--blue-600)]">
            <X size={16} />
            <span>ยกเลิก</span>
          </span>
        </ButtonSecondary>
      </div>
    </div>
  );
}

function UserProfile() {
  
  const [keyword, setkeyword] = useState("ข้อมูลผู้ใช้งาน");

  const [userData, setUserData] = useState<UserData | undefined>(undefined);
  const { accessToken } = useAuth();

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

  // โหลดข้อมูลอำเภอแบบ lazy หลังจากเลือกจังหวัดและรีเซ็ตฟิลด์ที่เกี่ยวข้อง
  useEffect(() => {
    const provinceCode = formData.province;
    // การรีเซ็ตตัวเลือกที่เกี่ยวข้องเมื่อผู้ใช้เปลี่ยนจังหวัดจะจัดการใน handleInputChange

    if (!provinceCode) {
      setDistrictList([]);
      return;
    }
    fetch(`/api/location/districts?province_code=${encodeURIComponent(provinceCode)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setDistrictList(Array.isArray(data) ? data : []))
      .catch(() => setDistrictList([]));
  }, [formData.province]);

  const [subdistrictList, setSubdistrictList] = useState<Subdistrict[]>([]);

  // โหลดข้อมูลตำบลแบบ lazy หลังจากเลือกอำเภอและรีเซ็ตฟิลด์ที่เกี่ยวข้อง
  useEffect(() => {
    const districtCode = formData.district;

    if ( !districtCode) {
      setSubdistrictList([]);
      return;
    }
    fetch(`/api/location/subdistricts?district_code=${encodeURIComponent(districtCode)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          setSubdistrictList(Array.isArray(data) ? data : []);
        })
        .catch(() => { setSubdistrictList([]);});
  }, [formData.district]);


  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [addressError, setAddressError] = useState<string>("");


  // ซิงค์ข้อมูลผู้ใช้เริ่มต้นลงฟอร์มเมื่อโหลดเสร็จ รวมถึงที่อยู่
  useEffect(() => {
    if (!userData) return;
    const firstAddress = (userData as { addresses?: Array<{ address: string; province_code: number; district_code: number; subdistrict_code: number }> })?.addresses?.[0] || undefined;
    setFormData((prev) => ({
      ...prev,
      fullname: userData.fullname ?? "",
      phone: userData.phone_number ?? "",
      email: userData.email ?? "",
      address: firstAddress?.address ?? "",
      province: firstAddress?.province_code ? String(firstAddress.province_code) : "",
      district: firstAddress?.district_code ? String(firstAddress.district_code) : "",
      subdistrict: firstAddress?.subdistrict_code ? String(firstAddress.subdistrict_code) : "",
    }));
    const avatarUrl = (userData as { avatar?: string })?.avatar || "";
    setProfileImageUrl(avatarUrl);
  }, [userData]);

  const handleInputChange = (field: string, value: string) => {
    // ล้าง error ของ address เมื่อผู้ใช้เริ่มพิมพ์
    if (field === "address" && addressError) {
      setAddressError("");
    }
    
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


  const handleSave = async () => {
    if (!accessToken) {
      console.warn("No access token");
      return;
    }
    
    // ตรวจสอบว่ามีที่อยู่หรือไม่
    if (!formData.address || formData.address.trim() === "") {
      setAddressError("กรุณากรอกที่อยู่");
      return;
    }
    
    // ล้าง error ก่อนบันทึก
    setAddressError("");
    
    try {
      // กำหนด URL ของรูปอวาตาร์ที่จะบันทึก
      let avatarUrlToSave = profileImageUrl;

      // ถ้ามีการเลือกรูปใหม่ ให้อัพโหลดก่อน
      if (profileImageFile) {
        const form = new FormData();
        form.append("file", profileImageFile);
        const upRes = await fetch("/api/profile/avatar", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: form,
        });
        if (!upRes.ok) {
          const err = await upRes.json().catch(() => ({}));
          throw new Error(err?.error || `Upload failed (${upRes.status})`);
        }
        const upData = await upRes.json();
        avatarUrlToSave = upData.url as string;
        setProfileImageUrl(avatarUrlToSave);
        setProfileImageFile(null);
      }

      const payload: {
        fullname?: string;
        email?: string;
        phone_number?: string;
        address?: string;
        province_code?: string;
        district_code?: string;
        subdistrict_code?: string;
        avatar?: string;
      } = {
        fullname: formData.fullname || undefined,
        email: formData.email || undefined,
        phone_number: formData.phone || undefined,
        address: formData.address || undefined,
        province_code: formData.province || undefined,
        district_code: formData.district || undefined,
        subdistrict_code: formData.subdistrict || undefined,
      };
      if (avatarUrlToSave) payload.avatar = avatarUrlToSave;

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
      // ซิงค์ข้อมูลโปรไฟล์ที่ได้รับกลับมาไปยัง state ภายใน
      if (data?.profile) {
        setUserData((prev) => ({ ...prev, ...data.profile }));
      }
      
      // ส่ง event เพื่อแจ้งให้ navbar อัพเดตข้อมูล
      window.dispatchEvent(new CustomEvent('profileUpdated', {
        detail: {
          fullname: formData.fullname,
          avatar: avatarUrlToSave
        }
      }));
      
      console.log("Profile saved successfully");
    } catch (e) {
      console.error("Failed to save profile", e);
    }
  };

  const handleCancel = () => {
    console.log("Cancelled");
    // รีเซ็ตหรือไปยังหน้าอื่น
  };



  return (
          <div className="w-[800px] min-h-[600px] bg-[var(--white)] shadow-sm">
            {keyword === "ข้อมูลผู้ใช้งาน" ? (
              <UserProfileForm
                profileImage={profileImageUrl}
                imageFile={profileImageFile}
                onImageFileChange={(file) => setProfileImageFile(file)}
                formData={formData}
                onChange={handleInputChange}
                provinceList={provinceList}
                districtList={districtList}
                subdistrictList={subdistrictList}
                onSave={handleSave}
                onCancel={handleCancel}
                addressError={addressError}
              />
            ) : null}
          </div>


  );
}

export default UserProfile;
