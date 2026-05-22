import Link from "next/link";

import { signUp } from "@/app/auth/actions";
import { Button } from "@workspace/ui/components/button";

interface Props {
  searchParams?: Promise<{
    error?: string;
  }>;
}

const RegisterPage = async ({ searchParams }: Props) => {
  const params = await searchParams;

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <section className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-sm">
        <div className="mb-6 space-y-1">
          <h1 className="text-xl font-semibold">Create account</h1>
          <p className="text-sm text-muted-foreground">
            Create your Kanban + Time Tracker workspace account.
          </p>
        </div>

        {params?.error ? (
          <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {params.error}
          </p>
        ) : null}

        <form action={signUp} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Name</span>
            <input
              className="h-9 w-full rounded-md border bg-background px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              name="fullName"
              type="text"
              autoComplete="name"
            />
          </label>

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
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>

          <Button className="w-full" type="submit">
            Create account
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            className="font-medium text-foreground underline"
            href="/auth/login"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
};

export default RegisterPage;
