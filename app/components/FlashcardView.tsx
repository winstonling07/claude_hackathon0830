'use client';

import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, RotateCcw, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function FlashcardView() {
  const { currentNote, flashcardSets, addFlashcardSet, addCardToSet, updateFlashcard } = useStore();
  const [mode, setMode] = useState<'edit' | 'study'>('edit');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  const currentSet = flashcardSets.find(set => set.noteId === currentNote?.id);

  useEffect(() => {
    if (currentNote && !currentSet) {
      addFlashcardSet(currentNote.id);
    }
  }, [currentNote, currentSet, addFlashcardSet]);

  if (!currentNote || !currentSet) {
    return null;
  }

  const addCard = () => {
    if (newFront.trim() && newBack.trim()) {
      addCardToSet(currentSet.id, {
        front: newFront,
        back: newBack,
        mastered: false,
      });
      setNewFront('');
      setNewBack('');
    }
  };

  const toggleMastery = () => {
    const card = currentSet.cards[currentCardIndex];
    if (card) {
      updateFlashcard(currentSet.id, card.id, { mastered: !card.mastered });
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % currentSet.cards.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + currentSet.cards.length) % currentSet.cards.length);
  };

  const masteredCount = currentSet.cards.filter(c => c.mastered).length;
  const currentCard = currentSet.cards[currentCardIndex];

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl p-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentNote.title}</h2>
            <p className="text-gray-500 mt-1">
              {currentSet.cards.length} cards • {masteredCount} mastered
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('edit')}
              className={`px-4 py-2 rounded-lg transition-all ${
                mode === 'edit'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Edit Cards
            </button>
            <button
              onClick={() => setMode('study')}
              className={`px-4 py-2 rounded-lg transition-all ${
                mode === 'study'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={currentSet.cards.length === 0}
            >
              Study Mode
            </button>
          </div>
        </div>
      </div>

      {mode === 'edit' ? (
        <div className="flex-1 overflow-y-auto p-8">
          {/* Add New Card */}
          <div className="max-w-3xl mx-auto mb-8 bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Add New Card</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Front (Question)
                </label>
                <textarea
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                  placeholder="Enter the question..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Back (Answer)
                </label>
                <textarea
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                  placeholder="Enter the answer..."
                />
              </div>
              <button
                onClick={addCard}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Add Card</span>
              </button>
            </div>
          </div>

          {/* Card List */}
          <div className="max-w-3xl mx-auto space-y-4">
            {currentSet.cards.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No flashcards yet. Add your first card above!</p>
              </div>
            ) : (
              currentSet.cards.map((card, index) => (
                <div
                  key={card.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-purple-600 mb-1">FRONT</div>
                        <p className="text-gray-900">{card.front}</p>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-pink-600 mb-1">BACK</div>
                        <p className="text-gray-700">{card.back}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {card.mastered && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Mastered
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          {currentSet.cards.length === 0 ? (
            <div className="text-center text-gray-400">
              <p>Add some cards to start studying!</p>
            </div>
          ) : (
            <div className="w-full max-w-2xl">
              {/* Progress */}
              <div className="text-center mb-8">
                <div className="text-sm text-gray-600 mb-2">
                  Card {currentCardIndex + 1} of {currentSet.cards.length}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                    style={{ width: `${((currentCardIndex + 1) / currentSet.cards.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Flashcard */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative h-96 cursor-pointer perspective-1000"
              >
                <div
                  className={`absolute inset-0 transition-transform duration-500 transform-style-3d ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Front */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl shadow-2xl p-12 flex items-center justify-center backface-hidden">
                    <div className="text-center text-white">
                      <div className="text-sm font-semibold mb-4 opacity-80">QUESTION</div>
                      <p className="text-3xl font-bold">{currentCard?.front}</p>
                      <p className="text-sm mt-8 opacity-60">Click to reveal answer</p>
                    </div>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-pink-600 rounded-3xl shadow-2xl p-12 flex items-center justify-center backface-hidden rotate-y-180">
                    <div className="text-center text-white">
                      <div className="text-sm font-semibold mb-4 opacity-80">ANSWER</div>
                      <p className="text-3xl font-bold">{currentCard?.back}</p>
                      <p className="text-sm mt-8 opacity-60">Click to flip back</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={prevCard}
                  className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all text-gray-700 hover:bg-gray-50"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                  onClick={toggleMastery}
                  className={`px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all font-medium ${
                    currentCard?.mastered
                      ? 'bg-gray-200 text-gray-700'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {currentCard?.mastered ? 'Unmark Mastered' : 'Mark as Mastered'}
                </button>

                <button
                  onClick={nextCard}
                  className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all text-gray-700 hover:bg-gray-50"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
