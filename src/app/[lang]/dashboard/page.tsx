import { getUserManageableGroups } from '../../api/dashboard/services/groupService';
import GroupList from './components/GroupList';
import PageBox from './components/PageBox';

export default async function DashboardPage() {
  const groups = await getUserManageableGroups();
  // Map to GroupList format
  const groupList = groups.map((g: any) => ({
    id: g.trptoolsGroup.id,
    name: g.robloxGroup?.group?.name || 'Unknown',
    iconUrl: g.iconId || 'https://static.trptools.com/icon.webp',
  }));
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <PageBox className="w-full max-w-4xl bg-[var(--background-secondary)]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Select a group to manage</h1>
          <a href="/dashboard/create" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Create Group</a>
        </div>
        <GroupList groups={groupList} />
      </PageBox>
    </div>
  );
}
