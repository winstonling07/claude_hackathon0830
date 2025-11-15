import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { canvasUrl, apiToken, courseId, assignmentId, content, title } = await request.json();

    if (!canvasUrl || !apiToken || !courseId || !assignmentId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Normalize Canvas URL
    const normalizedUrl = canvasUrl.replace(/\/$/, '');
    const baseUrl = normalizedUrl.startsWith('http') ? normalizedUrl : `https://${normalizedUrl}`;

    // Create a submission for the assignment
    // Note: This creates a text submission. For files, you'd need to upload them first.
    const submissionResponse = await fetch(
      `${baseUrl}/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submission: {
            submission_type: 'online_text_entry',
            body: `<h2>${title || 'Note'}</h2>${content}`,
          },
        }),
      }
    );

    if (!submissionResponse.ok) {
      const errorText = await submissionResponse.text();
      throw new Error(`Canvas API error: ${submissionResponse.status} - ${errorText}`);
    }

    const submission = await submissionResponse.json();

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        submittedAt: submission.submitted_at,
      },
    });
  } catch (error) {
    console.error('Canvas export error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export to Canvas' },
      { status: 500 }
    );
  }
}

