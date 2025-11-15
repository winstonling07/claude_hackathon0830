'use client';

import { useState } from 'react';
import { Upload, FileAudio, Languages, BookOpen, Loader2, CheckCircle2, XCircle, Mic, FileText, Copy, Check } from 'lucide-react';
import { db } from '../lib/db';

export default function LectureUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [originalLanguage, setOriginalLanguage] = useState('english');
  const [targetLanguage, setTargetLanguage] = useState('english');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'transcribing' | 'translating' | 'complete' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // If English is selected, automatically use transcribe-only mode
  const isEnglish = originalLanguage === 'english';
  const isTranscribeOnly = isEnglish;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check if it's an audio file
      if (selectedFile.type.startsWith('audio/')) {
        setFile(selectedFile);
        setError(null);
        setTranscript(null); // Clear previous transcript when new file is selected
      } else {
        setError('Please select an audio file (MP3, WAV, M4A, etc.)');
      }
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setOriginalLanguage(newLanguage);
    setTranscript(null); // Clear transcript when language changes
    setError(null);
  };

  const handleTranscribe = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setUploadStatus('uploading');
    setTranscript(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('originalLanguage', originalLanguage);
      formData.append('targetLanguage', targetLanguage);

      // Upload and transcribe
      setUploadStatus('transcribing');
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const transcribeData = await transcribeResponse.json();

      if (!transcribeResponse.ok) {
        const errorMessage = transcribeData.error || 'Failed to transcribe audio';
        throw new Error(errorMessage);
      }

      if (!transcribeData.transcript) {
        throw new Error('No transcript received from server');
      }

      const { transcript: newTranscript } = transcribeData;
      setTranscript(newTranscript);

      // If transcribe only, stop here
      if (isTranscribeOnly) {
        setUploadStatus('complete');
        return;
      }

      // Translate and generate comprehension aids
      setUploadStatus('translating');
      const translateResponse = await fetch('/api/translate-lecture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: newTranscript,
          originalLanguage,
          targetLanguage,
        }),
      });

      if (!translateResponse.ok) {
        throw new Error('Failed to translate lecture');
      }

      const { simplifiedEnglish, translatedVersion, glossary, keyPoints } = await translateResponse.json();

      // Save to IndexedDB
      await db.lectureNotes.add({
        id: crypto.randomUUID(),
        title: file.name.replace(/\.[^/.]+$/, ''),
        originalLanguage,
        targetLanguage,
        audioFileName: file.name,
        originalTranscript: newTranscript,
        simplifiedEnglish,
        translatedVersion,
        glossary,
        keyPoints,
        createdAt: new Date(),
        updatedAt: new Date(),
        syncStatus: 'pending',
      });

      setUploadStatus('complete');
      setTimeout(() => {
        // Reset form after 2 seconds (only if not transcribe only)
        if (!isTranscribeOnly) {
          setFile(null);
          setUploadStatus('idle');
          setTranscript(null);
        }
      }, 2000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process lecture');
      setUploadStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyTranscript = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy transcript:', err);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTranscript(null);
    setUploadStatus('idle');
    setError(null);
  };

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Uploading audio file...';
      case 'transcribing':
        return 'Transcribing lecture...';
      case 'translating':
        return 'Translating and generating comprehension aids...';
      case 'complete':
        return 'Lecture processed successfully!';
      case 'error':
        return error || 'An error occurred';
      default:
        return '';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-4">
              <Languages className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Lecture Transcription</h2>
            <p className="text-gray-600">
              Upload your lecture audio to transcribe in English or translate to another language
            </p>
          </div>

          {/* Language Selection */}
          <div className={`grid gap-4 mb-6 ${isEnglish ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audio Language
              </label>
              <select
                value={originalLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 select-dropdown"
                disabled={isProcessing}
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="italian">Italian</option>
                <option value="portuguese">Portuguese</option>
                <option value="chinese">Chinese</option>
                <option value="japanese">Japanese</option>
                <option value="korean">Korean</option>
              </select>
            </div>
            {!isEnglish && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Translate To
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 select-dropdown"
                  disabled={isProcessing}
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                </select>
              </div>
            )}
          </div>

          {/* Info Message */}
          {isEnglish && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <Mic className="h-4 w-4 inline mr-2" />
                English audio will be transcribed only. No translation needed.
              </p>
            </div>
          )}
          {!isEnglish && (
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                <Languages className="h-4 w-4 inline mr-2" />
                Audio will be transcribed and translated to {targetLanguage}.
              </p>
            </div>
          )}

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              file
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
            }`}
          >
            <input
              type="file"
              id="audio-upload"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isProcessing}
            />
            <label
              htmlFor="audio-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              {file ? (
                <>
                  <FileAudio className="h-12 w-12 text-indigo-600 mb-3" />
                  <p className="text-lg font-medium text-gray-900 mb-1">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    Drop your lecture audio here
                  </p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                  <p className="text-xs text-gray-400 mt-2">MP3, WAV, M4A, etc.</p>
                </>
              )}
            </label>
          </div>

          {/* Error Message */}
          {error && uploadStatus === 'error' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && uploadStatus !== 'error' && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <Loader2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
              <p className="text-sm text-blue-800">{getStatusMessage()}</p>
            </div>
          )}

          {/* Success Message */}
          {uploadStatus === 'complete' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{getStatusMessage()}</p>
            </div>
          )}


          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleTranscribe}
              disabled={!file || isProcessing}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                file && !isProcessing
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {uploadStatus === 'transcribing' ? 'Transcribing...' : uploadStatus === 'translating' ? 'Translating...' : 'Processing...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isTranscribeOnly ? (
                    <>
                      <Mic className="h-5 w-5" />
                      Transcribe Audio
                    </>
                  ) : (
                    <>
                      <Languages className="h-5 w-5" />
                      Process Lecture
                    </>
                  )}
                </span>
              )}
            </button>
            {transcript && (
              <button
                onClick={handleReset}
                disabled={isProcessing}
                className="py-3 px-6 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
              >
                Reset
              </button>
            )}
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Transcript
                </h3>
                <button
                  onClick={handleCopyTranscript}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {transcript}
                </p>
              </div>
              {!isTranscribeOnly && uploadStatus === 'complete' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ Transcript saved with translation and comprehension aids!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Features List */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">What you'll get:</h3>
            <div className="space-y-2">
              {isEnglish ? (
                <>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>Full transcript in English</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Copy transcript to clipboard</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>Full transcript in original language</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Simplified English version for easier comprehension</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 text-pink-600 flex-shrink-0 mt-0.5" />
                    <span>Complete translation to your target language</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>Glossary of key terms with definitions</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Summary of main points and concepts</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
