import Link from "next/link";

import { Button } from "@workspace/ui/components/button";

export default function Page() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <section className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-sm">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-semibold">Kanban + Time Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Основа проекта готова. Следующий рабочий экран начинается с
            авторизации.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/auth/login">Войти</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/register">Создать аккаунт</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
