import { create } from "zustand";

interface PaymentState {
  payment: string;
  setCreditCard: () => void;
  setQRCode: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payment: "",
  setCreditCard: () => set({ payment: "credit_card" }),
  setQRCode: () => set({ payment: "qr_code" }),
}));
