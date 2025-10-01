import React, { useState, useEffect, useMemo, useCallback } from "react";
import Head from "next/head";
import Image from 'next/image';

// Components
import LoadingState from "../../components/common/LoadingState";
import ErrorState from "../../components/common/ErrorState";
import HeroSection from "../../components/common/HeroSection";
import { Footer } from "../../components/footer";
import Navbar from "../../components/navbar/navbar";
import ServiceCard from "../../components/Cards/ServiceCard";
import { FiltersBar } from "@/components/filters";

// Hooks
import { useServices } from "../../hooks/useServices";
import { usePriceRange } from "../../hooks/usePriceRange";
import { useCategories } from "../../hooks/useCategories";

// Types & Utils
import { FiltersState } from "@/components/filters";
import { createDefaultFilters } from "../../constants/filters";

// ============================================================================
// PAGE METADATA
// ============================================================================
const PAGE_CONFIG = {
  title: 'รายการบริการ - Home Service',
  description: 'ค้นหาและกรองบริการตามต้องการ',
  loadingMessage: 'กำลังโหลดข้อมูลบริการ...',
  filteringMessage: 'กำลังกรองข้อมูล...',
  emptyState: {
    title: 'ไม่พบบริการ',
    description: 'กรุณาปรับเปลี่ยนเงื่อนไขการค้นหา'
  }
};

// ============================================================================
// TYPES
// ============================================================================
interface ServiceWithCategoryAndPrice {
  service_id: number;
  servicename: string;
  category: string;
  image_url: string;
  price: string;
  description: string;
  min_price: number;
  max_price: number;
  categoryColors?: {
    bg?: string | null;
    text?: string | null;
    ring?: string | null;
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const applyServiceFilters = (services: ServiceWithCategoryAndPrice[], filters: FiltersState) => {
  const matchesSearch = (service: ServiceWithCategoryAndPrice) => 
    !filters.q || service.servicename.toLowerCase().includes(filters.q.toLowerCase());
  
  const matchesCategory = (service: ServiceWithCategoryAndPrice) => 
    !filters.category || service.category === filters.category;
  
  const matchesPriceRange = (service: ServiceWithCategoryAndPrice) => 
    service.min_price <= filters.price.max && service.max_price >= filters.price.min;
  
  const filtered = services.filter(service => 
    matchesSearch(service) && matchesCategory(service) && matchesPriceRange(service)
  );
  
  const sortOrder = filters.sort === "asc" ? 1 : -1;
  return filtered.sort((a, b) => 
    sortOrder * a.servicename.localeCompare(b.servicename)
  );
};

// ============================================================================
// COMPONENT SECTIONS
// ============================================================================
const FilteringSpinner = () => (
  <div className="py-10 text-center text-gray-600">
    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <p className="mt-2">{PAGE_CONFIG.filteringMessage}</p>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12">
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">{PAGE_CONFIG.emptyState.title}</h2>
      <p className="text-gray-500">{PAGE_CONFIG.emptyState.description}</p>
    </div>
  </div>
);

const ServiceGrid = ({ services, onCategorySelection }: { services: ServiceWithCategoryAndPrice[], onCategorySelection: (category: string) => void }) => (
  <div className="flex justify-center">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard
          key={service.service_id}
          imgSrc={service.image_url}
          category={service.category}
          title={service.servicename}
          price={service.price}
          serviceId={service.service_id}
          categoryColors={service.categoryColors}
          // description={service.description}
          onCategoryClick={onCategorySelection}
        />
      ))}
    </div>
  </div>
);

const PageLayout = ({ children, isLoading, hasError, errorMessage }: {
  children: React.ReactNode;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
}) => {

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>{PAGE_CONFIG.title}</title>
          <meta name="description" content={PAGE_CONFIG.description} />
        </Head>
        
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          <LoadingState message={PAGE_CONFIG.loadingMessage} />
        </div>
      </div>
    );
  }
  
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>{PAGE_CONFIG.title}</title>
          <meta name="description" content={PAGE_CONFIG.description} />
        </Head>
        
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          <ErrorState message={errorMessage} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{PAGE_CONFIG.title}</title>
        <meta name="description" content={PAGE_CONFIG.description} />
      </Head>

      <Navbar />
      {children}
      <Footer />
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ServiceListPage() {
  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  const { services: allServices, loading: servicesLoading, error: servicesError } = useServices();
  const { priceRange, loading: priceRangeLoading } = usePriceRange();
  const { categories: availableCategories, loading: categoriesLoading, error: categoriesError } = useCategories();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [filteredServices, setFilteredServices] = useState<ServiceWithCategoryAndPrice[]>(allServices);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  const defaultFilters = useMemo(() => 
    createDefaultFilters(priceRange), 
    [priceRange]
  );

  const categoryOptions = useMemo(() => 
    availableCategories.map(category => ({
      label: category.name,
      value: category.name
    })), 
    [availableCategories]
  );

  const totalServices = filteredServices.length;
  const isLoading = servicesLoading || priceRangeLoading || categoriesLoading;
  const hasError = Boolean(servicesError || categoriesError);
  const errorMessage = servicesError || categoriesError || "";

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  const applyFilters = useCallback(async (filters: FiltersState) => {
    setIsApplyingFilters(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate loading
    
    const filtered = applyServiceFilters(allServices, filters);
    setFilteredServices(filtered);
    setIsApplyingFilters(false);
  }, [allServices]);

  const handleCategorySelection = useCallback((category: string) => {
    setSelectedCategory(category);
    const filtersWithCategory = {
      ...defaultFilters,
      category,
    };
    applyFilters(filtersWithCategory);
  }, [defaultFilters, applyFilters]);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  useEffect(() => {
    if (allServices.length > 0 && !isLoading) {
      applyFilters(defaultFilters);
    }
  }, [allServices, isLoading, defaultFilters, applyFilters]);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <PageLayout isLoading={isLoading} hasError={hasError} errorMessage={errorMessage}>
      <HeroSection />

      <FiltersBar
        categories={categoryOptions}
        onApply={applyFilters}
        defaultFilters={defaultFilters}
        selectedCategory={selectedCategory}
      />

      <div className="w-full bg-white">

        {isApplyingFilters ? (
          <FilteringSpinner />
        ) : (
          <>
            <div className="ml-[18%] py-4 text-sm text-gray-600">
              <span>แสดงผล {totalServices} รายการ</span>
            </div>

            {filteredServices.length === 0 ? (
              <EmptyState />
            ) : (
              <ServiceGrid 
                services={filteredServices} 
                onCategorySelection={handleCategorySelection} 
              />
            )}
          </>
        )}
      </div>

      {/* Spacing between content and about section */}
      <div className="py-8"></div>

      {/* About Section */}
      <section className="py-16 bg-blue-600 relative">
  {/* Image ชิดขอบ section */}
  <Image
  src="/images/house 1.svg"
  alt="House Icon"
  className="absolute bottom-0 right-0 h-[280px] object-contain"
  width={280}
  height={280}
/>


  <div className="max-w-7xl mx-auto px-4">
    <div className="flex items-center justify-center text-white">
      <div className="text-center max-w-4xl">
        <p className="text-xl leading-relaxed">
          เพราะเราคือช่าง ผู้ให้บริการเรื่องบ้านอันดับ 1 แบบครบวงจร โดยทีมช่างมืออาชีพมากกว่า 100 ทีม<br />
          สามารถตอบโจทย์ด้านการบริการเรื่องบ้านของคุณ และสร้าง<br />
          ความสะดวกสบายในการติดต่อกับทีมช่าง ได้ทุกที่ ทุกเวลา ตลอด 24 ชม.<br />
          มั่นใจ ช่างไม่ทิ้งงาน พร้อมรับประกันคุณภาพงาน
        </p>
      </div>
    </div>
  </div>
</section>

    </PageLayout>
  );
}