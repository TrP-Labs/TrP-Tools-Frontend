import ClientRankManager from './ClientRankManager';
import { fetchGroupRankRecords } from '@/lib/api/groups';
import type { GroupRankRecord } from '@/lib/api/groups';
import type { Rank, RankRelation } from '@/components//dashboard/RankManager';

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
  const records = await fetchGroupRankRecords(groupid);

  const rankMap = new Map<string, Rank>();
  records.forEach((record) => {
    if (!rankMap.has(record.robloxId)) {
      rankMap.set(record.robloxId, toRank(record));
    }
  });

  let ranks = Array.from(rankMap.values());
  if (ranks.length === 0) {
    ranks = buildMockRanks(groupid);
  }

  let relations = records.map(toRelation);
  if (relations.length === 0) {
    relations = buildMockRelations(groupid);
  }

  return (
    <div className="flex flex-col items-center justify-center">
        <ClientRankManager ranks={ranks} relations={relations} groupId={groupid} />
    </div>
  );
} 
