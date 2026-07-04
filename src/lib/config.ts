import { SiteConfig } from "./types";

export const siteConfig: SiteConfig = {
  storeName: process.env.NEXT_PUBLIC_STORE_NAME || "Subscrip Store",
  adminWhatsApp: process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "+1234567890",
  momoDetails: {
    momoName:
      process.env.NEXT_PUBLIC_MOMO_NAME || "Your MoMo Name",
    momoNumber: process.env.NEXT_PUBLIC_MOMO_NUMBER || "0000000000",
    additionalInfo:
      process.env.NEXT_PUBLIC_MOMO_INFO ||
      "Please include your Order ID as payment reference when sending",
  },
  adminPassword: process.env.ADMIN_PASSWORD || "admin123",
};
