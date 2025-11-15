'use client';

import { useState } from 'react';
import { LogIn, UserPlus, ArrowRight } from 'lucide-react';
import SignupForm from './SignupForm';
import LoginForm from './LoginForm';
import RoleSelection from './RoleSelection';
import SubjectSelection from './SubjectSelection';
import { useStore } from '../store/useStore';

type AuthStep = 'choice' | 'login' | 'signup' | 'role' | 'subjects' | 'complete';

export default function SignupFlow() {
  const [step, setStep] = useState<AuthStep>('choice');
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

  const handleLoginComplete = async (loginData: { email: string; password: string }) => {
    try {
      // Login user via API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sign in');
      }

      if (!result.success || !result.user) {
        throw new Error(result.error || 'Sign in failed. Please try again.');
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
      console.error('Login error:', error);
      alert(error instanceof Error ? error.message : 'Failed to sign in. Please try again.');
    }
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

  if (step === 'choice') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
              <h1 className="text-4xl font-bold text-white">S</h1>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Welcome to SprintNotes
            </h1>
            <p className="text-lg text-gray-600">Your all-in-one study companion</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Sign In Card */}
            <button
              onClick={() => setStep('login')}
              className="group relative p-8 bg-white rounded-2xl shadow-xl border-2 border-gray-200 hover:border-blue-500 transition-all text-left hover:shadow-2xl"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <LogIn className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-600 mb-4">Welcome back! Sign in to continue your learning journey.</p>
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <span>Sign In</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Create Account Card */}
            <button
              onClick={() => setStep('signup')}
              className="group relative p-8 bg-white rounded-2xl shadow-xl border-2 border-gray-200 hover:border-purple-500 transition-all text-left hover:shadow-2xl"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-600 mb-4">Join our community and start your mentoring journey today.</p>
              <div className="flex items-center gap-2 text-purple-600 font-medium">
                <span>Sign Up</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'login') {
    return <LoginForm onComplete={handleLoginComplete} onSwitchToSignup={() => setStep('signup')} />;
  }

  if (step === 'signup') {
    return <SignupForm onComplete={handleSignupComplete} onSwitchToLogin={() => setStep('login')} />;
  }

  if (step === 'role') {
    return <RoleSelection onSelectRole={handleRoleSelect} />;
  }

  if (step === 'subjects' && role) {
    return <SubjectSelection role={role} onComplete={handleSubjectsComplete} />;
  }

  if (step === 'complete') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
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

