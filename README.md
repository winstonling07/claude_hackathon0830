# SprintNotes - Your Smart Study Companion

A modern, feature-rich note-taking application built for college students, designed with an Apple Keynote-inspired aesthetic. Perfect for hackathons and real-world studying!

## Features

### Core Features
- **Rich Text Editor** - Full-featured note editor with formatting, lists, code blocks, and more
- **Whiteboard** - Draw diagrams, sketch ideas, and visualize concepts
- **Flashcards** - Create and study flashcards with a mastery tracking system
- **AI Summarization** - Powered by Claude AI to summarize your notes instantly
- **Focus Music Player** - Classical music to help you concentrate
- **Sharing** - Share notes with classmates via email or link
- **Canvas LMS Integration** - Sync with Canvas for seamless course integration
- **Local Storage** - All notes saved automatically in your browser

### Design
- Apple Keynote-inspired UI with smooth animations
- Beautiful gradients and modern components
- Responsive and mobile-friendly
- Dark mode support (coming soon)

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Anthropic API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd sprintnotes
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating Notes
1. Click "New Note" in the sidebar
2. Choose between Note, Whiteboard, or Flashcard Set
3. Start creating!

### Using the Rich Text Editor
- Use the toolbar to format text (bold, italic, headings, lists, etc.)
- Click "AI Summary" to generate a summary of your notes
- All changes are saved automatically

### Creating Flashcards
1. Create a new Flashcard Set
2. Add cards with front (question) and back (answer)
3. Switch to Study Mode to practice
4. Mark cards as mastered as you learn them

### Whiteboard
- Select pen or eraser tool
- Choose colors and brush sizes
- Download your whiteboard as an image
- Clear to start fresh

### Sharing Notes
1. Click the "Share" button on any note
2. Enter email addresses of classmates
3. Or copy the share link
4. Shared notes integrate with Canvas email notifications

### Canvas Integration
1. Click on the Canvas Integration panel (bottom right)
2. Enter your Canvas URL and API token
3. Import course notes or export your notes to Canvas

### Focus Music
- Click the music controls at the bottom
- Play/pause classical music designed for studying
- Adjust volume or skip tracks

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand with persistence
- **Rich Text**: Tiptap editor
- **AI**: Anthropic Claude API
- **Icons**: Lucide React

## Project Structure

```
sprintnotes/
├── app/
│   ├── components/        # React components
│   │   ├── Sidebar.tsx
│   │   ├── NoteEditor.tsx
│   │   ├── Whiteboard.tsx
│   │   ├── FlashcardView.tsx
│   │   ├── MusicPlayer.tsx
│   │   ├── ShareModal.tsx
│   │   └── CanvasIntegration.tsx
│   ├── store/            # Zustand state management
│   │   └── useStore.ts
│   ├── api/              # API routes
│   │   └── summarize/
│   ├── page.tsx          # Main application
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── public/               # Static assets
├── package.json
└── README.md
```

## Features for Future Development

- [ ] Real-time collaboration
- [ ] Cloud sync (Firebase/Supabase)
- [ ] Mobile apps (React Native)
- [ ] More AI features (quiz generation, concept extraction)
- [ ] Export to PDF/Markdown
- [ ] Tags and advanced search
- [ ] Dark mode
- [ ] Offline PWA support
- [ ] Voice notes
- [ ] OCR for handwritten notes

## Hackathon Tips

This project is perfect for hackathons! Here's what makes it stand out:

1. **Unique Feature Combination** - Notes + Whiteboard + Flashcards + AI in one app
2. **Modern Design** - Apple Keynote aesthetic catches judges' eyes
3. **Real Problem Solving** - Addresses actual student pain points
4. **AI Integration** - Leverages cutting-edge technology
5. **Canvas Integration** - Shows understanding of educational tech ecosystem

## Contributing

This is a hackathon project, but contributions are welcome! Feel free to fork and submit PRs.

## License

MIT

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Anthropic Claude](https://anthropic.com/)
- Icons from [Lucide](https://lucide.dev/)
- Editor by [Tiptap](https://tiptap.dev/)

---

Built with ❤️ for students, by students
