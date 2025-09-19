import NavbarTechnician from "@/components/navbartech";



const menuitems = [
  { label: "คำขอบริการซ่อม", path: "/", icon: "/images/icon_bell_off.svg", count: 1 },
  { label: "รายการที่รอดำเนินการ", path: "/", icon: "/images/icon_tasklist.svg", count: 0  },
  { label: "ประวัติการซ่อม", path: "/", icon: "/images/icon_history.svg" },
  { label: "ตั้งค่าบัญชีผู้ใช", path: "/", icon: "/images/icon_user.svg" }
]
export default function Home() {
  return ( 
    <div>
      <NavbarTechnician menuItems={menuitems}/>
    </div>
  );
}


