import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { formatThaiDateTimeAMPM } from "lib/formatDate";
import type {
  CategoryOneOk,
  CategoryErr,
  CategoryRow,
} from "@/types/category";

const Preview: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState<boolean>(true);
  const [category, setCategory] = useState<CategoryRow | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (!router.isReady || !id) return;

    const fetchOne = async (): Promise<void> => {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch(`/api/categories/${id}`);
        if (!res.ok) {
          const text = await res.text(); // กันกรณีได้ HTML error
          throw new Error(text || "โหลดข้อมูลไม่สำเร็จ");
        }
        const data = (await res.json()) as CategoryOneOk | CategoryErr;
        if (!("ok" in data) || !data.ok) {
          throw new Error(
            ("message" in data && data.message) || "โหลดข้อมูลไม่สำเร็จ"
          );
        }
        setCategory(data.category);
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };

    void fetchOne();
  }, [router.isReady, id]);

  // กล่องตัวอย่างสี (bg / text / ring)
  const previewStyle: React.CSSProperties | undefined = category
    ? {
        background: category.bg_color_hex,
        color: category.text_color_hex,
        // ring ใช้ boxShadow inset 2px
        boxShadow: `0 0 0 2px ${category.ring_color_hex} inset`,
      }
    : undefined;

  return (
    <div className="mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/__categories_demo"
            className="rounded-lg border px-3 py-2 text-[var(--gray-700)] hover:bg-[var(--gray-100)]"
          >
            ← กลับ
          </Link>
          <div className="text-xl font-semibold text-[var(--gray-900)]">
            หมวดหมู่
          </div>
        </div>

        {category && (
          <Link
            href={`/admin/__categories_demo/${category.category_id}/edit`}
            className="rounded-lg bg-[var(--blue-600)] px-4 py-2 text-white hover:bg-[var(--blue-700)]"
          >
            แก้ไข
          </Link>
        )}
      </div>

      {/* Body */}
      <div className="rounded-2xl border border-[var(--gray-100)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,.06)]">
        {loading ? (
          <div className="py-16 text-center text-[var(--gray-500)]">
            Loading…
          </div>
        ) : errorMsg ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
            {errorMsg}
          </div>
        ) : category ? (
          <div className="grid gap-6">
            {/* ชื่อ */}
            <div className="grid grid-cols-12 items-center gap-4">
              <div className="col-span-3 text-[var(--gray-600)]">
                ชื่อหมวดหมู่
              </div>
              <div className="col-span-9 text-[var(--gray-900)] font-medium">
                {category.name}
              </div>
            </div>

            {/* สีตัวอย่าง */}
            <div className="grid grid-cols-12 items-center gap-4">
              <div className="col-span-3 text-[var(--gray-600)]">สี</div>
              <div className="col-span-9">
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-sm text-[var(--gray-600)]">bg</span>
                  <span className="rounded border px-2 py-1 text-sm">
                    {category.bg_color_hex}
                  </span>
                  <span
                    className="h-5 w-8 rounded border"
                    style={{ background: category.bg_color_hex }}
                  />
                </div>

                <div className="mb-2 flex items-center gap-3">
                  <span className="text-sm text-[var(--gray-600)]">text</span>
                  <span className="rounded border px-2 py-1 text-sm">
                    {category.text_color_hex}
                  </span>
                  <span
                    className="h-5 w-8 rounded border"
                    style={{ background: category.text_color_hex }}
                  />
                </div>

                <div className="mb-4 flex items-center gap-3">
                  <span className="text-sm text-[var(--gray-600)]">ring</span>
                  <span className="rounded border px-2 py-1 text-sm">
                    {category.ring_color_hex}
                  </span>
                  <span
                    className="h-5 w-8 rounded border"
                    style={{ background: category.ring_color_hex }}
                  />
                </div>

                {/* กล่อง preview รวม */}
                <div
                  className="h-10 w-[260px] rounded px-4 py-2 text-sm font-semibold"
                  style={previewStyle}
                >
                  ตัวอย่างข้อความ
                </div>
              </div>
            </div>

            {/* เวลา */}
            <hr className="border-[var(--gray-200)]" />
            <div className="grid gap-2 text-[var(--gray-700)]">
              <div className="flex h-10 w-[420px] items-center justify-between">
                <span className="text-[var(--gray-500)]">สร้างเมื่อ</span>
                <span>{formatThaiDateTimeAMPM(category.create_at)}</span>
              </div>
              <div className="flex h-10 w-[420px] items-center justify-between">
                <span className="text-[var(--gray-500)]">แก้ไขล่าสุด</span>
                <span>{formatThaiDateTimeAMPM(category.update_at)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-[var(--gray-500)]">
            ไม่พบข้อมูล
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;
