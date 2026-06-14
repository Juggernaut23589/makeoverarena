import type { Metadata } from "next";
import { WhatsAppInbox } from "@/components/admin/whatsapp-inbox";

export const metadata: Metadata = { title: "WhatsApp Inbox | Admin" };

export default function InboxPage() {
  return <WhatsAppInbox />;
}
