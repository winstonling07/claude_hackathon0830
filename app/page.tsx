'use client';

import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import SignupFlow from './components/SignupFlow';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import Whiteboard from './components/Whiteboard';
import FlashcardView from './components/FlashcardView';
import LectureUpload from './components/LectureUpload';
import ShareModal from './components/ShareModal';
import CanvasIntegration from './components/CanvasIntegration';
import MatchingSystem from './components/MatchingSystem';
import ChatInterface from './components/ChatInterface';
import ProfileDropdown from './components/ProfileDropdown';
import { Share2, Trash2, Download, ChevronDown } from 'lucide-react';
import { downloadNoteAsMarkdown, downloadNoteAsJSON, downloadFlashcardsAsJSON, downloadFlashcardsAsCSV } from './utils/export';
import type { FlashcardSet } from './store/useStore';

export default function Home() {
  const { 
    user, 
    currentNote, 
    currentView, 
    currentChatMatchId, 
    deleteNote, 
    flashcardSets, 
    sidebarOpen, 
    setCurrentView, 
    setCurrentChatMatchId,
    notes,
    addNote,
    setCurrentNote,
    lastVisited,
  } = useStore();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  
  // Validate user on mount - ensure user has all required fields
  useEffect(() => {
    if (user) {
      // Check if user has all required fields (id, email, role, subjects, birthday)
      const isValidUser = user.id && user.email && user.role && Array.isArray(user.subjects) && user.birthday;
      if (!isValidUser) {
        // Clear invalid user data
        useStore.getState().logout();
      }
    }
  }, [user]);
  
  // Helper functions to open or create notes
  const handleOpenOrCreate = (type: 'note' | 'whiteboard' | 'flashcard-set') => {
    const lastId = type === 'note' ? lastVisited.note 
      : type === 'whiteboard' ? lastVisited.whiteboard 
      : lastVisited.flashcardSet;
    
    if (lastId) {
      const lastNote = notes.find((n) => n.id === lastId && n.type === type);
      if (lastNote) {
        setCurrentNote(lastNote);
        return;
      }
    }
    
    // Create a new note/whiteboard/flashcard-set
    const newNote = {
      title: type === 'note' ? 'Untitled Note' 
        : type === 'whiteboard' ? 'Untitled Whiteboard'
        : 'Untitled Flashcard Set',
      content: type === 'note' ? '<p>Start typing your notes...</p>' : '',
      type: type,
      tags: [],
      sharedWith: [],
    };
    
    addNote(newNote);
    
    // Find and open the newly created note
    setTimeout(() => {
      const state = useStore.getState();
      const createdNote = state.notes.find(
        (n) => n.title === newNote.title && n.type === type && n.content === newNote.content
      );
      if (createdNote) {
        setCurrentNote(createdNote);
      }
    }, 100);
  };
  
  const handleOpenAISummary = () => {
    // Find the most recent note to summarize
    const recentNote = notes
      .filter((n) => n.type === 'note')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
    
    if (recentNote) {
      setCurrentNote(recentNote);
      // In a real implementation, you might want to show an AI summary modal
      // For now, just open the note
    } else {
      // Create a new note if none exist
      handleOpenOrCreate('note');
    }
  };

  // Show signup flow if user is not authenticated
  // Block all access until user signs up/signs in
  // Strictly check: user must be null, undefined, or invalid
  if (!user || !user.id || !user.email || !user.role || !Array.isArray(user.subjects) || !user.birthday) {
    return (
      <div className="h-screen w-screen overflow-hidden">
        <SignupFlow />
      </div>
    );
  }

  const handleDelete = () => {
    if (currentNote && confirm('Are you sure you want to delete this note?')) {
      deleteNote(currentNote.id);
    }
  };

  const handleDownload = (format: 'markdown' | 'json' | 'flashcards-json' | 'flashcards-csv') => {
    if (!currentNote) return;

    switch (format) {
      case 'markdown':
        downloadNoteAsMarkdown(currentNote);
        break;
      case 'json':
        downloadNoteAsJSON(currentNote);
        break;
      case 'flashcards-json':
        const flashcardSet = flashcardSets.find((set: FlashcardSet) => set.noteId === currentNote.id);
        if (flashcardSet) {
          downloadFlashcardsAsJSON(flashcardSet, currentNote.title);
        }
        break;
      case 'flashcards-csv':
        const set = flashcardSets.find((s: FlashcardSet) => s.noteId === currentNote.id);
        if (set) {
          downloadFlashcardsAsCSV(set.cards, currentNote.title);
        }
        break;
    }
    setShowDownloadMenu(false);
  };

  // Double check user is authenticated before rendering content
  if (!user || !user.id || !user.email || !user.role || !Array.isArray(user.subjects) || !user.birthday) {
    return (
      <div className="h-screen w-screen overflow-hidden">
        <SignupFlow />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
        {/* Top Bar with Profile */}
        <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {currentNote && (
              <>
                {/* Download Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-lg"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  {showDownloadMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDownloadMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                          {currentNote.type === 'flashcard-set' ? 'Export Flashcards' : 'Export Note'}
                        </div>

                        {currentNote.type === 'flashcard-set' ? (
                          <>
                            <button
                              onClick={() => handleDownload('flashcards-csv')}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                            >
                              <Download className="h-4 w-4 text-green-600" />
                              <div>
                                <div className="font-medium">CSV Format</div>
                                <div className="text-xs text-gray-500">Import into Anki, Quizlet</div>
                              </div>
                            </button>
                            <button
                              onClick={() => handleDownload('flashcards-json')}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                            >
                              <Download className="h-4 w-4 text-blue-600" />
                              <div>
                                <div className="font-medium">JSON Format</div>
                                <div className="text-xs text-gray-500">For backup & data export</div>
                              </div>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleDownload('markdown')}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                            >
                              <Download className="h-4 w-4 text-purple-600" />
                              <div>
                                <div className="font-medium">Markdown (.md)</div>
                                <div className="text-xs text-gray-500">For Notion, Obsidian, etc.</div>
                              </div>
                            </button>
                            <button
                              onClick={() => handleDownload('json')}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                            >
                              <Download className="h-4 w-4 text-blue-600" />
                              <div>
                                <div className="font-medium">JSON Format</div>
                                <div className="text-xs text-gray-500">For backup & data export</div>
                              </div>
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-lg"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </>
            )}
            <ProfileDropdown />
          </div>
        </div>

        {currentView === 'lecture-upload' && <LectureUpload />}
        {currentView === 'matching' && <MatchingSystem />}
        {currentView === 'chat' && currentChatMatchId && (
          <ChatInterface 
            matchId={currentChatMatchId} 
            onClose={() => {
              setCurrentView('matching');
              setCurrentChatMatchId(null);
            }}
          />
        )}

        {currentView === 'notes' && currentNote?.type === 'note' && <NoteEditor />}
        {currentView === 'notes' && currentNote?.type === 'whiteboard' && <Whiteboard />}
        {currentView === 'notes' && currentNote?.type === 'flashcard-set' && <FlashcardView />}

        {currentView === 'notes' && !currentNote && (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <div className="text-center max-w-md">
              <div className="text-8xl mb-6">✨</div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Welcome to SprintNotes
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Your all-in-one study companion with AI-powered lecture translation, offline sync, and mentor connections.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <button
                  onClick={() => handleOpenOrCreate('note')}
                  className="bg-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer text-left"
                >
                  <div className="text-2xl mb-2">📝</div>
                  <div className="font-semibold">Rich Text Notes</div>
                </button>
                <button
                  onClick={() => handleOpenOrCreate('whiteboard')}
                  className="bg-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer text-left"
                >
                  <div className="text-2xl mb-2">🎨</div>
                  <div className="font-semibold">Whiteboard</div>
                </button>
                <button
                  onClick={() => handleOpenOrCreate('flashcard-set')}
                  className="bg-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer text-left"
                >
                  <div className="text-2xl mb-2">🃏</div>
                  <div className="font-semibold">Flashcards</div>
                </button>
                <button
                  onClick={handleOpenAISummary}
                  className="bg-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer text-left"
                >
                  <div className="text-2xl mb-2">🤖</div>
                  <div className="font-semibold">AI Summary</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {user && <CanvasIntegration />}

      {showShareModal && currentNote && (
        <ShareModal note={currentNote} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}
