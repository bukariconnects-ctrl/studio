"use server";

import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";

export type SmartAssignResult = {
  found: boolean;
  photographer_id?: string;
  name?: string;
  rating?: number;
  specialty?: string;
  current_bookings?: number;
  message?: string;
  error?: string;
};

export async function smartAssignPhotographer(
  date: string,
  startTime: string,
  endTime: string,
  specialty?: string,
): Promise<SmartAssignResult> {
  const allowed = await checkPermission(PERMISSIONS.BOOKINGS_MANAGE);
  if (!allowed) return { found: false, error: "غير مصرح" };

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("smart_assign_photographer", {
    p_date: date,
    p_start_time: startTime,
    p_end_time: endTime,
    p_specialty: specialty || null,
  });

  if (error) {
    return { found: false, error: error.message };
  }

  return data as SmartAssignResult;
}
