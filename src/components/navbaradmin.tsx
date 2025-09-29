import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import logo from "@/../public/images/logo.png"
import icon_logout from "@/../public/images/icon_logout.svg"

export interface NavbarMenuItem {
  label: string;
  path: string;
  icon: string;
}

interface NavbarProps {
  menuItems: NavbarMenuItem[];
  activePath?: string;
  loading?: boolean;
}

function NavbarAdmin({ menuItems, activePath, loading }: NavbarProps) {
  const router = useRouter();

  const cur = activePath ?? router.asPath;
  const isActive = (itemPath: string) => {
    return cur === itemPath || cur.startsWith(itemPath + "/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/admin/login"); //เวลากดlogout แล้วอยากให้ไปหน้าไหน
  };

  return (
    <div className="bg-[var(--blue-950)] w-[240px] h-screen flex flex-col rounded-none">
      {/* Header */}
      <div id="header" className="h-[105px] flex justify-center items-center">
        <div className="w-[192px] h-[46px] px-2 bg-[var(--blue-100)] rounded-xl flex justify-center items-center cursor-pointer"
          onClick={() => router.push("/admin/categories")}
        >
          <Image src={logo} alt="logo" width={168} height={30} style={{ width: 168, height: 30 }} sizes="168px" priority />
        </div>
      </div>

      {/* Body */}
      <div id="body" className="flex-1 flex flex-col">
        {loading
          ? (
            Array.from({ length: Math.max(3, menuItems.length || 3) }).map((_, i) => (
              <div key={i} className="h-[55px] px-[24px] py-[15px]">
                <div className="flex items-center gap-4">
                  <div className="h-6 w-6 rounded bg-white/20 animate-pulse" />
                  <div className="h-4 w-28 rounded bg-white/20 animate-pulse" />
                </div>
              </div>
            ))
          )
          : (
            menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  href={item.path}
                  key={item.label}
                  className={[
                    "h-[55px] cursor-pointer",
                    active ? "bg-[var(--blue-700)]" : "hover:bg-[var(--blue-500)]",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  <div className="px-[24px] py-[15px] flex flex-row items-center">
                    <Image src={item.icon} alt={`${item.label}_icon`} width={24} height={24} style={{ width: 24, height: 24 }} />
                    <span
                      className={[
                        "body5 ml-[16px]",
                        active ? "text-white font-medium" : "text-[var(--gray-100)]",
                      ].join(" ")}
                    >
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
      </div>

      {/* Footer */}
      <div id="footer"
        className="h-[55px] hover:bg-[var(--blue-500)] cursor-pointer flex items-center px-[24px] mb-[50px]"
        onClick={handleLogout}
      >
        <Image src={icon_logout} alt="logout_logo" width={24} height={24} sizes="24px" style={{ width: 24, height: 24 }} />
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