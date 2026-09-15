import React, { useState } from 'react';
import {
  GraduationCap,
  School,
  Lock,
  ArrowRight,
  ShieldAlert,
  ChevronLeft,
  KeyRound,
  ShieldCheck,
  Building,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginView: React.FC = () => {
  const { loginStudent, loginTeacher, loginAdminMaster, loginAdminCredentials } = useApp();

  // Selected view: 'home' | 'student' | 'teacher' | 'admin'
  const [activePortal, setActivePortal] = useState<'home' | 'student' | 'teacher' | 'admin'>('home');

  // Student Form State
  const [scholarNo, setScholarNo] = useState('');
  const [studentPassword, setStudentPassword] = useState('student123');
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Teacher Form State
  const [teacherNo, setTeacherNo] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('teacher123');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);

  // Admin Form State
  const [adminTab, setAdminTab] = useState<'master' | 'credentials'>('master');
  const [adminMasterCode, setAdminMasterCode] = useState('');
  const [showMasterCode, setShowMasterCode] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminMobile, setAdminMobile] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!scholarNo.trim()) {
      setErrorMessage('Please enter your Scholar No.');
      return;
    }
    const res = loginStudent(scholarNo, studentPassword);
    if (!res.success) {
      setErrorMessage(res.message || 'Login failed.');
    }
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!teacherNo.trim()) {
      setErrorMessage('Please enter your Teacher No.');
      return;
    }
    const res = loginTeacher(teacherNo, teacherPassword);
    if (!res.success) {
      setErrorMessage(res.message || 'Login failed.');
    }
  };

  const handleAdminMasterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!adminMasterCode.trim()) {
      setErrorMessage('Please enter the Admin Master Code.');
      return;
    }
    const res = loginAdminMaster(adminMasterCode);
    if (!res.success) {
      setErrorMessage(res.message || 'Invalid master authorization code.');
    }
  };

  const handleAdminCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!adminName.trim() || !adminMobile.trim() || !adminEmail.trim() || !adminPassword.trim()) {
      setErrorMessage('All fields (Name, Mobile No, Email, Password) are required.');
      return;
    }
    const res = loginAdminCredentials(adminName, adminMobile, adminEmail, adminPassword);
    if (!res.success) {
      setErrorMessage(res.message || 'Invalid administrator credentials.');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      {/* Top Quick Role Navigation Tabs */}
      <div className="w-full max-w-5xl mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Building className="h-4 w-4 text-emerald-600" />
          <span className="font-semibold text-slate-700">VeriClass™ Gateway</span>
          <span>•</span>
          <span>Role Authentication</span>
        </div>

        {activePortal !== 'home' && (
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null);
              setActivePortal('home');
            }}
            className="flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Switch Role</span>
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl">
        {/* VIEW 1: HOME SELECTION - 3 Clear Portals (Student, Faculty, Admin) */}
        {activePortal === 'home' && (
          <div className="text-center">
            {/* Header Banner */}
            <div className="mx-auto max-w-2xl mb-10">
              <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1 text-xs font-semibold text-emerald-800 shadow-2xs mb-4">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Geofenced Attendance & Academic Operations Portal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Institutional Portal Login
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-600">
                Select your institutional role to access classroom presence verification, faculty coursework management, or administrative operations.
              </p>
            </div>

            {/* 3 Prominent Role Portal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* 1. Student Portal Card */}
              <div
                onClick={() => {
                  setErrorMessage(null);
                  setActivePortal('student');
                }}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 sm:p-7 text-left transition-all hover:border-emerald-500 hover:shadow-xl shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <School className="h-6 w-6" />
                  </div>
                  <div className="mt-5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      Scholar Access
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-slate-900">Student Portal</h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Verify presence inside assigned classrooms with GPS geofencing & real-time photo verification. Access homework, practicals, and report cards.
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs sm:text-sm font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">
                  <span>Login with Scholar No.</span>
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </div>
              </div>

              {/* 2. Teacher Portal Card */}
              <div
                onClick={() => {
                  setErrorMessage(null);
                  setActivePortal('teacher');
                }}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 sm:p-7 text-left transition-all hover:border-indigo-500 hover:shadow-xl shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div className="mt-5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                      Faculty Access
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-slate-900">Teacher Portal</h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Initiate geofenced attendance sessions for your branch & section. Publish assignments, homework, and evaluate scholar submissions.
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs sm:text-sm font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  <span>Login with Teacher No.</span>
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </div>
              </div>

              {/* 3. Administrator Portal Card */}
              <div
                onClick={() => {
                  setErrorMessage(null);
                  setActivePortal('admin');
                }}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 sm:p-7 text-left transition-all hover:border-rose-500 hover:shadow-xl shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 group-hover:bg-rose-600 group-hover:text-white transition-all">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="mt-5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                      Governance & Oversight
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-slate-900">Admin Portal</h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Manage institution branches, sections, faculty records, student enrollment, classroom geofence perimeters, and institutional logs.
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs sm:text-sm font-semibold text-rose-600 group-hover:translate-x-1 transition-transform">
                  <span>Login to Admin Console</span>
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: STUDENT LOGIN */}
        {activePortal === 'student' && (
          <div className="max-w-md mx-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
            <button
              type="button"
              onClick={() => setActivePortal('home')}
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition cursor-pointer"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Role Selection
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <School className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Student Sign In</h2>
                <p className="text-xs text-slate-500">Enter your assigned institutional Scholar No.</p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-start space-x-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Scholar Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SCH-2024-001"
                  value={scholarNo}
                  onChange={(e) => setScholarNo(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-200 transition uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Student Password
                </label>
                <div className="relative">
                  <input
                    type={showStudentPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-200 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showStudentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition-all cursor-pointer"
              >
                Access Student Portal
              </button>
            </form>

            {/* Quick Demo Pre-fill for easy testing */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Sample Student Accounts:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setScholarNo('SCH-2024-001');
                    setStudentPassword('student123');
                  }}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer"
                >
                  Aarav (SCH-2024-001)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScholarNo('SCH-2024-002');
                    setStudentPassword('student123');
                  }}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer"
                >
                  Rhea (SCH-2024-002)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScholarNo('SCH-2024-004');
                    setStudentPassword('student123');
                  }}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer"
                >
                  Meera (SCH-2024-004)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: TEACHER LOGIN */}
        {activePortal === 'teacher' && (
          <div className="max-w-md mx-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
            <button
              type="button"
              onClick={() => setActivePortal('home')}
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition cursor-pointer"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Role Selection
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Faculty Sign In</h2>
                <p className="text-xs text-slate-500">Enter your assigned Teacher No.</p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-start space-x-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Teacher Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TCH-101"
                  value={teacherNo}
                  onChange={(e) => setTeacherNo(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-200 transition uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Faculty Password
                </label>
                <div className="relative">
                  <input
                    type={showTeacherPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-200 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showTeacherPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-all cursor-pointer"
              >
                Access Faculty Portal
              </button>
            </form>

            {/* Quick Demo Pre-fill */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Sample Faculty Accounts:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTeacherNo('TCH-101');
                    setTeacherPassword('teacher123');
                  }}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition cursor-pointer"
                >
                  Prof. Rajesh (TCH-101)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTeacherNo('TCH-102');
                    setTeacherPassword('teacher123');
                  }}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition cursor-pointer"
                >
                  Dr. Ananya (TCH-102)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: ADMIN LOGIN */}
        {activePortal === 'admin' && (
          <div className="max-w-lg mx-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
            <button
              type="button"
              onClick={() => setActivePortal('home')}
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition cursor-pointer"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Role Selection
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Administrator Console</h2>
                <p className="text-xs text-slate-500">Sign in with Master Authorization Code or Admin Credentials</p>
              </div>
            </div>

            {/* Admin Login Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setAdminTab('master');
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
                  adminTab === 'master'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Master Authorization Code
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setAdminTab('credentials');
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
                  adminTab === 'credentials'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin Credentials Login
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-start space-x-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB A: Master Password Code (Confidential & Masked, NO leaked secret in front!) */}
            {adminTab === 'master' && (
              <form onSubmit={handleAdminMasterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Master Authorization Code <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showMasterCode ? 'text' : 'password'}
                      required
                      placeholder="Enter master authorization code"
                      value={adminMasterCode}
                      onChange={(e) => setAdminMasterCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-mono font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden focus:ring-2 focus:ring-rose-200 transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMasterCode(!showMasterCode)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showMasterCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Enter the confidential master authorization code issued for institutional administrative access.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-rose-600 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-rose-500 transition-all cursor-pointer"
                >
                  Verify Authorization & Sign In
                </button>
              </form>
            )}

            {/* TAB B: Admin Credentials (Name, Mobile, Email, Password) */}
            {adminTab === 'credentials' && (
              <form onSubmit={handleAdminCredentialsSubmit} className="space-y-3.5">
                <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 mb-2 border border-slate-200">
                  Enter the administrative credentials registered by the institutional head.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Admin Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Arvind Sharma"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9811223344"
                      value={adminMobile}
                      onChange={(e) => setAdminMobile(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Official Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin@vericlass.edu"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter account password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white shadow hover:bg-rose-500 transition cursor-pointer"
                  >
                    Sign In as Administrator
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
