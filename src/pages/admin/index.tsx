import NavbarAdmin, { NavbarMenuItem } from "@/components/navbaradmin";
import type { PropsWithChildren } from "react";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";

const menuitems: NavbarMenuItem[] = [
  { label: "หมวดหมู่", path: "/admin/categories", icon: "/images/icon_category.svg" },
  { label: "บริการ", path: "/admin/services", icon: "/images/icon_service.svg" },
  { label: "Promotion Code", path: "/admin/promotion", icon: "/images/icon_promotion.svg" },
];

type AdminShellProps = PropsWithChildren<{
  adminRoots?: string[];
  defaultPath?: string;
}>;

export default function AdminShell({
  children,
  adminRoots = ["/admin", "/admin/"],
  defaultPath = "/admin/categories",
}: AdminShellProps) {
  const router = useRouter();
  const pathname = router.asPath || router.pathname;

  const shouldRedirect = useMemo(
    () => adminRoots.some((r) => pathname === r),
    [adminRoots, pathname]
  );

  useEffect(() => {
    if (shouldRedirect) router.replace(defaultPath);
  }, [shouldRedirect, router, defaultPath]);

  const activePath = pathname;

  // เพิ่มลูกเล่น หมุนๆ ระหว่างรอ redirect ไป /admin/categories
  if (shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--gray-50)]">
        <div className="w-14 h-14 border-4 border-[var(--blue-600)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--gray-50)]">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50
                   focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:shadow"
      >
        ข้ามไปยังเนื้อหา
      </a>

      <div className="flex">
        <aside className="sticky top-0 h-dvh shrink-0 border-r border-[var(--gray-100)] bg-white">
          <NavbarAdmin menuItems={menuitems} activePath={activePath} />
        </aside>

        <main
          id="admin-main"
          role="main"
          className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 [padding-bottom:env(safe-area-inset-bottom)]"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
