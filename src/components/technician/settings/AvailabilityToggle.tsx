// ปุ่มพร้อมรับงาน
import React, { useCallback, useState } from "react";
import Button from "@/components/button/buttonprimary";
import Image from "next/image";

export type TechnicianRequestProps = {
  // Called when availability status has been successfully set to true
  onStatusChanged?: (isAvailable: boolean) => void;
  className?: string;
};

// This is a pluggable block that, when the button is pressed,
// sets is_available=true in technician profile and notifies parent
export default function AvailabilityToggle(props: TechnicianRequestProps) {
  const { onStatusChanged, className } = props;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const activate = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      // Lightweight endpoint to set only availability
      const postRes = await fetch("/api/technician/profile/set-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ is_available: true }),
      });
      if (!postRes.ok) throw new Error(`POST set-availability failed: ${postRes.status}`);
      const postJson: any = await postRes.json().catch(() => ({ ok: false }));
      if (!postJson?.ok) throw new Error(postJson?.message || "Failed to update availability");

      setDone(true);
      onStatusChanged?.(true);
    } catch (e: any) {
      setError(String(e?.message || e || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [loading, onStatusChanged]);

  return (
    <div className={className}>
      <div className="bg-[var(--white)] rounded-xl border border-[var(--gray-200)] shadow-sm p-8 flex flex-col items-center justify-center text-center">
        <div className="pt-2 pb-4 mb-4">
          <Image src="/images/icon_bell_blue.svg" alt="Bell Icon" width={32} height={32} />
        </div>

        <div className="text-xl font-semibold text-[var(--gray-800)] mb-1">
          ต้องการรับแจ้งเตือนคำขอบริการสั่งซ่อม?
        </div>

        <p className="text-sm text-[var(--gray-500)] mb-6 ">
          เปิดใช้งานสถานะพร้อมให้บริการเพื่อแสดงรายการและรับงานซ่อมในบริเวณตำแหน่งที่คุณอยู่
        </p>

        <Button
          disabled={loading || done}
          onClick={activate as any}
          className={`w-[250px] text-[var(--white)] text-sm font-normal px-6 py-2 rounded-md whitespace-nowrap`}
        >
          {done ? "พร้อมให้บริการแล้ว" : loading ? "กำลังเปิดใช้งาน..." : "เปลี่ยนสถานะเป็นพร้อมให้บริการ"}
        </Button>

        {error && (
          <div className="mt-3 text-sm text-[var(--red-600)]">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
