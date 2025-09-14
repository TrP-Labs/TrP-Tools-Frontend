'use server';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  console.log('Creating group');
  try {
    const { groupId } = await req.json();
    if (!groupId) return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });

    // Fetch group info from Roblox
    const groupRes = await fetch(`https://groups.roblox.com/v1/groups/${groupId}`);
    if (!groupRes.ok) return NextResponse.json({ error: 'Failed to fetch group info' }, { status: 400 });
    const groupData = await groupRes.json();

    // Fetch group roles
    const rolesRes = await fetch(`https://groups.roblox.com/v1/groups/${groupId}/roles`);
    if (!rolesRes.ok) return NextResponse.json({ error: 'Failed to fetch group roles' }, { status: 400 });
    const rolesData = await rolesRes.json();
    const ownerRole = rolesData.roles.find((role: any) => role.rank === 255);
    if (!ownerRole) return NextResponse.json({ error: 'No owner role found' }, { status: 400 });

    // Check if group already exists
    const existing = await prisma.group.findFirst({ where: { robloxId: groupId.toString() } });
    if (existing) return NextResponse.json({ error: 'Group already exists' }, { status: 400 });

    // Create group in DB
    await prisma.group.create({
      data: {
        robloxId: groupId.toString(),
        ranks: {
          create: {
            robloxId: ownerRole.id.toString(),
            color: '#9b59b6',
            visible: true,
            permission_level: 3
          },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
