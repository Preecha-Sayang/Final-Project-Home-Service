import * as React from "react";
import ServiceCard from "../components/Cards/ServiceCard";
import { FiltersBar, type FiltersState, type Option } from "@/components/filters";
import { useServices } from "../hooks/useServices";
import Navbar from "../components/navbar/navbar";
import Image from "next/image";

export default function ServiceFiltersPage() {

  // Hook ดึงข้อมูล service ทั้งหมด
  const { services: servicesAll, loading, error } = useServices();

  // State สำหรับ filter
  const [filters, setFilters] = React.useState<FiltersState>({
    q: "",
    category: "",
    price: { min: 0, max: 100000 },
    sort: "asc",
    page: 1,
    pageSize: 12,
  });

  // Categories สำหรับ filter
  const categories: Option[] = [
    { label: "บริการทั่วไป", value: "ทั่วไป" },
    { label: "บริการหลังคา", value: "หลังคา" },
    { label: "บริการห้องน้ำ", value: "ห้องน้ำ" },
  ];

  // Filter และ sort ข้อมูล
  const servicesFiltered = React.useMemo(() => {
    if (!servicesAll) return [];

    return servicesAll
      .filter((s) => {
        const matchQ = !filters.q || s.servicename.toLowerCase().includes(filters.q.toLowerCase());
        const matchCat = !filters.category || s.category === filters.category;
        const priceNum = Number(s.price.replace(/[^\d]/g, "")); // แปลง string ราคาเป็น number
        const matchPrice = s.min_price <= filters.price.max && s.max_price >= filters.price.min;

        return matchQ && matchCat && matchPrice;
      })
      .sort((a, b) => (filters.sort === "asc" ? a.servicename.localeCompare(b.servicename) : b.servicename.localeCompare(a.servicename)));
  }, [servicesAll, filters]);

  // Callback สำหรับ FilterBar
  const handleApply = (f: FiltersState) => {
    setFilters(f);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar 
        token="user_token" 
        fullname="สมศรี จันทร์อังคารพุร" 
        imageURL="/images/user_default.png"
      />

      {/* Hero Banner Section */}
      <div className="relative h-96 bg-gray-200 overflow-hidden">
        <Image
          src="/images/service_bg_banner.jpg"
          alt="Service Background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 80, 0.6)' }}
        >
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">บริการของเรา</h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              ซ่อมเครื่องใช้ไฟฟ้า ซ่อมแอร์ ทําความสะอาดบ้าน และอื่น ๆ อีกมากมาย
              โดยพนักงานแม่บ้าน และช่างมืออาชีพ
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="mx-auto max-w-6xl p-6">
          <FiltersBar
            className="mb-6"
            categories={categories}
            onApply={handleApply}
            defaultFilters={filters}
          />
        </div>
      </div>

      {/* Service Cards Section */}
      <div className="mx-auto max-w-6xl p-6">
        {loading ? (
          <div className="py-10 text-center text-[var(--gray-600)]">กำลังโหลด…</div>
        ) : error ? (
          <div className="py-10 text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="mb-6 text-sm text-[var(--gray-600)]">
              ทั้งหมด {servicesFiltered.length} รายการ
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {servicesFiltered.map((s) => (
                <ServiceCard
                  key={s.service_id}
                  imgSrc={s.image_url}
                  category={s.category}
                  title={s.servicename}
                  price={s.price}
                  serviceId={s.service_id}
                  description={s.description}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
