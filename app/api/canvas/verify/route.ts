import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { canvasUrl, apiToken } = await request.json();

    if (!canvasUrl || !apiToken) {
      return NextResponse.json(
        { error: 'Canvas URL and API token are required' },
        { status: 400 }
      );
    }

    // Normalize Canvas URL (remove trailing slash, ensure https)
    const normalizedUrl = canvasUrl.replace(/\/$/, '');
    const baseUrl = normalizedUrl.startsWith('http') ? normalizedUrl : `https://${normalizedUrl}`;

    // Verify connection by fetching current user info
    const response = await fetch(`${baseUrl}/api/v1/users/self`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API token. Please check your token and try again.' },
          { status: 401 }
        );
      }
      throw new Error(`Canvas API error: ${response.status}`);
    }

    const user = await response.json();

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.primary_email,
      },
    });
  } catch (error) {
    console.error('Canvas verification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to Canvas' },
      { status: 500 }
    );
  }
}

