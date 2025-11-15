import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Folder {
  id: string;
  name: string;
  color: string;
  parentId?: string;
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
  order?: number;
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

export interface User {
  id: string;
  email: string;
  role: 'mentor' | 'mentee';
  subjects: string[];
  birthday: string;
}

interface AppState {
  user: User | null;
  notes: Note[];
  flashcardSets: FlashcardSet[];
  folders: Folder[];
  currentNote: Note | null;
  currentFolder: string | null;
  sidebarOpen: boolean;
  currentView: 'notes' | 'lecture-upload';

  // User actions
  setUser: (user: User) => void;
  logout: () => void;

  // Actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  reorderNote: (noteId: string, newFolderId: string | undefined, newIndex: number) => void;
  setCurrentNote: (note: Note | null) => void;
  setCurrentView: (view: 'notes' | 'lecture-upload') => void;
  toggleSidebar: () => void;

  // Folder actions
  addFolder: (name: string, color: string, parentId?: string) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  setCurrentFolder: (folderId: string | null) => void;
  moveFolder: (folderId: string, newParentId?: string) => void;

  // Flashcard actions
  addFlashcardSet: (noteId: string) => void;
  updateFlashcard: (setId: string, cardId: string, updates: Partial<Flashcard>) => void;
  addCardToSet: (setId: string, card: Omit<Flashcard, 'id'>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      notes: [],
      flashcardSets: [],
      folders: [],
      currentNote: null,
      currentFolder: null,
      sidebarOpen: true,
      currentView: 'notes' as 'notes' | 'lecture-upload',

      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),

      addNote: (note) =>
        set((state) => {
          // Use explicit folderId from note if provided, otherwise use currentFolder if set, otherwise undefined (root level)
          const targetFolderId = note.folderId !== undefined ? note.folderId : (state.currentFolder || undefined);
          const notesInFolder = state.notes.filter((n) => n.folderId === targetFolderId);
          const maxOrder = notesInFolder.reduce((max, n) => Math.max(max, n.order || 0), 0);
          
          return {
            notes: [
              ...state.notes,
              {
                ...note,
                id: crypto.randomUUID(),
                folderId: targetFolderId,
                order: maxOrder + 1,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
          };
        }),

      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date() }
              : note
          ),
        })),

      reorderNote: (noteId, newFolderId, newIndex) =>
        set((state) => {
          const note = state.notes.find((n) => n.id === noteId);
          if (!note) return state;

          // Get all notes in the target folder, excluding the note being moved
          const targetFolderNotes = state.notes
            .filter((n) => n.id !== noteId && n.folderId === newFolderId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

          // Update the moved note's folder and order
          const updatedNote = {
            ...note,
            folderId: newFolderId,
            order: newIndex + 1,
            updatedAt: new Date(),
          };

          // Reorder notes in the target folder
          const reorderedTargetNotes = [...targetFolderNotes];
          reorderedTargetNotes.splice(newIndex, 0, updatedNote);
          const targetNotesWithOrders = reorderedTargetNotes.map((n, idx) => ({
            ...n,
            order: idx + 1,
          }));

          // Update all notes that changed
          const updatedNotes = state.notes
            .filter((n) => n.id !== noteId && n.folderId !== newFolderId)
            .concat(targetNotesWithOrders);

          return { notes: updatedNotes };
        }),

      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          currentNote: state.currentNote?.id === id ? null : state.currentNote,
        })),

      setCurrentNote: (note) => set({ currentNote: note, currentView: 'notes' }),

      setCurrentView: (view) => set({ currentView: view, currentNote: view === 'lecture-upload' ? null : undefined }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      addFolder: (name, color, parentId) =>
        set((state) => ({
          folders: [
            ...state.folders,
            {
              id: crypto.randomUUID(),
              name,
              color,
              parentId,
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
        set((state) => {
          // Get all child folders recursively
          const getChildFolderIds = (parentId: string): string[] => {
            const directChildren = state.folders
              .filter((f) => f.parentId === parentId)
              .map((f) => f.id);
            const allChildren = [...directChildren];
            directChildren.forEach((childId) => {
              allChildren.push(...getChildFolderIds(childId));
            });
            return allChildren;
          };

          const childFolderIds = getChildFolderIds(id);
          const foldersToDelete = [id, ...childFolderIds];

          return {
            folders: state.folders.filter((folder) => !foldersToDelete.includes(folder.id)),
            notes: state.notes.map((note) =>
              foldersToDelete.includes(note.folderId || '') ? { ...note, folderId: undefined } : note
            ),
            currentFolder: foldersToDelete.includes(state.currentFolder || '') ? null : state.currentFolder,
          };
        }),

      moveFolder: (folderId, newParentId) =>
        set((state) => {
          // Prevent moving a folder into itself or its children
          const isDescendant = (parentId: string, childId: string): boolean => {
            const children = state.folders.filter((f) => f.parentId === parentId);
            if (children.some((c) => c.id === childId)) return true;
            return children.some((c) => isDescendant(c.id, childId));
          };

          if (newParentId && isDescendant(folderId, newParentId)) {
            return state; // Don't allow circular references
          }

          return {
            folders: state.folders.map((folder) =>
              folder.id === folderId ? { ...folder, parentId: newParentId } : folder
            ),
          };
        }),

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
