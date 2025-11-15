import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Get all matches for this user
    const { data: matches, error: fetchError } = await supabase
      .from('matches')
      .select(`
        *,
        mentor:users!matches_mentor_id_fkey(id, email, role, subjects),
        mentee:users!matches_mentee_id_fkey(id, email, role, subjects)
      `)
      .or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching matches:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch matches' },
        { status: 500 }
      );
    }

    // Format matches to include the other user's info
    const formattedMatches = (matches || []).map((match: any) => {
      const otherUser =
        match.mentor_id === userId ? match.mentee : match.mentor;
      const isMentor = match.mentor_id === userId;

      return {
        id: match.id,
        status: match.status,
        requestedBy: match.requested_by,
        otherUser: {
          id: otherUser.id,
          email: otherUser.email,
          role: otherUser.role,
          subjects: otherUser.subjects,
        },
        isMentor,
        createdAt: match.created_at,
        updatedAt: match.updated_at,
      };
    });

    return NextResponse.json({
      matches: formattedMatches,
    });
  } catch (error) {
    console.error('List matches error:', error);
    return NextResponse.json(
      { error: 'Failed to list matches' },
      { status: 500 }
    );
  }
}

