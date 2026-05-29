import { type createClient } from "@/lib/supabase/server";

import { type BoardMember } from "../model/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export const getBoardMembers = (
  supabase: SupabaseServerClient,
  boardId: string,
) => {
  const result = supabase.rpc("get_board_members", {
    target_board_id: boardId,
  });

  return result.then((response) => ({
    ...response,
    data: (response.data ?? null) as BoardMember[] | null,
  }));
};
