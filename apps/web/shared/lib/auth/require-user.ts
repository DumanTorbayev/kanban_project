import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type RequireUserOptions = {
  redirectTo?: string;
};

export async function requireUser(options: RequireUserOptions = {}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    const redirectTo = options.redirectTo ?? "/dashboard";
    const searchParams = new URLSearchParams({ redirectTo });

    redirect(`/auth/login?${searchParams.toString()}`);
  }

  return { supabase, user };
}
