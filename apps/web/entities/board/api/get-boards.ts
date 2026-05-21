import { createClient } from "@/lib/supabase/server";

export async function getBoards() {
  const supabase = await createClient();

  return supabase
    .from("boards")
    .select("id, title, created_at")
    .order("created_at", { ascending: false });
}
