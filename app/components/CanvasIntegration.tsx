'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Download, Upload, Link as LinkIcon, X, Loader2, ChevronDown, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

interface Course {
  id: number;
  name: string;
  code: string;
  term: string | null;
}

interface Assignment {
  id: number;
  name: string;
  description: string;
  dueAt: string | null;
  pointsPossible: number | null;
}

export default function CanvasIntegration() {
  const [canvasUrl, setCanvasUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [connected, setConnected] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { notes, addNote } = useStore();

  // Load saved credentials on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem('canvas-url');
    const savedToken = localStorage.getItem('canvas-token');
    const wasConnected = localStorage.getItem('canvas-connected') === 'true';

    if (savedUrl) setCanvasUrl(savedUrl);
    if (savedToken) setApiToken(savedToken);
    if (wasConnected && savedUrl && savedToken) {
      verifyConnection(savedUrl, savedToken);
    }
  }, []);

  const verifyConnection = async (url: string, token: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/canvas/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasUrl: url, apiToken: token }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to connect to Canvas');
      }

      const data = await response.json();
      setConnected(true);
      setUserName(data.user.name);
      localStorage.setItem('canvas-url', url);
      localStorage.setItem('canvas-token', token);
      localStorage.setItem('canvas-connected', 'true');

      // Fetch courses
      await fetchCourses(url, token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Canvas');
      setConnected(false);
      localStorage.removeItem('canvas-connected');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async (url: string, token: string) => {
    try {
      const response = await fetch('/api/canvas/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasUrl: url, apiToken: token }),
      });

      if (!response.ok) throw new Error('Failed to fetch courses');

      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const fetchAssignments = async (courseId: number) => {
    if (!canvasUrl || !apiToken) return;

    try {
      const response = await fetch('/api/canvas/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasUrl, apiToken, courseId }),
      });

      if (!response.ok) throw new Error('Failed to fetch assignments');

      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      setAssignments([]);
    }
  };

  const handleConnect = () => {
    if (canvasUrl && apiToken) {
      verifyConnection(canvasUrl, apiToken);
    } else {
      setError('Please enter both Canvas URL and API token');
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setCourses([]);
    setSelectedCourse(null);
    setAssignments([]);
    setUserName('');
    localStorage.removeItem('canvas-connected');
    localStorage.removeItem('canvas-url');
    localStorage.removeItem('canvas-token');
  };

  const handleCourseToggle = (course: Course) => {
    if (expandedCourse === course.id) {
      setExpandedCourse(null);
      setAssignments([]);
    } else {
      setExpandedCourse(course.id);
      setSelectedCourse(course);
      fetchAssignments(course.id);
    }
  };

  const handleImportAssignment = async (assignment: Assignment) => {
    if (!canvasUrl || !apiToken) return;

    setImporting(true);
    setError(null);

    try {
      // Find or create "Canvas Imports" folder
      const state = useStore.getState();
      let canvasFolder = state.folders.find((f) => f.name === 'Canvas Imports');
      
      if (!canvasFolder) {
        // Create the folder
        const folderColors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];
        const randomColor = folderColors[Math.floor(Math.random() * folderColors.length)];
        useStore.getState().addFolder('Canvas Imports', randomColor);
        
        // Get the newly created folder
        const newState = useStore.getState();
        canvasFolder = newState.folders.find((f) => f.name === 'Canvas Imports');
      }

      // Create a note from the assignment
      addNote({
        title: assignment.name,
        content: assignment.description || '',
        description: `Imported from Canvas - ${selectedCourse?.name || 'Course'}`,
        type: 'note',
        tags: ['canvas', 'imported', selectedCourse?.code || ''],
        sharedWith: [],
        folderId: canvasFolder?.id,
      });

      alert(`Imported "${assignment.name}" as a new note!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import assignment');
    } finally {
      setImporting(false);
    }
  };

  const handleExportNote = async (assignmentId: number) => {
    if (!canvasUrl || !apiToken || !selectedCourse) return;

    const currentNote = notes[notes.length - 1]; // Get the most recent note
    if (!currentNote) {
      setError('No note selected to export. Please create or select a note first.');
      return;
    }

    setExporting(true);
    setError(null);

    try {
      const response = await fetch('/api/canvas/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canvasUrl,
          apiToken,
          courseId: selectedCourse.id,
          assignmentId,
          title: currentNote.title,
          content: currentNote.content,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to export to Canvas');
      }

      alert(`Successfully exported "${currentNote.title}" to Canvas!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export to Canvas');
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-6 z-40">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-80">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-white" />
            <h3 className="font-semibold text-white">Canvas Integration</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Close Canvas Integration"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {!connected ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Canvas URL
                </label>
                <input
                  type="url"
                  value={canvasUrl}
                  onChange={(e) => setCanvasUrl(e.target.value)}
                  placeholder="https://canvas.university.edu"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Token
                </label>
                <input
                  type="password"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="Your Canvas API token"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                onClick={handleConnect}
                disabled={loading || !canvasUrl || !apiToken}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4" />
                    <span>Connect to Canvas</span>
                  </>
                )}
              </button>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Get your API token from Canvas Account Settings → New Access Token
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Connected as {userName}</span>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Courses List */}
              {courses.length > 0 ? (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  <p className="text-xs font-medium text-gray-700 mb-2">Your Courses:</p>
                  {courses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => handleCourseToggle(course)}
                        className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{course.name}</p>
                          <p className="text-xs text-gray-500">{course.code}</p>
                        </div>
                        {expandedCourse === course.id ? (
                          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {expandedCourse === course.id && (
                        <div className="px-2 pb-2 space-y-1">
                          {assignments.length > 0 ? (
                            assignments.map((assignment) => (
                              <div key={assignment.id} className="bg-gray-50 rounded p-2 text-xs">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{assignment.name}</p>
                                    {assignment.dueAt && (
                                      <p className="text-gray-500 text-xs mt-0.5">
                                        Due: {new Date(assignment.dueAt).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleImportAssignment(assignment)}
                                    disabled={importing}
                                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Import as note"
                                  >
                                    <Download className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500 p-2">No assignments found</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No courses found</p>
              )}

              <div className="space-y-2 pt-2 border-t border-gray-200">
                <button
                  onClick={handleDisconnect}
                  className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Disconnect
                </button>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs">
                <p className="text-orange-800 font-medium mb-1">Quick Features:</p>
                <ul className="text-orange-700 space-y-1">
                  <li>• Sync lecture notes from Canvas</li>
                  <li>• Export flashcards to assignments</li>
                  <li>• Share notes with classmates</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
