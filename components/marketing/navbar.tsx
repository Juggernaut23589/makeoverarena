"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, UserCircle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const serviceLinks = [
  { href: "/services/undergraduate", label: "Undergraduate" },
  { href: "/services/graduate", label: "Graduate" },
  { href: "/services/scholarships", label: "Scholarships" },
  { href: "/services/visa", label: "Visa Support" },
];

const navLinks = [
  { href: "/success-stories", label: "Success Stories" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "https://www.makeoverarena.com/", label: "Blog", external: true },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const pathname = usePathname();
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setServicesOpen(false);
    setMobileServicesOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isHomePage = pathname === "/";
  const isDark = isHomePage && !scrolled && !menuOpen;
  const isServiceActive = serviceLinks.some((l) => pathname === l.href);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled || menuOpen
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
          : isHomePage
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <Image
              src="/makeover-logo-icon.png"
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 object-contain drop-shadow-sm"
              priority
            />
            <span className={cn(
              "font-display font-bold text-xl leading-none transition-colors duration-300",
              isDark ? "text-gold-400" : "text-gold-600"
            )}>
              MakeoverArena
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {/* Services Dropdown */}
            <div className="relative" ref={servicesRef}>
              <button
                onClick={() => setServicesOpen((o) => !o)}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  isServiceActive
                    ? isDark
                      ? "bg-white/15 text-white"
                      : "bg-navy-50 text-navy-900"
                    : isDark
                    ? "text-white/80 hover:text-white hover:bg-white/10"
                    : "text-navy-600 hover:text-navy-900 hover:bg-navy-50"
                )}
              >
                Services
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    servicesOpen && "rotate-180"
                  )}
                />
              </button>

              {servicesOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-48 bg-white rounded-xl shadow-elevated border border-border py-1.5 z-50">
                  {serviceLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "block px-4 py-2.5 text-sm transition-colors",
                        pathname === link.href
                          ? "text-navy-900 bg-navy-50 font-medium"
                          : "text-navy-600 hover:text-navy-900 hover:bg-navy-50"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap",
                    isDark
                      ? "text-white/80 hover:text-white hover:bg-white/10"
                      : "text-navy-600 hover:text-navy-900 hover:bg-navy-50"
                  )}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap",
                    pathname === link.href
                      ? isDark
                        ? "bg-white/15 text-white"
                        : "bg-navy-50 text-navy-900"
                      : isDark
                      ? "text-white/80 hover:text-white hover:bg-white/10"
                      : "text-navy-600 hover:text-navy-900 hover:bg-navy-50"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* CTA Buttons + Profile */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Link
              href="/book"
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 whitespace-nowrap",
                isDark
                  ? "border-white/30 text-white hover:bg-white/10"
                  : "border-navy-200 text-navy-700 hover:border-navy-900 hover:text-navy-900"
              )}
            >
              Book Consultation
            </Link>
            <Link
              href="/apply"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-crimson-500 text-white hover:bg-crimson-400 transition-all duration-150 shadow-sm whitespace-nowrap"
            >
              Start Application →
            </Link>
            <Link
              href="/login"
              className={cn(
                "p-2 rounded-lg transition-all duration-150 ml-1",
                isDark
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-navy-600 hover:text-navy-900 hover:bg-navy-50"
              )}
              aria-label="My Account"
            >
              <UserCircle className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={cn(
              "lg:hidden p-2 rounded-lg transition-colors",
              isDark
                ? "text-white hover:bg-white/10"
                : "text-navy-700 hover:bg-navy-50"
            )}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span
                className={cn(
                  "block h-0.5 w-full transition-all duration-200",
                  isDark ? "bg-white" : "bg-navy-900",
                  menuOpen && "rotate-45 translate-y-[7px]"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 transition-all duration-200",
                  isDark ? "bg-white" : "bg-navy-900",
                  menuOpen ? "w-0 opacity-0" : "w-full opacity-100"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-full transition-all duration-200",
                  isDark ? "bg-white" : "bg-navy-900",
                  menuOpen && "-rotate-45 -translate-y-[9px]"
                )}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300",
          menuOpen ? "max-h-[calc(100dvh-4rem)] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="bg-white border-t border-border px-4 py-4 space-y-1 overflow-y-auto max-h-[calc(100dvh-4rem)]">
          {/* Services collapsible */}
          <button
            onClick={() => setMobileServicesOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-navy-600 hover:text-navy-900 hover:bg-navy-50 transition-colors"
          >
            Services
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                mobileServicesOpen && "rotate-180"
              )}
            />
          </button>

          {mobileServicesOpen && (
            <div className="pl-4 space-y-0.5">
              {serviceLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block px-4 py-2.5 rounded-lg text-sm transition-colors",
                    pathname === link.href
                      ? "bg-navy-50 text-navy-900 font-medium"
                      : "text-navy-500 hover:text-navy-900 hover:bg-navy-50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 rounded-lg text-sm font-medium transition-colors text-navy-600 hover:text-navy-900 hover:bg-navy-50"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-navy-50 text-navy-900"
                    : "text-navy-600 hover:text-navy-900 hover:bg-navy-50"
                )}
              >
                {link.label}
              </Link>
            )
          )}

          <div className="pt-3 flex flex-col gap-2 border-t border-border mt-2">
            <Link
              href="/book"
              className="block px-4 py-3 rounded-lg text-sm font-medium text-center border border-navy-200 text-navy-700 hover:bg-navy-50 transition-colors"
            >
              Book Free Consultation
            </Link>
            <Link
              href="/apply"
              className="block px-4 py-3 rounded-lg text-sm font-semibold text-center bg-crimson-500 text-white hover:bg-crimson-400 transition-colors"
            >
              Start Application →
            </Link>
            <Link
              href="/login"
              className="block px-4 py-3 rounded-lg text-sm font-medium text-center border border-navy-200 text-navy-700 hover:bg-navy-50 transition-colors"
            >
              My Account
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
