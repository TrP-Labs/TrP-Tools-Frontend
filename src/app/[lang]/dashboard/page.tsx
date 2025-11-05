import GroupList from '@/components//dashboard/GroupList';
import PageBox from '@/components//dashboard/PageBox';
import Link from 'next/link';
import { fetchGroups, type GroupSummary } from '@/lib/api/groups';

const withPlaceholders = (group: GroupSummary) => ({
  id: group.id,
  name: group.name || `Group ${group.robloxId}`,
  iconUrl: group.iconUrl || 'https://static.trptools.com/icon.webp',
});

export default async function DashboardPage() {
  const groups = await fetchGroups();
  const groupList = groups.map(withPlaceholders);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <PageBox className="w-full max-w-4xl bg-[var(--background-secondary)]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Select a group to manage</h1>
          <Link href={"/dashboard/create"} className="bg-white text-black px-4 py-2 rounded-full hover:bg-blue-600 transition">Create Group</Link>
        </div>
        <GroupList groups={groupList} />
      </PageBox>
    </div>
  );
}
