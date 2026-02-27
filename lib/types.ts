import type { ObjectId } from "mongodb"

export interface Proxy {
  _id: ObjectId
  ip: string
  port: number
  username?: string
  password?: string
  country: string
  countryCode: string
  maxUsage: number
  currentUsage: number
  expiresAt: Date
  isActive: boolean
  status: "available" | "expired" | "dead"
  createdAt: Date
}

export interface ProxyPurchase {
  _id: ObjectId
  userId: ObjectId
  proxyId: ObjectId
  orderId: ObjectId
  proxy: {
    ip: string
    port: number
    username?: string
    password?: string
    country: string
    countryCode: string
  }
  expiresAt: Date
  purchasedAt: Date
}

export interface Order {
  _id: ObjectId
  userId: ObjectId
  country: string
  duration: "daily"
  price: number
  phoneNumber?: string
  paymentMethod: "mpesa" | "balance"
  mpesaCheckoutRequestId?: string
  mpesaReceiptNumber?: string
  status: "pending" | "paid" | "failed" | "cancelled" | "expired"
  createdAt: Date
  paidAt?: Date
  targetProxyId?: ObjectId // Store target proxy for M-Pesa orders
}

export interface TopUp {
  _id: ObjectId
  userId: ObjectId
  amount: number
  phoneNumber: string
  mpesaCheckoutRequestId?: string
  mpesaReceiptNumber?: string
  status: "pending" | "completed" | "failed"
  createdAt: Date
  completedAt?: Date
}

export interface Pricing {
  _id: ObjectId
  country: string
  countryCode: string
  daily: number
  isEnabled: boolean
}

export interface EmailDomain {
  _id: ObjectId
  domain: string
  type: "gmail" | "rayproxy"
  server?: string
  isEnabled: boolean
  createdAt: Date
}

export interface EmailPricing {
  _id: ObjectId
  domainId: ObjectId
  pricePerEmail: number
  isEnabled: boolean
  createdAt: Date
}

export interface Email {
  _id: ObjectId
  emailAddress: string
  password: string
  domain: string
  domainId: ObjectId
  server?: string
  status: "available" | "sold" | "reserved"
  createdAt: Date
}

export interface EmailPurchase {
  _id: ObjectId
  userId: ObjectId
  orderId: ObjectId
  emails: {
    emailAddress: string
    password: string
    domain: string
    server?: string
  }[]
  quantity: number
  domain: string
  totalPrice: number
  purchasedAt: Date
}

export interface EmailOrder {
  _id: ObjectId
  userId: ObjectId
  domain: string
  domainId: ObjectId
  quantity: number
  pricePerEmail: number
  totalPrice: number
  phoneNumber?: string
  paymentMethod: "mpesa" | "balance"
  mpesaCheckoutRequestId?: string
  mpesaReceiptNumber?: string
  status: "pending" | "paid" | "failed" | "cancelled"
  createdAt: Date
  paidAt?: Date
}

export interface SupportConfig {
  _id: ObjectId
  whatsappNumber: string
  whatsappGroup: string
  telegramAgent: string
  telegramGroup: string
  updatedAt: Date
}
