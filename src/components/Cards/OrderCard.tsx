import ButtonPrimary from "../button/buttonprimary";
import Image from 'next/image';




interface OrderCardProps {
  orderCode: string;
  operationDateTime: string;
  employee: string;
  items: string[];
  status: string;
  totalPrice: string;
  onViewDetails?: () => Promise<void> | void;
}




function OrderCard({
  orderCode,
  operationDateTime,
  employee,
  items,
  status,
  totalPrice,
  onViewDetails
}: OrderCardProps) {
  return (
    <div className="w-full max-w-[831px] bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
      {/* Desktop Layout (md and up) */}
      <div className="hidden md:block">
        {/* Header */}
        <div className="mb-3">
          <h2 className="text-lg font-bold text-gray-900 font-prompt">คำสั่งการซ่อมรหัส : {orderCode}</h2>
        </div>




        <div className="flex justify-between items-start">
          {/* Left Column - Details */}
          <div className="flex-1 pr-4">
            {/* Operation Date/Time */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Image src="/images/icon_tasklist.svg" alt="tasklist" width={20} height={20} />
              <span className="font-prompt">วันเวลาดำเนินการ: {operationDateTime}</span>
            </div>




            {/* Employee */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Image src="/images/icon_user.svg" alt="icon_user" width={20} height={20} />
              <span className="font-prompt">พนักงาน: {employee}</span>
            </div>




            {/* Items */}
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-700 font-prompt">รายการ:</span>
              <ul className="mt-1 space-y-1">
                {items.map((item, index) => (
                  <li key={index} className="text-sm text-gray-900 flex items-center gap-2 font-prompt">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>




          {/* Right Column - Status and Price */}
          <div className="flex flex-col items-end gap-2">
            {/* Status */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-700 font-prompt">สถานะ:</span>
              <span className={`px-2 py-1 rounded-full text-sm font-prompt ${
                  status === "รอดำเนินการ" ? "bg-gray-200 text-gray-800" :
                  status === "กำลังดำเนินการ" ? "bg-yellow-100 text-yellow-900" :
                  status === "ดำเนินการสำเร็จ" ? "bg-green-100 text-green-900" :
                "bg-gray-200 text-gray-600"
              }`}>
                {status}
              </span>
            </div>




            {/* Total Price */}
            <div className="text-right text-sm font-medium text-gray-700 font-prompt">
              ราคารวม: {totalPrice} ฿
            </div>
          </div>
        </div>




        {/* Action Button */}
        <div className="flex justify-end mt-4">
          <ButtonPrimary onClick={onViewDetails}>
            ดูรายละเอียด
          </ButtonPrimary>
        </div>
      </div>


      {/* Mobile Layout (below md) */}
      <div className="block md:hidden">
        {/* Header */}
        <div className="mb-4">
          <h4 className="text-lg font-bold text-gray-900 font-prompt">คำสั่งการซ่อมรหัส : {orderCode}</h4>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-medium text-gray-700 font-prompt">สถานะ:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-prompt ${
                status === "รอดำเนินการ" ? "bg-gray-200 text-gray-800" :
                status === "กำลังดำเนินการ" ? "bg-yellow-100 text-yellow-900" :
                status === "ดำเนินการสำเร็จ" ? "bg-green-100 text-green-900" :
              "bg-gray-200 text-gray-600"
            }`}>
              {status}
            </span>
          </div>
        </div>




        {/* Details Section */}
        <div className="space-y-3 mb-4">
          {/* Operation Date/Time */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Image src="/images/icon_tasklist.svg" alt="tasklist" width={20} height={20} />
            <span className="font-prompt">วันเวลาดำเนินการ: {operationDateTime}</span>
          </div>




          {/* Employee */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Image src="/images/icon_user.svg" alt="icon_user" width={20} height={20} />
            <span className="font-prompt">พนักงาน: {employee}</span>
          </div>




          {/* Total Price */}
          <div className="text-sm">
            <span className="font-medium text-gray-700 font-prompt">ราคารวม: </span>
            <span className="font-bold text-lg text-gray-900 font-prompt">{totalPrice} ฿</span>
          </div>




          {/* Items */}
          <div>
            <span className="text-sm font-medium text-gray-700 font-prompt">รายการ:</span>
            <div className="mt-1">
              <span className="text-sm text-gray-900 font-prompt">{items.join(", ")}</span>
            </div>
          </div>
        </div>




        {/* Action Button */}
        <div className="w-full">
          <ButtonPrimary onClick={onViewDetails}>
            ดูรายละเอียด
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
}




export default OrderCard;