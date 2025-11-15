import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, userRole, userSubjects } = await request.json();

    if (!userId || !userRole || !userSubjects) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Find opposite role users with matching subjects
    const targetRole = userRole === 'mentor' ? 'mentee' : 'mentor';

    // Get all users with the target role
    const { data: potentialMatches, error: fetchError } = await supabase
      .from('users')
      .select('id, email, role, subjects, created_at')
      .eq('role', targetRole)
      .neq('id', userId);

    if (fetchError) {
      console.error('Error fetching potential matches:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch potential matches' },
        { status: 500 }
      );
    }

    // Get existing matches to exclude
    const { data: existingMatches } = await supabase
      .from('matches')
      .select('mentor_id, mentee_id')
      .or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`);

    const excludedIds = new Set<string>();
    if (existingMatches) {
      existingMatches.forEach((match) => {
        if (match.mentor_id === userId) {
          excludedIds.add(match.mentee_id);
        } else {
          excludedIds.add(match.mentor_id);
        }
      });
    }

    // Calculate match scores based on common subjects
    const matchesWithScores = (potentialMatches || [])
      .filter((user) => !excludedIds.has(user.id))
      .map((user) => {
        const userSubjectsArray = Array.isArray(user.subjects) ? user.subjects : [];
        const commonSubjects = userSubjects.filter((subject: string) =>
          userSubjectsArray.includes(subject)
        );
        const matchScore = commonSubjects.length;

        return {
          ...user,
          commonSubjects,
          matchScore,
        };
      })
      .filter((match) => match.matchScore > 0) // Only show matches with at least one common subject
      .sort((a, b) => b.matchScore - a.matchScore); // Sort by match score descending

    return NextResponse.json({
      matches: matchesWithScores,
    });
  } catch (error) {
    console.error('Find matches error:', error);
    return NextResponse.json(
      { error: 'Failed to find matches' },
      { status: 500 }
    );
  }
}

