import { getOwnedNonTrpToolsGroups } from '../../../api/dashboard/services/groupService';
import GroupList from '@/components//dashboard/GroupList';
import PageBox from '@/components//dashboard/PageBox';
import { getGroupIcons } from '../../../api/dashboard/services/robloxService';
import CreateGroupButton from '@/components//dashboard/CreateGroupButton';

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
        <h1 className="text-3xl font-bold mb-6">Select a group to add</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {groupList.map((group) => (
            <CreateGroupButton key={group.id} group={group} />
          ))}
        </div>
      </PageBox>
    </div>
  );
}
