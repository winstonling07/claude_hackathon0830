import Dexie, { Table } from 'dexie';

// Define database models
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
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface Flashcard {
  id: string;
  noteId: string;
  front: string;
  back: string;
  mastered: boolean;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface SyncOperation {
  id?: number;
  type: 'create' | 'update' | 'delete';
  entity: 'note' | 'flashcard' | 'folder';
  entityId: string;
  data: any;
  timestamp: number;
  synced: number; // 0 = false, 1 = true (for IndexedDB indexing)
  error?: string;
}

export interface LectureNote {
  id: string;
  courseId?: string;
  title: string;
  originalLanguage: string;
  targetLanguage: string;

  // Audio
  audioUrl?: string;
  audioFileName?: string;

  // Transcripts
  originalTranscript: string;
  simplifiedEnglish?: string;
  translatedVersion?: string;

  // Comprehension aids
  glossary: Array<{
    term: string;
    definition: string;
    context: string;
  }>;
  keyPoints: string[];

  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

// Dexie database class
export class SprintNotesDB extends Dexie {
  notes!: Table<Note, string>;
  flashcards!: Table<Flashcard, string>;
  syncQueue!: Table<SyncOperation, number>;
  lectureNotes!: Table<LectureNote, string>;

  constructor() {
    super('SprintNotesDB');

    this.version(1).stores({
      notes: 'id, folderId, type, syncStatus, updatedAt',
      flashcards: 'id, noteId, syncStatus',
      syncQueue: '++id, entity, timestamp, synced',
      lectureNotes: 'id, courseId, syncStatus, updatedAt',
    });
  }
}

export const db = new SprintNotesDB();
