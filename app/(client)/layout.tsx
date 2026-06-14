import { redirect } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
