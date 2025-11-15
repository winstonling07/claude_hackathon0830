'use client';

import { useState, useEffect } from 'react';
import { X, BookOpen, FileText, ChevronDown, ChevronRight, Loader2, AlertCircle, Link as LinkIcon } from 'lucide-react';

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

interface CanvasFile {
  id: number;
  name: string;
  url: string;
  size: number;
  contentType: string;
  createdAt: string;
  updatedAt: string;
}

interface CanvasCoursesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile?: (file: { name: string; url: string; type: 'assignment' | 'file' }) => void;
}

export default function CanvasCoursesModal({ isOpen, onClose, onSelectFile }: CanvasCoursesModalProps) {
  const [canvasUrl, setCanvasUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<{ [courseId: number]: Assignment[] }>({});
  const [files, setFiles] = useState<{ [courseId: number]: CanvasFile[] }>({});
  const [loadingAssignments, setLoadingAssignments] = useState<{ [courseId: number]: boolean }>({});
  const [loadingFiles, setLoadingFiles] = useState<{ [courseId: number]: boolean }>({});

  // Load saved credentials on mount
  useEffect(() => {
    if (isOpen) {
      const savedUrl = localStorage.getItem('canvas-url');
      const savedToken = localStorage.getItem('canvas-token');
      const wasConnected = localStorage.getItem('canvas-connected') === 'true';

      if (savedUrl) setCanvasUrl(savedUrl);
      if (savedToken) setApiToken(savedToken);
      if (wasConnected && savedUrl && savedToken) {
        verifyConnection(savedUrl, savedToken);
      }
    }
  }, [isOpen]);

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

      setConnected(true);
      await fetchCourses(url, token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Canvas');
      setConnected(false);
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
      setCourses([]);
    }
  };

  const fetchAssignments = async (courseId: number) => {
    if (!canvasUrl || !apiToken) return;

    setLoadingAssignments((prev) => ({ ...prev, [courseId]: true }));
    try {
      const response = await fetch('/api/canvas/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasUrl, apiToken, courseId }),
      });

      if (!response.ok) throw new Error('Failed to fetch assignments');

      const data = await response.json();
      setAssignments((prev) => ({ ...prev, [courseId]: data.assignments || [] }));
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      setAssignments((prev) => ({ ...prev, [courseId]: [] }));
    } finally {
      setLoadingAssignments((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  const fetchFiles = async (courseId: number) => {
    if (!canvasUrl || !apiToken) return;

    setLoadingFiles((prev) => ({ ...prev, [courseId]: true }));
    try {
      const response = await fetch('/api/canvas/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasUrl, apiToken, courseId }),
      });

      if (!response.ok) throw new Error('Failed to fetch files');

      const data = await response.json();
      setFiles((prev) => ({ ...prev, [courseId]: data.files || [] }));
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setFiles((prev) => ({ ...prev, [courseId]: [] }));
    } finally {
      setLoadingFiles((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  const handleCourseToggle = (course: Course) => {
    if (expandedCourse === course.id) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(course.id);
      if (!assignments[course.id]) {
        fetchAssignments(course.id);
      }
      if (!files[course.id]) {
        fetchFiles(course.id);
      }
    }
  };

  const handleConnect = () => {
    if (canvasUrl && apiToken) {
      verifyConnection(canvasUrl, apiToken);
    } else {
      setError('Please enter both Canvas URL and API token');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Canvas Courses & Files</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-all"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!connected ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canvas URL
                </label>
                <input
                  type="url"
                  value={canvasUrl}
                  onChange={(e) => setCanvasUrl(e.target.value)}
                  placeholder="https://canvas.university.edu"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Token
                </label>
                <input
                  type="password"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="Your Canvas API token"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                onClick={handleConnect}
                disabled={loading || !canvasUrl || !apiToken}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-5 w-5" />
                    <span>Connect to Canvas</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No courses found</p>
              ) : (
                courses.map((course) => {
                  const isExpanded = expandedCourse === course.id;
                  const courseAssignments = assignments[course.id] || [];
                  const courseFiles = files[course.id] || [];
                  const isLoadingAssignments = loadingAssignments[course.id];
                  const isLoadingFiles = loadingFiles[course.id];

                  return (
                    <div key={course.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleCourseToggle(course)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-gray-600" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-600" />
                          )}
                          <BookOpen className="h-5 w-5 text-orange-600" />
                          <div className="text-left">
                            <h3 className="font-semibold text-gray-900">{course.name}</h3>
                            {course.code && (
                              <p className="text-sm text-gray-500">{course.code}</p>
                            )}
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 bg-white border-t border-gray-200 space-y-4">
                          {/* Assignments */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Assignments
                            </h4>
                            {isLoadingAssignments ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
                              </div>
                            ) : courseAssignments.length === 0 ? (
                              <p className="text-sm text-gray-500 py-2">No assignments</p>
                            ) : (
                              <div className="space-y-2">
                                {courseAssignments.map((assignment) => (
                                  <button
                                    key={assignment.id}
                                    onClick={() => {
                                      if (onSelectFile) {
                                        onSelectFile({
                                          name: assignment.name,
                                          url: `${canvasUrl}/courses/${course.id}/assignments/${assignment.id}`,
                                          type: 'assignment',
                                        });
                                      }
                                    }}
                                    className="w-full text-left p-3 bg-gray-50 hover:bg-orange-50 rounded-lg border border-gray-200 hover:border-orange-300 transition-all"
                                  >
                                    <div className="font-medium text-sm text-gray-900">{assignment.name}</div>
                                    {assignment.dueAt && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Due: {new Date(assignment.dueAt).toLocaleDateString()}
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Files */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Files
                            </h4>
                            {isLoadingFiles ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
                              </div>
                            ) : courseFiles.length === 0 ? (
                              <p className="text-sm text-gray-500 py-2">No files</p>
                            ) : (
                              <div className="space-y-2">
                                {courseFiles.map((file) => (
                                  <button
                                    key={file.id}
                                    onClick={() => {
                                      if (onSelectFile) {
                                        onSelectFile({
                                          name: file.name,
                                          url: file.url,
                                          type: 'file',
                                        });
                                      }
                                    }}
                                    className="w-full text-left p-3 bg-gray-50 hover:bg-orange-50 rounded-lg border border-gray-200 hover:border-orange-300 transition-all"
                                  >
                                    <div className="font-medium text-sm text-gray-900">{file.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {formatFileSize(file.size)}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

