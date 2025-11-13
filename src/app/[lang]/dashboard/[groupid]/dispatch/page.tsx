import { Locale } from "@/../i18n-config";
import DispatchClient from "./DispatchClient";
import { fetchGroupDetail } from "@/lib/api/groups";
import { fetchGroupRoom } from "@/lib/api/rooms";

export default async function DispatchPage({
  params,
}: {
  params: Promise<{ groupid: string; lang: Locale }>;
}) {
  const { groupid } = await params;

  const [group, room] = await Promise.all([fetchGroupDetail(groupid), fetchGroupRoom(groupid)]);

  return (
    <DispatchClient
      groupId={groupid}
      groupName={group?.name ?? null}
      initialRoomId={room?.roomId ?? null}
    />
  );
}
