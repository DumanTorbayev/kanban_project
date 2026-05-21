"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/shared/lib/auth/require-user";

function redirectWithError(message: string): never {
  const searchParams = new URLSearchParams({ error: message });

  redirect(`/dashboard?${searchParams.toString()}`);
}

export async function createBoard(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();

  if (!title) {
    redirectWithError("Board title is required.");
  }

  const { supabase, user } = await requireUser({ redirectTo: "/dashboard" });
  const { error } = await supabase.from("boards").insert({
    title,
    owner_id: user.id,
  });

  if (error) {
    redirectWithError(error.message);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
