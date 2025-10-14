

import Image from "next/image";
import vector from "../../../public/images/vector.png";



interface PaymentSummaryProps {
  status?: string | React.ReactNode;  
  itemName?: string;
  quantity?: number;
  date?: Date;
  time?: string;
  address?: string;
  totalPrice?: string | number;
  type?: "button" | "submit" | "reset";
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({ status, itemName, quantity, date, time, address, totalPrice}:PaymentSummaryProps) => {

  // useEffect(() => {},[]

  return (
    <div className="flex flex-col gap-4 pt-10 mx-auto max-w-lg border border-bg-[var(--white)] px-10 py-10 rounded-xl">
      <div className="flex flex-col items-center justify-center">
        <Image src={vector} className="w-14 h-14" alt="" />
        <p className="text-[var(--gray-950)] text-3xl mt-5">
          {status}
        </p>
      </div>

      <div className="flex flex-row items-center justify-between gap-20 mt-6">
      <p className="text-[var(--black)] ">{itemName}</p>
        <p>{quantity}</p>
      </div>
      <hr />

      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between">
          <p className="text-[var(--gray-700)]">วันที่ </p>
          <p>{date}</p>
        </div>
        <div className="flex flex-row items-center justify-between">
          <p className="text-[var(--gray-700)]">เวลา </p>
          <p>{time}</p>
        </div>
        <div className="flex flex-row items-center justify-between">
          <p className="text-[var(--gray-700)]">สถานที่</p>
          <p className="text-right max-w-xs">
          {address}
          </p>
        </div>
      </div>
      <hr />

      <div className="flex flex-row items-center justify-between gap-20 mt-6">
        <p className="tex50.00 ฿t-[var(--gray-700)]">รวม</p>
        <p>{totalPrice.toLocaleString()} ฿</p>
      </div>

      <div className="mb-12 items-center justify-center mt-6">
        <button className="text-[var(--white)] bg-[var(--blue-600)] w-full py-4 rounded-2xl cursor-pointer">
          เช็ครายการซ่อม
        </button>
      </div>
    </div>
  );
};

export default PaymentSummary;






//   วิธีนำใาใช้      
// <PaymentSummary status={"ชำระเงินเรียบร้อยแล้ว !"} itemName={"9000-18,000 BTU"} quantity={2} date={23 เม.ย 2021} time={11.00} address={"จตุจัร กรุงเทพ"} tatalPrice={15550.00}/>
      
