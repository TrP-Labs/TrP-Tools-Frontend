import { getStrings } from "@/app/strings";
import { Locale } from "@/../i18n-config";
import { fetchGroupShiftEvents } from "@/lib/api/schedule";
import { fetchGroupRoom } from "@/lib/api/rooms";
import ClientShiftDashboard from "./ClientShiftDashboard";

export default async function ShiftDashboardPage({
  params,
}: {
  params: Promise<{ groupid: string; lang: Locale }>;
}) {
  const { groupid, lang } = await params;

  const [events, room, strings] = await Promise.all([
    fetchGroupShiftEvents(groupid),
    fetchGroupRoom(groupid),
    getStrings(lang),
  ]);
  const serverNow = new Date().toISOString();

  return (
    <ClientShiftDashboard
      groupId={groupid}
      events={events}
      initialRoom={room}
      locale={lang}
      initialNow={serverNow}
      strings={strings.dashboard?.shiftDashboard}
    />
  );
}
