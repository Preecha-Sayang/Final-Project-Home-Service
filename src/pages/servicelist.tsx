import * as React from "react";
import ServiceCard from "../components/Cards/ServiceCard";
import { FiltersBar, type FiltersState, type Option } from "@/components/filters";
import { useServices, type Service } from "../hooks/useServices";
import Navbar from "../components/navbar/navbar";
import Head from "next/head";

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
  
  // State management เหมือน service-filters
  const [items, setItems] = React.useState<Service[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isFiltering, setIsFiltering] = React.useState(false);
  
  // Get unique categories for filter dropdown - Dynamic from API
  const categories: Option[] = React.useMemo(() => {
    const uniqueCategories = [...new Set(servicesAll.map(service => service.category))];
    return uniqueCategories.map(category => ({
      label: category,
      value: category
    }));
  }, [servicesAll]);
  
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
  
  // Initialize with all services when data loads - เหมือน service-filters
  React.useEffect(() => {
    if (servicesAll.length > 0) {
      handleApplyFilters({
        q: "",
        category: "",
        price: { min: 0, max: 5000 },
        sort: "asc",
        page: 1,
        pageSize: 12,
      });
    }
  }, [servicesAll]);
  
  // Loading state
  if (loading) {
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
  if (error) {
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
              <p className="text-red-600">{error}</p>
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
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">รายการบริการ</h1>
            <p className="text-lg text-gray-600 mb-2">
              ค้นหาและกรองบริการตามความต้องการของคุณ
            </p>
            <p className="text-sm text-gray-500">
              พบบริการทั้งหมด {servicesAll.length} รายการ
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters Bar */}
        <FiltersBar
          className="mb-6"
          categories={categories}
          onApply={handleApplyFilters}
          defaultFilters={{
            q: "",
            category: "",
            price: { min: 0, max: 5000 },
            sort: "asc",
            page: 1,
            pageSize: 12,
          }}
        />

        {/* Results - เหมือน service-filters แต่ใช้ ServiceCard */}
        {isFiltering ? (
          <div className="py-10 text-center text-gray-600">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2">กำลังกรองข้อมูล...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-gray-600">
              แสดงผล {total} รายการ
            </div>
            
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">ไม่พบบริการ</h2>
                  <p className="text-gray-500">ลองปรับเปลี่ยนเงื่อนไขการค้นหาดูครับ</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((service) => (
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
