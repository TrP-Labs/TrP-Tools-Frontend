"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import GroupCard from './GroupCard';
import { createGroup } from '@/lib/api/groups';

interface CreatableGroup {
  id: string;
  name: string;
  iconUrl: string | null;
  robloxId: string;
}

const CreateGroupButton: React.FC<{ group: CreatableGroup }> = ({ group }) => {
  const router = useRouter();

  const handleCreate = async () => {
    try {
      const result = await createGroup(group.robloxId);
      if (result?.id) {
        router.push(`/dashboard/${result.id}`);
      } else {
        alert('Failed to create group.');
      }
    } catch (e) {
      alert('Error creating group.');
    }
  };

  return (
    <GroupCard key={group.id} iconUrl={group.iconUrl ?? 'https://static.trptools.com/icon.webp'} name={group.name} onClick={handleCreate} />
  );
};

export default CreateGroupButton; 
