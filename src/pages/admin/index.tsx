import NavbarAdmin from "@/components/navbaradmin";
import { PropsWithChildren } from "react";

const menuitems = [
  { label: "หมวดหมู่", path: "/admin/categories", icon: "/images/icon_category.svg" },
  { label: "บริการ", path: "/admin/services", icon: "/images/icon_service.svg" },
  { label: "Promotion Code", path: "/admin/promotion", icon: "/images/icon_promotion.svg" },
];

export default function AdminShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[var(--gray-50)] flex">
      <NavbarAdmin menuItems={menuitems} />
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
