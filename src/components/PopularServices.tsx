import { useServices, Service } from "../hooks/useServices";
import ServiceCard from "./Cards/ServiceCard";

export default function PopularServices() {
  const { services, loading, error } = useServices(true); // topOnly = true

  if (loading) return <p>กำลังโหลดบริการยอดนิยม...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {services.map((service: Service) => (
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
  );
}
