import { useMemo } from "react";
import { useServices } from "./useServices";

export interface PriceRange {
  min: number;
  max: number;
}

export function usePriceRange() {
  const { services, loading, error } = useServices();
  
  const priceRange = useMemo(() => {
    if (services.length === 0) {
      return { min: 0, max: 1000 }; // ค่าเริ่มต้น
    }
    
    const allMinPrices = services.map(service => service.min_price);
    const allMaxPrices = services.map(service => service.max_price);
    
    const minPrice = Math.min(...allMinPrices);
    const maxPrice = Math.max(...allMaxPrices);
    
    return { min: minPrice, max: maxPrice };
  }, [services]);
  
  return { priceRange, loading, error };
}
