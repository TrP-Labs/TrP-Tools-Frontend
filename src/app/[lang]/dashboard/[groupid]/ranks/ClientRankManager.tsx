"use client";

import React, { useState } from "react";
import RankManager, { Rank, RankRelation } from '@/components/dashboard/RankManager';
import { createGroupRankRecord, deleteGroupRankRecord, fetchCreatableGroupRanks, fetchGroupRankRecords, updateGroupRankRecord } from "@/lib/api/groups";
import type { GroupRankRecord, CreatableGroupRank } from "@/lib/api/groups";

interface ClientRankManagerProps {
  ranks: Rank[];
  relations: RankRelation[];
  creatableRanks: CreatableGroupRank[];
  groupId: string;
}

const ClientRankManager: React.FC<ClientRankManagerProps> = ({ ranks, relations: initialRelations, creatableRanks: initialCreatableRanks, groupId }) => {
  const [relations, setRelations] = useState<RankRelation[]>(initialRelations);
  const [creatableRanks, setCreatableRanks] = useState<CreatableGroupRank[]>(initialCreatableRanks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toRelation = (record: GroupRankRecord): RankRelation => ({
    id: record.id,
    robloxId: record.robloxId,
    color: record.color,
    visible: record.visible,
    permission_level: record.permission_level,
  });

  const buildFallbackCreatableRanks = (records: GroupRankRecord[]): CreatableGroupRank[] =>
    records.map((record) => ({
      robloxId: record.robloxId,
      name: record.cached_name,
      order: record.cached_rank,
    }));

  const isMockRelation = (relationId: string) => relationId.includes('mock');
  const isMockRank = (rankId: string) => rankId.includes('mock');

  // Helper to re-fetch relations and available ranks after mutation
  const refetchGroupData = async (groupId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [records, available] = await Promise.all([
        fetchGroupRankRecords(groupId),
        fetchCreatableGroupRanks(groupId),
      ]);
      setRelations(records.map(toRelation));
      const fallbackOptions = buildFallbackCreatableRanks(records);
      setCreatableRanks((prev) => {
        if (available.length) return available;
        if (fallbackOptions.length) return fallbackOptions;
        return prev;
      });
    } catch (e: any) {
      setError(e?.message || "Failed to fetch rank data.");
    } finally {
      setLoading(false);
    }
  };

  const lastFetchedGroup = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (lastFetchedGroup.current === groupId) return;
    lastFetchedGroup.current = groupId;
    refetchGroupData(groupId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  // Update permissions
  const onPermissionChange = async (relationId: string, level: number) => {
    if (isMockRelation(relationId)) {
      setError("Placeholder data cannot be modified.");
      return;
    }
    setLoading(true);
    setError(null);
    // Optimistic update
    setRelations(relations => relations.map(r => r.id === relationId ? {
      ...r,
      permission_level: level
    } : r));
    try {
      const success = await updateGroupRankRecord(relationId, { permission_level: level });
      if (!success) throw new Error("Failed to update permissions");
      await refetchGroupData(groupId);
    } catch (e: any) {
      setError(e?.message || "Failed to update permissions.");
    } finally {
      setLoading(false);
    }
  };

  // Update color
  const onColorChange = async (relationId: string, color: string) => {
    if (isMockRelation(relationId)) {
      setError("Placeholder data cannot be modified.");
      return;
    }
    setLoading(true);
    setError(null);
    setRelations(relations => relations.map(r => r.id === relationId ? { ...r, color } : r));
    try {
      const success = await updateGroupRankRecord(relationId, { color });
      if (!success) throw new Error("Failed to update color");
      await refetchGroupData(groupId);
    } catch (e: any) {
      setError(e?.message || "Failed to update color.");
    } finally {
      setLoading(false);
    }
  };

  // Update visible state
  const onVisibleChange = async (relationId: string, visible: boolean) => {
    if (isMockRelation(relationId)) {
      setError("Placeholder data cannot be modified.");
      return;
    }
    setLoading(true);
    setError(null);
    setRelations(relations => relations.map(r => r.id === relationId ? { ...r, visible } : r));
    try {
      const success = await updateGroupRankRecord(relationId, { visible });
      if (!success) throw new Error("Failed to update visibility");
      await refetchGroupData(groupId);
    } catch (e: any) {
      setError(e?.message || "Failed to update visibility.");
    } finally {
      setLoading(false);
    }
  };

  // Delete relation
  const onDelete = async (relationId: string) => {
    if (isMockRelation(relationId)) {
      setError("Placeholder data cannot be modified.");
      return;
    }
    setLoading(true);
    setError(null);
    setRelations(relations => relations.filter(r => r.id !== relationId));
    try {
      const success = await deleteGroupRankRecord(relationId);
      if (!success) throw new Error("Failed to delete relation");
      await refetchGroupData(groupId);
    } catch (e: any) {
      setError(e?.message || "Failed to delete relation.");
    } finally {
      setLoading(false);
    }
  };

  // Create relation
  const onCreate = async (robloxId: string) => {
    if (isMockRank(robloxId)) {
      setError("Placeholder ranks cannot be created.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const record = await createGroupRankRecord(groupId, robloxId);
      if (!record) throw new Error("Failed to create relation");
      await refetchGroupData(groupId);
    } catch (e: any) {
      setError(e?.message || "Failed to create relation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <RankManager
        ranks={ranks}
        relations={relations}
        creatableRanks={creatableRanks}
        onPermissionChange={onPermissionChange}
        onColorChange={onColorChange}
        onVisibleChange={onVisibleChange}
        onDelete={onDelete}
        onCreate={onCreate}
      />
      {loading && <div className="text-gray-500 mt-2">Loading...</div>}
    </>
  );
};

export default ClientRankManager; 
