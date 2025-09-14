"use client";
import React from 'react';
import PageBox from './PageBox';
import LoadingSpinner from '@/components/LoadingSpinner';
import LargeDropdown from '@/components/settings/LargeDropdown';
import PermissionsSelector from './PermissionSelector';

// Define types for rank and relation
export interface Rank {
  id: string;
  name: string;
  memberCount?: number;
  rank: number;
}

export interface RankRelation {
  id: string;
  robloxId: string;
  color: string;
  visible: boolean;
  permission_level: number;
}

interface RankManagerProps {
  ranks: Rank[];
  relations: RankRelation[];
  onPermissionChange: (relationId: string, level: number) => void;
  onColorChange: (relationId: string, color: string) => void;
  onVisibleChange: (relationId: string, visible: boolean) => void;
  onDelete: (relationId: string) => void;
  onCreate: (robloxId: string) => void;
}

const PERMISSION_LEVELS = [
  { label: 'None', value: 0 },
  { label: 'Dispatch', value: 1 },
  { label: 'Host + Dispatch', value: 2 },
  { label: 'Manage + Host + Dispatch', value: 3 },
];

const RankManager: React.FC<RankManagerProps> = ({
  ranks,
  relations,
  onPermissionChange,
  onColorChange,
  onVisibleChange,
  onDelete,
  onCreate,
}) => {
  const [selectedRank, setSelectedRank] = React.useState('');

  // Prepare dropdown options for LargeDropdown - filter out ranks that are already in relations
  const dropdownOptions = React.useMemo(() => {
    const obj: { [key: string]: { id: string; display: string; rank: number } } = {};
    const existingRankIds = relations.map(rel => rel.robloxId);
    
    ranks.forEach((r) => {
      // Only add ranks that are not already in relations
      if (!existingRankIds.includes(r.id)) {
        obj[r.id] = { id: r.id, display: r.name, rank: r.rank };
      }
    });
    return obj;
  }, [ranks, relations]);

  return (
    <PageBox className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-primary">Manage Group Ranks</h2>
      <p className="text-gray-400 mb-6">Configure permissions, colors, and visibility for each Roblox group rank. Changes are saved instantly.</p>
      <div className="grid gap-4">
        {relations.length === 0 && (
          <div className="text-center text-gray-500 py-8">No rank relations found for this group.</div>
        )}
        {relations.map((rank) => {
          const rankInfo = ranks.find((r) => r.id == rank.robloxId);
          const permLevel = rank.permission_level
          return (
            <div
              key={rankInfo?.rank || rank.robloxId}
              className="bg-card rounded-lg shadow hover:shadow-lg transition px-6 py-5 border border-border mb-2" // needs items center ig?
              style={{ order: Math.abs(255 - Number(rankInfo?.rank)) || 0 }}
            >
              <div className="flex-1 min-w-0 w-full flex sm:flex-row sm:items-center sm:gap-6 gap-2">
                <div className="flex flex-col items-start sm:items-start flex-1 min-w-0">
                  <span className="text-lg font-semibold truncate mb-1">{rankInfo?.name || rank.robloxId}</span>
                  <span className="text-xs text-gray-400">Members: {rankInfo?.memberCount ?? '??'}</span>
                </div>

                {rankInfo?.rank != 255 && (<PermissionsSelector permLevel={permLevel} onPermissionChange={onPermissionChange} rankId={rank.id} />)}

                <div className="flex flex-col items-center top-0">
                  <label className="text-xs text-gray-400 mb-1 top-0">Color</label>
                  <input
                    type="color"
                    value={rank.color}
                    onChange={(e) => onColorChange(rank.id, e.target.value)}
                    className="w-10 h-10 border-none cursor-pointer bg-transparent"
                  />
                </div>
                <div className="flex flex-col items-center gap-2 sm:gap-1">
                  <label className="text-xs text-gray-400 mb-1 top-0">Visible</label>
                  <input
                    type="checkbox"
                    checked={rank.visible}
                    onChange={(e) => onVisibleChange(rank.id, e.target.checked)}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>
                <div className="flex flex-col items-center gap-2 sm:gap-1 mt-2 sm:mt-0">
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    onClick={() => onDelete(rank.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <hr className="my-8 border-border" />
      <h2 className="text-2xl font-bold mb-2 text-primary">Select a rank to add</h2>
      {Object.keys(dropdownOptions).length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          All available ranks have already been added to this group.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <LargeDropdown
            currentSelection={selectedRank || Object.keys(dropdownOptions)[0] || ''}
            selection={dropdownOptions}
            effect={setSelectedRank}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
            onClick={() => selectedRank && onCreate(selectedRank)}
            disabled={!selectedRank}
          >
            Add Rank
          </button>
        </div>
      )}
    </PageBox>
  );
};

export default RankManager;
