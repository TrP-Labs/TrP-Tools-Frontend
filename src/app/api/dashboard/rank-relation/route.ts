import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: List all rank relations for a group
export async function GET(req: NextRequest) {
  const groupId = req.nextUrl.searchParams.get('groupId');
  if (!groupId) {
    return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });
  }
  try {
    const relations = await prisma.rankRelation.findMany({ where: { groupId } });
    return NextResponse.json(relations);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch relations' }, { status: 500 });
  }
}

// POST: Create a new rank relation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { groupId, robloxId, color, visible, permission_manage, permission_host, permission_dispatch } = body;
    if (!groupId || !robloxId) {
      return NextResponse.json({ error: 'Missing groupId or robloxId' }, { status: 400 });
    }
    const created = await prisma.rankRelation.create({
      data: {
        groupId,
        robloxId,
        color: color || '#ffffff',
        visible: visible ?? true,
        permission_manage: !!permission_manage,
        permission_host: !!permission_host,
        permission_dispatch: !!permission_dispatch,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create relation' }, { status: 500 });
  }
}

// PATCH: Update a rank relation
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    const updated = await prisma.rankRelation.update({
      where: { id },
      data: updates,
    });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update relation' }, { status: 500 });
  }
}

// DELETE: Delete a rank relation
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  try {
    await prisma.rankRelation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete relation' }, { status: 500 });
  }
} 