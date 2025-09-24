import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Prompt } from "next/font/google";

const fontPrompt = Prompt({
  //Set Font เพื่อใช้ทั้งระบบ ไม่ต้องลบส่วนนี้//
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: "600",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={fontPrompt.className}>
      <Component {...pageProps} />
    </div>
  );
}
