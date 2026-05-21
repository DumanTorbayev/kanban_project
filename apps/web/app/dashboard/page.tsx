import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@workspace/ui/components/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-svh bg-muted/30 p-6">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4 rounded-lg border bg-background p-5 shadow-sm">
          <div>
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Вы вошли в систему. Следующий шаг - доски и рабочее пространство.
            </p>
          </div>

          {user ? (
            <form action={signOut}>
              <Button type="submit" variant="outline">
                Выйти
              </Button>
            </form>
          ) : (
            <Button asChild>
              <Link href="/auth/login">Войти</Link>
            </Button>
          )}
        </div>

        <div className="rounded-lg border bg-background p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-medium">Текущая сессия</h2>
          {user ? (
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Пользователь авторизован.</p>
              <p>Email: {user.email}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Сессия не найдена. Обновите страницу или войдите заново.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
