'use client';

import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Users, MessageCircle, Check, X, Loader2, Sparkles, BookOpen } from 'lucide-react';

interface PotentialMatch {
  id: string;
  email: string;
  role: string;
  subjects: string[];
  commonSubjects: string[];
  matchScore: number;
}

interface Match {
  id: string;
  status: string;
  requestedBy: string;
  otherUser: {
    id: string;
    email: string;
    role: string;
    subjects: string[];
  };
  isMentor: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MatchingSystem() {
  const { user, setCurrentView, setCurrentChatMatchId } = useStore();
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([]);
  const [myMatches, setMyMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'browse' | 'matches'>('browse');
  const [requesting, setRequesting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadMatches();
      loadPotentialMatches();
    }
  }, [user]);

  const loadPotentialMatches = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/matches/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userRole: user.role,
          userSubjects: user.subjects,
        }),
      });

      if (!response.ok) throw new Error('Failed to load potential matches');

      const data = await response.json();
      setPotentialMatches(data.matches || []);
    } catch (err) {
      console.error('Error loading potential matches:', err);
      setError('Failed to load potential matches');
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/matches/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) throw new Error('Failed to load matches');

      const data = await response.json();
      setMyMatches(data.matches || []);
    } catch (err) {
      console.error('Error loading matches:', err);
    }
  };

  const handleRequestMatch = async (targetUserId: string) => {
    if (!user) return;

    setRequesting(targetUserId);
    setError(null);

    try {
      const response = await fetch('/api/matches/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          targetUserId,
          userRole: user.role,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to request match');
      }

      // Reload matches
      await loadMatches();
      await loadPotentialMatches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request match');
    } finally {
      setRequesting(null);
    }
  };

  const handleUpdateMatch = async (matchId: string, status: 'accepted' | 'rejected' | 'ended') => {
    if (!user) return;

    try {
      const response = await fetch('/api/matches/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          userId: user.id,
          status,
        }),
      });

      if (!response.ok) throw new Error('Failed to update match');

      await loadMatches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update match');
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Please sign in to use the matching system</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentoring Matches</h1>
          <p className="text-gray-600">
            {user.role === 'mentor'
              ? 'Connect with mentees who need your expertise'
              : 'Find mentors to help you learn and grow'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'browse'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Browse {user.role === 'mentor' ? 'Mentees' : 'Mentors'}
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'matches'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageCircle className="h-4 w-4 inline mr-2" />
            My Matches ({myMatches.length})
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : activeTab === 'browse' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {potentialMatches.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No potential matches found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Try updating your subjects to find more matches
                </p>
              </div>
            ) : (
              potentialMatches.map((match) => (
                <div
                  key={match.id}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{match.email}</h3>
                      <p className="text-sm text-gray-500 capitalize">{match.role}</p>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm font-medium">{match.matchScore}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Common Subjects:</p>
                    <div className="flex flex-wrap gap-2">
                      {match.commonSubjects.map((subject) => (
                        <span
                          key={subject}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRequestMatch(match.id)}
                    disabled={requesting === match.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {requesting === match.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4" />
                        Request Match
                      </>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {myMatches.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No matches yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Browse potential matches to get started
                </p>
              </div>
            ) : (
              myMatches.map((match) => (
                <div
                  key={match.id}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {match.otherUser.email}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize mb-2">
                        {match.otherUser.role}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {match.otherUser.subjects.slice(0, 3).map((subject) => (
                          <span
                            key={subject}
                            className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                          >
                            {subject}
                          </span>
                        ))}
                        {match.otherUser.subjects.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{match.otherUser.subjects.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        match.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : match.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {match.status}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {match.status === 'pending' && match.requestedBy !== user.id && (
                      <>
                        <button
                          onClick={() => handleUpdateMatch(match.id, 'accepted')}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateMatch(match.id, 'rejected')}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </button>
                      </>
                    )}
                    {match.status === 'accepted' && (
                      <button
                        onClick={() => {
                          setCurrentChatMatchId(match.id);
                          setCurrentView('chat');
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Open Chat
                      </button>
                    )}
                    {match.status === 'accepted' && (
                      <button
                        onClick={() => handleUpdateMatch(match.id, 'ended')}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        End Match
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

