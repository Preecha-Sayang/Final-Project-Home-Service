import { useRouter } from "next/router";
import { ChevronLeft } from "lucide-react";
import { ReactNode } from "react";

type Props = {
    title: string;
    subtitle?: string;
    backHref?: string;// จะ push ไปเส้นนี้ (วางไว้ก่อนเดี่ยวมาดูอีกที)
    actions?: ReactNode;
    className?: string;
};

export default function BackHeader({ title, subtitle, backHref, actions, className }: Props) {

    const router = useRouter();
    const goBack = () => {
        if (backHref) return router.push(backHref);
        router.back();
    };

    return (
        <div className={["w-full bg-white rounded-2xl border border-[var(--gray-100)] px-5 py-4 mb-6 flex items-center justify-between shadow-[0_10px_24px_rgba(0,0,0,.06)]", className].join(" ")}>
            <div>
                <button onClick={goBack} className="flex items-center gap-3 group cursor-pointer" aria-label="ย้อนกลับ">
                    <span className="inline-flex h-[44px] w-8 items-center justify-center rounded-md border border-[var(--gray-200)] group-hover:bg-[var(--blue-600)] group-hover:text-[var(--gray-100)]">
                        <ChevronLeft size={30} />
                    </span>
                    <div className="text-left">
                        {subtitle && <div className="text-xs text-[var(--gray-500)]">{subtitle}</div>}
                        <div className="text-base font-medium text-[var(--gray-900)]">{title}</div>
                    </div>
                </button>
            </div>
            <div>
                {actions}
            </div>
        </div>
    );
}