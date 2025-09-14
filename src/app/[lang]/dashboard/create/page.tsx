import { getOwnedNonTrpToolsGroups } from '../../../api/dashboard/services/groupService';
import PageBox from '@/components//dashboard/PageBox';
import { getGroupIcons } from '../../../api/dashboard/services/robloxService';
import CreateGroupButton from '@/components/dashboard/CreateGroupCard';
import Link from 'next/link';

export default async function CreateGroupPage() {
  const groups = await getOwnedNonTrpToolsGroups();
  const groupIds = groups.map((g: any) => g.group.id);
  const icons = await getGroupIcons(groupIds);
  console.log(groups)
  console.log(icons)
  const groupList = groups.map((g: any) => {
    console.log(g)
    const icon = icons.find((icon: any) => icon.groupId == g.group.id);
    console.log(icon)
    return {
      id: g.group.id,
      name: g.group.name,
      iconUrl: icon?.imageUrl || 'https://static.trptools.com/icon.webp',
    };
  });
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
