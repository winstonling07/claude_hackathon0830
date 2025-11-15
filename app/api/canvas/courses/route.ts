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

    // Normalize Canvas URL
    const normalizedUrl = canvasUrl.replace(/\/$/, '');
    const baseUrl = normalizedUrl.startsWith('http') ? normalizedUrl : `https://${normalizedUrl}`;

    // Fetch user's courses
    const response = await fetch(`${baseUrl}/api/v1/courses?enrollment_type=student&enrollment_role=StudentEnrollment&per_page=100`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Canvas API error: ${response.status}`);
    }

    const courses = await response.json();

    // Filter and format courses
    const formattedCourses = courses
      .filter((course: any) => course.course_code && course.name) // Only active courses with names
      .map((course: any) => ({
        id: course.id,
        name: course.name,
        code: course.course_code,
        term: course.term?.name || null,
        enrollmentTermId: course.enrollment_term_id,
      }));

    return NextResponse.json({
      courses: formattedCourses,
    });
  } catch (error) {
    console.error('Canvas courses error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

