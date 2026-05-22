import { signOut } from "@/app/auth/actions";
import { Button } from "@workspace/ui/components/button";

interface Props {
  email?: string;
}

export const DashboardHeader = ({ email }: Props) => {
  return (
    <header className="flex items-center justify-between gap-4 rounded-lg border bg-background p-5 shadow-sm">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {email ?? "unknown user"}
        </p>
      </div>

      <form action={signOut}>
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </header>
  );
};
