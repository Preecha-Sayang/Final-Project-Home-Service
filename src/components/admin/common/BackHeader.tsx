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
        <div className={["w-full bg-white rounded-2xl border border-gray-100 px-5 py-4 mb-6 flex items-center justify-between", className].join(" ")}>
            <button onClick={goBack} className="flex items-center gap-3 group" aria-label="ย้อนกลับ">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 group-hover:bg-gray-50">
                    <ChevronLeft size={18} />
                </span>
                <div className="text-left">
                    {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
                    <div className="text-sm md:text-base font-medium text-gray-900">{title}</div>
                </div>
            </button>
            {/* ปุ่มขวา */}
            <div className="flex items-center gap-2">
                {actions}
            </div>
            <div />
        </div>
    );
}