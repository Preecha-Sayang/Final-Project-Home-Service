import React, { useState } from 'react';

interface CheckboxProps {
  id: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  className?: string;
}

function Checkbox({
  id,
  checked = false,
  disabled = false,
  onChange,
  label,
  className = ''
}: CheckboxProps) {
  /**
   * ฟังก์ชันจัดการเมื่อมีการเปลี่ยนแปลงค่า
   * จะทำงานเฉพาะเมื่อ checkbox ไม่ถูกปิดใช้งาน
   */
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      const next = e.target.checked;
      if (!disabled && onChange) {
          onChange(next);
      }
  };

  return (
    <div className={`inline-block my-2 ${className}`}>
      {/* Input element ที่ซ่อนไว้ */}
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
      />

      {/* Label ที่แสดง checkbox custom และข้อความ */}
      <label
        htmlFor={id}
        className={`
          flex items-center text-sm font-normal select-none transition-all duration-200
          ${disabled
            ? 'cursor-not-allowed text-[var(--gray-400)]'
            : 'cursor-pointer text-[var(--gray-700)] hover:text-[var(--blue-500)]'
          }
        `}
      >
         {/* สี่เหลี่ยม checkbox แบบ custom - ขนาด 20px x 20px */}
         <span
           className={`
             relative w-[20px] h-[20px] mr-2 rounded-md border-2 transition-all duration-200 flex items-center justify-center
             ${disabled
               ? checked
                 ? 'border-[var(--gray-300)] bg-[var(--gray-200)]'
                 : 'border-[var(--gray-300)] bg-[var(--gray-100)]'
               : checked
                 ? 'border-[var(--blue-500)] bg-[var(--blue-500)]'
                 : 'border-[var(--gray-300)] hover:border-[var(--blue-500)]'
             }
           `}
         >
          {/* เครื่องหมายถูกเมื่อถูกเลือก */}
          {checked && (
            <span
              className={`
                absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                ${disabled ? 'bg-[var(--blue-500)]' : 'text-[var(--white)] drop-shadow-sm'}
              `}
            >
               <svg
                 width="16"
                 height="12"
                 viewBox="0 0 16 12"
                 fill="none"
                 xmlns="http://www.w3.org/2000/svg"
                 className="w-4 h-3"
               >
                 <path
                   d="M2 6L6 10L14 2"
                   stroke="currentColor"
                   strokeWidth="2.5"
                   strokeLinecap="round"
                   strokeLinejoin="round"
                 />
               </svg>
            </span>
          )}
        </span>
        {label}
      </label>
    </div>
  );
}

export default Checkbox;

/* ----------------------------------------------------
  วิธีใช้งาน Checkbox Component

  Checkbox Component เป็น custom checkbox ที่มีสไตล์
  รองรับการใช้งานแบบ controlled และ uncontrolled
  มีการแสดงผลที่สอดคล้องกับ design system ของแอปพลิเคชัน

  Props:
  - id: string (required) - ID ของ checkbox (ต้องไม่ซ้ำกัน)
  - checked: boolean (optional) - สถานะการเลือก (default: false)
  - disabled: boolean (optional) - ปิดใช้งาน checkbox (default: false)
  - onChange: function (optional) - ฟังก์ชันที่เรียกเมื่อมีการเปลี่ยนแปลงค่า
  - label: string (optional) - ข้อความที่แสดงข้าง checkbox
  - className: string (optional) - CSS class เพิ่มเติม

  ตัวอย่างการใช้งาน:

  1) การใช้งานพื้นฐาน:
     import Checkbox from "@/components/radio/check_box";
     
     const [isChecked, setIsChecked] = useState(false);
     
     <Checkbox 
       id="basic-checkbox"
       label="ยอมรับเงื่อนไขการใช้งาน"
       checked={isChecked}
       onChange={setIsChecked}
     />

  2) การใช้งานแบบ Form:
     const [formData, setFormData] = useState({
       newsletter: false,
       notifications: true,
       terms: false
     });
     
     <div className="space-y-4">
       <Checkbox 
         id="newsletter"
         label="รับข่าวสารทางอีเมล"
         checked={formData.newsletter}
         onChange={(checked) => setFormData(prev => ({...prev, newsletter: checked}))}
       />
       <Checkbox 
         id="notifications"
         label="รับการแจ้งเตือน"
         checked={formData.notifications}
         onChange={(checked) => setFormData(prev => ({...prev, notifications: checked}))}
       />
       <Checkbox 
         id="terms"
         label="ยอมรับข้อตกลงและเงื่อนไข"
         checked={formData.terms}
         onChange={(checked) => setFormData(prev => ({...prev, terms: checked}))}
       />
     </div>

  3) การใช้งานแบบ Disabled:
     <div className="space-y-2">
       <Checkbox 
         id="enabled-checkbox"
         label="ตัวเลือกที่ใช้งานได้"
         checked={true}
         onChange={(checked) => console.log(checked)}
       />
       <Checkbox 
         id="disabled-checkbox"
         label="ตัวเลือกที่ปิดใช้งาน"
         checked={false}
         disabled={true}
       />
     </div>

  4) การใช้งานแบบ Filter/Selection:
     const [selectedServices, setSelectedServices] = useState<string[]>([]);
     
     const services = ["ล้างแอร์", "ซ่อมเครื่องซักผ้า", "ทำความสะอาดบ้าน"];
     
     const handleServiceToggle = (service: string, checked: boolean) => {
       if (checked) {
         setSelectedServices(prev => [...prev, service]);
       } else {
         setSelectedServices(prev => prev.filter(s => s !== service));
       }
     };
     
     <div className="space-y-3">
       <h3 className="font-semibold">เลือกบริการที่ต้องการ:</h3>
       {services.map(service => (
         <Checkbox 
           key={service}
           id={`service-${service}`}
           label={service}
           checked={selectedServices.includes(service)}
           onChange={(checked) => handleServiceToggle(service, checked)}
         />
       ))}
     </div>

  5) การใช้งานแบบ Custom Styling:
     <Checkbox 
       id="custom-checkbox"
       label="ตัวเลือกพิเศษ"
       checked={true}
       onChange={(checked) => console.log(checked)}
       className="mb-4 p-2 bg-gray-50 rounded"
     />

  การแสดงผล:
  - Checkbox มีขนาด 20x20 pixels
  - สีน้ำเงินเมื่อถูกเลือก
  - สีเทาเมื่อปิดใช้งาน
  - มี hover effect เมื่อ hover
  - มี transition animation ที่นุ่มนวล
  - รองรับการแสดงผลแบบ responsive

  หมายเหตุ:
  - id ต้องไม่ซ้ำกันในหน้าเดียวกัน
  - ควรใช้ label เพื่อความชัดเจน
  - onChange จะไม่ทำงานเมื่อ disabled
  - รองรับการใช้งานแบบ controlled และ uncontrolled
  - ใช้กับ form libraries เช่น react-hook-form ได้

  การใช้งานกับ Form Libraries:
  
  React Hook Form:
     const { register, watch } = useForm();
     
     <Checkbox 
       id="form-checkbox"
       label="ยอมรับเงื่อนไข"
       checked={watch('terms')}
       onChange={(checked) => setValue('terms', checked)}
     />

  Formik:
     <Checkbox 
       id="formik-checkbox"
       label="ยอมรับเงื่อนไข"
       checked={formik.values.terms}
       onChange={(checked) => formik.setFieldValue('terms', checked)}
     />

---------------------------------------------------- */

