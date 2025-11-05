import PageBox from '@/components//dashboard//PageBox';
import { fetchGroupDetail } from '@/lib/api/groups';

const buildMockGroup = (groupId: string) => ({
  name: `Group ${groupId}`,
  iconUrl: 'https://static.trptools.com/icon.webp',
  members: 'N/A',
  description: 'Group details are currently unavailable.',
});

export default async function GroupOverviewPage({ params }: { params: { groupid: string } }) {
  const { groupid } = await params;
  const group = await fetchGroupDetail(groupid);
  if (!group) {
    const fallback = buildMockGroup(groupid);
    return (
      <div className="flex flex-col items-center justify-center">
        <PageBox className="w-full max-w-2xl bg-[var(--background-secondary)] mt-8">
          <div className="flex items-center mb-6">
            <img src={fallback.iconUrl} alt={fallback.name} className="w-24 h-24 rounded mr-6 border border-border" />
            <div>
              <h1 className="text-3xl font-bold">{fallback.name}</h1>
              <p className="text-gray-500">Members: {fallback.members}</p>
            </div>
          </div>
          <div className="mt-4">
            <p>{fallback.description}</p>
          </div>
        </PageBox>
      </div>
    );
  }

  const iconUrl = group.iconUrl || 'https://static.trptools.com/icon.webp';
  const memberCount = group.members ?? 'N/A';

  return (
    <div className="flex flex-col items-center justify-center">
      <PageBox className="w-full max-w-2xl bg-[var(--background-secondary)] mt-8">
        <div className="flex items-center mb-6">
          <img src={iconUrl} alt={group.name} className="w-24 h-24 rounded mr-6 border border-border" />
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
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
