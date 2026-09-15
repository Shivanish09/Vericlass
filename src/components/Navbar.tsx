import React, { useState } from 'react';
import {
  Bell,
  LogOut,
  Download,
  School,
  User,
  GraduationCap,
  ShieldCheck,
  Building,
  Layers,
  X,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportInstitutionDataZip, downloadBlob } from '../utils/zipUtils';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    currentRole,
    logout,
    notifications,
    markNotificationRead,
    attendanceSessions,
    students,
    teachers,
    classrooms,
    academicMaterials,
    reportCards,
    getBranch,
    getSection,
    isServerSynced,
    lastServerSyncTime,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Filter notifications for this role or user
  const relevantNotifications = notifications.filter((n) => {
    if (n.targetRole === 'all') return true;
    if (currentRole && n.targetRole === currentRole) {
      if (currentRole === 'student' && 'branchId' in (currentUser || {})) {
        const student = currentUser as any;
        if (n.branchId && n.branchId !== student.branchId) return false;
        if (n.sectionId && n.sectionId !== student.sectionId) return false;
      }
      return true;
    }
    return false;
  });

  const unreadCount = relevantNotifications.filter((n) => !n.read).length;

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      const zipBlob = await exportInstitutionDataZip({
        sessions: attendanceSessions,
        students,
        teachers,
        classrooms,
        materials: academicMaterials,
        reportCards,
      });
      downloadBlob(zipBlob, `VeriClass_Institution_Archive_${new Date().toISOString().slice(0, 10)}.zip`);
    } catch (err) {
      console.error('Failed to export ZIP:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const getRoleBadge = () => {
    switch (currentRole) {
      case 'admin':
        return {
          label: 'Administrator',
          bg: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: ShieldCheck,
        };
      case 'teacher':
        return {
          label: 'Faculty',
          bg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          icon: GraduationCap,
        };
      case 'student':
        return {
          label: 'Student',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: School,
        };
      default:
        return { label: 'Guest', bg: 'bg-slate-100 text-slate-700', icon: User };
    }
  };

  const badge = getRoleBadge();
  const IconComponent = badge.icon;

  let branchInfo = '';
  if (currentUser) {
    if ('branchId' in currentUser && currentUser.branchId) {
      const b = getBranch(currentUser.branchId);
      const s = 'sectionId' in currentUser ? getSection(currentUser.sectionId) : null;
      branchInfo = `${b?.code || ''} ${s ? `• ${s.name}` : ''}`;
    } else if ('departmentBranchId' in currentUser && currentUser.departmentBranchId) {
      const b = getBranch(currentUser.departmentBranchId);
      branchInfo = `${b?.code || ''} Dept`;
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <School className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-slate-900 text-lg sm:text-xl">
                Veri<span className="text-emerald-600">Class</span>
              </span>
              <span className="hidden sm:inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
              Geofenced Attendance & Academic Portal
            </p>
          </div>
        </div>

        {/* User Context & Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Multi-Device Cloud Sync Pill */}
          <div
            className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-slate-200 bg-slate-50 text-slate-700"
            title={
              isServerSynced
                ? `Active multi-device sync with server. Last sync: ${lastServerSyncTime || 'now'}`
                : 'Reconnecting to live server...'
            }
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isServerSynced ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-semibold text-slate-700">
              {isServerSynced ? 'Live Sync' : 'Reconnecting'}
            </span>
          </div>

          {/* Institution Data Backup ZIP Export */}
          {currentUser && (
            <button
              type="button"
              onClick={handleExportZip}
              disabled={isExporting}
              title="Export institutional records backup as ZIP"
              className="hidden lg:flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>{isExporting ? 'Exporting...' : 'Data Backup'}</span>
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              title="System Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-sm font-semibold text-slate-800">Institute Notifications</h4>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2 divide-y divide-slate-50">
                  {relevantNotifications.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-400">No current notifications.</p>
                  ) : (
                    relevantNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`pt-2.5 pb-2 text-xs transition ${
                          notif.read ? 'opacity-70' : 'bg-slate-50/70 p-2 rounded-lg'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h5 className="font-semibold text-slate-800">{notif.title}</h5>
                          {!notif.read && (
                            <button
                              onClick={() => markNotificationRead(notif.id)}
                              className="text-[10px] text-emerald-600 hover:underline flex items-center shrink-0 ml-2"
                            >
                              <Check className="h-3 w-3 mr-0.5" /> Read
                            </button>
                          )}
                        </div>
                        <p className="mt-1 text-slate-600 leading-relaxed">{notif.message}</p>
                        <span className="mt-1 block text-[10px] text-slate-400">
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Current User Pill */}
          {currentUser && (
            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
              <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shrink-0">
                {'photoUrl' in currentUser && currentUser.photoUrl ? (
                  <img
                    src={currentUser.photoUrl}
                    alt={currentUser.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-600 font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="hidden sm:block text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-semibold text-slate-900 leading-tight">
                    {currentUser.name}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-md border px-1.5 py-0.2 text-[10px] font-semibold ${badge.bg}`}
                  >
                    <IconComponent className="mr-0.5 h-2.5 w-2.5" />
                    {badge.label}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {'scholarNo' in currentUser && (
                    <span className="font-mono font-semibold text-slate-700 mr-1.5">
                      {currentUser.scholarNo}
                    </span>
                  )}
                  {'teacherNo' in currentUser && (
                    <span className="font-mono font-semibold text-slate-700 mr-1.5">
                      {currentUser.teacherNo}
                    </span>
                  )}
                  {branchInfo && <span>({branchInfo})</span>}
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                title="Sign Out"
                className="ml-1 rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
