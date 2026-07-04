import { Order } from "./types";
import { siteConfig } from "./config";

export function buildWhatsAppOrderNotification(order: Order): string {
  const message = `New Order Received!\n\nOrder ID: ${order.id}\nProduct: ${order.productName}\nPlan: ${order.planName} (${order.planDuration})\nPrice: $${order.price.toFixed(2)} ${order.currency}\n\nCustomer: ${order.customerName}\nWhatsApp: ${order.customerWhatsApp}\nEmail: ${order.customerEmail}\n\nStatus: Awaiting Payment`;

  const phone = siteConfig.adminWhatsApp.replace(/[^0-9]/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppChatLink(
  customerPhone: string,
  message?: string
): string {
  const phone = customerPhone.replace(/[^0-9]/g, "");
  const defaultMessage = `Hi! This is ${siteConfig.storeName}. `;
  const text = message || defaultMessage;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function buildAdminChatLink(order: Order): string {
  const phone = order.customerWhatsApp.replace(/[^0-9]/g, "");
  const message = `Hi ${order.customerName}! This is ${siteConfig.storeName} regarding your order ${order.id} for ${order.productName} (${order.planName}).`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildPaymentConfirmationLink(order: Order): string {
  const phone = order.customerWhatsApp.replace(/[^0-9]/g, "");
  const message = `Hi ${order.customerName}! Your payment for ${order.productName} (${order.planName}) has been confirmed. Your subscription is now being activated. Thank you for your order! - ${siteConfig.storeName}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
