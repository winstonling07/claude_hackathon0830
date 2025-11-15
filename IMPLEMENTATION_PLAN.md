# SprintNotes - Three Major Features Implementation Plan

## Feature 1: AI Lecture Translation & Comprehension

### Architecture Overview
- **Audio Processing**: Web Audio API → Speech-to-Text API (OpenAI Whisper or similar)
- **Translation**: Claude AI for multi-language translation
- **Comprehension**: Claude AI for simplified versions and glossaries

### Data Models
```typescript
interface LectureNote {
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
  simplifiedEnglish: string;
  translatedVersion: string;

  // Comprehension aids
  glossary: GlossaryTerm[];
  keyPoints: string[];

  createdAt: Date;
  updatedAt: Date;
}

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  context: string;
}
```

### Implementation Steps
1. Create lecture upload component with audio file support
2. Mock Whisper API integration (use Web Speech API as fallback)
3. Build Claude API routes for:
   - Simplification
   - Translation
   - Glossary generation
4. Create lecture viewer component with tabs for each version

---

## Feature 2: Offline Sync for Notes and Flashcards

### Architecture Overview
- **Storage**: Dexie.js (IndexedDB wrapper) for offline data
- **Sync Strategy**: Last-write-wins with conflict detection
- **Queue System**: Operation queue for offline writes

### Technology Choice: Dexie.js
**Why Dexie?**
- Simple API, typed queries
- React hooks via dexie-react-hooks
- Built-in versioning and migrations
- Better than raw IndexedDB or localStorage because:
  * Handles complex queries
  * Stores large amounts of data
  * Better performance for arrays/objects
  * Versioning support for schema changes

### Data Flow
```
User Action → Local Write (Dexie) → Queue Operation →
[Online] Flush to Supabase → Update local state
[Offline] Store in queue → Wait for connection
```

### Conflict Resolution
- **Strategy**: Last-write-wins based on `updatedAt` timestamp
- **Detection**: Compare timestamps before sync
- **User Notification**: Alert user when conflicts occur

### Implementation
```typescript
// Offline queue
interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'note' | 'flashcard';
  data: any;
  timestamp: number;
  synced: boolean;
}

// Hooks
- useOnlineStatus(): boolean
- useSyncQueue(): { queueOp, flushQueue, pendingOps }
- useOfflineNotes(): { notes, loading, error }
```

---

## Feature 3: Community Mentor Connect

### Database Schema (Supabase)

```sql
-- Mentor Profiles (extends users table)
CREATE TABLE mentor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  school_year TEXT, -- "Freshman", "Sophomore", etc.
  major TEXT,
  bio TEXT,
  languages TEXT[], -- ["English", "Spanish", "Mandarin"]
  is_mentor BOOLEAN DEFAULT false,
  is_first_gen BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Mentor Skills/Tags
CREATE TABLE mentor_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL, -- "calc help", "first-gen advice", etc.
  category TEXT, -- "academic", "career", "social"
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Connection Requests
CREATE TABLE mentor_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentee_id UUID REFERENCES mentor_profiles(id),
  mentor_id UUID REFERENCES mentor_profiles(id),
  status TEXT DEFAULT 'pending', -- "pending", "accepted", "rejected"
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(mentee_id, mentor_id)
);

-- Simple Messages (for connection requests)
CREATE TABLE mentor_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID REFERENCES mentor_connections(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES mentor_profiles(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_mentor_tags_mentor ON mentor_tags(mentor_id);
CREATE INDEX idx_connections_mentee ON mentor_connections(mentee_id);
CREATE INDEX idx_connections_mentor ON mentor_connections(mentor_id);
CREATE INDEX idx_messages_connection ON mentor_messages(connection_id);
```

### React Components
1. **MentorDiscovery** - Search and filter mentors
2. **MentorCard** - Display mentor profile
3. **MentorProfile** - Detailed mentor view
4. **ConnectionRequest** - Send/manage requests
5. **MentorInbox** - View incoming requests

### API Routes (Next.js)
- `GET /api/mentors` - List mentors with filters
- `GET /api/mentors/[id]` - Get mentor details
- `POST /api/connections` - Create connection request
- `GET /api/connections` - Get user's connections
- `PATCH /api/connections/[id]` - Accept/reject request

---

## Implementation Priority

### Phase 1 (Core Architecture)
1. ✅ Remove music player
2. ⏳ Add drag-and-drop for folders
3. ⏳ Set up offline sync infrastructure
4. ⏳ Create mentor database schema

### Phase 2 (Feature Development)
1. Lecture upload and processing UI
2. Offline sync hooks and queue system
3. Mentor discovery and profiles

### Phase 3 (Integration)
1. Translation API integration
2. Sync conflict resolution
3. Connection request system

---

## Notes for Hackathon Demo

### Lecture Translation
- Demo with pre-recorded lecture
- Show English → Spanish translation
- Highlight glossary generation

### Offline Sync
- Demonstrate by toggling network in DevTools
- Show queue building up
- Show sync when back online

### Mentor Connect
- Pre-populate with sample mentors
- Show search/filter functionality
- Demo connection request flow

---

## Technical Considerations

### API Costs
- OpenAI Whisper: ~$0.006/minute
- Claude API: ~$0.01/request
- Consider mocking for demo

### Performance
- Index large datasets
- Lazy load mentor list
- Chunk audio processing

### Security
- Validate file uploads
- Rate limit API calls
- Sanitize user inputs
