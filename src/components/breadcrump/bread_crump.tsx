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
  rootLink = "",
 }: BreadcrumbProps) {
  return (
    <div className="rounded-lg bg-white pb-1 pt-1 pl-3 pr-3 md:pb-3 md:pt-3 md:pl-6 md:pr-6 shadow-md inline-block">
      <div className="flex items-center space-x-2 text-gray-500 text-[16px]">
<<<<<<< HEAD
        <Link href="" className="hover:text-blue-600">
         <p className="text-[16px]"> บริการของเรา</p>
=======
        <Link href={rootLink} className="hover:text-blue-600">
          {root}
>>>>>>> 2a3a784 (feat: enhance Breadcrumb and OrderSummary components with additional props and formatting options)
        </Link>
        <span className="text-gray-400">{">"}</span>
        <span className="font-bold text-blue-600 text-[32px]">{current}</span>
      </div>
    </div>
  );
}
