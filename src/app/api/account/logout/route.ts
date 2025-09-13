import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, invalidateSession, deleteSessionTokenCookie } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const { session } = await getCurrentSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'No active session found' },
        { status: 401 }
      );
    }

    await invalidateSession(session.id);
    await deleteSessionTokenCookie();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
} 