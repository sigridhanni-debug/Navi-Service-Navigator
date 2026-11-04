import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© 2026 OIXIO TEST. Built with Claude Code</p>
        <nav className="flex gap-5">
          <Link href="/" className="hover:text-navy">Services</Link>
          <Link href="/navigator" className="hover:text-navy">Navigator</Link>
          <Link href="/admin" className="hover:text-navy">Manage</Link>
        </nav>
      </div>
    </footer>
  );
}
