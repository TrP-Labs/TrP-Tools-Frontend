import PageBox from '@/components//dashboard/PageBox';
import CreateGroupButton from '@/components/dashboard/CreateGroupCard';
import Link from 'next/link';
import { fetchCreatableGroups, type GroupSummary } from '@/lib/api/groups';

const withPlaceholders = (group: GroupSummary) => ({
  id: group.id,
  name: group.name || `Group ${group.robloxId}`,
  iconUrl: group.iconUrl || 'https://static.trptools.com/icon.webp',
  robloxId: group.robloxId,
});

export default async function CreateGroupPage() {
  const groups = await fetchCreatableGroups();
  const groupList = groups.map(withPlaceholders);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <PageBox className="w-full max-w-3xl bg-[var(--background-secondary)]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Select a group to add</h1>
          <Link href={"/dashboard"} className="bg-white text-black px-4 py-2 rounded-full hover:bg-blue-600 transition">Back to groups</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {groupList.map((group) => (
            <CreateGroupButton group={group} key={group.id} />
          ))}
        </div>
      </PageBox>
    </div>
  );
}
