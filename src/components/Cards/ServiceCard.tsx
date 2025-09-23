import ButtonGhost from "../button/buttonghost";
import Image from 'next/image';
import { useRouter } from 'next/router';

interface ServiceCardProps {
  imgSrc: string;
  category: string;
  title: string;
  price: string;
  serviceId?: number;
  description?: string;
}

function ServiceCard({ imgSrc, category, title, price, serviceId, description }: ServiceCardProps) {
  const router = useRouter();

  const handleAction = () => {
    if (serviceId) {
      router.push(`/services/${serviceId}`);
    }
  };

  const handleMoreInfo = () => {
    if (description) {
      alert(description);
    }
  };
  return (
    <div className="w-full max-w-[349px] md:w-[349px] rounded-lg overflow-hidden bg-white border border-gray-300 transition-all duration-300 hover:shadow-[2px_2px_24px_0px_rgba(23,51,106,0.5)]">
      {/* Image placeholder - 60% of card height */}
      <div className="h-48 md:h-[240px] w-full bg-blue-100 flex items-center justify-center rounded-t-lg">
        <Image
          src={imgSrc}
          alt={`${title} image`}
          width={349}
          height={400}
          className="h-full w-full object-cover"
        />
      </div>


      {/* Content area - 40% of card height */}
      <div className="p-4 flex flex-col justify-between gap-3">
        <div className="flex flex-col gap-2">
         
          {/* Category Tag */}
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-md w-fit">
            {category}
          </span>


          {/* Title */}
          <h3 className="font-bold text-lg text-gray-950 leading-tight">{title}</h3>


          {/* Price */}
          <div className="flex items-center gap-2 text-gray-500">
          <Image src="/images/icon_tag.svg" alt="PriceTag" width={20} height={20} />
            <span className="text-sm">{price}</span>
          </div>
        </div>


        {/* button */}
        <div className="flex justify-between mt-2 gap-2">
          {/* <ButtonGhost onClick={handleMoreInfo}>
            รายละเอียดเพิ่มเติม
          </ButtonGhost> */}
         
          <ButtonGhost onClick={handleAction}>
            เลือกบริการ
          </ButtonGhost>
</div>
      </div>
    </div>
  );
}


export default ServiceCard;

/* ----------------------------------------------------
  📘 วิธีใช้งาน ServiceCard (ตัวอย่างสั้น ๆ)

  1) Import component
     import ServiceCard from "../components/Cards/ServiceCard";

  2) ดึงข้อมูลจาก API ด้วย useServices hook
     const { services, loading, error } = useServices();

  3) Render โดยใช้ .map (ไม่ต้องส่ง callback functions)
     {services.map(service => (
        <ServiceCard
          key={service.service_id}
          imgSrc={service.image_url}
          category={service.category}
          title={service.servicename}
          price={service.price}
          serviceId={service.service_id}
          description={service.description}
        />
     ))}

  ✅ Best Practice:
  - ServiceCard จัดการ navigation เอง
  - ไม่ต้องส่ง onAction/onMoreInfo callbacks
  - ใช้ serviceId และ description เป็น props
---------------------------------------------------- */