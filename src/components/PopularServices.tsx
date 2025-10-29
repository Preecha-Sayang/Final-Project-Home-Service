import { useState, useEffect } from 'react';
import ServiceCard from './Cards/ServiceCard';
import type { Service } from '@/types/service.types';


export default function PopularServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularServices = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/services-cards?topOnly=true');
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data: Service[] = await res.json();
        setServices(data);
      } catch (err) {
        console.error('Failed to fetch popular services:', err);
        setError('ไม่สามารถโหลดบริการยอดนิยมได้');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularServices();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[400px] bg-gray-100 animate-pulse rounded-lg border border-gray-200"
          >
            <div className="h-[240px] bg-gray-200 rounded-t-lg" />
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-5 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 inline-block">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
          <p className="text-gray-600 text-lg">ไม่พบบริการยอดนิยมในขณะนี้</p>
        </div>
      </div>
    );
  }

  // Success State
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard
          key={service.service_id}
          imgSrc={service.image_url}
          category={service.category}
          title={service.servicename}
          price={service.price}
          serviceId={service.service_id}
          categoryColors={service.categoryColors}
        />
      ))}
    </div>
  );
}