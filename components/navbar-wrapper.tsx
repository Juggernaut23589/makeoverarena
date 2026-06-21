"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/marketing/navbar";

const NO_NAVBAR_PREFIXES = ["/admin/", "/staff/"];

function shouldShowNavbar(pathname: string) {
  if (pathname === "/admin/login") return true;
  if (pathname === "/staff/login") return true;
  return !NO_NAVBAR_PREFIXES.some((p) => pathname.startsWith(p));
}

export function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const show = shouldShowNavbar(pathname);

  return (
    <>
      {show && <Navbar />}
      <div className={show ? "pt-16 lg:pt-[72px] flex flex-1 flex-col" : "flex flex-1 flex-col"}>
        {children}
      </div>
    </>
  );
}
