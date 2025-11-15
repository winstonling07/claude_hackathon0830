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
  Folder as FolderIcon,
  FolderPlus,
  MoreVertical,
  Trash2,
  Languages
} from 'lucide-react';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export default function Sidebar() {
  const { notes, folders, sidebarOpen, currentFolder, currentView, toggleSidebar, addNote, addFolder, deleteFolder, setCurrentNote, setCurrentFolder, setCurrentView, currentNote, updateNote } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFolder = currentFolder === null || note.folderId === currentFolder;
    return matchesSearch && matchesFolder;
  });

  const folderColors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const randomColor = folderColors[Math.floor(Math.random() * folderColors.length)];
      addFolder(newFolderName, randomColor);
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // No destination or dropped in same place
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    // Find the note being dragged
    const noteId = draggableId;

    // Determine the new folder ID
    let newFolderId: string | undefined;
    if (destination.droppableId === 'all-notes') {
      newFolderId = undefined;
    } else if (destination.droppableId.startsWith('folder-')) {
      newFolderId = destination.droppableId.replace('folder-', '');
    } else {
      return; // Invalid destination
    }

    // Update the note's folderId
    updateNote(noteId, { folderId: newFolderId });
  };

  const createNewNote = (type: 'note' | 'whiteboard' | 'flashcard-set') => {
    const newNote = {
      title: `Untitled ${type === 'note' ? 'Note' : type === 'whiteboard' ? 'Whiteboard' : 'Flashcard Set'}`,
      content: '',
      type,
      tags: [],
      sharedWith: [],
    };
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
    <DragDropContext onDragEnd={handleDragEnd}>
      <aside className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col shadow-xl z-40">
        {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SprintNotes
          </h1>
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
          onClick={() => createNewNote('note')}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">New Note</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => createNewNote('whiteboard')}
            className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all text-sm font-medium"
          >
            <PenTool className="h-4 w-4" />
            <span>Whiteboard</span>
          </button>
          <button
            onClick={() => createNewNote('flashcard-set')}
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
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              placeholder="Folder name..."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        )}

        <Droppable droppableId="all-notes">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <button
                onClick={() => setCurrentFolder(null)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  currentFolder === null
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${snapshot.isDraggingOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}
              >
                <FolderIcon className="h-4 w-4" />
                <span>All Notes</span>
                <span className="ml-auto text-xs text-gray-500">{notes.length}</span>
              </button>
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {folders.map((folder) => (
          <Droppable key={folder.id} droppableId={`folder-${folder.id}`}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex items-center gap-2 rounded-lg transition-all group ${
                  currentFolder === folder.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                } ${snapshot.isDraggingOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}
              >
                <button
                  onClick={() => setCurrentFolder(folder.id)}
                  className="flex-1 flex items-center gap-2 px-3 py-2 text-sm"
                >
                  <FolderIcon className="h-4 w-4" style={{ color: folder.color }} />
                  <span className={currentFolder === folder.id ? 'text-blue-700 font-medium' : 'text-gray-700'}>
                    {folder.name}
                  </span>
                  <span className="ml-auto text-xs text-gray-500">
                    {notes.filter(n => n.folderId === folder.id).length}
                  </span>
                </button>
                <button
                  onClick={() => deleteFolder(folder.id)}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition-all mr-2"
                >
                  <Trash2 className="h-3 w-3 text-red-600" />
                </button>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>

      {/* Notes List */}
      <Droppable droppableId="notes-list">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 overflow-y-auto p-4 space-y-2"
          >
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notes yet</p>
              </div>
            ) : (
              filteredNotes.map((note, index) => (
                <Draggable key={note.id} draggableId={note.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <button
                        onClick={() => setCurrentNote(note)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          currentNote?.id === note.id
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                        } ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-400 rotate-2' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          {note.type === 'note' && <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                          {note.type === 'whiteboard' && <PenTool className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                          {note.type === 'flashcard-set' && <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{note.title}</h3>
                            <p className={`text-xs mt-1 line-clamp-2 ${
                              currentNote?.id === note.id ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {note.description || 'No description'}
                            </p>
                            <p className={`text-xs mt-1 ${
                              currentNote?.id === note.id ? 'text-blue-200' : 'text-gray-400'
                            }`}>
                              {new Date(note.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      </aside>
    </DragDropContext>
  );
}
