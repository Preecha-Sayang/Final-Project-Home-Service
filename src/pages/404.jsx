import Link from "next/link";

export default function Custom404() {
  return (
    <div style={{
      textAlign: "center",
      marginTop: "100px",
      fontFamily: "Arial, sans-serif",
    }}>
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