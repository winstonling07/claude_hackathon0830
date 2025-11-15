import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, targetUserId, userRole } = await request.json();

    if (!userId || !targetUserId || !userRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Determine mentor and mentee IDs
    const mentorId = userRole === 'mentor' ? userId : targetUserId;
    const menteeId = userRole === 'mentee' ? userId : targetUserId;

    // Check if match already exists
    const { data: existingMatch } = await supabase
      .from('matches')
      .select('*')
      .eq('mentor_id', mentorId)
      .eq('mentee_id', menteeId)
      .single();

    if (existingMatch) {
      return NextResponse.json(
        { error: 'Match request already exists' },
        { status: 409 }
      );
    }

    // Create match request
    const { data: newMatch, error: insertError } = await supabase
      .from('matches')
      .insert({
        mentor_id: mentorId,
        mentee_id: menteeId,
        status: 'pending',
        requested_by: userId,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error creating match request:', insertError);
      return NextResponse.json(
        { error: 'Failed to create match request' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      match: newMatch,
    });
  } catch (error) {
    console.error('Request match error:', error);
    return NextResponse.json(
      { error: 'Failed to request match' },
      { status: 500 }
    );
  }
}

