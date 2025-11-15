import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { matchId, senderId, content } = await request.json();

    if (!matchId || !senderId || !content || !content.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verify match exists and is accepted
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .eq('status', 'accepted')
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { error: 'Match not found or not accepted' },
        { status: 404 }
      );
    }

    // Verify sender is part of this match
    if (match.mentor_id !== senderId && match.mentee_id !== senderId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Create message
    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: senderId,
        content: content.trim(),
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error creating message:', insertError);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

