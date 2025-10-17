import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/router";
import Payment from "@/components/payments/Payment";
import InputField from "@/components/input/inputField/input_state";
import ButtonPrimary from "@/components/button/buttonprimary";
import { usePaymentStore } from "@/stores/paymentMethodStore";
import { useBookingStore } from "@/stores/bookingStore";
import { useAuth } from "@/context/AuthContext";

interface PaymentFormProps {
  totalPrice: number;
  onPaymentSuccess?: (bookingId: number, chargeId: string) => void;
  onPaymentError?: (error: string) => void;
}

export interface PaymentFormRef {
  handlePayment: () => Promise<void>;
}

// Omise types
interface OmiseWindow extends Window {
  Omise?: {
    setPublicKey: (key: string) => void;
    createToken: (
      type: string,
      data: {
        name: string;
        number: string;
        expiration_month: number;
        expiration_year: number;
        security_code: string;
      },
      callback: (status: number, response: OmiseTokenResponse) => void
    ) => void;
  };
}

interface OmiseTokenResponse {
  id: string;
  message?: string;
}

const PaymentForm = forwardRef<PaymentFormRef, PaymentFormProps>(({ 
  totalPrice, 
  onPaymentSuccess,
  onPaymentError 
}, ref) => {
  const router = useRouter();
  
  // ดึงข้อมูลจาก booking store
  const {
    getActiveCartItems,
    getFinalAmount,
    customerInfo,
    paymentInfo,
  } = useBookingStore();

  // ดึงข้อมูล user จาก auth context
  const { accessToken } = useAuth();

  // ฟังก์ชันดึง user_id จาก JWT token
  const getUserIdFromToken = () => {
    if (!accessToken) return 1; // default user_id
    
    try {
      // Decode JWT token (base64)
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      return payload.userId || payload.user_id || payload.id || 1;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return 1; // default user_id
    }
  };

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

    const { payment } = usePaymentStore();

    const handleChange = (name: string, value: string) => {
      setForm({ ...form, [name]: value });
    };

    // โหลด Omise.js ฝั่ง client เท่านั้น
    useEffect(() => {
      if (typeof window === "undefined") return;
      if (document.getElementById("omise-js")) return; // กันโหลดซ้ำ

      const s = document.createElement("script");
      s.id = "omise-js";
      s.src = "https://cdn.omise.co/omise.js";
      s.async = true;
      s.onload = () => {
        const omiseWindow = window as OmiseWindow;
        if (omiseWindow.Omise) {
          omiseWindow.Omise.setPublicKey(
            process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY || ""
          );
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

    // ---------- ฟังก์ชันหลัก: ยืนยันการชำระเงิน -----------//
    const handlePayment = async () => {
      try {
        if (processing) return;
        setProcessing(true);

        // ดึงวิธีชำระเงินที่ผู้ใช้เลือกจาก localStorage
        const selectedPayment =
          localStorage.getItem("selectedPayment") || "credit_card";

        const amountBaht = totalPrice && totalPrice > 0 ? totalPrice : 0;

        if (form.credit_card_number === "") {
          alert("กรุณากรอกหมายเลขบัตรเครดิต");
          setProcessing(false);
          return;
        }

        if (form.card_fullname === "") {
          alert("กรุณากรอกชื่อบนบัตรเครดิต");
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

        if (form.ccv === "") {
          alert("กรุณากรอกรหัส CVC / CCV");
          setProcessing(false);
          return;
        }

        if (selectedPayment === "credit_card") {
          const omiseWindow = window as OmiseWindow;
          const Omise = omiseWindow.Omise;
          if (!Omise) {
            alert("โหลดไม่สำเสร็จ กรุณาลองใหม่");
            setProcessing(false);
            return;
          }

          // เตรียมข้อมูลสำหรับ API
          const tokenRes = await new Promise<{ id: string }>(
            (resolve, reject) => {
              Omise.createToken(
                "card",
                {
                  name: form.card_fullname,
                  number: form.credit_card_number.replace(/\s+/g, ""),
                  expiration_month: exp.month,
                  expiration_year: exp.year,
                  security_code: form.ccv,
                },
                (status: number, response: OmiseTokenResponse) => {
                  if (status === 200) resolve({ id: response.id });
                  else
                    reject(
                      new Error(response.message || "Create token failed")
                    );
                }
              );
            }
          );

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
          const chargeId = result.chargeId || result.charge_id || "";
          
          // บันทึกข้อมูลการจองลง database
          try {
            const cartItems = getActiveCartItems();
            const finalAmount = getFinalAmount();
            
            // ตรวจสอบว่ามีข้อมูลหรือไม่
            if (!cartItems || cartItems.length === 0) {
              alert("ไม่พบรายการบริการ กรุณาเลือกบริการใหม่");
              return;
            }
            
            const bookingData = {
              user_id: getUserIdFromToken(),
              items: cartItems.map(item => ({
                id: item.id,
                title: item.title,
                price: item.price,
                quantity: item.quantity,
                unit: item.unit,
              })),
              total_price: finalAmount,
              discount: paymentInfo.discount?.amount || 0,
              service_date: customerInfo.serviceDate?.toISOString().split('T')[0],
              service_time: customerInfo.serviceTime,
              address_data: {
                address: customerInfo.address,
                province: customerInfo.province,
                district: customerInfo.district,
                subdistrict: customerInfo.subDistrict,
                additional_info: customerInfo.additionalInfo,
                latitude: customerInfo.latitude,
                longitude: customerInfo.longitude,
              },
              promotion_id: null,
              charge_id: chargeId,
            };

            const bookingRes = await fetch("/api/bookings/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(bookingData),
            });

            const bookingResult = await bookingRes.json();

            if (bookingResult.success) {
              alert("ชำระเงินสำเร็จ!");
              if (onPaymentSuccess) {
                onPaymentSuccess(bookingResult.booking_id, chargeId);
              } else {
                // Redirect พร้อม bookingId และ chargeId
              router.push(
                `/payment/summary?bookingId=${bookingResult.booking_id}&chargeId=${chargeId}`
              );
              }
            } else {
              // ถ้าบันทึกไม่สำเร็จ แต่ชำระเงินสำเร็จแล้ว
              console.error("Failed to save booking:", bookingResult);
              alert("ชำระเงินสำเร็จ แต่เกิดข้อผิดพลาดในการบันทึกข้อมูล");
              router.push(`/payment/summary?chargeId=${chargeId}`);
            }
          } catch (bookingError) {
            console.error("Booking creation error:", bookingError);
            alert("ชำระเงินสำเร็จ แต่เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            router.push(`/payment/summary?chargeId=${chargeId}`);
          }
        } else if (result.status === "pending" && result.redirect_url) {
          // Handle redirect if needed
        } else {
          const errorMsg = "การชำระเงินล้มเหลว: " + (result.message || "ไม่ทราบสาเหตุ");
          alert(errorMsg);
          if (onPaymentError) onPaymentError(errorMsg);
        }
      } else if (selectedPayment === "qr") {
        const res = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amountBaht, method: "qr" }),
        });

          const result = await res.json();

        if (result.status === "pending" && result.qr_url) {
          // แสดง QR Code และเริ่มตรวจสอบสถานะ
          window.open(result.qr_url, "_blank");
          
          // TODO: Implement polling to check payment status
          // เมื่อชำระเงินสำเร็จ ให้ redirect ไป:
          // router.push(`/payment/summary?chargeId=${result.chargeId}`);
          
          alert("กรุณาสแกน QR Code เพื่อชำระเงิน\nระบบจะตรวจสอบสถานะการชำระเงินอัตโนมัติ");
        } else {
          const errorMsg = "สร้าง PromptPay QR ไม่สำเร็จ: " + (result.message || "");
          alert(errorMsg);
          if (onPaymentError) onPaymentError(errorMsg);
        }
      }
    } catch (error) {
      console.error(error);
      const errorMsg = "เกิดข้อผิดพลาดในการชำระเงิน";
      alert(errorMsg);
      if (onPaymentError) onPaymentError(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

    const submitDiscountCode = () => {
      // TODO: Implement discount code logic
    };

    // Expose handlePayment to parent component via ref
    useImperativeHandle(ref, () => ({
      handlePayment,
    }));

    return (
      <div className="bg-white border border-[var(--gray-border)] rounded-xl w-full">
        <div className="p-8 flex flex-col gap-4">
          <p className="text-2xl font-bold text-[var(--gray-700)]">ชำระเงิน</p>

          {/* แถบเลือกวิธีชำระเงิน */}
          <Payment />
          <div className="mt-4 flex flex-col">
            {payment === "credit_card" ? (
              <div className="flex flex-col gap-8 min-h-[270px]">
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
              </div>
            ) : (
              <div className="flex flex-col gap-8 mb-4 min-h-[270px]">
                <span>QR Code are commimg.</span>
              </div>
            )}

            <hr className="mt-6 mb-4" />
            <div className="flex flex-row items-center gap-6">
              <div className="w-1/2">
                <InputField
                  label="Promotion Code"
                  type="text"
                  required
                  value={form.promotion}
                  placeholder="กรุณากรอกโค้ดส่วนลด (ถ้ามี)"
                  onChange={(e) => handleChange("promotion", e.target.value)}
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
    );
  }
);

PaymentForm.displayName = "PaymentForm";

export default PaymentForm;
