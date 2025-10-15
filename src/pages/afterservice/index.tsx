import { Footer } from "@/components/footer";
import Navbar from "@/components/navbar/navbar";
import Image from "next/image";
import { useEffect, useState } from "react";
import ServiceListProcess from "./servicelist-process";
import ServiceListSuccess from "./servicelist-success";
import UserProfile from "../userprofile";

function AfterService() {
  const menuItems = [
    { label: "ข้อมูลผู้ใช้งาน", icon: "/images/icon_user.svg" },
    { label: "รายการคำสั่งซ่อม", icon: "/images/icon_tasklist.svg" },
    { label: "ประวัติการสั่งซ่อม", icon: "/images/icon_history.svg" },
  ];
  const [keyword, setkeyword] = useState("ข้อมูลผู้ใช้งาน");
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // รอ 1 วินาที
    return () => clearTimeout(timer);
  }, [keyword]);

  function RenderContent() {
    switch (keyword) {
      case "ข้อมูลผู้ใช้งาน":
        return <UserProfile />;

      case "รายการคำสั่งซ่อม":
        return <ServiceListProcess onLoadDone={() => setIsLoading(false)}/>;

      case "ประวัติการสั่งซ่อม":
        return <ServiceListSuccess onLoadDone={() => setIsLoading(false)}/>

      default:
        return <p>กรุณาเลือกนวัฒกรรมใหม่</p>;
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="hidden md:flex h-[100px] w-[100%] bg-[var(--blue-600)]  justify-center items-center">
        <p className="text-[32px] font-[500] text-[var(--white)]">{keyword}</p>
      </div>

      <div className="flex-grow bg-[var(--gray-100)]">
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-[35px] my-[30px]">
          <div
            id="category-select"
            className="w-[90%] md:w-[250px] md:h-[250px] bg-[var(--white)] flex flex-col gap-[16px]
                    px-[25px] py-[25px] border-[1px] border-[var(--gray-300)]"
          >
            <p className="text-[var(--gray-700)] text-[20px] font-[400]">
              บัญชีผู้ใช้
            </p>
            <div className="border bg-[var(--gray-100)]"></div>
            <div className="flex flex-row md:flex-col">
              {menuItems.map((item) => (
                <div
                  key={item.label}
                  id={item.label}
                  className={`flex flex-row items-center md:h-[50px] gap-[12px]  w-full
                                 hover:cursor-pointer hover:bg-[var(--gray-300)]    `}
                  onClick={() => setkeyword(item.label)}
                >
                  <Image
                    src={item.icon}
                    alt={`${item.label}_icon`}
                    width={24}
                    height={24}
                  />
                  <p className={`${keyword === item.label ? "text-[var(--blue-700)]" : ""}`}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex md:hidden  w-[90%] bg-[var(--blue-600)]  justify-center items-center rounded-xl px-[16px] py-[8px]">
              <p className="text-[20px] font-[500] text-[var(--white)]">{keyword}</p>
          </div>
          <div className="w-[90%] md:w-[800px]">
            {isLoading ? (
              <div className="flex  flex-col justify-center items-center w-[100%] h-[100%]">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
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

export default AfterService;
