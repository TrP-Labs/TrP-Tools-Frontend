"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import GroupCard from './GroupCard';

const CreateGroupButton: React.FC<any> = ({ group }) => {
  const router = useRouter();

  const handleCreate = async (groupId: number) => {
    try {
      const res = await fetch('/api/dashboard/create-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: groupId }),
      });
      if (res.ok) {
        router.push(`/dashboard/${groupId}`);
      } else {
        alert('Failed to create group.');
      }
    } catch (e) {
      alert('Error creating group.');
    }
  };

  return (
    <GroupCard key={group.id} iconUrl={group.iconUrl} name={group.name} onClick={handleCreate} />
  );
};

export default CreateGroupButton; 