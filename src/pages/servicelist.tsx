import * as React from "react";
import ServiceCard from "../components/Cards/ServiceCard";
import { FiltersBar, type FiltersState, type Option } from "@/components/filters";
import { useServices, type Service } from "../hooks/useServices";
import { usePriceRange } from "../hooks/usePriceRange";
import { useCategories } from "../hooks/useCategories";
import { createDefaultFilters } from "../constants/filters";
import Navbar from "../components/navbar/navbar";
import Head from "next/head";
import Image from "next/image";

// Function to filter services based on filter state - ปรับปรุงให้เหมือน service-filters
function filterServices(services: Service[], filters: FiltersState): Service[] {
  let filtered = services.filter((service) => {
    // Search by service name
    const matchesSearch = !filters.q || 
      service.servicename.toLowerCase().includes(filters.q.toLowerCase());
    
    // Filter by category
    const matchesCategory = !filters.category || 
      service.category === filters.category;
    
    // Filter by price range - แก้ไขให้ถูกต้อง
    const matchesPrice = service.min_price <= filters.price.max && 
      service.max_price >= filters.price.min;
    
    return matchesSearch && matchesCategory && matchesPrice;
  });
  
  // Sort services
  filtered.sort((a, b) => {
    if (filters.sort === "asc") {
      return a.servicename.localeCompare(b.servicename);
    } else {
      return b.servicename.localeCompare(a.servicename);
    }
  });
  
  return filtered;
}

export default function ServiceListPage() {
  // Hook ดึงข้อมูล service ทั้งหมด
  const { services: servicesAll, loading, error } = useServices();
  
  // Hook ดึง price range จากฐานข้อมูล
  const { priceRange, loading: priceLoading } = usePriceRange();
  
  // Hook ดึง categories จาก API
  const { categories: categoriesData, loading: categoriesLoading, error: categoriesError } = useCategories();
  
  // State management เหมือน service-filters
  const [items, setItems] = React.useState<Service[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isFiltering, setIsFiltering] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("");
  
  // สร้าง default filters จาก price range
  const defaultFilters = React.useMemo(() => 
    createDefaultFilters(priceRange), 
    [priceRange]
  );
  
  // Get categories for filter dropdown - จาก API
  const categories: Option[] = React.useMemo(() => {
    return categoriesData.map(category => ({
      label: category.name,
      value: category.name
    }));
  }, [categoriesData]);
  
  // Handle filter application - เหมือน service-filters
  const handleApplyFilters = async (filters: FiltersState) => {
    setIsFiltering(true);
    
    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const filtered = filterServices(servicesAll, filters);
    setItems(filtered);
    setTotal(filtered.length);
    setIsFiltering(false);
  };

  // Handle category selection from ServiceCard
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    
    // Apply filter immediately with the selected category
    const newFilters = {
      ...defaultFilters,
      category: category,
    };
    handleApplyFilters(newFilters);
  };
  
  // Initialize with all services when data loads
  React.useEffect(() => {
    if (servicesAll.length > 0 && !priceLoading && !categoriesLoading) {
      handleApplyFilters(defaultFilters);
    }
  }, [servicesAll, priceLoading, categoriesLoading, defaultFilters]);
  
  // Loading state
  if (loading || priceLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>รายการบริการ - Home Service</title>
          <meta name="description" content="ค้นหาและกรองบริการตามต้องการ" />
        </Head>
        
        <Navbar token="user" fullname="ผู้ใช้" />
        
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลบริการ...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || categoriesError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>รายการบริการ - Home Service</title>
          <meta name="description" content="ค้นหาและกรองบริการตามต้องการ" />
        </Head>
        
        <Navbar token="user" fullname="ผู้ใช้" />
        
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-800 mb-2">เกิดข้อผิดพลาด</h2>
              <p className="text-red-600">{error || categoriesError}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>รายการบริการ - Home Service</title>
        <meta name="description" content="ค้นหาและกรองบริการตามต้องการ" />
      </Head>

      {/* Navbar */}
      <Navbar token="user" fullname="ผู้ใช้" />

      {/* Hero Section */}
      <div className="relative h-[240px] md:h-[350px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/service_bg_banner.jpg"
            alt="บริการของเรา"
            className="w-full h-full object-cover filter blur-xs"
            width={144}
            height={240}
          />
        </div>
        
        {/* Dark Blue Overlay */}
        <div className="absolute inset-0 bg-blue-900" style={{ backgroundColor: 'rgba(0, 0, 128, 0.4)' }}></div>
        
        {/* Content */}
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


{/* Main Content */}
<div className="container mx-auto px-4 py-8">

  {/* Filters Bar */}
  <div className="flex justify-center mb-6">
    <FiltersBar
      categories={categories}
      onApply={handleApplyFilters}
      defaultFilters={defaultFilters}
      selectedCategory={selectedCategory}
    />
  </div>

  

  {/* Results - Service Cards */}
  {isFiltering ? (
    <div className="py-10 text-center text-gray-600">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="mt-2">กำลังกรองข้อมูล...</p>
    </div>
  ) : (
    <>
      <div className="md:ml-35 mb-6 text-sm text-gray-600">
        <span>แสดงผล {total} รายการ</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">ไม่พบบริการ</h2>
            <p className="text-gray-500">กรุณาปรับเปลี่ยนเงื่อนไขการค้นหา</p>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((service) => (
              <ServiceCard
                key={service.service_id}
                imgSrc={service.image_url}
                category={service.category}
                title={service.servicename}
                price={service.price}
                serviceId={service.service_id}
                description={service.description}
                onCategoryClick={handleCategorySelect}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )}
</div>



      {/* Footer spacing */}
      <div className="h-16"></div>
    </div>
  );
}
