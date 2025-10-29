export const SERVICE_PAGE_CONFIG = {
  title: 'รายการบริการ - Home Service',
  description: 'ค้นหาและกรองบริการตามต้องการ',
  loadingMessage: 'กำลังโหลดข้อมูลบริการ...',
  emptyState: {
    title: 'ไม่พบบริการ',
    description: 'กรุณาปรับเปลี่ยนเงื่อนไขการค้นหา'
  }
} as const;

export const FILTER_DEFAULTS = {
  pageSize: 12,
  page: 1,
  debounceMs: 300
} as const;

export const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: 'บริการแนะนำ', value: 'recommended' },
  { label: 'บริการยอดนิยม', value: 'popular' },
  { label: 'ตามตัวอักษร (ก-ฮ)', value: 'asc' },
  { label: 'ตามตัวอักษร (ฮ-ก)', value: 'desc' }
];

export const PRICE_RANGE_DEFAULTS = {
  min: 0,
  max: 1000,
  step: 1
} as const;