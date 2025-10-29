// ===== Core Types =====
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
    categoryColors?: CategoryColors;
  }
  
  export interface Category {
    category_id: number;
    name: string;
    description: string;
    bg_color_hex: string;
    text_color_hex: string;
    ring_color_hex: string;
    create_at: number;
    update_at: number;
  }
  
  export interface CategoryColors {
    bg?: string | null;
    text?: string | null;
    ring?: string | null;
  }
  
  // ===== Filter Types =====
  export interface PriceRange {
    min: number;
    max: number;
  }
  
  export type SortOption = 'asc' | 'desc' | 'recommended' | 'popular';
  
  export interface ServiceFilters {
    q: string;
    category: string;
    price: PriceRange;
    sort: SortOption;
    page?: number;
    pageSize?: number;
  }
  
  // ===== UI Types =====
  export interface SelectOption {
    label: string;
    value: string;
    disabled?: boolean;
  }
  
  // ===== Hook Return Types =====
  export interface UseServicesReturn {
    services: Service[];
    loading: boolean;
    error: string | null;
  }
  
  export interface UseCategoriesReturn {
    categories: Category[];
    loading: boolean;
    error: string | null;
  }
  
  export interface UsePriceRangeReturn {
    priceRange: PriceRange;
    loading: boolean;
    error: string | null;
  }