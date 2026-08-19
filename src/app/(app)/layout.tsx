import { auth } from "@/auth";
import { NavLinks } from "@/components/NavLinks";
import { SignOutButton } from "@/components/SignOutButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      <aside className="w-64 shrink-0 border-r border-neutral-800 flex flex-col p-4 gap-6">
        <div className="flex items-center gap-2 px-1">
          <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-sm">
            PRF
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Estudos PRF</p>
            <p className="text-xs text-neutral-500 leading-tight">Edital verticalizado</p>
          </div>
        </div>
        <NavLinks />
        <div className="mt-auto flex items-center justify-between border-t border-neutral-800 pt-4 px-1">
          <div className="min-w-0">
            <p className="text-sm text-white truncate">{session?.user?.name}</p>
            <p className="text-xs text-neutral-500 truncate">{session?.user?.email}</p>
          </div>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
