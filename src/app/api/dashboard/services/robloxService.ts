// Roblox API service for group, role, and icon data

export type RobloxGroup = {
  group: {
    id: string;
    name: string;
    icon: string | null;
  };
  role: {
    id: number;
    rank: number;
  };
};

export type RobloxGroupInfo = {
  id: string;
  name: string;
  description: string;
  owner: { userId: string };
};

export type RobloxRole = { id: number; name: string; rank: number; memberCount?: number };

export async function getUserGroups(userId: string): Promise<RobloxGroup[]> {
  const res = await fetch(`https://groups.roblox.com/v1/users/${userId}/groups/roles`);
  if (!res.ok) throw new Error('Failed to fetch user groups');
  const data = await res.json();
  return data.data;
}

export async function getGroupInfo(groupId: string): Promise<RobloxGroupInfo> {
  const res = await fetch(`https://groups.roblox.com/v1/groups/${groupId}`);
  if (!res.ok) throw new Error('Failed to fetch group info');
  return await res.json();
}

export async function getGroupIcons(groupIds: string[]): Promise<{ groupId: string, imageUrl: string }[]> {
  if (groupIds.length === 0) return [];
  const res = await fetch(`https://thumbnails.roblox.com/v1/groups/icons?groupIds=${groupIds.join(',')}&format=webp&size=420x420`);
  if (!res.ok) throw new Error('Failed to fetch group icons');
  const data = await res.json();
  return data.data.map((icon: any) => ({ groupId: icon.targetId.toString(), imageUrl: icon.imageUrl }));
}

export async function getGroupRoles(groupId: string): Promise<RobloxRole[]> {
  console.log(groupId);
  const res = await fetch(`https://groups.roblox.com/v1/groups/${groupId}/roles`);
  if (!res.ok) throw new Error('Failed to fetch group roles');
  const data = await res.json();
  return data.roles;
}
