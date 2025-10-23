

import Image from "next/image";
import { useRouter } from 'next/router';
import vector from "../../../public/images/vector.png";

type Item = {
  name: string;
  quantity: number;
};

interface PaymentSummaryProps {
  status?: string | React.ReactNode;  
  items?: Item[];
  date?: Date;
  time?: string;
  address?: string;
  totalPrice?: string | number;
  type?: "button" | "submit" | "reset";
  clickevent?:() => Promise<void> | void;
  eventname: string;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({ status, items = [], date, time, address, totalPrice, clickevent, eventname}:PaymentSummaryProps) => {
  const router = useRouter();



  return (
    <div className="flex flex-col gap-4 pt-10 mx-auto max-w-lg border border-bg-[var(--white)] px-10 py-10 rounded-xl bg-white">
      <div className="flex flex-col items-center justify-center">
        <Image src={vector} className="w-14 h-14" alt="" />
        <p className="text-[var(--gray-950)] text-3xl mt-5">
          {status}
        </p>
      </div>

      <div className="mt-6">
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start">
              <span className="text-[var(--black)] text-base flex-1 pr-4">
                {item.name}
              </span>
              <span className="text-base text-[var(--black)] whitespace-nowrap">
                {item.quantity} รายการ
              </span>
            </div>
          ))}
        </div>
      </div>
      <hr />

      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between">
          <p className="text-[var(--gray-700)]">วันที่ </p>
          <p>{date ? new Intl.DateTimeFormat('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }).format(new Date(date)) : 'ยังไม่ได้เลือก'}</p>
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
        <p className="text-[var(--gray-700)]">รวม</p>
        <p className="text-lg font-bold">{totalPrice?.toLocaleString()} ฿</p>
      </div>

      <div className="mb-12 items-center justify-center mt-6">
        <button 
          onClick={clickevent}
          className="text-[var(--white)] bg-[var(--blue-600)] w-full py-4 rounded-2xl cursor-pointer hover:bg-[var(--blue-700)] transition-colors"
        >
          {eventname}
        </button>
      </div>
    </div>
  );
};

export default PaymentSummary;






//   วิธีนำมาใช้      
// const items = [
//   { name: "ล้างแอร์ 9000-18,000 BTU", quantity: 2 },
//   { name: "ซ่อมเครื่องซักผ้า", quantity: 1 }
// ];
// 
// <PaymentSummary 
//   status={"ชำระเงินเรียบร้อย !"} 
//   items={items} 
//   date={new Date("2021-04-23")} 
//   time={"11:00"} 
//   address={"จตุจักร กรุงเทพ"} 
//   totalPrice={15550.00}
// />
      
