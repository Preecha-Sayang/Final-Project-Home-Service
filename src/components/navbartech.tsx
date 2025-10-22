import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

export interface MenuItem {
  label: string;
  path: string;
  icon: string;
  count?: number;
}

interface NavbarProps {
  menuItems: MenuItem[];
}
function NavbarTechnician({ menuItems }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const menuRef= useRef<HTMLDivElement>(null) 

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/"); // เปลี่ยนหน้า logout
  };

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  if (open) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [open]);






  return (
    <div className="bg-[var(--blue-950)] md:w-[240px] md:h-screen flex flex-row md:flex-col justify-between md:justify-center items-center px-[20px] md:px-0 rounded-none">
      {/* Header */}
      <div id="header" className="h-[105px] flex justify-between md:justify-center items-center w-full">
        <div
          className="w-[140px] h-[30px] md:w-[192px] md:h-[46px] bg-[var(--blue-100)] rounded-xl flex justify-center items-center cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image
            src="/images/logo.png"
            alt="logo"
            width={168}
            height={30}
            className="h-[25px] w-[125px] md:w-[168px] md:h-[30px]"
            priority
          />
        </div>

      </div>

      {/* Body Desktop */}
      <div id="body" className="flex-1 hidden md:flex flex-col w-full max-w-[240px]">
        {menuItems.map((item) => (
          <div
            key={item.label}
            className="hover:bg-[var(--blue-500)] cursor-pointer"
            onClick={() => router.push(item.path)}
          >
            <div className="px-[15px] py-[15px] flex items-center">
              <Image src={item.icon} alt={`${item.label}_icon`} width={24} height={24} />
              <span className="body5 text-[var(--gray-100)] ml-[10px] max-w-[170px] break-words">{item.label}</span>
              {Number(item.count) > 0 && (
                <div className="inline-flex h-[20px] min-w-[20px] rounded-full bg-[var(--red)] items-center justify-center ml-[15px] px-[6px]">
                  <span className="body5 text-[var(--gray-100)] text-center">
                    {item.count! > 99 ? "99+" : item.count}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Desktop */}
      <div
        id="footer"
        className="h-[55px] hover:bg-[var(--blue-500)] cursor-pointer hidden md:flex items-center px-[24px] mb-[50px] w-full"
        onClick={handleLogout}
      >
        <Image src="/images/icon_logout.svg" alt="logout_logo" width={24} height={24} />
        <span className="body5 text-[var(--gray-100)] ml-[16px]">ออกจากระบบ</span>
      </div>



      {/* Hamburger Menu มือถือ */}
        <div className="md:hidden ml-auto w-[32px] h-[32px] cursor-pointer" onClick={() => setOpen(!open)}>
          <Image src="/images/icon_menu.svg" alt="icon_menu" width={30} height={30} />
        </div>
      

      {/* Overlay มือถือ */}
      {open && (
        <div className="fixed top-0 right-0 h-full w-64 bg-[var(--blue-950)] z-50 shadow-lg flex flex-col md:hidden"
        ref={menuRef}
        >
          <div className="w-[48px] h-[48px] cursor-pointer flex justify-center items-center mt-[16px]" 
          onClick={() => setOpen(!open)}
          >
            <Image src="/images/icon_close.svg" alt="close_icon" width={24} height={24} 
            />
          </div>
          {/* Body Mobile */}
          <div className="flex-1 overflow-y-auto">
            {menuItems.map((item) => (
              <div
                key={item.label}
                className="hover:bg-[var(--blue-500)] cursor-pointer"
                onClick={() => {
                  router.push(item.path);
                  setOpen(false); // ปิดเมนู
                }}
              >
                <div className="px-[15px] py-[15px] flex items-center ">
                  <Image src={item.icon} alt={`${item.label}_icon`} width={24} height={24} />
                  <span className="body5 text-[var(--gray-100)] ml-[10px] break-words max-w-[170px]">{item.label}</span>
                  {Number(item.count) > 0 && (
                    <div className="inline-flex h-[20px] min-w-[20px] rounded-full bg-[var(--red)] items-center justify-center ml-[15px] px-[6px]">
                      <span className="body5 text-[var(--gray-100)] text-center  ">
                        {item.count! > 99 ? "99+" : item.count}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Mobile */}
          <div
            className="h-[55px] hover:bg-[var(--blue-500)] cursor-pointer flex items-center px-[24px] mb-[16px]"
            onClick={() => {
              handleLogout();
              setOpen(false);
            }}
          >
            <Image src="/images/icon_logout.svg" alt="logout_logo" width={24} height={24} />
            <span className="body5 text-[var(--gray-100)] ml-[16px]">ออกจากระบบ</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default NavbarTechnician;








// const res = await datatable.query(
//   "SELECT COUNT(*) AS count FROM table_name WHERE name = $1",
//   ['Jame']
// );

// const Count = res.rows[0].count; // ต้องใช้ rows

// const menuItems = [
//   { label: "คำขอบริการซ่อม", path: "/", icon: "/images/icon_bell_off.svg", count: 1 },
//   { label: "รายการที่รอดำเนินการ", path: "/", icon: "/images/icon_tasklist.svg", count: 0 },
//   { label: "ประวัติการซ่อม", path: "/", icon: "/images/icon_history.svg", count: Count },
//   { label: "ตั้งค่าบัญชีผู้ใช", path: "/", icon: "/images/icon_user.svg" }
// ];

// <NavbarTechnician menuItems={menuItems} />


