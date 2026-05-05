import { redirect } from 'next/navigation';
import { loginAction } from '@/lib/actions/loginAction';
import { getSession, sanitizeRedirectPath } from '@/lib/session';

type LoginPageProps = {
  searchParams?: Promise<{
    redirect?: string | string[];
    error?: string | string[];
  }>;
};

function toSingleValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();
  const resolvedSearchParams = await searchParams;

  if (session.user) {
    redirect('/');
  }

  const safeRedirect = sanitizeRedirectPath(
    toSingleValue(resolvedSearchParams?.redirect)
  );
  const errorMessage = toSingleValue(resolvedSearchParams?.error);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
      <section className="w-full rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Use your customer credentials to continue.
        </p>

        <form action={loginAction} className="mt-6 space-y-4">
          <input type="hidden" name="redirect" value={safeRedirect} />

          <div className="space-y-1">
            <label htmlFor="username" className="text-sm font-medium text-zinc-800">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-offset-2 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-300"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-zinc-800">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-offset-2 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-300"
            />
          </div>

          {errorMessage ? (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
