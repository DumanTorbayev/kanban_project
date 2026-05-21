import Link from "next/link";

import { signIn } from "@/app/auth/actions";
import { Button } from "@workspace/ui/components/button";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    redirectTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <section className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-sm">
        <div className="mb-6 space-y-1">
          <h1 className="text-xl font-semibold">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to continue managing your boards.
          </p>
        </div>

        {params?.message ? (
          <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            {params.message}
          </p>
        ) : null}

        {params?.error ? (
          <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {params.error}
          </p>
        ) : null}

        <form action={signIn} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Email</span>
            <input
              className="h-9 w-full rounded-md border bg-background px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Password</span>
            <input
              className="h-9 w-full rounded-md border bg-background px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>

          <input
            name="redirectTo"
            type="hidden"
            value={params?.redirectTo ?? "/dashboard"}
          />

          <Button className="w-full" type="submit">
            Sign in
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          No account yet?{" "}
          <Link
            className="font-medium text-foreground underline"
            href="/auth/register"
          >
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}
