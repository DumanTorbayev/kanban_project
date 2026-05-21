import { type createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function getBoard(
  supabase: SupabaseServerClient,
  boardId: string,
) {
  return supabase
    .from("boards")
    .select("id, title, created_at")
    .eq("id", boardId)
    .maybeSingle();
}
