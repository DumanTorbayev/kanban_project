"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getNextPosition } from "@/entities/kanban/lib/position";
import { requireUser } from "@/shared/lib/auth/require-user";

function redirectWithBoardError(boardId: string, message: string): never {
  const searchParams = new URLSearchParams({ error: message });

  redirect("/boards/" + boardId + "?" + searchParams.toString());
}

function redirectWithDashboardError(message: string): never {
  const searchParams = new URLSearchParams({ error: message });

  redirect("/dashboard?" + searchParams.toString());
}

export async function createKanbanColumn(formData: FormData) {
  const boardId = String(formData.get("boardId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();

  if (!boardId) {
    redirectWithDashboardError("Board id is required.");
  }

  if (!title) {
    redirectWithBoardError(boardId, "Column title is required.");
  }

  const { supabase } = await requireUser({ redirectTo: "/boards/" + boardId });
  const { data: lastColumn, error: positionError } = await supabase
    .from("board_columns")
    .select("position")
    .eq("board_id", boardId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (positionError) {
    redirectWithBoardError(boardId, positionError.message);
  }

  const { error } = await supabase.from("board_columns").insert({
    board_id: boardId,
    title,
    position: getNextPosition(lastColumn?.position),
  });

  if (error) {
    redirectWithBoardError(boardId, error.message);
  }

  revalidatePath("/boards/" + boardId);
  redirect("/boards/" + boardId);
}
