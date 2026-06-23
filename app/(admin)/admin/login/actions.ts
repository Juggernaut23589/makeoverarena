"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeSession, COOKIE_NAME } from "@/lib/admin-auth";

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/admin/login");
}
