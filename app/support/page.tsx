import type { Metadata } from "next"
import { SupportContent } from "./support-content"

export const metadata: Metadata = {
  title: "Support - RayProxy Hub",
  description: "Get support from our team via WhatsApp and Telegram",
}

export default function SupportPage() {
  return <SupportContent />
}
