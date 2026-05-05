import Link from 'next/link';
import type { Route } from 'next';
import { logoutAction } from '@/lib/actions/logoutAction';
import type { SessionUser } from '@/lib/session';

type NavbarProps = {
  user?: SessionUser;
};

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight text-zinc-900">
          Grill Customers
        </Link>

        <nav className="flex items-center gap-4 text-sm text-zinc-700">
          <Link href={'/events' as Route} className="hover:text-zinc-950">
            Events
          </Link>

          {user ? (
            <>
              <span className="text-zinc-600">{user.identity}</span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-100"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-100">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
