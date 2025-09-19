import Image from "next/image";
import { useRouter } from "next/router";

interface MenuItem {
  label: string;
  path: string;
  icon: string;
}

interface NavbarProps {
  menuItems: MenuItem[];
}

function NavbarAdmin({ menuItems }: NavbarProps) {
  const router = useRouter();

    const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/"); //เวลากดlogout แล้วอยากให้ไปหน้าไหน
  };



  return (
    <div className="bg-[var(--blue-950)] w-[240px] h-screen flex flex-col rounded-none">
      {/* Header */}
      <div id="header" className="h-[105px] flex justify-center items-center">
        <div className="w-[192px] h-[46px] bg-[var(--blue-100)] rounded-xl flex justify-center items-center cursor-pointer"
        onClick={() => router.push("/")} 
        >
          <Image src="/images/logo.png" alt="logo" width={168} height={30} />
        </div>
      </div>

      {/* Body */}
      <div id="body" className="flex-1 flex flex-col">
        {menuItems.map((item) => (
          <div
            key={item.label}
            className="h-[55px] hover:bg-[var(--blue-500)] cursor-pointer"
            onClick={() => router.push(item.path)}
          >
            <div className="px-[24px] py-[15px] flex flex-row items-center">
              <Image src={item.icon} alt={`${item.label}_icon`} width={24} height={24} />
              <span className="body5 text-[var(--gray-100)] ml-[16px]">{item.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div id="footer" 
        className="h-[55px] hover:bg-[var(--blue-500)] cursor-pointer flex items-center px-[24px] mb-[50px]"
        onClick={handleLogout}
       >
        <Image src="/images/icon_logout.svg" alt="logout_logo" width={24} height={24} />
        <span className="body5 text-[var(--gray-100)] ml-[16px]">ออกจากระบบ</span>
      </div>
    </div>
  );
}


export default NavbarAdmin;

// const menuitems = [
//   { label: "หมวดหมู่", path: "/", icon: "/images/icon_category.svg" },
//   { label: "บริการ", path: "/", icon: "/images/icon_service.svg" },
//   { label: "Promotion Code", path: "/", icon: "/images/icon_promotion.svg" }
// ]

    // <div>
    //   <NavbarAdmin menuItems={menuitems}/>
    // </div>