import React, { useState } from 'react';


interface SelectFilterProps {
  id: string;                         
  selected?: string;                  
  disabled?: boolean;                 
  onChange?: (value: string) => void; 
  options?: string[];                
  className?: string;                 
}

function SelectFilterExample({
  id,
  selected = "Selected",
  disabled = false,
  onChange,
  options = ["Selected", "Unselected", "Hover"],
  className = ''
}: SelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(selected);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  /**
   * ฟังก์ชันจัดการเมื่อมีการเปลี่ยนแปลงค่า
   */
  const handleOptionSelect = (value: string) => {
    setCurrentValue(value);
    setIsOpen(false);
    if (onChange) {
      onChange(value);
    }
  };

  /**
   * ฟังก์ชันจัดการเมื่อคลิกที่ปุ่ม
   */
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* ปุ่ม Select Filter */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
         className={`
           relative w-[200px] h-[40px] px-3 py-2
           bg-white
           rounded-md text-left
           flex items-center justify-between
           transition-all duration-200
           ${disabled
             ? 'cursor-not-allowed opacity-60'
             : isOpen
               ? 'bg-blue-50'
               : 'hover:bg-gray-100 cursor-pointer'
           }
         `}
      >
        {/* ข้อความที่เลือก */}
        <span className="font-medium text-gray-900 truncate ">
          {currentValue}
        </span>
         
         {/* ไอคอน Dropdown Arrow */}
         <svg
           className={`w-4 h-4 transition-all duration-200 ${
             disabled
               ? 'text-gray-300'
               : isOpen
                 ? 'text-blue-500 rotate-180'
                 : 'text-gray-500 group-hover:text-gray-600'
           }`}
           fill="none"
           stroke="currentColor"
           viewBox="0 0 24 24"
         >
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
         </svg>
      </button>

       {/* Dropdown Menu */}
       {isOpen && (
         <>
           <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
             {options.map((option, index) => (
               <button
                 key={index}
                 type="button"
                 onClick={() => handleOptionSelect(option)}
                 onMouseEnter={() => setHoveredOption(option)}
                 onMouseLeave={() => setHoveredOption(null)}
                 className={`
                   w-full px-3 py-2 text-left
                   transition-colors duration-150
                   first:rounded-t-md last:rounded-b-md
                   ${option === currentValue
                     ? 'text-blue-500 bg-blue-50'
                     : hoveredOption === option
                       ? 'text-gray-900 bg-gray-100'
                       : 'text-gray-500 hover:text-gray-900'
                   }
                 `}
               >
                 {option}
               </button>
             ))}
           </div>
           
           {/* Overlay เพื่อปิด dropdown เมื่อคลิกข้างนอก */}
           <div
             className="fixed inset-0 z-40"
             onClick={() => setIsOpen(false)}
           />
         </>
       )}
    </div>
  );
}
export default SelectFilterExample;

/**
 * วิธีใช้งาน SelectFilterExample Component
 * 
 * SelectFilterExample Component เป็นคอมโพเนนต์ dropdown select filter
 * เหมาะสำหรับการกรองข้อมูล, การเลือกตัวเลือก, การเรียงลำดับ
 * 
 * คุณสมบัติหลัก:
 * - Dropdown menu ที่แสดงเมื่อคลิก
 * - ตัวเลือกที่เปลี่ยนแปลงได้
 * - รองรับการปิดใช้งาน (disabled state)
 * - Hover effects สำหรับตัวเลือก
 * - Click outside to close functionality
 * - สไตล์ที่สอดคล้องกับ design system
 * 
 * ตัวอย่างการใช้งาน:
 * 
 * 1) การใช้งานพื้นฐาน - การกรองข้อมูล:
 *    const [selectedValue, setSelectedValue] = useState("Selected");
 *    
 *    <SelectFilterExample
 *      id="category-filter"
 *      selected={filterValue}
 *      onChange={setFilterValue}
 *      options={["All", "Category 1", "Category 2", "Category 3"]}
 *    />
 * 
 * 2) การใช้งานแบบ Disabled:
 *    <div className="space-y-4">
 *      <SelectFilterExample
 *        id="enabled-filter"
 *        selected="Active"
 *        onChange={(value) => console.log(value)}
 *        options={["All", "Active", "Inactive"]}
 *      />
 *      <SelectFilterExample
 *        id="disabled-filter"
 *        selected="Disabled"
 *        disabled={true}
 *        options={["All", "Active", "Inactive"]}
 *      />
 *    </div>
 * 
 * การแสดงผล:
 * - ปุ่มแสดงค่าที่เลือกปัจจุบัน
 * - Dropdown arrow ที่หมุนเมื่อเปิด
 * - Dropdown menu แสดงตัวเลือกทั้งหมด
 * - ตัวเลือกที่เลือกจะแสดงสีน้ำเงิน
 * - Hover effects สำหรับตัวเลือก
 * - รองรับ responsive design
 * 
 * สถานะต่างๆ:
 * - Default: สีเทา, cursor pointer
 * - Hover: พื้นหลังเทาอ่อน
 * - Open: พื้นหลังน้ำเงินอ่อน, arrow หมุน
 * - Selected Option: สีน้ำเงิน, พื้นหลังน้ำเงินอ่อน
 * - Hovered Option: พื้นหลังเทาอ่อน
 * - Disabled: สีเทา, opacity ลดลง, cursor not-allowed
 * 
 * Best Practices:
 * 1. ใช้ id ที่ไม่ซ้ำกันสำหรับแต่ละ select filter
 * 2. จัดการ state ให้เหมาะสมกับ use case
 * 3. ใช้ options ที่ชัดเจนและเข้าใจง่าย
 * 4. ตรวจสอบ accessibility (keyboard navigation)
 * 5. ใช้ placeholder หรือ default value ที่เหมาะสม
 * 6. จัดกลุ่มตัวเลือกที่เกี่ยวข้องกัน
 * 
 * การใช้งานกับ Form Libraries:
 * 
 * React Hook Form:
 * ```tsx
 * const { register, watch, setValue } = useForm();
 * const selectedValue = watch("category");
 * 
 * <SelectFilterExample
 *   id="category"
 *   selected={selectedValue}
 *   onChange={(value) => setValue("category", value)}
 *   options={["All", "Category 1", "Category 2"]}
 * />
 */



