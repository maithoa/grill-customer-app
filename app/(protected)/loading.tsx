export default function ProtectedDashboardLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl animate-pulse px-6 py-10">
      <div className="mb-8 h-12 w-56 rounded bg-zinc-200" />

      <section>
        <div className="h-7 w-36 rounded bg-zinc-200" />
        <div className="mt-2 h-5 w-64 rounded bg-zinc-200" />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="h-56 rounded-xl bg-zinc-200" />
          <div className="h-56 rounded-xl bg-zinc-200" />
        </div>
      </section>

      <section className="mt-10">
        <div className="h-7 w-56 rounded bg-zinc-200" />
        <div className="mt-2 h-5 w-72 rounded bg-zinc-200" />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="h-56 rounded-xl bg-zinc-200" />
          <div className="h-56 rounded-xl bg-zinc-200" />
        </div>
      </section>
    </main>
  );
}