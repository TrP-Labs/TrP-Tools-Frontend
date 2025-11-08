import { fetchGroupShiftEvents } from "@/lib/api/schedule";
import { getStrings } from "@/app/strings";
import { Locale } from "@/../i18n-config";
import ClientShiftScheduler from "./ClientShiftScheduler";

export default async function GroupShiftSchedulePage({ params }: { params: Promise<{ groupid: string; lang: Locale }> }) {
  const { groupid, lang } = await params;
  const events = await fetchGroupShiftEvents(groupid);
  const strings = await getStrings(lang);
  const schedulerStrings = strings.dashboard?.shiftScheduler;

  return (
    <div className="flex flex-col items-center justify-center">
      <ClientShiftScheduler
        groupId={groupid}
        initialEvents={events}
        locale={lang}
        strings={schedulerStrings}
      />
    </div>
  );
}
