export type PromotionId = number;
export type PromotionType = "fixed" | "percent";

export type PromotionRow = {
  promotion_id: PromotionId;
  code: string;
  discount_type: PromotionType;
  discount_value: number; //บาท กับ %
  usage_limit: number | null;
  expire_at: string | null; //ISO
  create_at: string;
  update_at: string;
};

export type PromotionUse = {
  promotion_id: PromotionId;
  code: string;
  discount_type: PromotionType;
  discount_value: number | null; //บาท กับ %
  usage_limit: number | null;
  count_of_use: number | null;
  expire_at: string | null; //ISO
  can_use: boolean;
  create_at: string;
  update_at: string;
};

export type promotionUsage = {
  usage_id: number;
  promotion_id: number;
  booking_id: number;
  used_at: string | null;
};

export type PromotionCreatePayload = {
  code: string;
  discount_type: PromotionType;
  discount_value: number;
  usage_limit: number | null;
  expire_at: string | null; //ISO
};

export type PromotionUpdatePayload = Partial<PromotionCreatePayload>;

export type PromotionListOk = { ok: true; promotions: PromotionRow[] };
export type PromotionOneOk = { ok: true; promotion: PromotionRow };
export type PromotionErr = { ok: false; message?: string };
