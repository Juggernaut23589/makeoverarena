import type { Metadata } from "next";
import { StaffLoginClient } from "./staff-login-client";

export const metadata: Metadata = { title: "Staff Login | MakeoverArena" };

export default function StaffLoginPage() {
  return <StaffLoginClient />;
}
