import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPhotographerRecord, getUpcomingSessions } from "@/actions/photographer";
import { UpcomingSessionsList } from "../_components/upcoming-sessions-list";

export const metadata: Metadata = {
  title: "جلساتي القادمة",
};

export default async function SessionsPage() {
  const photographer = await getPhotographerRecord();
  if (!photographer) redirect("/dashboard");

  const sessions = await getUpcomingSessions(photographer.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">جلساتي القادمة ({sessions.length})</h1>
      <UpcomingSessionsList sessions={sessions} />
    </div>
  );
}
