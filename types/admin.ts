export type AdminRole = "admin" | "user";

export interface Profile {
  id: string;
  email: string | null;
  role: AdminRole;
  created_at: string;
}

export interface AdminStats {
  totalMedia: number;
  pending: number;
  approved: number;
  rejected: number;
  totalPlays: number;
}
