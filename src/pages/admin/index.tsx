"use client";
import NavbarAdmin from "@/components/navbaradmin";

const menuitems = [
  { label: "หมวดหมู่", path: "/admin/category", icon: "/images/icon_category.svg" },
  { label: "บริการ", path: "/admin/services", icon: "/images/icon_service.svg" },
  { label: "Promotion Code", path: "/admin/promotioncode", icon: "/images/icon_promotion.svg" }
]

export default function Home() {
  return (
    <div>
      <NavbarAdmin menuItems={menuitems} />
      
    </div>
  );
}
