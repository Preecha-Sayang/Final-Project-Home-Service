import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/router";
import Payment from "@/components/payments/Payment";
import InputField from "@/components/input/inputField/input_state";
import ButtonPrimary from "@/components/button/buttonprimary";
import { usePaymentStore } from "@/stores/paymentMethodStore";
import { useBookingStore } from "@/stores/bookingStore";
import { useAuth } from "@/context/AuthContext";
import { PromotionUse } from "@/types/promotion";
import { usePromotionStore } from "@/stores/promotionStore";

interface PaymentFormProps {
  totalPrice: number;
  onPaymentSuccess?: (bookingId: number, chargeId: string) => void;
  onPaymentError?: (error: string) => void;
}

interface PromotionResponse {
  ok: boolean;
  message: string;
  promotion?: PromotionUse;
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

const PaymentForm = forwardRef<PaymentFormRef, PaymentFormProps>(
  ({ totalPrice, onPaymentSuccess, onPaymentError }, ref) => {
    const router = useRouter();

    // ดึงข้อมูลจาก booking store
    const { getActiveCartItems, getFinalAmount, customerInfo, paymentInfo } =
      useBookingStore();

    // ดึงข้อมูล user จาก auth context
    const { accessToken } = useAuth();

    // ฟังก์ชันดึง user_id จาก JWT token
    const getUserIdFromToken = () => {
      if (!accessToken) return 1; // default user_id
      try {
        // Decode JWT token (base64)
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        return payload.userId || payload.user_id || payload.id || 1;
      } catch (error) {
        console.error("Error decoding JWT token:", error);
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
    const {
      discount,
      promotionId,
      promotionCode,
      discountType,
      discountValue,
      setPromotion,
      clearPromotion,
    } = usePromotionStore();

    const handleChange = (name: string, value: string) => {
      setForm({ ...form, [name]: value });
    };

    // ฟังก์ชัน auto เว้นวรรคเลขบัตรเครดิต
    const formatCreditCardNumber = (value: string) => {
      return value
        .replace(/\D/g, "") // ลบตัวอักษรที่ไม่ใช่ตัวเลข
        .replace(/(.{4})/g, "$1 ") // เว้นวรรคทุก 4 ตัว
        .trim(); // ลบช่องว่างส่วนเกิน
    };

    // ฟังก์ชัน auto เพิ่ม "/" ในวันหมดอายุ (MM/YY)
    const formatExpiryDate = (value: string) => {
      const cleaned = value.replace(/\D/g, ""); // เอาเฉพาะตัวเลข
      if (cleaned.length === 0) return "";
      if (cleaned.length <= 2) return cleaned;
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
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

          // บันทึกข้อมูลการจองลง database
          let chargeId = "";
          try {
            const cartItems = getActiveCartItems();
            const finalAmount = getFinalAmount();

            // ตรวจสอบว่ามีข้อมูลหรือไม่
            if (!cartItems || cartItems.length === 0) {
              alert("ไม่พบรายการบริการ กรุณาเลือกบริการใหม่");
              setProcessing(false);
              return;
            }

            // 🗺️ ตรวจสอบพิกัด
            if (!customerInfo.latitude || !customerInfo.longitude) {
              alert("กรุณาระบุตำแหน่งบนแผนที่ก่อนชำระเงิน");
              setProcessing(false);
              return;
            }

            const bookingData = {
              user_id: getUserIdFromToken(),
              items: cartItems.map((item) => ({
                id: item.id,
                title: item.title,
                price: item.price,
                quantity: item.quantity,
                unit: item.unit,
              })),
              total_price: amountBaht,
              discount: discount || 0,
              service_date: customerInfo.serviceDate
                ?.toISOString()
                .split("T")[0],
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
              promotion_id: promotionId,
              charge_id: null,
              // 🗺️ ส่งพิกัดไปด้วย
              latitude: customerInfo.latitude,
              longitude: customerInfo.longitude,
            };

            console.log('[PaymentForm] Booking data with location:', {
              latitude: customerInfo.latitude,
              longitude: customerInfo.longitude,
            });

            const bookingRes = await fetch("/api/bookings/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(bookingData),
            });

            const bookingResult = await bookingRes.json();

            // 🔧 แก้ไข: ตรวจสอบ success ก่อน
            if (!bookingResult.success) {
              clearPromotion();
              const errorMsg =
                "การบันทึกข้อมูลล้มเหลว: " + (bookingResult.error || bookingResult.message || "ไม่ทราบสาเหตุ");
              console.error("[PaymentForm] Booking creation failed:", bookingResult);
              alert(errorMsg);
              if (onPaymentError) onPaymentError(errorMsg);
              setProcessing(false);
              return;
            }

            // เรียก API ที่เราสร้างจาก (Omise) โดยส่ง tokenId ไม่ใช่เลขบัตร
            const res = await fetch("/api/payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: discount > 0 ? amountBaht - discount : amountBaht,
                method: "credit_card",
                tokenId: tokenRes.id,
                booking_id: bookingResult.booking_id,
              }),
            });

            const result = await res.json();
            chargeId = result.chargeId || result.charge_id || "";

            if (result.status === "success") {
              // บันทึกการใช้ promotion code ลง database
              if (promotionId && promotionCode) {
                try {
                  const usageRes = await fetch("/api/promotionsusage", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      promotion_id: promotionId,
                      booking_id: bookingResult.booking_id,
                    }),
                  });

                  if (!usageRes.ok) {
                    console.error("Failed to save promotion usage");
                  }
                } catch (usageError) {
                  console.error("Error saving promotion usage:", usageError);
                }
              }

              // ล้างข้อมูล promotion
              clearPromotion();
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
              // ชำระเงินไม่สำเร็จ
              clearPromotion();
              const errorMsg =
                "การชำระเงินล้มเหลว: " + (result.message || "ไม่ทราบสาเหตุ");
              alert(errorMsg);
              if (onPaymentError) onPaymentError(errorMsg);
            }
          } catch (bookingError) {
            clearPromotion();
            console.error("Booking creation error:", bookingError);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + (bookingError instanceof Error ? bookingError.message : ""));
            if (onPaymentError) onPaymentError("Booking error");
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
            alert(
              "กรุณาสแกน QR Code เพื่อชำระเงิน\nระบบจะตรวจสอบสถานะการชำระเงินอัตโนมัติ"
            );
          } else {
            const errorMsg =
              "สร้าง PromptPay QR ไม่สำเร็จ: " + (result.message || "");
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

    const submitDiscountCode = async (): Promise<void> => {
      try {
        if (!form.promotion) {
          alert("กรุณากรอกรหัสส่วนลด");
          clearPromotion();
          return;
        }

        const res = await fetch(`/api/promotionsusage/${form.promotion}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data: PromotionResponse = await res.json();

        if (data.ok && data.promotion) {
          alert(data.message);

          let calculatedDiscount = 0;
          if (data.promotion.discount_type === "fixed") {
            calculatedDiscount = Number(data.promotion.discount_value);
          } else if (data.promotion.discount_type === "percent") {
            calculatedDiscount =
              (totalPrice * Number(data.promotion.discount_value)) / 100;
          }

          // บันทึกข้อมูล promotion แบบเต็มรูปแบบ
          setPromotion({
            promotionId: data.promotion.promotion_id,
            promotionCode: form.promotion,
            discountType: data.promotion.discount_type,
            discountValue: Number(data.promotion.discount_value),
            discount: calculatedDiscount,
          });
        } else {
          alert(data.message || "ไม่สามารถใช้โค้ดส่วนลดได้");
          clearPromotion();
        }
      } catch (error) {
        clearPromotion();
        console.error("Error:", error);
        alert("เกิดข้อผิดพลาดในการตรวจสอบรหัสส่วนลด");
      }
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
                    handleChange(
                      "credit_card_number",
                      formatCreditCardNumber(e.target.value)
                    )
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
                        handleChange(
                          "expired_date",
                          formatExpiryDate(e.target.value)
                        )
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
                <span>QR Code are coming.</span>
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
                  disabled={!!promotionCode}
                />
              </div>
              <div className="w-1/2">
                {promotionCode ? (
                  <ButtonPrimary
                    className="mt-6 bg-red-500 hover:bg-red-600"
                    onClick={() => {
                      clearPromotion();
                      setForm({ ...form, promotion: "" });
                    }}
                    type="button"
                  >
                    ยกเลิกโค้ด
                  </ButtonPrimary>
                ) : (
                  <ButtonPrimary
                    className="mt-6"
                    onClick={() => submitDiscountCode()}
                    type="button"
                  >
                    ใช้โค้ด
                  </ButtonPrimary>
                )}
              </div>
            </div>

            {/* แสดงข้อมูลโค้ดที่ใช้ */}
            {promotionCode && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ ใช้โค้ด <strong>{promotionCode}</strong> สำเร็จ
                  <br />
                  ส่วนลด:{" "}
                  {discountType === "fixed"
                    ? `${discount.toFixed(2)} ฿`
                    : `${discountValue}% (${discount.toFixed(2)} ฿)`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

PaymentForm.displayName = "PaymentForm";

export default PaymentForm;