'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Bell, Mail, Calendar, GraduationCap, BookOpen, X, Check, XCircle, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';

interface MatchRequest {
  id: string;
  status: string;
  requestedBy: string;
  otherUser: {
    id: string;
    email: string;
    role: 'mentor' | 'mentee';
    subjects: string[];
  };
  isMentor: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProfileDropdown() {
  const { user, logout } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>('profile');
  const [notifications, setNotifications] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && activeTab === 'notifications' && user) {
      fetchNotifications();
    }
  }, [isOpen, activeTab, user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/matches/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) throw new Error('Failed to fetch notifications');

      const data = await response.json();
      // Filter for pending requests (notifications)
      const pendingRequests = (data.matches || []).filter(
        (match: MatchRequest) => match.status === 'pending' && match.requestedBy !== user.id
      );
      setNotifications(pendingRequests);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptMatch = async (matchId: string) => {
    try {
      const response = await fetch('/api/matches/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          status: 'accepted',
        }),
      });

      if (!response.ok) throw new Error('Failed to accept match');

      // Remove from notifications
      setNotifications((prev) => prev.filter((n) => n.id !== matchId));
    } catch (error) {
      console.error('Error accepting match:', error);
      alert('Failed to accept match request');
    }
  };

  const handleRejectMatch = async (matchId: string) => {
    try {
      const response = await fetch('/api/matches/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          status: 'rejected',
        }),
      });

      if (!response.ok) throw new Error('Failed to reject match');

      // Remove from notifications
      setNotifications((prev) => prev.filter((n) => n.id !== matchId));
    } catch (error) {
      console.error('Error rejecting match:', error);
      alert('Failed to reject match request');
    }
  };

  if (!user) return null;

  const getInitials = () => {
    const email = user.email || '';
    return email.charAt(0).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
      >
        <span className="text-lg font-semibold">{getInitials()}</span>
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            {/* Header Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </div>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'notifications'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                  {notifications.length > 0 && (
                    <span className="absolute top-2 right-4 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </div>
              </button>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {activeTab === 'profile' ? (
                <div className="p-6 space-y-6">
                  {/* Profile Header */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold mb-3">
                      {getInitials()}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{user.email}</h2>
                    <p className="text-sm text-gray-500 capitalize mt-1">{user.role}</p>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Email Address</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-700">{user.email}</span>
                    </div>
                  </div>

                  {/* Birthday */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Birthday</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-700">{formatDate(user.birthday)}</span>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Role</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {user.role === 'mentor' ? (
                        <GraduationCap className="h-5 w-5 text-purple-500" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-blue-500" />
                      )}
                      <span className="text-sm text-gray-700 capitalize font-medium">{user.role}</span>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      {user.role === 'mentor' ? 'Subjects You Teach' : 'Subjects You\'re Learning'}
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {user.subjects && user.subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.subjects.map((subject, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-full"
                            >
                              {subject.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No subjects selected</p>
                      )}
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                      window.location.reload();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="p-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No new notifications</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.otherUser.role === 'mentor' ? 'Mentor' : 'Mentee'} Request
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                From: {notification.otherUser.email}
                              </p>
                            </div>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                              Pending
                            </span>
                          </div>

                          {notification.otherUser.subjects && notification.otherUser.subjects.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-gray-500 mb-1">Subjects:</p>
                              <div className="flex flex-wrap gap-1">
                                {notification.otherUser.subjects.slice(0, 3).map((subject, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                                  >
                                    {subject.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                  </span>
                                ))}
                                {notification.otherUser.subjects.length > 3 && (
                                  <span className="px-2 py-0.5 text-gray-500 text-xs">
                                    +{notification.otherUser.subjects.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptMatch(notification.id)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                            >
                              <Check className="h-4 w-4" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectMatch(notification.id)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

