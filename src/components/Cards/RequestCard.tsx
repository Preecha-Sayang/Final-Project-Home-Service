import Image from 'next/image';
import ButtonPrimary from "../button/buttonprimary";
import ButtonSecondary from "../button/buttonsecondary";


interface RequestCardProps {
  title: string;
  operationDateTime: string;
  orderCode: string;
  items: string;
  totalPrice: string;
  address: string;
  onAccept?: () => Promise<void> | void;
  onReject?: () => Promise<void> | void;
}


function RequestCard({
  title,
  operationDateTime,
  orderCode,
  items,
  totalPrice,
  address,
  onAccept,
  onReject,
}: RequestCardProps) {
  return (
    <div className="w-full max-w-[1024px] bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
      {/* Desktop/Page version (reference) */}
      <div className="hidden md:block">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 font-prompt">{title}</h3>
          <div className="text-sm font-prompt text-gray-600">
            <span>วันเวลาดำเนินการ </span>
            <span className="text-blue-600">{operationDateTime}</span>
          </div>
        </div>


        {/* Content Row */}
        <div className="flex justify-between items-end">
          {/* Left details */}
          <div className="flex-1 pr-4">
            <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm font-prompt text-gray-700">
              <div className="text-gray-500">รายการ</div>
              <div className="text-gray-900">{items}</div>


              <div className="text-gray-500">รหัสคำสั่งซ่อม</div>
              <div className="text-gray-900">{orderCode}</div>


              <div className="text-gray-500">ราคารวม</div>
              <div className="text-gray-900">{totalPrice} ฿</div>


              <div className="text-gray-500">สถานที่</div>
              <div className="text-gray-900">
                {address}
                <div className="mt-1 flex items-center gap-1 text-[var(--blue-600)] cursor-pointer w-fit underline">
                  <Image src="/images/icon_pin.svg" alt="pin" width={16} height={16} />
                  ดูแผนที่
                </div>
              </div>
            </div>
          </div>


          {/* Right actions */}
          <div className="flex gap-3">
          <ButtonSecondary onClick={onReject} >ปฏิเสธ</ButtonSecondary>
          <ButtonPrimary onClick={onAccept}>รับงาน</ButtonPrimary>
          </div>
        </div>
      </div>


      {/* Mobile/Responsive version */}
      <div className="block md:hidden">
        <h4 className="text-lg font-bold text-gray-900 font-prompt mb-3">{title}</h4>


        <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm font-prompt text-gray-700 mb-4">
        <div className="text-gray-500 col-span-2">วันเวลาดำเนินการ</div>
    <div className="text-blue-600 col-span-2">{operationDateTime}</div>


    <div className="text-gray-500">รายการ</div>
    <div className="text-gray-900">
      {Array.isArray(items) ? items.join(", ") : items}
    </div>


    <div className="text-gray-500">รหัสคำสั่งซ่อม</div>
    <div className="text-gray-900">{orderCode}</div>


    <div className="text-gray-500">ราคารวม</div>
    <div className="text-gray-900">{totalPrice} ฿</div>


    <div className="text-gray-500">สถานที่</div>
    <div className="text-gray-900"> {address}
            <div className="mt-2 flex items-center gap-1 text-[var(--blue-600)] cursor-pointer w-fit underline">
              <Image src="/images/icon_pin.svg" alt="pin" width={16} height={16} />
              ดูแผนที่
            </div>
          </div>
        </div>




        <div className="flex w-full gap-3">
          <div className="flex-1">
            <ButtonSecondary onClick={onReject} className="w-full">ปฏิเสธ</ButtonSecondary>
          </div>
          <div className="flex-1">
            <ButtonPrimary onClick={onAccept} className="w-full">รับงาน</ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  );
}


export default RequestCard;
