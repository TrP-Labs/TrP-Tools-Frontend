"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Group {
  id: string;
  name: string;
  iconUrl: string;
}

interface CreateGroupButtonProps {
  group: Group;
}

const CreateGroupButton: React.FC<CreateGroupButtonProps> = ({ group }) => {
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const router = useRouter();
  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/create-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: group.id }),
      });
      console.log(res);
      if (res.ok) {
        console.log(res)
        setCreated(true);
        // Redirect to the new group page
        router.push(`/dashboard/${group.id}`);
      } else {
        alert('Failed to create group.');
      }
    } catch (e) {
      alert('Error creating group.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center bg-[var(--background-secondary-muted)] rounded-lg shadow p-4 w-40 h-64">
      <img src={group.iconUrl} alt={group.name} className="w-24 h-24 rounded mb-2 object-cover" />
      <span className="text-lg font-semibold text-center truncate w-full mb-2">{group.name}</span>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600 transition disabled:opacity-50 mt-auto cursor-pointer"
        onClick={handleCreate}
        disabled={loading || created}
      >
        {created ? 'Created!' : loading ? 'Creating...' : 'Create'}
      </button>
    </div>
  );
};

export default CreateGroupButton; 