import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, subjects } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(subjects)) {
      return NextResponse.json(
        { error: 'Subjects must be an array' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Update user subjects in Supabase
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ subjects })
      .eq('id', userId)
      .select('id, email, role, subjects, birthday')
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user subjects' },
        { status: 500 }
      );
    }

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        subjects: updatedUser.subjects,
        birthday: updatedUser.birthday,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to update user: ${errorMessage}` },
      { status: 500 }
    );
  }
}

