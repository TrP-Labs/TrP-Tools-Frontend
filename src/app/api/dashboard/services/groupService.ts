import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { getCurrentSession } from '@/lib/auth/session';
import { getUserGroups, getGroupIcons, getGroupRoles, RobloxGroup } from './robloxService';

export async function getUserManageableGroups() {
  const { user } = await getCurrentSession();
  if (!user) throw new Error('Not authenticated');

  // Fetch Roblox groups
  const groupData: RobloxGroup[] = await getUserGroups(user.robloxId);
  if (!groupData) return [];

  // Fetch groups from DB
  const trptoolsGroups = await prisma.group.findMany({
    where: {
      robloxId: {
        in: groupData.map((group: RobloxGroup) => group.group.id.toString()),
      },
    },
    include: { ranks: true },
  });

  // Filter for admin groups
  const adminGroups = trptoolsGroups.filter((group: any) => {
    return group.ranks.some((rankRelation: any) => {
      const matchingGroup = groupData.find((g: RobloxGroup) => g.group.id == group.robloxId);
      return (
        matchingGroup &&
        rankRelation.robloxId === matchingGroup.role.id.toString() &&
        (rankRelation.permission_manage ||
          rankRelation.permission_host ||
          rankRelation.permission_dispatch)
      );
    });
  });

  // Fetch icons
  const groupIds = adminGroups.map((group: any) => group.robloxId);
  const iconsData = await getGroupIcons(groupIds);

  // Combine data
  return adminGroups.map((group: any) => {
    const matchingGroup = groupData.find((g: RobloxGroup) => g.group.id == group.robloxId);
    const iconData = iconsData.find((icon: any) => icon.groupId == group.robloxId);
    return {
      trptoolsGroup: group,
      robloxGroup: matchingGroup,
      iconId: iconData?.imageUrl || null,
    };
  });
}

export async function getOwnedNonTrpToolsGroups() {
  const { user } = await getCurrentSession();
  if (!user) throw new Error('Not authenticated');
  const groupData: RobloxGroup[] = await getUserGroups(user.robloxId);
  if (!groupData) return [];
  const trptoolsGroups = await prisma.group.findMany({
    where: {
      robloxId: {
        in: groupData.map((group: RobloxGroup) => group.group.id.toString()),
      },
    },
  });
  return groupData.filter((group: RobloxGroup) => {
    const matchingGroup = trptoolsGroups.find((g: any) => g.robloxId == group.group.id);
    return !matchingGroup && group.role.rank === 255;
  });
}

export async function getGroupById(id: string) {
  return prisma.group.findUnique({ where: { id } });
}

export async function getGroupRanks(groupId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new Error('Group not found.');
  }

  return await getGroupRoles(group.robloxId);
}

export async function getRankRelations(groupId: string) {
  return prisma.rankRelation.findMany({ where: { groupId } });
}

// Add create, update, delete rank relation functions as needed
