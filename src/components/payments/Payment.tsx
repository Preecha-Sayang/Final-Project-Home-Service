"use client";

import Image from "next/image";
import qr_code from "../../../public/images/icon_qr.svg";
import credit_card from "../../../public/images/icon_card.svg";
import selected_qr from "../../../public/images/selected_qr.png";
import selected_card from "../../../public/images/selected_card.png";
import { useState } from "react";

export default function Payment() {
  const [selectedPayment, setSelectedPayment] = useState("");

  const setSelectPayment = (val: string) => {
    if (val === "QR_CODE") {
      setSelectedPayment(val);
    } else {
      setSelectedPayment(val);
    }
  };

  return (
    <div className="mt-12">
      <div className="flex flex-row items-center justify-center gap-12">
        <div
          onClick={() => setSelectPayment("QR_CODE")}
          className={`flex flex-col items-center justify-center gap-2 border border-[var(--gray-300)] px-48 py-6 rounded-xl cursor-pointer ${
            selectedPayment === "QR_CODE" ? "bg-[var(--blue-100)]" : ""
          }`}
        >
          {selectedPayment === "QR_CODE" ? (
            <Image src={selected_qr} className="w-12 h-12" alt="" />
          ) : (
            <Image src={qr_code} className="w-12 h-12" alt="" />
          )}
          <p
            className={`${
              selectedPayment === "QR_CODE" ? "text-[var(--blue-600)]" : ""
            } `}
          >
            พร้อมเพย์
          </p>
        </div>

        <div
          onClick={() => setSelectPayment("CREDIT_CARD")}
          className={`flex flex-col items-center justify-center gap-2 border border-[var(--blue-300)] px-48 py-6 rounded-xl cursor-pointer ${
            selectedPayment === "CREDIT_CARD" ? "bg-[var(--blue-100)]" : ""
          }`}
        >
          {selectedPayment === "CREDIT_CARD" ? (
            <Image src={selected_card} className="w-12 h-12" alt="" />
          ) : (
            <Image src={credit_card} className="w-12 h-12" alt="" />
          )}

          <p
            className={`${
              selectedPayment === "CREDIT_CARD" ? "text-[var(--blue-600)]" : ""
            } `}
          >
            บัตรเครดิต
          </p>
        </div>
      </div>
    </div>
  );
}
