import { useState } from "react";
import Image from "next/image";

interface Notification {
  booking_id: number;
  new_status: string;
}

interface Props {
  notifications: Notification[];
  onClear: () => void;
}

export default function IconBell({ notifications, onClear }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  function handleClick() {
    setIsOpen(!isOpen);
    if (!isOpen) onClear(); // เคลียร์ dot แดงเมื่อเปิด dropdown
  }

  return (
    <div className="relative">
      <button
        className="w-[40px] h-[40px] rounded-full flex justify-center items-center hover:bg-gray-200 active:bg-gray-300 transition-colors duration-200"
        onClick={handleClick}
        type="button"
      >
        <Image src="/images/icon_bell_blue.svg" alt="bell_alert" width={13} height={18} />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white shadow-md border rounded-md z-50">
          {notifications.length === 0 ? (
            <div className="p-2 text-gray-500 text-sm">ไม่มีแจ้งเตือน</div>
          ) : (
            notifications.map((item, idx) => (
              <div key={idx} className="p-2 border-b text-sm text-gray-700">
                งาน {item.booking_id} เปลี่ยนสถานะเป็น {item.new_status}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}