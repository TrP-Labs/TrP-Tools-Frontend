import { getGroupRanks, getRankRelations } from '../../../../api/dashboard/services/groupService';
import PageBox from '@/components//dashboard/PageBox';
import ClientRankManager from './ClientRankManager';

export default async function GroupRanksPage({ params }: { params: { groupid: string } }) {
  const { groupid } = await params;
  console.log(groupid);
  const robloxRanks = await getGroupRanks(groupid);
  console.log(robloxRanks);
  const ranks = robloxRanks.map((r: any) => ({
    id: r.id.toString(),
    name: r.name,
    memberCount: r.memberCount,
    rank: r.rank,
  }));
  console.log(ranks);
  const relations = await getRankRelations(groupid);
  console.log(relations);
  // Pass data to RankManager client component
  return (
    <div className="flex flex-col items-center justify-center">
        <ClientRankManager ranks={ranks} relations={relations} groupId={groupid} />
    </div>
  );
} 