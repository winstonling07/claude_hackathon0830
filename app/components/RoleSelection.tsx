'use client';

import { useState } from 'react';
import { GraduationCap, Users, ArrowRight, Sparkles, BookOpen } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (role: 'mentor' | 'mentee') => void;
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<'mentor' | 'mentee' | null>(null);

  const roles = [
    {
      id: 'mentor' as const,
      title: 'Mentor',
      icon: GraduationCap,
      description: 'Share your knowledge and guide students on their academic journey',
      longDescription: 'As a mentor, you\'ll help students succeed by providing guidance, answering questions, and sharing your expertise. Perfect if you excel in specific subjects and want to make a difference in someone\'s learning.',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      iconColor: 'text-purple-600',
    },
    {
      id: 'mentee' as const,
      title: 'Mentee',
      icon: BookOpen,
      description: 'Find expert mentors to help you learn and grow',
      longDescription: 'As a mentee, you\'ll be matched with experienced mentors who can help you master subjects, prepare for exams, and develop professionally. Get personalized guidance tailored to your learning goals.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
    },
  ];

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 overflow-y-auto">
      <div className="max-w-4xl w-full my-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Role</h1>
          <p className="text-gray-600">Select how you'd like to participate in our mentoring program</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? `${role.borderColor} border-4 shadow-xl scale-105`
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                } ${role.bgColor}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-r ${role.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 ${role.iconColor}`}>{role.title}</h3>
                    <p className="text-gray-700 mb-3 font-medium">{role.description}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{role.longDescription}</p>
                  </div>
                  {isSelected && (
                    <div className={`absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-r ${role.color} flex items-center justify-center`}>
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {selectedRole && (
          <div className="flex justify-center">
            <button
              onClick={() => onSelectRole(selectedRole)}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium shadow-lg"
            >
              Continue with {selectedRole === 'mentor' ? 'Mentor' : 'Mentee'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

