import { useState, useEffect } from 'react';

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

export function useCategories(topOnly?: boolean) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // สร้าง query parameters
        const params = new URLSearchParams();
        if (topOnly) {
          params.append('topOnly', 'true');
        }
        
        const url = `/api/services-cards/categories${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // API ใหม่ส่งข้อมูลเป็น array โดยตรง ไม่ใช่ object ที่มี categories property
        const data: Category[] = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [topOnly]);

  return { categories, loading, error };
}
