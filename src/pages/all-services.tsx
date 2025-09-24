import React from 'react';
import { useServices } from '../hooks/useServices';
import ServiceCard from '../components/Cards/ServiceCard';
import Head from 'next/head';

const AllServicesPage: React.FC = () => {
  const { services, loading, error } = useServices();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>บริการทั้งหมด - Home Service</title>
          <meta name="description" content="ดูบริการทั้งหมดที่มีในระบบ" />
        </Head>
        
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลบริการ...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>บริการทั้งหมด - Home Service</title>
          <meta name="description" content="ดูบริการทั้งหมดที่มีในระบบ" />
        </Head>
        
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
        <title>บริการทั้งหมด - Home Service</title>
        <meta name="description" content="ดูบริการทั้งหมดที่มีในระบบ" />
      </Head>

      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">บริการทั้งหมด</h1>
            <p className="text-lg text-gray-600 mb-2">
              เลือกบริการที่คุณต้องการจากบริการทั้งหมดที่มีในระบบ
            </p>
            <p className="text-sm text-gray-500">
              พบบริการทั้งหมด {services.length} รายการ
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-8">
        {services.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">ไม่พบบริการ</h2>
              <p className="text-gray-500">ขณะนี้ยังไม่มีบริการในระบบ</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => (
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
      </div>

      {/* Footer spacing */}
      <div className="h-16"></div>
    </div>
  );
};

export default AllServicesPage;
