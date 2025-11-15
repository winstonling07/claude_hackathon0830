import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { canvasUrl, apiToken, courseId } = await request.json();

    if (!canvasUrl || !apiToken || !courseId) {
      return NextResponse.json(
        { error: 'Canvas URL, API token, and course ID are required' },
        { status: 400 }
      );
    }

    // Normalize Canvas URL
    const normalizedUrl = canvasUrl.replace(/\/$/, '');
    const baseUrl = normalizedUrl.startsWith('http') ? normalizedUrl : `https://${normalizedUrl}`;

    // Fetch files for the course
    const response = await fetch(`${baseUrl}/api/v1/courses/${courseId}/files?per_page=100`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Canvas API error: ${response.status}`);
    }

    const files = await response.json();

    // Format files
    const formattedFiles = files.map((file: any) => ({
      id: file.id,
      name: file.display_name || file.filename,
      url: file.url,
      size: file.size,
      contentType: file['content-type'],
      createdAt: file.created_at,
      updatedAt: file.updated_at,
    }));

    return NextResponse.json({
      files: formattedFiles,
    });
  } catch (error) {
    console.error('Canvas files error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

