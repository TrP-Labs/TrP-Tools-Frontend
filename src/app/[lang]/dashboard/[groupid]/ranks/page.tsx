import ClientRankManager from './ClientRankManager';
import { fetchCreatableGroupRanks, fetchGroupRankRecords } from '@/lib/api/groups';
import type { GroupRankRecord, CreatableGroupRank } from '@/lib/api/groups';
import type { Rank, RankRelation } from '@/components/dashboard/RankManager';

const buildMockRanks = (groupId: string): Rank[] => ([
  { id: `${groupId}-mock-1`, name: `Rank A (${groupId})`, memberCount: null, rank: 1 },
  { id: `${groupId}-mock-2`, name: `Rank B (${groupId})`, memberCount: null, rank: 2 },
]);

const buildMockRelations = (groupId: string): RankRelation[] => ([
  { id: `${groupId}-mock-rel-1`, robloxId: `${groupId}-mock-1`, color: '#ffffff', visible: false, permission_level: 0 },
]);

const toRank = (record: GroupRankRecord): Rank => ({
  id: record.robloxId,
  name: record.cached_name,
  memberCount: null,
  rank: record.cached_rank,
});

const toRelation = (record: GroupRankRecord): RankRelation => ({
  id: record.id,
  robloxId: record.robloxId,
  color: record.color,
  visible: record.visible,
  permission_level: record.permission_level,
});

export default async function GroupRanksPage({ params }: { params: { groupid: string } }) {
  const { groupid } = await params;
  const [records, creatableRankOptions] = await Promise.all([
    fetchGroupRankRecords(groupid),
    fetchCreatableGroupRanks(groupid),
  ]);

  let ranks = records.map(toRank);
  if (ranks.length === 0) {
    ranks = buildMockRanks(groupid);
  }

  let relations = records.map(toRelation);
  if (relations.length === 0) {
    relations = buildMockRelations(groupid);
  }

  let creatableRanks: CreatableGroupRank[] = creatableRankOptions;
  if (creatableRanks.length === 0) {
    creatableRanks = ranks.map((rank) => ({
      robloxId: rank.id,
      name: rank.name,
      order: rank.rank,
    }));
  }

  return (
    <div className="flex flex-col items-center justify-center">
        <ClientRankManager ranks={ranks} relations={relations} creatableRanks={creatableRanks} groupId={groupid} />
    </div>
  );
} 
