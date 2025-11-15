'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Send, MessageCircle, ArrowLeft, Loader2, Paperclip, X } from 'lucide-react';
import CanvasCoursesModal from './CanvasCoursesModal';

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

interface Match {
  id: string;
  status: string;
  otherUser: {
    id: string;
    email: string;
    role: string;
    subjects: string[];
  };
}

interface ChatInterfaceProps {
  matchId: string;
  onClose?: () => void;
}

export default function ChatInterface({ matchId, onClose }: ChatInterfaceProps) {
  const { user } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCanvasModal, setShowCanvasModal] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; url: string; type: 'assignment' | 'file' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (matchId && user) {
      loadMatch();
      loadMessages();
      
      // Poll for new messages every 3 seconds
      pollIntervalRef.current = setInterval(() => {
        loadMessages();
      }, 3000);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [matchId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMatch = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/matches/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) throw new Error('Failed to load match');

      const data = await response.json();
      const foundMatch = data.matches.find((m: Match) => m.id === matchId);
      setMatch(foundMatch || null);
    } catch (err) {
      console.error('Error loading match:', err);
    }
  };

  const loadMessages = async () => {
    if (!user || !matchId) return;

    try {
      const response = await fetch('/api/messages/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          userId: user.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to load messages');

      const data = await response.json();
      setMessages(data.messages || []);
      setError(null);
    } catch (err) {
      console.error('Error loading messages:', err);
      if (loading) {
        setError('Failed to load messages');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachedFile) || !user || !matchId || sending) return;

    setSending(true);
    setError(null);

    try {
      // Format message with attachment if present
      let messageContent = newMessage.trim();
      if (attachedFile) {
        const fileLink = `[Canvas ${attachedFile.type === 'assignment' ? 'Assignment' : 'File'}: ${attachedFile.name}](${attachedFile.url})`;
        messageContent = messageContent ? `${messageContent}\n\n${fileLink}` : fileLink;
      }

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          senderId: user.id,
          content: messageContent,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      setNewMessage('');
      setAttachedFile(null);
      // Reload messages to get the new one
      await loadMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSelectCanvasFile = (file: { name: string; url: string; type: 'assignment' | 'file' }) => {
    setAttachedFile(file);
    setShowCanvasModal(false);
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Please sign in to use chat</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Match not found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 bg-white">
        <div className="flex items-center gap-4">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
          )}
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">{match.otherUser.email}</h2>
            <p className="text-sm text-gray-500 capitalize">{match.otherUser.role}</p>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">Chat</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No messages yet</p>
            <p className="text-sm text-gray-500 mt-2">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === user.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwn
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {message.content.split('\n').map((line, idx) => {
                      // Check if line is a Canvas file link
                      const linkMatch = line.match(/\[Canvas (Assignment|File): ([^\]]+)\]\(([^)]+)\)/);
                      if (linkMatch) {
                        const [, type, name, url] = linkMatch;
                        return (
                          <div key={idx} className={`mt-2 p-2 rounded border ${
                            isOwn 
                              ? 'bg-white/20 border-white/30' 
                              : 'bg-blue-50 border-blue-200'
                          }`}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm font-medium underline hover:no-underline ${
                                isOwn ? 'text-white' : 'text-blue-700'
                              }`}
                            >
                              📎 {name} ({type})
                            </a>
                          </div>
                        );
                      }
                      return line ? <p key={idx}>{line}</p> : <br key={idx} />;
                    })}
                  </div>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white">
        {attachedFile && (
          <div className="mb-2 p-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-900 font-medium">{attachedFile.name}</span>
              <span className="text-xs text-orange-600">({attachedFile.type})</span>
            </div>
            <button
              type="button"
              onClick={() => setAttachedFile(null)}
              className="p-1 hover:bg-orange-100 rounded transition-colors"
            >
              <X className="h-4 w-4 text-orange-600" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowCanvasModal(true)}
            disabled={sending || match.status !== 'accepted'}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Attach Canvas file"
          >
            <Paperclip className="h-5 w-5 text-gray-600" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending || match.status !== 'accepted'}
          />
          <button
            type="submit"
            disabled={(!newMessage.trim() && !attachedFile) || sending || match.status !== 'accepted'}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        {match.status !== 'accepted' && (
          <p className="text-xs text-gray-500 mt-2">
            Wait for the match to be accepted before sending messages
          </p>
        )}
      </form>

      {/* Canvas Courses Modal */}
      <CanvasCoursesModal
        isOpen={showCanvasModal}
        onClose={() => setShowCanvasModal(false)}
        onSelectFile={handleSelectCanvasFile}
      />
    </div>
  );
}

