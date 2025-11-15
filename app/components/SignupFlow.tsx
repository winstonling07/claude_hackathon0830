'use client';

import { useState } from 'react';
import SignupForm from './SignupForm';
import RoleSelection from './RoleSelection';
import SubjectSelection from './SubjectSelection';
import { useStore } from '../store/useStore';

type SignupStep = 'signup' | 'role' | 'subjects' | 'complete';

export default function SignupFlow() {
  const [step, setStep] = useState<SignupStep>('signup');
  const [userData, setUserData] = useState<{
    email: string;
    password: string;
    birthday: string;
  } | null>(null);
  const [role, setRole] = useState<'mentor' | 'mentee' | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const setUser = useStore((state) => state.setUser);

  const handleSignupComplete = (data: { email: string; password: string; birthday: string }) => {
    setUserData(data);
    setStep('role');
  };

  const handleRoleSelect = (selectedRole: 'mentor' | 'mentee') => {
    setRole(selectedRole);
    setStep('subjects');
  };

  const handleSubjectsComplete = async (selectedSubjects: string[]) => {
    setSubjects(selectedSubjects);
    
    try {
      // Register user via API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData!.email,
          password: userData!.password,
          birthday: userData!.birthday,
          role,
          subjects: selectedSubjects,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account');
      }

      if (!result.success || !result.user) {
        throw new Error(result.error || 'Account creation failed. Please try again.');
      }
      
      // Save user to store and mark as authenticated
      setUser({
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        subjects: result.user.subjects,
        birthday: result.user.birthday,
      });

      setStep('complete');
    } catch (error) {
      console.error('Signup error:', error);
      alert(error instanceof Error ? error.message : 'Failed to create account. Please try again.');
    }
  };

  if (step === 'signup') {
    return <SignupForm onComplete={handleSignupComplete} />;
  }

  if (step === 'role') {
    return <RoleSelection onSelectRole={handleRoleSelect} />;
  }

  if (step === 'subjects' && role) {
    return <SubjectSelection role={role} onComplete={handleSubjectsComplete} />;
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SprintNotes!</h1>
          <p className="text-gray-600 mb-6">
            Your account has been created successfully. You're now ready to start your mentoring journey.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium shadow-lg"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  return null;
}

