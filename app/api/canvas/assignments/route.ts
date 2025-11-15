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

    // Fetch assignments for the course
    const response = await fetch(`${baseUrl}/api/v1/courses/${courseId}/assignments?per_page=100`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Canvas API error: ${response.status}`);
    }

    const assignments = await response.json();

    // Format assignments
    const formattedAssignments = assignments.map((assignment: any) => ({
      id: assignment.id,
      name: assignment.name,
      description: assignment.description || '',
      dueAt: assignment.due_at,
      pointsPossible: assignment.points_possible,
      submissionTypes: assignment.submission_types || [],
    }));

    return NextResponse.json({
      assignments: formattedAssignments,
    });
  } catch (error) {
    console.error('Canvas assignments error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

