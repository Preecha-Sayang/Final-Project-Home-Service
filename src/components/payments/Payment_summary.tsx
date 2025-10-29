import React from "react";

interface PaymentSummaryProps {
  status: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  date?: Date;
  time?: string;
  address?: string;
  totalPrice: number;
  discount?: number;
  promoCode?: string | null;
  clickevent?: () => void;
  eventname?: string;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  status,
  items,
  date,
  time,
  address,
  totalPrice,
  discount = 0,
  promoCode,
  clickevent,
  eventname = "ดูรายละเอียด",
}) => {
  const formatDate = (date?: Date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatNumber = (num: number) =>
    num.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const finalAmount = totalPrice - discount;

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-5">
      {/* Status Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-7 h-7 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          {status}
        </h1>
        <p className="text-sm text-gray-600">ขอบคุณที่ใช้บริการของเรา</p>
      </div>

      {/* Service Items */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <h6 className="text-base font-semibold text-gray-900 mb-3">
          รายการบริการ
        </h6>
        <div className="space-y-1.5 text-sm">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <span className="text-gray-700">{item.name}</span>
              <span className="text-gray-900 font-medium">
                {item.quantity} รายการ
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Details */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <h6 className="text-base font-semibold text-gray-900 mb-3">
          รายละเอียดการจอง
        </h6>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">วันที่:</span>
            <span className="font-medium text-gray-900">{formatDate(date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">เวลา:</span>
            <span className="font-medium text-gray-900">{time || "-"}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-gray-600">สถานที่:</span>
            <span className="font-medium text-gray-900 text-right max-w-[65%]">
              {address || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Price Summary */}
      <div className="border-t-2 border-gray-300 pt-4 mb-4">
        <h6 className="text-base font-semibold text-gray-900 mb-3">
          สรุปค่าใช้จ่าย
        </h6>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">ราคาบริการ:</span>
            <span className="font-medium text-gray-900">
              {formatNumber(totalPrice)} ฿
            </span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">
                ส่วนลด {promoCode && `(${promoCode})`}:
              </span>
              <span className="font-medium text-red-500">
                -{formatNumber(discount)} ฿
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-base font-semibold text-gray-900">
              ยอดชำระ:
            </span>
            <span className="text-xl font-bold text-blue-600">
              {formatNumber(finalAmount)} ฿
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      {clickevent && (
        <button
          onClick={clickevent}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm cursor-pointer"
        >
          {eventname}
        </button>
      )}

      {/* Additional Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800 text-center leading-relaxed">
          📧 ข้อมูลการจองได้รับการบันทึกแล้ว
          <br />
          หากมีคำถามเพิ่มเติม กรุณาติดต่อฝ่ายสนับสนุน
        </p>
      </div>
    </div>
  );
};

export default PaymentSummary;