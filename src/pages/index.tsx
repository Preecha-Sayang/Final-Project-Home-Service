import { Footer } from "@/components/footer";
import ButtonPrimary from "@/components/button/buttonprimary";
import Navbar from "@/components/navbar/navbar";
import PopularServices from "@/components/PopularServices";
import Link from "next/link";
import Image from "next/image";


export default function Home() {
    return (
          <div className="min-h-screen bg-white">
                <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-50 to-blue-100 h-auto md:h-[540px] pt-8 md:pt-12">
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between h-full relative">
            {/* ข้อความ */}
                    <div className="flex-1 md:text-left mb-8 md:mb-0">
                    <div className="text-4xl md:text-6xl font-bold text-blue-700 mb-8 font-prompt">
                            เรื่องบ้าน...ให้เราช่วยดูแลคุณ
                    </div>
                        <p className="text-2xl md:text-4xl font-bold text-gray-950 mb-12 font-prompt">
                            สะดวก ราคาคุ้มค่า เชื่อถือได้
                        </p>
                        <p className="text-2xl md:text-2xl text-gray-500 mb-12 font-prompt">
                            ซ่อมเครื่องใช้ไฟฟ้า ซ่อมแอร์ ทำความสะอาดบ้าน<br />
                            โดยพนักงานแม่บ้าน และช่างมืออาชีพ
                        </p>
                        <Link href="/services">
                        <ButtonPrimary>เช็คราคาบริการ</ButtonPrimary>
                        </Link>
                    </div>

                {/* รูป */}
                    <div className="flex justify-end items-end w-auto ">
                        <Image
                        src="/images/technicain.png"
                        alt="Professional Technician"
                        className="w-[100%] max-w-[420px] md:max-w-[520px] h-auto object-contain"
                        />
                    </div>
                </div>
            </section>

            {/* Our Services Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 font-prompt">
                        บริการยอดฮิตของเรา
                    </h2>
                    <PopularServices />
                </div>
                <div className="flex justify-center mt-12">
                    <Link href="/services">
                        <ButtonPrimary>ดูบริการทั้งหมด</ButtonPrimary>
                    </Link>
                </div>
            </section>

            {/* Contact Section */}
              <section className="bg-blue-600 relative ">
                <div className="flex flex-col md:flex-row items-center justify-between text-white w-full">
    
                  {/* รูปซ้าย (ชิดซ้ายสุด) */}
                  <div className="relative w-full md:w-auto">
                    <Image
                    src="/images/มาร่วมเป็นพนักงานซ่อม.svg"
                    alt="Join Our Team"
                    className="w-full h-[280px] md:h-[372px] object-cover"
                    />
                  </div>
                  
                  {/* ข้อความ */}
                  <div className="flex-1 md:ml-40 md:text-left mb-40 md:mb-0 mt-10 md:mt-0">
                    <h2 className="text-2xl md:text-4xl font-bold mb-6 font-prompt ">
                      มาร่วมเป็นพนักงานซ่อม<br />
                      กับ HomeServices
                    </h2>
                    <p className="text-lg md:text-xl mb-6 font-prompt">
                      เข้ารับการฝึกอบรมที่ได้มาตรฐาน ฟรี!<br />
                      และยังได้รับค่าตอบแทนที่มากขึ้นกว่าเดิม
                    </p>
                    <p className="text-xl md:text-3xl font-semibold font-prompt">
                      ติดต่อสมัครได้ที่: <br className="md:hidden" />
                      job@homeservices.co
                    </p>
                  </div>
                </div>

                {/* ไอคอนบ้าน */}
                  <Image
                    src="/images/house 1.svg"
                    alt="House Icon"
                    className="absolute bottom-0 right-0 h-[280px] md:h-[360px] object-contain opacity-40 md:opacity-100"
                  />
              </section>

                {/* Footer */}
                  <Footer />
          </div>
    );
}

