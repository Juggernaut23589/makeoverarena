import { Footer } from "@/components/marketing/footer";
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget";
import { FloatingButtons } from "@/components/ui/floating-buttons";
import { CookieBanner } from "@/components/ui/cookie-banner";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatbotWidget />
      <FloatingButtons />
      <CookieBanner />
    </>
  );
}
