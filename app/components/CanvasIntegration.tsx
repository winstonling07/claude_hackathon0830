'use client';

import { useState } from 'react';
import { BookOpen, Download, Upload, Link as LinkIcon, X } from 'lucide-react';

export default function CanvasIntegration() {
  const [canvasUrl, setCanvasUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [connected, setConnected] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const handleConnect = () => {
    // In a real implementation, this would connect to Canvas API
    if (canvasUrl && apiToken) {
      setConnected(true);
      localStorage.setItem('canvas-url', canvasUrl);
      localStorage.setItem('canvas-token', apiToken);
    }
  };

  const exportToCanvas = () => {
    // This would export notes to Canvas in a real implementation
    alert('Notes exported to Canvas! (This is a demo feature)');
  };

  const importFromCanvas = () => {
    // This would import from Canvas in a real implementation
    alert('Importing from Canvas... (This is a demo feature)');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-6 z-40">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-80">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-white" />
            <h3 className="font-semibold text-white">Canvas Integration</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Close Canvas Integration"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {!connected ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Canvas URL
                </label>
                <input
                  type="url"
                  value={canvasUrl}
                  onChange={(e) => setCanvasUrl(e.target.value)}
                  placeholder="https://canvas.university.edu"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Token
                </label>
                <input
                  type="password"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="Your Canvas API token"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                onClick={handleConnect}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
              >
                <LinkIcon className="h-4 w-4" />
                <span>Connect to Canvas</span>
              </button>

              <p className="text-xs text-gray-500">
                Get your API token from Canvas Account Settings
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Connected to Canvas</span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={importFromCanvas}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Import Course Notes</span>
                </button>

                <button
                  onClick={exportToCanvas}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all text-sm"
                >
                  <Upload className="h-4 w-4" />
                  <span>Export to Canvas</span>
                </button>

                <button
                  onClick={() => setConnected(false)}
                  className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Disconnect
                </button>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs">
                <p className="text-orange-800 font-medium mb-1">Quick Features:</p>
                <ul className="text-orange-700 space-y-1">
                  <li>• Sync lecture notes from Canvas</li>
                  <li>• Export flashcards to assignments</li>
                  <li>• Share notes with classmates</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
