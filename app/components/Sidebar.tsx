'use client';

import { useStore } from '../store/useStore';
import {
  FileText,
  PenTool,
  BookOpen,
  Music,
  Share2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Folder as FolderIcon,
  FolderPlus,
  MoreVertical,
  Trash2,
  Languages,
  Users,
  MessageCircle
} from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import type { Folder, Note } from '../store/useStore';

interface FolderTreeProps {
  folder: Folder;
  level: number;
  folders: Folder[];
  notes: Note[];
  currentFolder: string | null;
  currentNote: Note | null;
  expandedFolders: Set<string>;
  onToggleExpand: (folderId: string) => void;
  onSetCurrentFolder: (folderId: string | null) => void;
  onSetCurrentNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onShowNewFolder: (parentId?: string) => void;
  getChildFolders: (parentId: string) => Folder[];
  getNotesInFolder: (folderId: string | undefined) => Note[];
  searchQuery: string;
  onReorderNote: (noteId: string, newFolderId: string | undefined, newIndex: number) => void;
  isDraggingRef: React.MutableRefObject<boolean>;
}

function FolderTree({
  folder,
  level,
  folders,
  notes,
  currentFolder,
  currentNote,
  expandedFolders,
  onToggleExpand,
  onSetCurrentFolder,
  onSetCurrentNote,
  onDeleteNote,
  onDeleteFolder,
  onShowNewFolder,
  getChildFolders,
  getNotesInFolder,
  searchQuery,
  onReorderNote,
  isDraggingRef,
}: FolderTreeProps) {
  const childFolders = getChildFolders(folder.id);
  const folderNotes = getNotesInFolder(folder.id).filter(note => {
    if (!searchQuery) return true;
    return note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.description?.toLowerCase().includes(searchQuery.toLowerCase()));
  });
  const isExpanded = expandedFolders.has(folder.id);
  const hasChildren = childFolders.length > 0 || folderNotes.length > 0;

  return (
    <>
      <Droppable droppableId={`folder-${folder.id}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`group ${snapshot.isDraggingOver ? 'ring-2 ring-blue-400 rounded-lg' : ''}`}
          >
            <div
              className={`flex items-center gap-0 rounded-lg transition-all ${
                currentFolder === folder.id ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
              style={{ paddingLeft: `${level * 16}px` }}
            >
              {hasChildren && (
                <button
                  onClick={() => onToggleExpand(folder.id)}
                  className="p-1 hover:bg-gray-200 rounded transition-all"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-gray-600" />
                  )}
                </button>
              )}
              {!hasChildren && <div className="w-4" />}
              
              <Draggable draggableId={`folder-${folder.id}`} index={0}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`flex-1 flex items-center justify-between min-w-0 ${
                      snapshot.isDragging ? 'opacity-50' : ''
                    }`}
                  >
                    <button
                      {...provided.dragHandleProps}
                      onClick={() => onSetCurrentFolder(folder.id)}
                      className="flex items-center gap-2 pl-0 pr-2 py-2 text-sm transition-all min-w-0 flex-shrink"
                    >
                      <FolderIcon className="h-4 w-4 flex-shrink-0" style={{ color: folder.color }} />
                      <span className={`truncate ${currentFolder === folder.id ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                        {folder.name}
                      </span>
                    </button>
                    <div className="flex items-center gap-1 flex-shrink-0 py-2">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {folderNotes.length}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowNewFolder(folder.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-all"
                        title="Add subfolder"
                      >
                        <FolderPlus className="h-3 w-3 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFolder(folder.id);
                        }}
                        className="p-1 hover:bg-red-100 rounded transition-all mr-2"
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </button>
                    </div>
                  </div>
                )}
              </Draggable>
              
              {provided.placeholder}
            </div>

            {isExpanded && (
              <div className="ml-4">
                {/* Child Folders */}
                {childFolders.map((childFolder) => (
                  <FolderTree
                    key={childFolder.id}
                    folder={childFolder}
                    level={level + 1}
                    folders={folders}
                    notes={notes}
                    currentFolder={currentFolder}
                    currentNote={currentNote}
                    expandedFolders={expandedFolders}
                    onToggleExpand={onToggleExpand}
                    onSetCurrentFolder={onSetCurrentFolder}
                    onSetCurrentNote={onSetCurrentNote}
                    onDeleteNote={onDeleteNote}
                    onDeleteFolder={onDeleteFolder}
                    onShowNewFolder={onShowNewFolder}
                    getChildFolders={getChildFolders}
                    getNotesInFolder={getNotesInFolder}
                    searchQuery={searchQuery}
                    onReorderNote={onReorderNote}
                    isDraggingRef={isDraggingRef}
                  />
                ))}

                {/* Notes in this folder - All note types (notes, whiteboards, flashcard-sets) are draggable */}
                <Droppable droppableId={`notes-${folder.id}`}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-1' : ''}
                    >
                      {folderNotes.map((note, index) => (
                        <Draggable key={note.id} draggableId={note.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`mb-1 group ${snapshot.isDragging ? 'opacity-50' : ''}`}
                              style={{ paddingLeft: `${(level + 1) * 16 + 12}px` }}
                            >
                              <div className={`flex items-center gap-1 rounded-lg transition-all ${
                                currentNote?.id === note.id
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg'
                                  : ''
                              }`}>
                                <button
                                  {...provided.dragHandleProps}
                                  onClick={(e) => {
                                    // Only select if not dragging
                                    if (!isDraggingRef.current && !snapshot.isDragging) {
                                      onSetCurrentNote(note);
                                    }
                                  }}
                                  className={`flex-1 text-left p-2 rounded-lg transition-all text-sm ${
                                    currentNote?.id === note.id
                                      ? 'text-white shadow-lg'
                                      : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                                  } ${snapshot.isDragging ? 'shadow-lg cursor-grabbing' : 'cursor-grab'}`}
                                >
                                  <div className="flex items-start gap-2">
                                    {note.type === 'note' && <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                                    {note.type === 'whiteboard' && <PenTool className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                                    {note.type === 'flashcard-set' && <BookOpen className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                                    <span className="text-xs truncate">{note.title}</span>
                                  </div>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Are you sure you want to delete this note?')) {
                                      onDeleteNote(note.id);
                                    }
                                  }}
                                  className="p-1 hover:bg-red-100 rounded transition-all mr-2"
                                  title="Delete note"
                                >
                                  <Trash2 className="h-3 w-3 text-red-600" />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </>
  );
}

export default function Sidebar() {
  const { notes, folders, sidebarOpen, currentFolder, currentView, toggleSidebar, addNote, addFolder, deleteFolder, deleteNote, moveFolder, setCurrentNote, setCurrentFolder, setCurrentView, currentNote, updateNote, reorderNote, user, setCurrentChatMatchId, lastVisited, isAllNotesExpanded, toggleAllNotesExpanded } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParentId, setNewFolderParentId] = useState<string | undefined>(undefined);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const isDraggingRef = useRef(false);
  
  // Don't render sidebar if user is not authenticated
  if (!user) {
    return null;
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    // When no folder is selected, show root-level notes. When a folder is selected, show only notes in that folder
    const matchesFolder = currentFolder === null 
      ? note.folderId === undefined 
      : note.folderId === currentFolder;
    return matchesSearch && matchesFolder;
  });

  // Build folder tree structure
  const rootFolders = folders.filter((f) => !f.parentId);
  const getChildFolders = (parentId: string) => folders.filter((f) => f.parentId === parentId);
  const getNotesInFolder = (folderId: string | undefined) => {
    const folderNotes = notes.filter((n) => n.folderId === folderId);
    return folderNotes.sort((a, b) => (a.order || 0) - (b.order || 0));
  };
  const rootNotes = getNotesInFolder(undefined);

  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleCreateFolder = (parentId?: string) => {
    if (newFolderName.trim()) {
      const randomColor = folderColors[Math.floor(Math.random() * folderColors.length)];
      addFolder(newFolderName, randomColor, parentId);
      setNewFolderName('');
      setShowNewFolder(false);
      setNewFolderParentId(undefined);
      if (parentId) {
        setExpandedFolders((prev) => new Set(prev).add(parentId));
      }
    }
  };

  const folderColors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];


  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragEnd = (result: DropResult) => {
    isDraggingRef.current = false;
    const { destination, source, draggableId } = result;

    // No destination
    if (!destination) {
      return;
    }

    // Check if dragging a folder
    if (draggableId.startsWith('folder-')) {
      const folderId = draggableId.replace('folder-', '');
      let newParentId: string | undefined;
      if (destination.droppableId === 'notes-list') {
        newParentId = undefined; // Dropping on root level
      } else if (destination.droppableId.startsWith('folder-')) {
        newParentId = destination.droppableId.replace('folder-', '');
      } else {
        return;
      }
      moveFolder(folderId, newParentId);
      return;
    }

    // Find the note being dragged
    const noteId = draggableId;

    // Determine the new folder ID and index
    let newFolderId: string | undefined;
    let newIndex = destination.index;

    if (destination.droppableId === 'notes-list') {
      // Dropped in root-level notes list
      newFolderId = undefined;
      newIndex = destination.index;
    } else if (destination.droppableId.startsWith('folder-')) {
      // Dropped on folder itself
      newFolderId = destination.droppableId.replace('folder-', '');
      newIndex = 0; // Will be at top of folder
      // Expand the target folder if it's collapsed
      setExpandedFolders((prev) => new Set(prev).add(newFolderId!));
    } else if (destination.droppableId.startsWith('notes-')) {
      // Dropped in notes list within a folder
      newFolderId = destination.droppableId.replace('notes-', '');
      // Use the destination index for proper ordering
      newIndex = destination.index;
      // Expand the target folder if it's collapsed
      setExpandedFolders((prev) => new Set(prev).add(newFolderId!));
    } else {
      return; // Invalid destination
    }

    // Use reorderNote to handle the move and reordering
    reorderNote(noteId, newFolderId, newIndex);
  };

  const createNewNote = (type: 'note' | 'whiteboard' | 'flashcard-set') => {
    const newNote = {
      title: `Untitled ${type === 'note' ? 'Note' : type === 'whiteboard' ? 'Whiteboard' : 'Flashcard Set'}`,
      content: '',
      type,
      tags: [],
      sharedWith: [],
      folderId: undefined, // Always create at root level by default
    };
    // Clear current folder so new notes appear at root
    setCurrentFolder(null);
    addNote(newNote);
  };

  if (!sidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-all"
      >
        <ChevronRight className="h-5 w-5 text-gray-700" />
      </button>
    );
  }

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <aside className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col shadow-xl z-40">
        {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              // Navigate to home view - clear current note and view
              setCurrentNote(null);
              setCurrentView('notes');
              setCurrentFolder(null);
            }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer"
          >
            SprintNotes
          </button>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Create Buttons */}
      <div className="p-4 space-y-2 border-b border-gray-200">
        <button
          onClick={() => {
            // Check if there's a last visited note
            if (lastVisited.note) {
              const lastNote = notes.find((n) => n.id === lastVisited.note && n.type === 'note');
              if (lastNote) {
                setCurrentNote(lastNote);
                return;
              }
            }
            createNewNote('note');
          }}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">New Note</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              // Check if there's a last visited whiteboard
              if (lastVisited.whiteboard) {
                const lastWhiteboard = notes.find((n) => n.id === lastVisited.whiteboard && n.type === 'whiteboard');
                if (lastWhiteboard) {
                  setCurrentNote(lastWhiteboard);
                  return;
                }
              }
              createNewNote('whiteboard');
            }}
            className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all text-sm font-medium"
          >
            <PenTool className="h-4 w-4" />
            <span>Whiteboard</span>
          </button>
          <button
            onClick={() => {
              // Check if there's a last visited flashcard set
              if (lastVisited.flashcardSet) {
                const lastFlashcardSet = notes.find((n) => n.id === lastVisited.flashcardSet && n.type === 'flashcard-set');
                if (lastFlashcardSet) {
                  setCurrentNote(lastFlashcardSet);
                  return;
                }
              }
              createNewNote('flashcard-set');
            }}
            className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm font-medium"
          >
            <BookOpen className="h-4 w-4" />
            <span>Flashcards</span>
          </button>
        </div>

        <button
          onClick={() => setCurrentView('lecture-upload')}
          className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
            currentView === 'lecture-upload'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
        >
          <Languages className="h-4 w-4" />
          <span>Upload Lecture</span>
        </button>

        {user && (
          <button
            onClick={() => {
              setCurrentView('matching');
              setCurrentChatMatchId(null);
            }}
            className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
              currentView === 'matching' || currentView === 'chat'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Mentoring</span>
          </button>
        )}
      </div>

      {/* Folders */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">Folders</span>
          <button
            onClick={() => setShowNewFolder(!showNewFolder)}
            className="p-1 hover:bg-gray-100 rounded transition-all"
          >
            <FolderPlus className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {showNewFolder && (
          <div className="mb-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder(newFolderParentId)}
              placeholder="Folder name..."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        )}

        {/* All Notes Section */}
        <div className="px-4 py-2 border-b border-gray-200">
          <button
            onClick={toggleAllNotesExpanded}
            className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 uppercase hover:text-gray-700 transition-colors"
          >
            <span>All Notes</span>
            {isAllNotesExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Root-level notes - shown directly without folder */}
        {rootNotes.length > 0 && isAllNotesExpanded && (
          <div className="mb-3 px-4">
            <Droppable droppableId="notes-list">
              {(provided, snapshot) => {
                const filteredRootNotes = rootNotes.filter(note => {
                  if (!searchQuery) return true;
                  return note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (note.description?.toLowerCase().includes(searchQuery.toLowerCase()));
                });
                return (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-1 ${snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-1' : ''}`}
                  >
                    {filteredRootNotes.map((note, index) => (
                      <Draggable key={note.id} draggableId={note.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`group ${snapshot.isDragging ? 'opacity-50' : ''}`}
                          >
                            <div className={`flex items-center gap-1 rounded-lg transition-all ${
                              currentNote?.id === note.id
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg'
                                : ''
                            }`}>
                              <button
                                {...provided.dragHandleProps}
                                onClick={(e) => {
                                  // Only select if not dragging
                                  if (!isDraggingRef.current && !snapshot.isDragging) {
                                    setCurrentNote(note);
                                    setCurrentFolder(null);
                                  }
                                }}
                                className={`flex-1 text-left p-2 rounded-lg transition-all text-sm ${
                                  currentNote?.id === note.id
                                    ? 'text-white shadow-lg'
                                    : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                                } ${snapshot.isDragging ? 'shadow-lg cursor-grabbing' : 'cursor-grab'}`}
                              >
                                <div className="flex items-start gap-2">
                                  {note.type === 'note' && <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                                  {note.type === 'whiteboard' && <PenTool className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                                  {note.type === 'flashcard-set' && <BookOpen className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                                  <span className="text-xs truncate">{note.title}</span>
                                </div>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Are you sure you want to delete this note?')) {
                                    deleteNote(note.id);
                                  }
                                }}
                                className="p-1 hover:bg-red-100 rounded transition-all mr-2"
                                title="Delete note"
                              >
                                <Trash2 className="h-3 w-3 text-red-600" />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                );
              }}
            </Droppable>
          </div>
        )}

        {/* Hierarchical Folder Tree */}
        <div className="space-y-1">
          {rootFolders.map((folder) => (
            <FolderTree
              key={folder.id}
              folder={folder}
              level={0}
              folders={folders}
              notes={notes}
              currentFolder={currentFolder}
              currentNote={currentNote}
              expandedFolders={expandedFolders}
              onToggleExpand={toggleFolderExpansion}
              onSetCurrentFolder={setCurrentFolder}
              onSetCurrentNote={setCurrentNote}
              onDeleteNote={deleteNote}
              onDeleteFolder={deleteFolder}
              onShowNewFolder={(parentId) => {
                setShowNewFolder(true);
                setNewFolderParentId(parentId);
              }}
              getChildFolders={getChildFolders}
              getNotesInFolder={getNotesInFolder}
              searchQuery={searchQuery}
              onReorderNote={reorderNote}
              isDraggingRef={isDraggingRef}
            />
          ))}
        </div>
      </div>


      </aside>
    </DragDropContext>
  );
}
