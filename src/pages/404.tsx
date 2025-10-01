import Link from "next/link";
import { Prompt } from "next/font/google";
const fontPrompt = Prompt({
  //Set Font เพื่อใช้ทั้งระบบ ไม่ต้องลบส่วนนี้//
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
export default function Custom404() {
  return (
   <div className={fontPrompt.className} style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>404 - ไม่พบหน้าที่คุณต้องการ</h1>
      <p>ขออภัย ไม่พบหน้าที่คุณค้นหา</p>
      <Link href="/">
        <button style={{
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          padding: "12px 24px",
          marginTop: "20px",
          fontSize: "16px",
          borderRadius: "6px",
          cursor: "pointer",
        }}>
          กลับหน้าหลัก
        </button>
      </Link>
    </div>
  );
}