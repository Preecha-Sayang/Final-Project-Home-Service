import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

type Props = { children: ReactNode };

const NavItem = ({ href, label }: { href: string; label: string }) => {
    const { pathname } = useRouter();
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
        <Link
            href={href}
            className={`rounded-md px-3 py-2 text-sm font-medium transition
        ${active ? "bg-white/15 text-white" : "text-white/80 hover:text-white hover:bg-white/10"}`}
        >
            {label}
        </Link>
    );
};

export default function TechnicianShell({ children }: Props) {
    return (
        <div className="min-h-screen grid grid-cols-[240px_1fr]">
            {/* Sidebar */}
            <aside className="bg-[#0b2a5a] text-white">
                <div className="px-4 py-4 text-lg font-semibold">HomeServices</div>
                <nav className="px-3 py-2 grid gap-1">
                    <NavItem href="/technician" label="คำขอบริการซ่อม" />
                    <NavItem href="/technician/pending" label="รายการที่รอดำเนินการ" />
                    <NavItem href="/technician/history" label="ประวัติการซ่อม" />
                    <NavItem href="/technician/settings" label="ตั้งค่าบัญชีผู้ใช้" />
                </nav>
            </aside>

            {/* Main */}
            <main className="bg-[#f7f8fa]">
                {children}
            </main>
        </div>
    );
}

// Layout/Sidebar/Header (สไตล์เดียวกับ AdminShell)