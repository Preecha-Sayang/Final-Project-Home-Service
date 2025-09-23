import { useState, useEffect } from "react";

export interface Service {
  service_id: number;
  servicename: string;
  category_id: number;
  category: string;
  image_url: string;
  price: string;
  description: string;
  paid_count?: number;
  min_price: number;
  max_price: number;
}

export function useServices(topOnly: boolean = false) {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      async function fetchServices() {
        try {
          const endpoint = `/api/services${topOnly ? "?topOnly=true" : ""}`;
          const res = await fetch(endpoint);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const data: Service[] = await res.json();
          setServices(data);
        } catch (err) {
          console.error("Failed to fetch services:", err);
          setError("ไม่สามารถโหลดข้อมูลบริการได้");
        } finally {
          setLoading(false);
        }
      }
  
      fetchServices();
    }, [topOnly]);
  
    return { services, loading, error };
  }
  