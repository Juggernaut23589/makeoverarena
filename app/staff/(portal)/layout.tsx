import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeSession, COOKIE_NAME } from "@/lib/admin-auth";


export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token || !decodeSession(token)) {
    redirect("/admin/login");
  }
  return <>{children}</>;
}
