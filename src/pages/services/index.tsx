import { useCallback } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Service } from '@/types/service.types';

// Components
import Navbar from '@/components/navbar/navbar';
import { Footer } from '@/components/footer';
import HeroSection from '@/components/common/HeroSection';
import ServiceFilters from '../../components/filters/ServiceFliters';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ServiceCard from '../../components/Cards/ServiceCard';

// Hooks & Utils
import { useServiceData } from '@/hooks/useServiceData';
import { SERVICE_PAGE_CONFIG } from '@/constants/service.constants';

// ===== Sub-components =====
const EmptyState = () => (
  <div className="text-center py-12">
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        {SERVICE_PAGE_CONFIG.emptyState.title}
      </h2>
      <p className="text-gray-500">
        {SERVICE_PAGE_CONFIG.emptyState.description}
      </p>
    </div>
  </div>
);

const ServiceGrid = ({ 
  services, 
  onCategoryClick 
}: { 
  services: Service[];
  onCategoryClick: (category: string) => void;
}) => (
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
          onCategoryClick={onCategoryClick}
        />
      ))}
    </div>
  </div>
);

const AboutSection = () => (
  <section className="py-16 bg-blue-600 relative">
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
);

// ===== Main Component =====
export default function ServiceListPage() {
  const {
    filteredServices,
    categories,
    priceRange,
    loading,
    error,
    filters,
    applyFilters,
    totalServices
  } = useServiceData();

  // Handle category selection from service card
  const handleCategorySelection = useCallback((category: string) => {
    applyFilters({
      ...filters,
      category
    });
  }, [filters, applyFilters]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>{SERVICE_PAGE_CONFIG.title}</title>
          <meta name="description" content={SERVICE_PAGE_CONFIG.description} />
        </Head>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <LoadingState message={SERVICE_PAGE_CONFIG.loadingMessage} />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>{SERVICE_PAGE_CONFIG.title}</title>
          <meta name="description" content={SERVICE_PAGE_CONFIG.description} />
        </Head>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <ErrorState message={error} />
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{SERVICE_PAGE_CONFIG.title}</title>
        <meta name="description" content={SERVICE_PAGE_CONFIG.description} />
      </Head>

      <Navbar />
      
      <HeroSection />
      
      <ServiceFilters
        categories={categories}
        priceRange={priceRange}
        defaultFilters={filters}
        selectedCategory={filters.category}
        onApply={applyFilters}
      />

      <div className="w-full bg-white">
        <div className="ml-[18%] py-4 text-sm text-gray-600">
          <span>แสดงผล {totalServices} รายการ</span>
        </div>

        {filteredServices.length === 0 ? (
          <EmptyState />
        ) : (
          <ServiceGrid
            services={filteredServices}
            onCategoryClick={handleCategorySelection}
          />
        )}
      </div>

      <div className="py-8" />

      <AboutSection />

      <Footer />
    </div>
  );
}