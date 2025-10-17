import React from "react";
import Image from "next/image";

const HeroSection: React.FC = () => (
  <div className="relative h-[240px] md:h-[350px] overflow-hidden">
    <div className="absolute inset-0">
      <Image
        src="/images/service_bg_banner.jpg"
        alt="บริการของเรา"
        className="w-full h-full object-cover filter blur-xs"
        width={144}
        height={240}
        style={{ width: "auto", height: "auto" }}
      />
    </div>
    
    <div className="absolute inset-0 bg-blue-900" style={{ backgroundColor: 'rgba(0, 0, 128, 0.4)' }}></div>
    
    <div className="relative z-10 h-full flex items-center justify-center">
      <div className="text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          บริการของเรา
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl font-medium leading-relaxed opacity-90">
          ซ่อมเครื่องใช้ไฟฟ้า ซ่อมแอร์ ทำความสะอาดบ้าน และอื่น ๆ อีกมากมาย<br />
          โดยพนักงานแม่บ้าน และช่างมืออาชีพ
        </p>
      </div>
    </div>
  </div>
);

export default HeroSection;
