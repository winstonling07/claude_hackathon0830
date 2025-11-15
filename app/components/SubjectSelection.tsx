'use client';

import { useState } from 'react';
import { CheckCircle2, ArrowRight, Book, Briefcase, Music, Code, Calculator, FlaskConical, Globe, Paintbrush, Dumbbell, Heart } from 'lucide-react';

interface SubjectSelectionProps {
  role: 'mentor' | 'mentee';
  onComplete: (subjects: string[]) => void;
}

const subjectCategories = [
  {
    name: 'Academic Subjects',
    icon: Book,
    subjects: [
      { id: 'mathematics', label: 'Mathematics', icon: Calculator },
      { id: 'science', label: 'Science', icon: FlaskConical },
      { id: 'computer-science', label: 'Computer Science', icon: Code },
      { id: 'languages', label: 'Languages', icon: Globe },
      { id: 'history', label: 'History', icon: Book },
      { id: 'literature', label: 'Literature', icon: Book },
      { id: 'economics', label: 'Economics', icon: Book },
      { id: 'psychology', label: 'Psychology', icon: Book },
      { id: 'engineering', label: 'Engineering', icon: Calculator },
      { id: 'medicine', label: 'Medicine', icon: Heart },
    ],
  },
  {
    name: 'Professional Development',
    icon: Briefcase,
    subjects: [
      { id: 'career-guidance', label: 'Career Guidance', icon: Briefcase },
      { id: 'resume-writing', label: 'Resume Writing', icon: Briefcase },
      { id: 'interview-prep', label: 'Interview Preparation', icon: Briefcase },
      { id: 'networking', label: 'Networking', icon: Briefcase },
      { id: 'leadership', label: 'Leadership Skills', icon: Briefcase },
      { id: 'public-speaking', label: 'Public Speaking', icon: Briefcase },
    ],
  },
  {
    name: 'Creative & Hobbies',
    icon: Paintbrush,
    subjects: [
      { id: 'art', label: 'Art & Design', icon: Paintbrush },
      { id: 'music', label: 'Music', icon: Music },
      { id: 'writing', label: 'Creative Writing', icon: Book },
      { id: 'photography', label: 'Photography', icon: Paintbrush },
    ],
  },
  {
    name: 'Wellness & Lifestyle',
    icon: Heart,
    subjects: [
      { id: 'fitness', label: 'Fitness & Health', icon: Dumbbell },
      { id: 'mindfulness', label: 'Mindfulness & Meditation', icon: Heart },
      { id: 'time-management', label: 'Time Management', icon: Briefcase },
      { id: 'study-skills', label: 'Study Skills', icon: Book },
    ],
  },
];

export default function SubjectSelection({ role, onComplete }: SubjectSelectionProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleContinue = () => {
    if (selectedSubjects.length === 0) {
      alert(`Please select at least one subject you're ${role === 'mentor' ? 'proficient in' : 'interested in learning'}.`);
      return;
    }
    onComplete(selectedSubjects);
  };

  const getActionText = () => {
    return role === 'mentor'
      ? 'Select subjects you\'re proficient in'
      : 'Select subjects you want to learn';
  };

  const getDescription = () => {
    return role === 'mentor'
      ? 'Help us match you with mentees by selecting the areas where you can provide guidance'
      : 'Tell us what you\'d like to learn so we can find the perfect mentor for you';
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 py-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
            <Book className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{getActionText()}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">{getDescription()}</p>
          <p className="text-sm text-gray-500 mt-2">You can select multiple subjects</p>
        </div>

        <div className="space-y-8 mb-8">
          {subjectCategories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <div key={category.name} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                  <CategoryIcon className="h-6 w-6 text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.subjects.map((subject) => {
                    const SubjectIcon = subject.icon;
                    const isSelected = selectedSubjects.includes(subject.id);
                    return (
                      <button
                        key={subject.id}
                        onClick={() => toggleSubject(subject.id)}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-purple-500' : 'bg-gray-100'
                          }`}
                        >
                          <SubjectIcon
                            className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-gray-600'}`}
                          />
                        </div>
                        <span className={`flex-1 font-medium ${isSelected ? 'text-purple-900' : 'text-gray-700'}`}>
                          {subject.label}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                {selectedSubjects.length} {selectedSubjects.length === 1 ? 'subject' : 'subjects'} selected
              </p>
              <p className="text-xs text-blue-700">
                You can always update your subjects later in your profile settings
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={selectedSubjects.length === 0}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete Signup
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

