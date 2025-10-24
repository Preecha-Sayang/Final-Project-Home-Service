import Button from "@/components/button/buttonprimary";
import PageToolbar from "@/components/technician/common/PageToolbar";
import Image from "next/image";



export default function TechnicianRequestPage() {
    return (
        <>
            <PageToolbar
                title="คำขอบริการซ่อม"
            />
            
            <div className="p-8  bg-[var(--gray-50)] min-h-screen">
                <div className="bg-[var(--white)] rounded-xl border border-[var(--gray-200)] shadow-sm p-8 flex flex-col items-center justify-center text-center">
      {/* ไอคอนแจ้งเตือน */}
      <div className="pt-2 pb-4 mb-4">
        <Image 
          src="/images/icon_bell_blue.svg" 
          alt="Bell Icon" 
          width={32} 
          height={32}
        />
      </div>

      {/* หัวข้อ */}
      <div className="text-xl font-semibold text-[var(--gray-800)] mb-1">
        ต้องการรับแจ้งเตือนคำขอบริการสั่งซ่อม?
      </div>

      {/* คำอธิบาย */}
      <p className="text-sm text-[var(--gray-500)] mb-6 ">
        เปิดใช้งานสถานะพร้อมให้บริการเพื่อแสดงรายการและรับงานซ่อมในบริเวณตำแหน่งที่คุณอยู่
      </p>

      {/* ปุ่มหลัก */}
        <Button className="w-[250px] bg-[var(--blue-600)] hover:bg-[var(--blue-700)] text-[var(--white)] text-sm font-normal px-6 py-2 rounded-md whitespace-nowrap">
         เปลี่ยนสถานะเป็นพร้อมให้บริการ
       </Button>
                </div>
            </div>
        </>
     );
}