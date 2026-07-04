export interface Plan {
  id: string;
  name: string;
  duration: string;
  price: number;
  currency: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  icon: string;
  gradient: string;
  category: string;
  plans: Plan[];
  features: string[];
}

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";
export type PaymentStatus =
  | "unpaid"
  | "pending_confirmation"
  | "confirmed"
  | "rejected";

export interface Order {
  id: string;
  productId: string;
  productName: string;
  planId: string;
  planName: string;
  planDuration: string;
  price: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerWhatsApp: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentReference: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteConfig {
  storeName: string;
  adminWhatsApp: string;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    additionalInfo: string;
  };
  adminPassword: string;
}
