import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget";
import { FloatingButtons } from "@/components/ui/floating-buttons";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatbotWidget />
      <FloatingButtons />
    </>
  );
}
