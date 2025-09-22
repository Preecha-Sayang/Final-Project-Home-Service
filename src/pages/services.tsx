import { useEffect, useState } from "react";
import ServiceCard from "../components/Cards/ServiceCard";


interface Service {
  service_id: number;
  servicename: string;
  category_id: number;
  image_url: string;
  price: string;
  description: string;
}


export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetch("/api/services")
      .then(res => res.json())
      .then(data => {
        setServices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);


  if (loading) return <p>Loading...</p>;


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map(service => (
        <ServiceCard
          key={service.service_id}
          imgSrc={service.image_url}
          category={`Category ${service.category_id}`}
          title={service.servicename}
          price={service.price}
          onAction={() => alert(`Call to action for ${service.servicename}`)}
          onMoreInfo={() => alert(service.description)}
        />
      ))}
    </div>
  );
}
