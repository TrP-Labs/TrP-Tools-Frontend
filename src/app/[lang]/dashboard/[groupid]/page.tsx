import { getGroupById } from '../../../api/dashboard/services/groupService';
import { getGroupInfo, getGroupIcons } from '../../../api/dashboard/services/robloxService';
import PageBox from '@/components//dashboard//PageBox';

export default async function GroupOverviewPage({ params }: { params: { groupid: string } }) {
  const { groupid } = await params;
  const group = await getGroupById(groupid);
  if (!group) return <div className="text-center mt-10">Group not found.</div>;

  // Fetch Roblox group info and icon
  const robloxInfo = await getGroupInfo(group.robloxId);
  const icons = await getGroupIcons([group.robloxId]);
  const iconUrl = icons[0]?.imageUrl || 'https://static.trptools.com/icon.webp';

  // Try to get member count from robloxInfo (Roblox API may use different keys)
  let memberCount = 'N/A';
  if ('memberCount' in robloxInfo) memberCount = (robloxInfo as any).memberCount;
  else if ('member_count' in robloxInfo) memberCount = (robloxInfo as any).member_count;

  return (
    <div className="flex flex-col items-center justify-center">
      <PageBox className="w-full max-w-2xl bg-[var(--background-secondary)] mt-8">
        <div className="flex items-center mb-6">
          <img src={iconUrl} alt={robloxInfo.name} className="w-24 h-24 rounded mr-6 border border-border" />
          <div>
            <h1 className="text-3xl font-bold">{robloxInfo.name}</h1>
            <p className="text-gray-500">Members: {memberCount}</p>
          </div>
        </div>
        <div className="mt-4">
          {/* Placeholder for stats, audit logs, etc. */}
          <p>Group stats and recent activity will appear here.</p>
        </div>
      </PageBox>
    </div>
  );
} 