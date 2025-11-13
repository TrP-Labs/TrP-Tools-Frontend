import ClientRouteManager from "./ClientRouteManager";
import { fetchRoutes } from "@/lib/api/routes";

export default async function GroupRoutesPage({
  params,
}: {
  params: { groupid: string };
}) {
  const { groupid } = await params;
  const routes = await fetchRoutes(groupid);

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <ClientRouteManager groupId={groupid} initialRoutes={routes} />
      </div>
    </div>
  );
}
