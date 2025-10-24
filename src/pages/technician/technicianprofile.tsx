import { useState } from "react";
import PageToolbar from "@/components/technician/common/PageToolbar";
import ButtonSecondary from "@/components/button/buttonsecondary";
import ButtonPrimary from "@/components/button/buttonprimary";
import Checkbox from "@/components/radio/check_box";

export default function TechnicianProfilePage() {
    const [formData, setFormData] = useState({
        firstName: "สมาน",
        lastName: "เยี่ยมยอด",
        phone: "0890002345",
        address: "332 อาคารเดอะไนน์ทาวเวอร์ เสนานิคม จตุจักร กรุงเทพฯ",
    });

    const [isAvailable, setIsAvailable] = useState(true);
    const [selectedServices, setSelectedServices] = useState({
        "ล้างแอร์": true,
        "ติดตั้งแอร์": true,
        "ทําความสะอาดทั่วไป": true,
        "ซ่อมแอร์": true,
        "ซ่อมเครื่องซักผ้า": true,
        "ติดตั้งเตาแก๊ส": true,
        "ติดตั้งเครื่องดูดควัน": true,
        "ติดตั้งชักโครก": true,
        "ติดตั้งเครื่องทํานํ้าอุ่น": true,
    });

    const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value,
        }));
    };

    const handleServiceToggle = (service: string) => (checked: boolean) => {
        setSelectedServices(prev => ({
            ...prev,
            [service]: checked,
        }));
    };

    const handleRefreshLocation = () => {
        console.log("Refreshing location...");
    };

    const handleCancel = () => {
        console.log("Cancel clicked");
    };

    const handleConfirm = () => {
        console.log("Confirm clicked", { formData, isAvailable, selectedServices });
    };

    return (
        <>
            <PageToolbar
                title="ตั้งค่าบัญชีผู้ใช้"
                rightSlot={
                    <div className="flex flex-row sm:flex-row gap-2 sm:gap-6 w-full sm:w-auto">
                    <ButtonSecondary
                      onClick={handleCancel}
                      className="w-full sm:w-auto sm:min-w-[120px] px-4 py-1.5 text-sm"
                    >
                      ยกเลิก
                    </ButtonSecondary>
                  
                    <ButtonPrimary
                      onClick={handleConfirm}
                      className="w-full sm:w-auto sm:min-w-[120px] px-4 py-1.5 text-sm"
                    >
                      ยืนยัน
                    </ButtonPrimary>
                  </div>
                }
            />

            <div className="p-4 md:p-8 bg-[var(--gray-50)] min-h-screen">
                    <div className="bg-[var(--white)] rounded-xl shadow-sm p-4 md:p-8 space-y-6 md:space-y-10">
                        {/* รายละเอียดบัญชี */}
                        <section>
                            <div className="text-xl font-semibold text-[var(--gray-900)] mb-6">
                                รายละเอียดบัญชี
                            </div>

                            <div className="flex flex-col gap-3 ">
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                                    <label className="text-m font-medium text-[var(--gray-700)] whitespace-nowrap w-full md:w-[200px]">
                                        ชื่อ<span className="text-[var(--red)]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={handleInputChange("firstName")}
                                        placeholder="กรุณากรอกชื่อ"
                                        className="cursor-pointer w-full md:w-[350px] border border-[var(--gray-300)] rounded-lg px-3 py-2 text-m text-[var(--gray-900)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-300)]"
                                    />
                                </div>
                                
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                                    <label className="text-m font-medium text-[var(--gray-700)] whitespace-nowrap w-full md:w-[200px]">
                                        นามสกุล<span className="text-[var(--red)]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={handleInputChange("lastName")}
                                        placeholder="กรุณากรอกนามสกุล"
                                        className="cursor-pointer w-full md:w-[350px] border border-[var(--gray-300)] rounded-lg px-3 py-2 text-m text-[var(--gray-900)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-300)]"
                                    />
                                </div>
                                
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                                    <label className="text-m font-medium text-[var(--gray-700)] whitespace-nowrap w-full md:w-[200px]">
                                        เบอร์ติดต่อ<span className="text-[var(--red)]">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleInputChange("phone")}
                                        placeholder="กรุณากรอกเบอร์ติดต่อ"
                                        className="cursor-pointer w-full md:w-[350px] border border-[var(--gray-300)] rounded-lg px-3 py-2 text-m text-[var(--gray-900)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-300)]"
                                    />
                                </div>
                                
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                                    <label className="text-m font-medium text-[var(--gray-700)] whitespace-nowrap w-full md:w-[200px]">
                                        ตำแหน่งที่อยู่ปัจจุบัน<span className="text-[var(--red)]">*</span>
                                    </label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={handleInputChange("address")}
                                            placeholder="กรุณากรอกที่อยู่"
                                            className="cursor-pointer w-full md:w-[350px] border border-[var(--gray-300)] rounded-lg px-3 py-2 text-m text-[var(--gray-900)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-300)]"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRefreshLocation}
                                            className="cursor-pointer w-full md:w-[96px] h-[42px] rounded-lg border border-[var(--blue-300)] text-[var(--blue-700)] text-sm font-medium hover:bg-[var(--blue-50)]"
                                        >
                                            รีเฟรช
                                        </button>
                                    </div>
                            </div>
                        </section>

                        <hr className="border-b border-[var(--gray-200)]" />

                        {/* สถานะบัญชี */}
                        <section>

                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                <div className="text-xl font-semibold text-[var(--gray-900)] w-full md:w-[200px]">
                                    สถานะบัญชี
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAvailable(!isAvailable)}
                                    className={`cursor-pointer w-16 h-8 rounded-full p-1 flex items-center transition-all duration-300 ${
                                        isAvailable
                                            ? "bg-[var(--blue-500)] justify-end"
                                            : "bg-[var(--gray-300)] justify-start"
                                    }`}
                                >
                                    <div className="cursor-pointer h-6 w-6 bg-[var(--white)] rounded-full shadow-md transition-transform duration-300"></div>
                                </button>

                                <div className="text-base font-medium text-[var(--gray-900)]">
                                    พร้อมให้บริการ
                                </div>
                            </div>
                                <div className="flex items-center gap-4 "> 
                                <div className="w-[200px]"></div> 
                                <div className="w-16"></div> 
                                <div className="text-sm text-[var(--gray-600)]"> 
                                    ระบบจะแสดงคำสั่งซ่อมในบริเวณใกล้เคียงตำแหน่งที่อยู่ปัจจุบัน ให้สามารถเลือกรับงานได้ 
                                </div> 
                                </div>
                        </section>

                        <hr className="border-b border-[var(--gray-200)] " />

                        {/* บริการที่รับซ่อม */}
                        <section>
                        <div className="flex flex-col md:flex-row">
                            <div className="text-xl font-semibold text-[var(--gray-900)] w-full md:w-[220px] mb-6">
                                บริการที่รับซ่อม
                            </div>
                            <div className="flex flex-col gap-2 ">
                                {Object.entries(selectedServices).map(([service, isSelected]) => (
                                    <Checkbox
                                        key={service}
                                        id={`service-${service}`}
                                        checked={isSelected}
                                        onChange={handleServiceToggle(service)}
                                        label={service}
                                    />
                                ))}
                            </div>
                            </div>
                        </section>
                    </div>
                </div>
        </>
    );
}
