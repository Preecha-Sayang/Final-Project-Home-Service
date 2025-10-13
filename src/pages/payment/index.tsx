import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// components
import Breadcrumb from "@/components/breadcrump/bread_crump";
import Navbar from "@/components/navbar/navbar";
import Stepper from "@/components/state_list and stepper/stepper";
import Payment from "@/components/payments/Payment";
import OrderSummary from "@/components/ordersummary/order_summary";
import InputField from "@/components/input/inputField/input_state";
import ButtonPrimary from "@/components/button/buttonprimary";
import FooterAction from "@/components/footer_action/footer_action";

// รูป
import Image from "next/image";
import manhand from "../../../public/images/manhand_air.png";

export default function PaymentPage() {
  const router = useRouter();

  const [totalPrice, setTotalPrice] = useState(0.0);
  const [dateOrder, setDateOrder] = useState("");
  const [timeOrder, setTimeOrder] = useState("");
  const [addressOrder, setAddressOrder] = useState("");
  const [promotion, setPromotion] = useState();
  const [currentStep, setCurrentStep] = useState(2);
  const orderItems: any[] = [];

  // ---------- ฟอร์มข้อมูลบัตรเครดิต ------------//
  const [form, setForm] = useState({
    credit_card_number: "",
    card_fullname: "",
    expired_date: "",
    ccv: "",
    promotion: "",
  });

  // ป้องกันกดชำระเงินซ้ำ/แสดงสถานะระหว่างรอ
  const [processing, setProcessing] = useState(false);

  const submitDiscountCode = () => {
    setCurrentStep(3);
  };

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  // โหลด Omise.js ฝั่ง client เท่านั้น
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("omise-js"))
      // กันโหลดซ้ำ
      return;

    const s = document.createElement("script");
    s.id = "omise-js";
    s.src = "https://cdn.omise.co/omise.js";
    s.async = true;
    s.onload = () => {
      // @ts-ignore
      if (window.Omise) {
        // @ts-ignore
        window.Omise.setPublicKey(process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY);
      }
    };
    document.body.appendChild(s);
  }, []);

  // แปลง MM/YY -> month/year พร้อม validate เบื้องต้น
  const parseExpiry = (mmYY: string) => {
    const [mm, yy] = (mmYY || "").split("/");
    const month = Number(mm);
    const year = Number("20" + String(yy || "").padStart(2, "0"));
    if (!month || month < 1 || month > 12 || !year) return null;
    return { month, year };
  };

  // ถ้าเลือกบัตร: ใช้ Omise.js สร้าง token (ไม่ส่งเลขบัตรจริงไป API)
  // ถ้าเลือก QR: เรียก API ให้สร้าง PromptPay QR แล้วเปิดรูปให้ผู้ใช้สแกน

  // ---------- ฟังก์ชันหลัก: ยืนยันการชำระเงิน -----------//
  const handlePayment = async () => {
    try {
      if (processing) return;
      setProcessing(true);

      // ดึงวิธีชำระเงินที่ผู้ใช้เลือกจาก localStorage
      const selectedPayment =
        localStorage.getItem("selectedPayment") || "credit_card";

        const amountBaht = totalPrice && totalPrice > 0 ? totalPrice : 500;
        
        if (selectedPayment === "credit_card") {
          
          const Omise = window.Omise;
          if (!Omise) {
            alert("โหลดไม่สำเสร็จ กรุณาลองใหม่");
            setProcessing(false);
            return;
          }
  
          // ตรวจวันหมดอายุ
          const exp = parseExpiry(form.expired_date);
          if (!exp) {
            alert("กรุณากรอกวันหมดอายุรูปแบบ MM/YY (เช่น 08/27)");
            setProcessing(false);
            return;
          }


      // เตรียมข้อมูลสำหรับ API
      const tokenRes = await new Promise<{ id: string }>((resolve, reject) => {
        Omise.createToken(
          "card",
          {
            name: form.card_fullname,
            number: form.credit_card_number.replace(/\s+/g, ""),
            expiration_month: exp.month,
            expiration_year: exp.year,
            security_code: form.ccv,
          },
          (status: number, response: any) => {
            if (status === 200) resolve({ id: response.id });
            else reject(new Error(response.message || "Create token failed"));
          }
        );
      });


      // เรียก API ที่เราสร้างจาก (Omise) โดยส่ง tokenId ไม่ใช่เลขบัตร
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountBaht,
          method: "credit_card",
          tokenId: tokenRes.id,
        }),
      });

      const result = await res.json();

      // ตรวจผลลัพธ์
      if (result.status === "success") {
        alert("ชำระเงินสำเร็จ!");
        router.push("/payment/paymentsummary");
      } else if (result.status === "pending" && result.redirect_url) {
        
      } else {
        alert("การชำระเงินล้มเหลว: " + (result.message || "ไม่ทราบสาเหตุ"));
      }
    } else if (selectedPayment === "qr") {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountBaht, method: "qr" }),
      });

      const result = await res.json();

      if (result.status === "pending" && result.qr_url) {
        // ปัจจุบันเปิดในแท็บใหม่ — ถ้าต้องการโชว์ใน Modal ก็เปลี่ยนมาวาด <img src={qr_url} />
        window.open(result.qr_url, "_blank");
      } else {
        alert("สร้าง PromptPay QR ไม่สำเร็จ: " + (result.message || ""));
      }
    }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการชำระเงิน");
    } finally {
      setProcessing(false);
    }
  };

  // ----------------------------------- UI -----------------------------------//
  return (
    <div>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        {/* ส่วนหัวรูปภาพ + Breadcrumb */}
        <section className="relative w-full">
          <Image
            src={manhand}
            alt=""
            className="w-full md:h-60 object-cover"
            priority
            width={1440}
            height={240}
          />

          <div className="absolute left-36 top-1/2 -translate-y-1/2">
            <Breadcrumb
              root="บริการของเรา"
              rootLink="/services"
              current="ล้างแอร์"
            />
          </div>
        </section>

        <div className="relative  md:-mt-15 md:mx-34 mx-auto">
          <Stepper currentStep={currentStep} />
        </div>

        {/* ส่วนเนื้อหา (Payment + OrderSummary) */}
        <form action="" onSubmit={(e) => e.preventDefault()}>
          <div className="md:mx-36 flex flex-row justify-between gap-4">
            {/*กล่องซ้าย (Payment) */}
            <div className="border border-[var(--gray-border)] rounded-xl mt-4 w-full">
              <div className="p-8 flex flex-col gap-4">
                <p className="text-2xl font-bold text-[var(--gray-700)]">
                  ชำระเงิน
                </p>

                {/* แถบเลือกวิธีชำระเงิน */}
                <Payment />
                <div className="mt-4 flex flex-col gap-8">
                  <InputField
                    label="หมายเลขบัตรเครดิต *"
                    type="text"
                    required
                    value={form.credit_card_number}
                    placeholder="กรุณากรอกหมายเลขบัตรเครดิต"
                    onChange={(e) =>
                      handleChange("credit_card_number", e.target.value)
                    }
                  />
                  <InputField
                    label="ชื่อบนบัตร *"
                    type="text"
                    required
                    value={form.card_fullname}
                    placeholder="กรุณากรอกชื่อบนบัตร"
                    onChange={(e) =>
                      handleChange("card_fullname", e.target.value)
                    }
                  />
                  <div className="flex flex-row gap-6">
                    <div className="w-1/2">
                      <InputField
                        label="วันหมดอายุ *"
                        type="text"
                        required
                        value={form.expired_date}
                        placeholder="MM/YY"
                        onChange={(e) =>
                          handleChange("expired_date", e.target.value)
                        }
                        maxLength={5}
                      />
                    </div>
                    <div className="w-1/2">
                      <InputField
                        label="รหัส CVC / CCV *"
                        type="password"
                        required
                        value={form.ccv}
                        placeholder="xxx"
                        onChange={(e) => handleChange("ccv", e.target.value)}
                        maxLength={3}
                      />
                    </div>
                  </div>
                  <hr className="mt-6" />
                  <div className="flex flex-row items-center gap-6">
                    <div className="w-1/2">
                      <InputField
                        label="Promotion Code"
                        type="text"
                        required
                        value={form.promotion}
                        placeholder="กรุณากรอกโค้ดส่วนลด (ถ้ามี)"
                        onChange={(e) =>
                          handleChange("promotion", e.target.value)
                        }
                      />
                    </div>
                    <div className="w-1/2">
                      <ButtonPrimary
                        className="mt-6"
                        onClick={() => submitDiscountCode()}
                        type="button"
                      >
                        ใช้โค้ด
                      </ButtonPrimary>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/*กล่องขวา (Order Summary) */}
            <div>
              <OrderSummary
                items={orderItems}
                total={totalPrice}
                date={dateOrder}
                time={timeOrder}
                address={addressOrder}
                promotion={promotion}
              />
            </div>
          </div>
        </form>
        <FooterAction
          backTitle="< ย้อนกลับ"
          forwardTitle="ยืนยันการชำระเงิน >"
          onForwardClick={handlePayment}
        />
      </div>
    </div>
  );
}
