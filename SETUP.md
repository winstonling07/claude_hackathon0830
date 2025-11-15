# Quick Setup Guide for SprintNotes

## Immediate Next Steps

### 1. Set Up Your API Key

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_key_here
```

Get your API key from: https://console.anthropic.com/

### 2. Run the Application

The dev server is already running at: http://localhost:3000

If you need to restart it:
```bash
npm run dev
```

### 3. Test All Features

#### Notes
1. Click "New Note" in the sidebar
2. Try formatting text with the toolbar
3. Click "AI Summary" to test AI features (requires API key)

#### Whiteboard
1. Create a new Whiteboard
2. Draw something
3. Try different colors and brush sizes
4. Download your creation

#### Flashcards
1. Create a new Flashcard Set
2. Add some cards
3. Switch to Study Mode
4. Practice and mark cards as mastered

#### Music Player
- Click the music player at the bottom
- Note: For the hackathon, you may want to add actual music files or integrate with a music API

#### Sharing
1. Create or select a note
2. Click the Share button
3. Try sharing via email or link

#### Canvas Integration
1. Click the Canvas panel (bottom right)
2. You can demo the integration UI
3. For full functionality, you'll need a Canvas API token

## For the Hackathon Demo

### Must-Have Before Demo
1. ✅ Set up `.env.local` with Anthropic API key
2. ✅ Create some sample notes to showcase
3. ✅ Create a sample flashcard set
4. ⚠️  Add music files (or use a placeholder)
5. ⚠️  Consider adding a demo Canvas account

### Demo Flow Suggestion
1. Show the beautiful Apple Keynote-inspired UI
2. Create a new note and demonstrate rich text editing
3. Use AI Summary on your note
4. Switch to whiteboard and draw a diagram
5. Show the flashcard system in study mode
6. Demonstrate the sharing feature
7. Show Canvas integration panel
8. Turn on focus music

### Optional Enhancements Before Demo
- Add some default classical music tracks to `/public/music/`
- Pre-populate with sample educational content
- Add your university's Canvas URL as default
- Create a landing page animation
- Add keyboard shortcuts

## Production Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

Don't forget to add environment variables in Vercel dashboard!

### Other Platforms
The app works on any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- etc.

## Troubleshooting

### Build Errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
npm run dev
```

### AI Summary Not Working
- Check that your `.env.local` file exists
- Verify your ANTHROPIC_API_KEY is valid
- Restart the dev server after adding the key

## Tips for Hackathon Success

1. **Practice your demo** - Know the flow cold
2. **Have backup data** - Pre-create notes in case something breaks
3. **Mobile responsive** - Show it works on phones too
4. **Explain the tech** - Judges love hearing about Next.js 16, Zustand, Claude AI
5. **Focus on student pain points** - Emphasize how it solves real problems

## What Makes This Stand Out

- **Unique combination** of features in one app
- **Modern tech stack** (Next.js 16, React 19, Tailwind 4)
- **AI integration** with Claude
- **Beautiful design** inspired by Apple Keynote
- **Practical solution** for real student needs
- **Canvas integration** shows understanding of ed-tech ecosystem

Good luck at your hackathon! 🚀
