'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useStore } from '../store/useStore';
import { useEffect, useState } from 'react';
import { useSyncQueue } from '../hooks/useSyncQueue';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Code,
  Quote,
  Undo,
  Redo,
  Sparkles,
  CheckSquare,
  FileText,
  Clock,
  Star,
  Wifi,
  WifiOff,
  CloudUpload,
} from 'lucide-react';

export default function NoteEditor() {
  const { currentNote, updateNote } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { queueOperation, pendingOps, isSyncing } = useSyncQueue();
  const isOnline = useOnlineStatus();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: currentNote?.content || '<p>Start typing your notes...</p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] px-8 py-6',
      },
    },
    onUpdate: ({ editor }) => {
      if (currentNote) {
        updateNote(currentNote.id, { content: editor.getHTML() });
        // Queue sync operation for offline support
        queueOperation('update', 'note', currentNote.id, {
          content: editor.getHTML(),
        });
      }
    },
  });

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setDescription(currentNote.description || '');
      editor?.commands.setContent(currentNote.content || '<p>Start typing your notes...</p>');
    }
  }, [currentNote, editor]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (currentNote) {
      updateNote(currentNote.id, { title: newTitle });
      queueOperation('update', 'note', currentNote.id, { title: newTitle });
    }
  };

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
    if (currentNote) {
      updateNote(currentNote.id, { description: newDescription });
      queueOperation('update', 'note', currentNote.id, { description: newDescription });
    }
  };

  const summarizeNote = async () => {
    if (!currentNote || !editor) return;

    setIsSummarizing(true);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editor.getText() }),
      });

      const data = await response.json();

      // Insert summary at the top
      editor.commands.setContent(
        `<h2>AI Summary</h2><p>${data.summary}</p><hr />${editor.getHTML()}`
      );
    } catch (error) {
      console.error('Error summarizing:', error);
    } finally {
      setIsSummarizing(false);
    }
  };

  if (!currentNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No Note Selected</h2>
          <p className="text-gray-500">Select a note from the sidebar or create a new one</p>
        </div>
      </div>
    );
  }

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Google Docs Style Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-lg font-semibold focus:outline-none bg-transparent text-gray-900 placeholder-gray-400 flex-1 min-w-0"
                placeholder="Untitled document"
              />
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-gray-500">
                <Clock className="h-3 w-3" />
                {new Date(currentNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {isOnline ? (
                <span className="flex items-center gap-1 text-green-600">
                  <Wifi className="h-3 w-3" />
                  Online
                </span>
              ) : (
                <span className="flex items-center gap-1 text-orange-600">
                  <WifiOff className="h-3 w-3" />
                  Offline
                </span>
              )}
              {isSyncing && (
                <span className="flex items-center gap-1 text-blue-600">
                  <CloudUpload className="h-3 w-3 animate-pulse" />
                  Syncing...
                </span>
              )}
              {pendingOps > 0 && !isSyncing && (
                <span className="flex items-center gap-1 text-yellow-600">
                  <CloudUpload className="h-3 w-3" />
                  {pendingOps} pending
                </span>
              )}
            </div>
          </div>
          <input
            type="text"
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            className="w-full text-sm focus:outline-none bg-transparent text-gray-600 placeholder-gray-400 pl-8"
            placeholder="Add a description..."
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50/50 backdrop-blur-xl sticky top-[60px] z-10">
        <div className="px-8 py-4">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('bold')
                  ? 'bg-blue-100 text-blue-600'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Bold"
            >
              <Bold className="h-5 w-5" />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('italic')
                  ? 'bg-blue-100 text-blue-600'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Italic"
            >
              <Italic className="h-5 w-5" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('heading', { level: 1 })
                  ? 'bg-blue-100 text-blue-600'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Heading 1"
            >
              <Heading1 className="h-5 w-5" />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('heading', { level: 2 })
                  ? 'bg-blue-100 text-blue-600'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Heading 2"
            >
              <Heading2 className="h-5 w-5" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('bulletList')
                  ? 'bg-blue-100 text-blue-600'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Bullet List"
            >
              <List className="h-5 w-5" />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('orderedList')
                  ? 'bg-blue-100 text-blue-600'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Numbered List"
            >
              <ListOrdered className="h-5 w-5" />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('taskList')
                  ? 'bg-blue-100 text-blue-600'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Task List"
            >
              <CheckSquare className="h-5 w-5" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('codeBlock')
                  ? 'bg-blue-100 text-blue-600'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Code Block"
            >
              <Code className="h-5 w-5" />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded-lg transition-all ${
                editor.isActive('blockquote')
                  ? 'bg-blue-100 text-blue-600'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Quote"
            >
              <Quote className="h-5 w-5" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 disabled:opacity-30 transition-all"
              title="Undo"
            >
              <Undo className="h-5 w-5" />
            </button>

            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 disabled:opacity-30 transition-all"
              title="Redo"
            >
              <Redo className="h-5 w-5" />
            </button>

            <div className="flex-1" />

            <button
              onClick={summarizeNote}
              disabled={isSummarizing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">
                {isSummarizing ? 'Summarizing...' : 'AI Summary'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="flex-1 overflow-y-auto px-8 pt-6" />
    </div>
  );
}
