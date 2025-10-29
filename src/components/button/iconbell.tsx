import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface Notification {
  booking_id: number;
  order_code: string;
  new_status: string;
}

interface Props {
  notifications: Notification[];
  onClear: () => void;
}

export default function IconBell({ notifications, onClear }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function handleClick() {
    // console.log("🔔 Bell clicked, notifications:", notifications.length, "isOpen:", isOpen);
    setIsOpen(!isOpen);
  }

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  function handleClearAll() {
    console.log("🧹 Clearing all notifications");
    onClear();
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="w-[40px] h-[40px] rounded-full flex justify-center items-center hover:bg-gray-200 active:bg-gray-300 transition-colors duration-200 relative"
        onClick={handleClick}
        type="button"
      >
        <Image 
          src="/images/icon_bell_blue.svg" 
          alt="bell_alert" 
          width={20} 
          height={20}
          style={{ width: 'auto', height: 'auto' }}
        />
        {notifications.length > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg border border-gray-200 rounded-lg z-[999] max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <span className="font-semibold text-gray-800">การแจ้งเตือน</span>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                ลบทั้งหมด
              </button>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-80">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                ไม่มีการแจ้งเตือน
              </div>
            ) : (
              <div>
                {notifications.map((item, idx) => (
                  <div 
                    key={`${item.booking_id}-${idx}`}
                    className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-sm text-gray-800">
                      <span className="font-semibold">คำสั่งซ่อม {item.order_code}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      เปลี่ยนสถานะเป็น: <span className="font-medium">{item.new_status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}