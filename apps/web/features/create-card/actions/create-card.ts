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

export async function createCard(formData: FormData) {
  const boardId = String(formData.get("boardId") ?? "").trim();
  const columnId = String(formData.get("columnId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!boardId) {
    redirectWithDashboardError("Board id is required.");
  }

  if (!columnId) {
    redirectWithBoardError(boardId, "Column id is required.");
  }

  if (!title) {
    redirectWithBoardError(boardId, "Card title is required.");
  }

  const { supabase, user } = await requireUser({
    redirectTo: "/boards/" + boardId,
  });
  const { data: lastCard, error: positionError } = await supabase
    .from("cards")
    .select("position")
    .eq("board_id", boardId)
    .eq("column_id", columnId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (positionError) {
    redirectWithBoardError(boardId, positionError.message);
  }

  const { error } = await supabase.from("cards").insert({
    board_id: boardId,
    column_id: columnId,
    title,
    description: description || null,
    position: getNextPosition(lastCard?.position),
    created_by: user.id,
  });

  if (error) {
    redirectWithBoardError(boardId, error.message);
  }

  revalidatePath("/boards/" + boardId);
  redirect("/boards/" + boardId);
}
