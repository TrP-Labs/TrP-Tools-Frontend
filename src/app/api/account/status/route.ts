import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const result = await getCurrentSession();
    
    return NextResponse.json({
      authenticated: result.session !== null,
      user: result.user ? { id: result.user.id, robloxId: result.user.robloxId } : null
    });
  } catch (error) {
    console.error('Account status error:', error);
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 500 }
    );
  }
} 