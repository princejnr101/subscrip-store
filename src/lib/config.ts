import { SiteConfig } from "./types";

export const siteConfig: SiteConfig = {
  storeName: process.env.NEXT_PUBLIC_STORE_NAME || "Subscrip Store",
  adminWhatsApp: process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "+1234567890",
  bankDetails: {
    bankName: process.env.NEXT_PUBLIC_BANK_NAME || "Your Bank Name",
    accountName:
      process.env.NEXT_PUBLIC_ACCOUNT_NAME || "Your Account Name",
    accountNumber: process.env.NEXT_PUBLIC_ACCOUNT_NUMBER || "0000000000",
    additionalInfo:
      process.env.NEXT_PUBLIC_BANK_INFO ||
      "Please include your Order ID as payment reference",
  },
  adminPassword: process.env.ADMIN_PASSWORD || "admin123",
};
