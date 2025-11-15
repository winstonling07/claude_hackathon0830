'use client';

import { useState } from 'react';
import { X, Mail, Copy, Check, Users } from 'lucide-react';
import { useStore, Note } from '../store/useStore';

interface ShareModalProps {
  note: Note;
  onClose: () => void;
}

export default function ShareModal({ note, onClose }: ShareModalProps) {
  const { updateNote } = useStore();
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);

  const shareLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/shared/${note.id}`;

  const handleShare = () => {
    if (email.trim()) {
      updateNote(note.id, {
        sharedWith: [...note.sharedWith, email],
      });
      setEmail('');
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Share Note</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-all"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Share via Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share with email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleShare()}
                placeholder="colleague@university.edu"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Shared With */}
          {note.sharedWith.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Shared with</div>
              <div className="space-y-2">
                {note.sharedWith.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{email}</span>
                    <button
                      onClick={() => {
                        updateNote(note.id, {
                          sharedWith: note.sharedWith.filter((_, i) => i !== index),
                        });
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or share with link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600"
              />
              <button
                onClick={copyLink}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Canvas Integration Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-1">Canvas Integration</h3>
            <p className="text-sm text-blue-700">
              Notes shared via email will be accessible to Canvas users with the same email address.
              They'll receive a notification in their Canvas inbox.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
