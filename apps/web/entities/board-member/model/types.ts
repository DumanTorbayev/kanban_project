export type BoardMemberRole = "owner" | "admin" | "member";

export type BoardMember = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: BoardMemberRole;
  joined_at: string;
};
