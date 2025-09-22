import { Footer } from "@/components/footer";
import ServiceCard from "@/components/Cards/ServiceCard";
import ButtonPrimary from "@/components/button/buttonprimary";
import Navbar from "@/components/navbar/navbar";
import Link from "next/link";

export default function Home() {
  const services = [
    {
      imgSrc: "/images/ทำความสะอาดทั่วไป.svg",
      category: "บริการทั่วไป",
      title: "ทำความสะอาดทั่วไป",
      price: "ค่าบริการประมาณ 500.00 - 1,000.00 ฿",
    },
    {
      imgSrc: "/images/ล้างแอร์.svg", 
      category: "บริการทั่วไป",
      title: "ล้างแอร์",
      price: "ค่าบริการประมาณ 500.00 - 1,000.00 ฿",
    },
    {
      imgSrc: "/images/ซ่อมเครื่องซักผ้า.svg",
      category: "บริการทั่วไป", 
      title: "ซ่อมเครื่องซักผ้า",
      price: "ค่าบริการประมาณ 500.00 ฿",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />
      

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 h-[540px]">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-full">
          <div className="flex-1">
            <div className="text-6xl font-bold text-blue-700 mb-8 font-prompt">
              เรื่องบ้าน...ให้เราช่วยดูแลคุณ
            </div>
            <p className="text-4xl font-bold text-gray-950 mb-10 font-prompt">
              "สะดวก ราคาคุ้มค่า เชื่อถือได้"
            </p>
            <p className="text-2xl text-gray-500 mb-12 font-prompt">
              ซ่อมเครื่องใช้ไฟฟ้า ซ่อมแซม ทำความสะอาดบ้าน<br />
              โดยพนักงานแม่บ้าน และช่างมืออาชีพ
            </p>
            <Link href="/services">
              <ButtonPrimary>เช็คราคาบริการ</ButtonPrimary>
            </Link>
          </div>
          <div className=" flex justify-end">
            <img 
              src="/images/technichain.svg" 
              alt="Professional Technician" 
              className="w-[520px] h-[720px] object-contain absolute top-[30px] left-[810px]"
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                imgSrc={service.imgSrc}
                category={service.category}
                title={service.title}
                price={service.price}
                onAction={() => {
                  // Navigate to service detail
                  console.log(`Selected service: ${service.title}`);
                }}
              />
            ))}
          </div>

          <div className="flex justify-center">
            <Link href="/services">
              <ButtonPrimary>ดูบริการทั้งหมด</ButtonPrimary>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-blue-600 relative">
        <div className="max-w-7xl flex items-center justify-between text-white">
          <div className="flex-1">
            <img 
              src="/images/มาร่วมเป็นพนักงานซ่อม.svg" 
              alt="Join Our Team" 
              className="absolute left-[0px] top-[0px] h-[372px]"
            />
          </div>
          <div className="flex-1 margin-left-[100px]">
            <h2 className="text-4xl font-bold mb-10 font-prompt">
              มาร่วมเป็นพนักงานงานช่อม<br />
              กับ HomeServices
            </h2>
            <p className="text-xl mb-8 font-prompt">
            เข้ารับการฝึกอบรมที่ได้มาตรฐาน ฟรี!<br />
            และยังได้รับค่าตอบแทนที่มากขึ้นกว่าเดิม<br />
            </p>
            <p className="text-3xl font-semibold font-prompt">
              ติดต่อสมัครได้ที่: job@homeservices.co
            </p>
          </div>
        </div>
        {/* House icon positioned at the right edge */}
        <img 
          src="/images/house 1.svg" 
          alt="House Icon" 
          className="absolute bottom-[0px] right-[0px] h-[360px] object-contain"
        />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}