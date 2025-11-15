import { NextRequest, NextResponse } from 'next/server';

// Mock email sending function
async function sendEmail(to: string[], subject: string, body: string) {
  // In a real implementation, this would use SendGrid, Resend, AWS SES, etc.
  // For now, we'll just simulate the API call
  console.log('Sending email:', { to, subject, body });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock success - in production, this would be an actual API call
  return { success: true, messageId: `mock-${Date.now()}` };
}

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emails, noteTitle, noteLink, noteContent } = body;

    // Validate emails
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Please provide at least one email address' },
        { status: 400 }
      );
    }

    // Validate each email
    const invalidEmails = emails.filter((email: string) => !isValidEmail(email.trim()));
    if (invalidEmails.length > 0) {
      return NextResponse.json(
        { error: `Invalid email addresses: ${invalidEmails.join(', ')}` },
        { status: 400 }
      );
    }

    // Prepare email content
    const subject = `Shared Note: ${noteTitle || 'Untitled Note'}`;
    const emailBody = `
Hello,

You've been shared a note: "${noteTitle || 'Untitled Note'}"

${noteLink ? `View note: ${noteLink}` : ''}

${noteContent ? `\nNote content:\n${noteContent.substring(0, 500)}${noteContent.length > 500 ? '...' : ''}` : ''}

---
This email was sent from SprintNotes.
    `.trim();

    // Send emails
    const emailPromises = emails.map((email: string) => 
      sendEmail([email.trim()], subject, emailBody)
    );

    const results = await Promise.allSettled(emailPromises);
    
    // Count successful sends
    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    if (failed > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to send to ${failed} recipient(s). ${successful} email(s) sent successfully.` 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Note shared with ${successful} recipient(s)`,
      recipients: emails.length,
    });
  } catch (error) {
    console.error('Share error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to share note: ${errorMessage}` },
      { status: 500 }
    );
  }
}

