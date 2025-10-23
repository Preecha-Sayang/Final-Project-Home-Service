import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Service, ServiceFilters, PriceRange, SelectOption } from '@/types/service.types';
import { FILTER_DEFAULTS, PRICE_RANGE_DEFAULTS } from '@/constants/service.constants';

interface UseServiceDataReturn {
  // Data
  services: Service[];
  filteredServices: Service[];
  categories: SelectOption[];
  priceRange: PriceRange;
  
  // States
  loading: boolean;
  error: string | null;
  
  // Filter management
  filters: ServiceFilters;
  applyFilters: (newFilters: ServiceFilters) => void;
  resetFilters: () => void;
  
  // Computed
  totalServices: number;
}

export function useServiceData(): UseServiceDataReturn {
  // ===== States =====
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ===== Fetch all initial data =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch services only (categories computed from services)
        const servicesRes = await fetch('/api/services-cards');
        
        if (!servicesRes.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const servicesData = await servicesRes.json();
        
        setAllServices(servicesData);
        setFilteredServices(servicesData);
      } catch (err) {
        console.error('Error fetching service data:', err);
        setError('ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // ===== Computed values =====
  const priceRange = useMemo((): PriceRange => {
    if (allServices.length === 0) {
      return PRICE_RANGE_DEFAULTS;
    }
    
    const minPrice = Math.min(...allServices.map(s => s.min_price));
    const maxPrice = Math.max(...allServices.map(s => s.max_price));
    
    return { min: minPrice, max: maxPrice };
  }, [allServices]);
  
  const categories = useMemo((): SelectOption[] => {
    const uniqueCategories = Array.from(
      new Set(allServices.map(s => s.category))
    );
    
    return [
      { label: 'บริการทั้งหมด', value: '' },
      ...uniqueCategories.map(cat => ({
        label: cat,
        value: cat
      }))
    ];
  }, [allServices]);
  
  const defaultFilters = useMemo((): ServiceFilters => ({
    q: '',
    category: '',
    price: priceRange,
    sort: 'asc',
    page: FILTER_DEFAULTS.page,
    pageSize: FILTER_DEFAULTS.pageSize
  }), [priceRange]);
  
  const [filters, setFilters] = useState<ServiceFilters>(defaultFilters);
  
  // ===== Filter logic =====
  const applyFilters = useCallback((newFilters: ServiceFilters) => {
    const filtered = allServices.filter(service => {
      // Search filter
      const matchesSearch = !newFilters.q || 
        service.servicename.toLowerCase().includes(newFilters.q.toLowerCase());
      
      // Category filter
      const matchesCategory = !newFilters.category || 
        service.category === newFilters.category;
      
      // Price filter
      const matchesPrice = 
        service.min_price <= newFilters.price.max && 
        service.max_price >= newFilters.price.min;
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
    
    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (newFilters.sort) {
        case 'asc':
          return a.servicename.localeCompare(b.servicename, 'th');
        case 'desc':
          return b.servicename.localeCompare(a.servicename, 'th');
        case 'recommended':
        case 'popular':
          // TODO: Implement later
          return 0;
        default:
          return 0;
      }
    });
    
    setFilteredServices(sorted);
    setFilters(newFilters);
  }, [allServices]);
  
  const resetFilters = useCallback(() => {
    applyFilters(defaultFilters);
  }, [defaultFilters, applyFilters]);
  
  // Apply default filters when data loads
  useEffect(() => {
    if (allServices.length > 0 && !loading) {
      applyFilters(defaultFilters);
    }
  }, [allServices, loading, defaultFilters, applyFilters]);
  
  return {
    services: allServices,
    filteredServices,
    categories,
    priceRange,
    loading,
    error,
    filters,
    applyFilters,
    resetFilters,
    totalServices: filteredServices.length
  };
}