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
               : 'hover:bg-gray-50 cursor-pointer'
           }
         `}
      >
        {/* ข้อความที่เลือก */}
        <span className="font-medium text-gray-900 truncate">
          {currentValue}
        </span>
        
        {/* ไอคอน Dropdown Arrow */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
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
      )}
    </div>
  );
}

/**
 * คอมโพเนนต์ตัวอย่างการใช้งาน Select Filter
 * แสดง select filter เดี่ยวที่มีทุกสถานะรวมกัน: Default, Hover, Hover Option

 */
export function SelectFilter() {
  const [selectedValue, setSelectedValue] = useState("Selected");

  return (
    <div className="space-y-6">
      {/* Select Filter เดียวที่แสดงทุกสถานะ */}
      <div className="space-y-4">
       
         {/* Select Filter Interactive */}
         <div className="flex justify-center">
           <SelectFilterExample
             id="select-filter-interactive"
             selected={selectedValue}
             onChange={setSelectedValue}
             options={["Selected", "Unselected", "Hover"]}
           />
         </div>
      </div>
    </div>
  );
}

export default SelectFilterExample;
