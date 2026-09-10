import { supabase } from "@/lib/supabase";
import type { AppState, UserStateSummary } from "@/lib/store";

type CloudStateRow = {
  user_id: string;
  state: AppState;
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
