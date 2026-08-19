"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Painel" },
  { href: "/edital", label: "Edital Verticalizado" },
  { href: "/ciclo", label: "Ciclo de Estudos" },
  { href: "/sessoes", label: "Sessões" },
  { href: "/simulados", label: "Simulados" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-2 text-sm transition ${
              active
                ? "bg-rose-600 text-white font-medium"
                : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
