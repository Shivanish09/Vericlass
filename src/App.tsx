/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { RotateCcw, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentRole, currentUser, resetToDemoData } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <main className="flex-1">
        {!currentUser || !currentRole ? (
          <LoginView />
        ) : currentRole === 'admin' ? (
          <AdminDashboard />
        ) : currentRole === 'teacher' ? (
          <TeacherDashboard />
        ) : (
          <StudentDashboard />
        )}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>
              VeriClass™ Institutional Attendance & Academic Verification Engine
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all demo attendance records and data back to initial sample state?')) {
                  resetToDemoData();
                }
              }}
              className="flex items-center space-x-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              title="Reset initial dataset"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Demo Data</span>
            </button>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-400">
              GPS Geofencing • Real-Time Photo Verification
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
