import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeSession, STAFF_COOKIE_NAME } from "@/lib/admin-auth";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_COOKIE_NAME)?.value;
  if (!token || !decodeSession(token)) {
    redirect("/staff/login");
  }
  return <>{children}</>;
}
