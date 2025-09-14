"use client";

import React, { useState } from "react";
import RankManager, { Rank, RankRelation } from '@/components//dashboard/RankManager';

interface ClientRankManagerProps {
  ranks: Rank[];
  relations: RankRelation[];
  groupId: string;
}

const API_BASE = "/api/dashboard/rank-relation";

const ClientRankManager: React.FC<ClientRankManagerProps> = ({ ranks, relations: initialRelations, groupId }) => {
  const [relations, setRelations] = useState<RankRelation[]>(initialRelations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to re-fetch relations after mutation
  const refetchRelations = async (groupId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}?groupId=${encodeURIComponent(groupId)}`);
      if (!res.ok) throw new Error("Failed to fetch relations");
      const data = await res.json();
      setRelations(data);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Update permissions
  const onPermissionChange = async (relationId: string, level: number) => {
    setLoading(true);
    setError(null);
    // Optimistic update
    setRelations(relations => relations.map(r => r.id === relationId ? {
      ...r,
      permission_level: level
    } : r));
    try {
      const res = await fetch(API_BASE, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: relationId,
          permission_level: level
        }),
      });
      if (!res.ok) throw new Error("Failed to update permissions");
      await refetchRelations(groupId);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Update color
  const onColorChange = async (relationId: string, color: string) => {
    setLoading(true);
    setError(null);
    setRelations(relations => relations.map(r => r.id === relationId ? { ...r, color } : r));
    try {
      const res = await fetch(API_BASE, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: relationId, color }),
      });
      if (!res.ok) throw new Error("Failed to update color");
      await refetchRelations(groupId);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Update visible state
  const onVisibleChange = async (relationId: string, visible: boolean) => {
    setLoading(true);
    setError(null);
    setRelations(relations => relations.map(r => r.id === relationId ? { ...r, visible } : r));
    try {
      const res = await fetch(API_BASE, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: relationId, visible }),
      });
      if (!res.ok) throw new Error("Failed to update visibility");
      await refetchRelations(groupId);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Delete relation
  const onDelete = async (relationId: string) => {
    setLoading(true);
    setError(null);
    setRelations(relations => relations.filter(r => r.id !== relationId));
    try {
      const res = await fetch(`${API_BASE}?id=${encodeURIComponent(relationId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete relation");
      await refetchRelations(groupId);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Create relation
  const onCreate = async (robloxId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          robloxId
        }),
      });
      console.log(res);
      if (!res.ok) throw new Error("Failed to create relation");
      await refetchRelations(groupId);
    } catch (e: any) {
      setError(e.message || "Unknown error");
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