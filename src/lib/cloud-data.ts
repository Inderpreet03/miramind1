import { supabase } from "@/lib/supabase";
import type { AppState, FamilyMember, UserStateSummary } from "@/lib/store";

type CloudStateRow = {
  user_id: string;
  state: AppState;
};

type SharedFamilyRow = FamilyMember & {
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchCloudState(userId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("user_states")
    .select("user_id, state")
    .eq("user_id", userId)
    .maybeSingle<CloudStateRow>();
  if (error) throw error;
  return data?.state ?? null;
}

export async function saveCloudState(userId: string, state: AppState) {
  if (!supabase) return;
  const { error } = await supabase.from("user_states").upsert(
    {
      user_id: userId,
      state,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

export async function fetchSharedFamily() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("shared_family_members")
    .select(
      "id, name, relation, emoji, note, birthday, image, created_by, created_at, updated_at",
    )
    .order("created_at", { ascending: true })
    .returns<SharedFamilyRow[]>();
  if (error) throw error;
  return (data ?? []).map(
    ({
      created_by: _createdBy,
      created_at: _createdAt,
      updated_at: _updatedAt,
      ...member
    }) => member,
  );
}

export async function saveSharedFamilyMember(
  userId: string,
  member: FamilyMember,
) {
  if (!supabase) return;
  const { error } = await supabase.from("shared_family_members").upsert(
    {
      ...member,
      created_by: userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) throw error;
}

export async function saveSharedFamilyMembers(
  userId: string,
  members: FamilyMember[],
) {
  if (!supabase || members.length === 0) return;
  const now = new Date().toISOString();
  const { error } = await supabase.from("shared_family_members").upsert(
    members.map((member) => ({
      ...member,
      created_by: userId,
      updated_at: now,
    })),
    { onConflict: "id" },
  );
  if (error) throw error;
}

export async function removeSharedFamilyMember(id: string) {
  if (!supabase) return;
  const { error } = await supabase
    .from("shared_family_members")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export function summarizeState(state: AppState): UserStateSummary {
  return {
    resident: state.resident,
    familyCount: state.family.length,
    sessionsCount: state.sessions.length,
    tasksCompleted: state.tasks.filter((task) => task.completedAt).length,
    lastSessionAt: state.sessions[0]?.at ?? null,
  };
}

export async function fetchCloudSummary(userId: string) {
  const state = await fetchCloudState(userId);
  return state ? summarizeState(state) : null;
}
