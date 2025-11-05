"use client";

import React, { useState } from "react";
import RankManager, { Rank, RankRelation } from '@/components//dashboard/RankManager';
import { createGroupRankRecord, deleteGroupRankRecord, fetchGroupRankRecords, updateGroupRankRecord } from "@/lib/api/groups";
import type { GroupRankRecord } from "@/lib/api/groups";

interface ClientRankManagerProps {
  ranks: Rank[];
  relations: RankRelation[];
  groupId: string;
}

const ClientRankManager: React.FC<ClientRankManagerProps> = ({ ranks, relations: initialRelations, groupId }) => {
  const [relations, setRelations] = useState<RankRelation[]>(initialRelations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toRelation = (record: GroupRankRecord): RankRelation => ({
    id: record.id,
    robloxId: record.robloxId,
    color: record.color,
    visible: record.visible,
    permission_level: record.permission_level,
  });

  const isMockRelation = (relationId: string) => relationId.includes('mock');
  const isMockRank = (rankId: string) => rankId.includes('mock');

  // Helper to re-fetch relations after mutation
  const refetchRelations = async (groupId: string) => {
    setLoading(true);
    setError(null);
    try {
      const records = await fetchGroupRankRecords(groupId);
      setRelations(records.map(toRelation));
    } catch (e: any) {
      setError(e?.message || "Failed to fetch rank relations.");
    } finally {
      setLoading(false);
    }
  };

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
      const success = await updateGroupRankRecord(groupId, relationId, { permission_level: level });
      if (!success) throw new Error("Failed to update permissions");
      await refetchRelations(groupId);
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
      const success = await updateGroupRankRecord(groupId, relationId, { color });
      if (!success) throw new Error("Failed to update color");
      await refetchRelations(groupId);
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
      const success = await updateGroupRankRecord(groupId, relationId, { visible });
      if (!success) throw new Error("Failed to update visibility");
      await refetchRelations(groupId);
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
      const success = await deleteGroupRankRecord(groupId, relationId);
      if (!success) throw new Error("Failed to delete relation");
      await refetchRelations(groupId);
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
      await refetchRelations(groupId);
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
