import { NextRequest, NextResponse } from 'next/server';

interface RobloxUserResponse {
  name: string;
  displayName: string;
}

interface RobloxThumbnailResponse {
  data: Array<{
    imageUrl: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate userId format (should be numeric)
    if (!/^\d+$/.test(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Fetch user data from Roblox API
    const userRes = await fetch(`https://users.roblox.com/v1/users/${userId}`, {
      headers: {
        'User-Agent': 'TrPTools/1.0',
      },
    });

    if (!userRes.ok) {
      if (userRes.status === 404) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      throw new Error(`Roblox API error: ${userRes.status}`);
    }

    const userData: RobloxUserResponse = await userRes.json();

    // Fetch thumbnail data
    const thumbRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`,
      {
        headers: {
          'User-Agent': 'TrPTools/1.0',
        },
      }
    );

    if (!thumbRes.ok) {
      console.warn(`Failed to fetch thumbnail for user ${userId}: ${thumbRes.status}`);
    }

    const thumbData: RobloxThumbnailResponse = await thumbRes.json();

    return NextResponse.json({
      username: userData.name,
      displayName: userData.displayName,
      userId: userId,
      profileImage: thumbData.data[0]?.imageUrl || null,
    });
  } catch (error) {
    console.error('Error fetching Roblox user info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user information' },
      { status: 500 }
    );
  }
} 