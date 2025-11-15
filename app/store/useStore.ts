import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  description?: string;
  folderId?: string;
  type: 'note' | 'whiteboard' | 'flashcard-set';
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  sharedWith: string[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
}

export interface FlashcardSet {
  id: string;
  noteId: string;
  cards: Flashcard[];
}

interface AppState {
  notes: Note[];
  flashcardSets: FlashcardSet[];
  folders: Folder[];
  currentNote: Note | null;
  currentFolder: string | null;
  sidebarOpen: boolean;
  currentView: 'notes' | 'lecture-upload';

  // Actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setCurrentNote: (note: Note | null) => void;
  setCurrentView: (view: 'notes' | 'lecture-upload') => void;
  toggleSidebar: () => void;

  // Folder actions
  addFolder: (name: string, color: string) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  setCurrentFolder: (folderId: string | null) => void;

  // Flashcard actions
  addFlashcardSet: (noteId: string) => void;
  updateFlashcard: (setId: string, cardId: string, updates: Partial<Flashcard>) => void;
  addCardToSet: (setId: string, card: Omit<Flashcard, 'id'>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      notes: [],
      flashcardSets: [],
      folders: [],
      currentNote: null,
      currentFolder: null,
      sidebarOpen: true,
      currentView: 'notes' as 'notes' | 'lecture-upload',

      addNote: (note) =>
        set((state) => ({
          notes: [
            ...state.notes,
            {
              ...note,
              id: crypto.randomUUID(),
              folderId: state.currentFolder || note.folderId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        })),

      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date() }
              : note
          ),
        })),

      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          currentNote: state.currentNote?.id === id ? null : state.currentNote,
        })),

      setCurrentNote: (note) => set({ currentNote: note, currentView: 'notes' }),

      setCurrentView: (view) => set({ currentView: view, currentNote: view === 'lecture-upload' ? null : undefined }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      addFolder: (name, color) =>
        set((state) => ({
          folders: [
            ...state.folders,
            {
              id: crypto.randomUUID(),
              name,
              color,
              createdAt: new Date(),
            },
          ],
        })),

      updateFolder: (id, updates) =>
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id ? { ...folder, ...updates } : folder
          ),
        })),

      deleteFolder: (id) =>
        set((state) => ({
          folders: state.folders.filter((folder) => folder.id !== id),
          notes: state.notes.map((note) =>
            note.folderId === id ? { ...note, folderId: undefined } : note
          ),
          currentFolder: state.currentFolder === id ? null : state.currentFolder,
        })),

      setCurrentFolder: (folderId) => set({ currentFolder: folderId }),

      addFlashcardSet: (noteId) =>
        set((state) => ({
          flashcardSets: [
            ...state.flashcardSets,
            {
              id: crypto.randomUUID(),
              noteId,
              cards: [],
            },
          ],
        })),

      updateFlashcard: (setId, cardId, updates) =>
        set((state) => ({
          flashcardSets: state.flashcardSets.map((set) =>
            set.id === setId
              ? {
                  ...set,
                  cards: set.cards.map((card) =>
                    card.id === cardId ? { ...card, ...updates } : card
                  ),
                }
              : set
          ),
        })),

      addCardToSet: (setId, card) =>
        set((state) => ({
          flashcardSets: state.flashcardSets.map((set) =>
            set.id === setId
              ? {
                  ...set,
                  cards: [
                    ...set.cards,
                    { ...card, id: crypto.randomUUID() },
                  ],
                }
              : set
          ),
        })),
    }),
    {
      name: 'sprintnotes-storage',
    }
  )
);
