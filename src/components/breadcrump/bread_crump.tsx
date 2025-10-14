import React from "react";
import Link from "next/link";

interface BreadcrumbProps {
  root: string;
  rootLink: string;
  current: string; // ค่า breadcrumb สุดท้าย (เช่น "ล้างแอร์")
}

export default function Breadcrumb({ 
  current,
  root = "บริการของเรา",
  rootLink = "/services",
}: BreadcrumbProps) {
  return (
    <div className="rounded-lg bg-white pb-1 pt-1 pl-3 pr-3 md:pb-3 md:pt-3 md:pl-8 md:pr-6 shadow-md inline-block">
      <div className="flex items-center space-x-3 text-gray-500 text-[20px]">
        <Link href={rootLink} className="hover:text-blue-600 transition-colors">
          <span className="text-[16px]">{root}</span>
        </Link>
        <span className="text-gray-400">{">"}</span>
        <span className="font-medium text-blue-600 text-[32px]">{current}</span>
      </div>
    </div>
  );
}

/* ----------------------------------------------------
  วิธีใช้งาน Breadcrumb Component

  Breadcrumb Component ใช้สำหรับแสดงเส้นทางการนำทางในเว็บไซต์
  ช่วยให้ผู้ใช้ทราบว่าตนอยู่ในหน้าใดและสามารถกลับไปหน้าก่อนหน้าได้

  Props:
  - root: string (required) - ข้อความของ breadcrumb ระดับแรก
  - rootLink: string (required) - ลิงก์ไปยังหน้า breadcrumb ระดับแรก
  - current: string (required) - ข้อความของ breadcrumb ปัจจุบัน (ไม่สามารถคลิกได้)

  ตัวอย่างการใช้งาน:

  1) การใช้งานพื้นฐาน:
     import Breadcrumb from "@/components/breadcrump/bread_crump";
     
     <Breadcrumb 
       root="บริการของเรา"
       rootLink="/services"
       current="ล้างแอร์"
     />

  
  การแสดงผล:
  - Breadcrumb จะแสดงเป็นกล่องสีขาวพร้อมเงา
  - มีการแบ่งด้วยเครื่องหมาย ">" 
  - ข้อความแรกสามารถคลิกได้และมี hover effect
  - ข้อความสุดท้าย (current) จะเป็นสีน้ำเงินและไม่สามารถคลิกได้
  - รองรับการแสดงผลแบบ responsive

  หมายเหตุ:
  - ควรใช้ breadcrumb ในทุกหน้าที่ไม่ใช่หน้าแรก
  - ข้อความ current ควรสั้นและชัดเจน
  - rootLink ควรชี้ไปยังหน้าที่มีอยู่จริง

---------------------------------------------------- */
