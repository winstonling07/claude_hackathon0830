import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { matchId, userId, status } = await request.json();

    if (!matchId || !userId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['accepted', 'rejected', 'ended'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be accepted, rejected, or ended' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verify user is part of this match
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (fetchError || !match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    if (match.mentor_id !== userId && match.mentee_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update match status
    const { data: updatedMatch, error: updateError } = await supabase
      .from('matches')
      .update({ status })
      .eq('id', matchId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating match:', updateError);
      return NextResponse.json(
        { error: 'Failed to update match' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      match: updatedMatch,
    });
  } catch (error) {
    console.error('Update match error:', error);
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    );
  }
}

