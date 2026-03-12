import { auth0 } from "@/lib/auth0";

export default async function Home() {
  const session = await auth0.getSession();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center gap-8 bg-white p-16 dark:bg-black">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">iZimate</h1>

        {session ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-zinc-600 dark:text-zinc-400">
              Signed in as <span className="font-medium text-black dark:text-white">{session.user.email}</span>
            </p>
            <pre className="max-w-full overflow-auto rounded bg-zinc-100 p-4 text-xs dark:bg-zinc-900">
              {JSON.stringify(session.user, null, 2)}
            </pre>
            <a
              href="/auth/logout"
              className="flex h-12 w-full items-center justify-center rounded-full border border-red-200 px-5 text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
            >
              Sign Out
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="text-zinc-600 dark:text-zinc-400">Not signed in</p>
            <a
              href="/auth/login"
              className="bg-foreground text-background flex h-12 w-full items-center justify-center rounded-full px-5 transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Sign In
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
