import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Play,
  StopCircle,
  Radio,
  Users,
  CheckCircle,
  Clock,
  MapPin,
  Camera,
  Plus,
  BookOpen,
  FileText,
  HelpCircle,
  FlaskConical,
  Send,
  Award,
  ChevronRight,
  Eye,
  X,
  AlertCircle,
  Trash2,
  Calendar,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AcademicMaterialType, AttendanceRecord, AttendanceSession, TeacherUser } from '../../types';

export const TeacherDashboard: React.FC = () => {
  const {
    currentUser,
    branches,
    sections,
    classrooms,
    students,
    attendanceSessions,
    deleteAttendanceSession,
    startAttendanceSession,
    endAttendanceSession,
    getActiveSessionForTeacher,
    academicMaterials,
    addAcademicMaterial,
    materialSubmissions,
    gradeSubmission,
    reportCards,
    updateReportCard,
    addNotification,
  } = useApp();

  const teacher = currentUser as TeacherUser;

  // Active Tab: 'attendance' | 'materials' | 'submissions' | 'reports' | 'announcements'
  const [activeTab, setActiveTab] = useState<
    'attendance' | 'materials' | 'submissions' | 'reports' | 'announcements'
  >('attendance');

  // Active attendance session
  const activeSession = teacher ? getActiveSessionForTeacher(teacher.id) : undefined;
  const teacherSessions = teacher
    ? attendanceSessions.filter((s) => s.teacherId === teacher.id)
    : [];

  // Modal states for sessions
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [historyInspectedSession, setHistoryInspectedSession] = useState<AttendanceSession | null>(null);

  // Timer countdown state
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Start Attendance Form State
  const [selectedBranchId, setSelectedBranchId] = useState(teacher?.departmentBranchId || branches[0]?.id || '');
  const [selectedSectionId, setSelectedSectionId] = useState(
    sections.find((s) => s.branchId === (teacher?.departmentBranchId || branches[0]?.id))?.id || ''
  );
  const [selectedClassroomId, setSelectedClassroomId] = useState(classrooms[0]?.id || '');
  const [subjectName, setSubjectName] = useState(
    teacher?.assignedClasses?.[0]?.subject || 'Data Structures & Algorithms'
  );
  const [sessionTopic, setSessionTopic] = useState('');
  const [sessionDuration, setSessionDuration] = useState(15);

  // Material Creation Form State
  const [showCreateMaterial, setShowCreateMaterial] = useState(false);
  const [matType, setMatType] = useState<AcademicMaterialType>('assignment');
  const [matTitle, setMatTitle] = useState('');
  const [matSubject, setMatSubject] = useState(subjectName);
  const [matDueDate, setMatDueDate] = useState('2026-09-25');
  const [matMaxMarks, setMatMaxMarks] = useState<number>(20);
  const [matDescription, setMatDescription] = useState('');
  const [matQuestionInput, setMatQuestionInput] = useState('');
  const [matQuestionsList, setMatQuestionsList] = useState<string[]>([]);
  const [matAttachment, setMatAttachment] = useState('Lab_Assignment_Guide.pdf');

  // Photo Verification Modal state (for teacher to inspect live photo vs student profile)
  const [inspectedRecord, setInspectedRecord] = useState<AttendanceRecord | null>(null);

  // Announcement State
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementSent, setAnnouncementSent] = useState(false);

  // Update countdown clock
  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      const remaining = new Date(activeSession.expiresAt).getTime() - Date.now();
      if (remaining <= 0) {
        setTimeLeft('Expired');
      } else {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassroomId || !subjectName.trim()) return;

    startAttendanceSession({
      teacherId: teacher.id,
      branchId: selectedBranchId,
      sectionId: selectedSectionId,
      classroomId: selectedClassroomId,
      subject: subjectName,
      topic: sessionTopic,
      durationMinutes: Number(sessionDuration),
    });
    setShowAddSessionModal(false);
  };

  const handleEndSession = () => {
    if (activeSession) {
      endAttendanceSession(activeSession.id);
    }
  };

  const handleCreateMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim() || !matDescription.trim()) return;

    addAcademicMaterial({
      type: matType,
      title: matTitle.trim(),
      description: matDescription.trim(),
      teacherId: teacher.id,
      teacherName: teacher.name,
      branchId: selectedBranchId,
      sectionId: selectedSectionId,
      subject: matSubject,
      dueDate: matDueDate,
      maxMarks: Number(matMaxMarks),
      questions: matQuestionsList,
      attachmentName: matAttachment,
    });

    setMatTitle('');
    setMatDescription('');
    setMatQuestionsList([]);
    setShowCreateMaterial(false);
  };

  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;

    addNotification({
      targetRole: 'student',
      branchId: selectedBranchId,
      sectionId: selectedSectionId,
      title: `📢 ${announcementTitle}`,
      message: `${teacher.name}: ${announcementMessage}`,
      type: 'announcement',
    });

    setAnnouncementTitle('');
    setAnnouncementMessage('');
    setAnnouncementSent(true);
    setTimeout(() => setAnnouncementSent(false), 3000);
  };

  const activeClassroom = classrooms.find((c) => c.id === activeSession?.classroomId);
  const enrolledStudentsInActiveSection = students.filter(
    (s) => s.branchId === activeSession?.branchId && s.sectionId === activeSession?.sectionId
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            <GraduationCap className="h-4 w-4" />
            <span>Faculty Management Console</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome, {teacher.name} ({teacher.teacherNo})
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Launch geofenced classroom attendance, verify students in real time, and distribute academic coursework.
          </p>
        </div>

        {/* Live Attendance Banner Button */}
        {activeSession && (
          <div className="flex items-center space-x-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-emerald-800 shadow-xs">
            <Radio className="h-4 w-4 animate-pulse text-emerald-600" />
            <div className="text-xs">
              <span className="font-bold">Live Session Active:</span> {activeSession.subject}
              <span className="font-mono ml-2 font-bold text-emerald-700">({timeLeft} left)</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'attendance'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Radio className="h-4 w-4" />
          <span>Live Attendance & Geofencing</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('materials')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'materials'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Course Materials (Homework, Practicals)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'submissions'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Student Submissions ({materialSubmissions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'reports'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Report Cards & Internal Marks</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'announcements'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Send className="h-4 w-4" />
          <span>Broadcast Announcement</span>
        </button>
      </div>

      {/* ================= TAB 1: LIVE ATTENDANCE ================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Tab 1 Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Attendance Verification & Geofencing</h2>
              <p className="text-xs text-slate-500">
                Launch geofenced sessions for your classes, monitor incoming selfie verification proofs, or manage session records.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddSessionModal(true)}
              className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Attendance Session</span>
            </button>
          </div>

          {/* If an attendance session is ACTIVE: Show Live Monitor */}
          {activeSession ? (
            <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                      <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                      ACTIVE SESSION
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {activeClassroom?.roomNo} ({activeClassroom?.buildingName})
                    </span>
                  </div>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">{activeSession.subject}</h2>
                  <p className="text-xs text-slate-500">
                    Geofence Radius: {activeClassroom?.geofenceRadiusMeters}m • Topic:{' '}
                    {activeSession.topic || 'General Lecture'}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-semibold uppercase">Time Remaining</div>
                    <div className="text-2xl font-extrabold font-mono text-emerald-700">{timeLeft}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddSessionModal(true)}
                      className="flex items-center space-x-1.5 rounded-xl bg-indigo-50 border border-indigo-200 px-3.5 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>New Session</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleEndSession}
                      className="flex items-center space-x-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-rose-500 transition cursor-pointer"
                    >
                      <StopCircle className="h-4 w-4" />
                      <span>Close Session</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Attendance Progress Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b border-slate-100">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Verified Present</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {activeSession.records.length} / {enrolledStudentsInActiveSection.length}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    {enrolledStudentsInActiveSection.length > 0
                      ? `${Math.round(
                          (activeSession.records.length / enrolledStudentsInActiveSection.length) * 100
                        )}% Attendance Rate`
                      : '0%'}
                  </span>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Classroom GPS Beacon</span>
                  <div className="text-sm font-mono font-bold text-slate-800 mt-1">
                    {activeClassroom?.latitude.toFixed(4)}, {activeClassroom?.longitude.toFixed(4)}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Max Distance: {activeClassroom?.geofenceRadiusMeters}m
                  </span>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Verification Mode</span>
                  <div className="text-sm font-bold text-emerald-700 mt-1 flex items-center space-x-1">
                    <Camera className="h-4 w-4" />
                    <span>Live Selfie + GPS Check</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Only in-class selfies accepted</span>
                </div>
              </div>

              {/* Real-time Student Records Feed */}
              <div className="pt-6">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                  <span>Real-Time Incoming Attendance Stream</span>
                  <span className="text-xs font-normal text-slate-500">
                    Updates automatically as students capture selfie & submit
                  </span>
                </h3>

                {activeSession.records.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
                    No students have marked attendance yet. As students take real-time photos inside the
                    classroom, they will appear here instantly.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Live Photo</th>
                          <th className="p-3">Student & Scholar No</th>
                          <th className="p-3">Timestamp</th>
                          <th className="p-3">Geofence Distance</th>
                          <th className="p-3">Verification Score</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Inspect Photo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {activeSession.records.map((rec) => (
                          <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-3">
                              <img
                                src={rec.livePhotoUrl}
                                alt={rec.studentName}
                                className="h-10 w-10 rounded-xl object-cover border border-slate-200 shadow-2xs cursor-pointer"
                                onClick={() => setInspectedRecord(rec)}
                              />
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-slate-900 block">{rec.studentName}</span>
                              <span className="font-mono text-slate-400 text-[11px]">{rec.scholarNo}</span>
                            </td>
                            <td className="p-3 font-mono text-[11px] text-slate-500">{rec.timestamp}</td>
                            <td className="p-3">
                              <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-mono text-[11px]">
                                <MapPin className="h-3 w-3" />
                                <span>{rec.distanceMeters}m from beacon</span>
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-slate-800">{rec.verificationScore}%</span>
                            </td>
                            <td className="p-3">
                              <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                <CheckCircle className="h-3 w-3" />
                                <span>Verified Present</span>
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => setInspectedRecord(rec)}
                                className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>View Proof</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* If NO active session: Form to START attendance */
            <div className="max-w-2xl mx-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                  <Play className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Start Live Attendance Session</h2>
                  <p className="text-xs text-slate-500">
                    Students can ONLY mark their presence while this attendance session is actively running.
                  </p>
                </div>
              </div>

              <form onSubmit={handleStartSession} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Branch *</label>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => {
                        setSelectedBranchId(e.target.value);
                        const firstSec = sections.find((s) => s.branchId === e.target.value);
                        if (firstSec) setSelectedSectionId(firstSec.id);
                      }}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Section *</label>
                    <select
                      value={selectedSectionId}
                      onChange={(e) => setSelectedSectionId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                    >
                      {sections
                        .filter((s) => s.branchId === selectedBranchId)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Classroom (Geofence Beacon) *
                  </label>
                  <select
                    value={selectedClassroomId}
                    onChange={(e) => setSelectedClassroomId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                  >
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.roomNo} - {c.buildingName} ({c.geofenceRadiusMeters}m geofence)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Data Structures & Algorithms"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Session Duration</label>
                    <select
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                    >
                      <option value={5}>5 Minutes (Quick Call)</option>
                      <option value={10}>10 Minutes</option>
                      <option value={15}>15 Minutes (Standard)</option>
                      <option value={30}>30 Minutes</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Topic / Lecture Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. B-Trees and Distributed DB Replication"
                    value={sessionTopic}
                    onChange={(e) => setSessionTopic(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                  />
                </div>

                <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4 text-indigo-900 space-y-1 text-xs">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <Radio className="h-4 w-4 text-indigo-600" />
                    <span>Geofenced Physical Security</span>
                  </div>
                  <p className="text-slate-600">
                    When started, students registered in this Branch & Section will receive an instant notification.
                    Their devices will perform GPS geofence checks and require a live selfie inside the room.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Initiate Live Attendance Session</span>
                </button>
              </form>
            </div>
          )}

          {/* Attendance Sessions Log / History */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <History className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Attendance Session Records</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {teacherSessions.length} total
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSessionModal(true)}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Attendance Session</span>
              </button>
            </div>

            {teacherSessions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No attendance sessions logged yet. Click &quot;Add New Attendance Session&quot; to begin tracking presence.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="p-3">Subject & Topic</th>
                      <th className="p-3">Classroom</th>
                      <th className="p-3">Branch & Section</th>
                      <th className="p-3">Started</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Present</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {teacherSessions.map((s) => {
                      const branch = branches.find((b) => b.id === s.branchId);
                      const section = sections.find((sec) => sec.id === s.sectionId);
                      const room = classrooms.find((c) => c.id === s.classroomId);
                      const isActive = s.status === 'active';
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/70 transition">
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{s.subject}</span>
                            <span className="text-[11px] text-slate-500">{s.topic || 'General Lecture'}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-800">{room?.roomNo}</span>
                            <span className="text-slate-400 block text-[10px]">{room?.buildingName}</span>
                          </td>
                          <td className="p-3">
                            {branch?.code} • {section?.name}
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">
                            {new Date(s.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(s.startedAt).toLocaleDateString()})
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {s.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-900">{s.records.length} students</td>
                          <td className="p-3 text-right space-x-1.5">
                            {s.records.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setHistoryInspectedSession(s)}
                                className="inline-flex items-center space-x-1 rounded-lg bg-slate-100 hover:bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 transition cursor-pointer"
                              >
                                <Eye className="h-3 w-3" />
                                <span>Inspect ({s.records.length})</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => deleteAttendanceSession(s.id)}
                              title="Delete Session Record"
                              className="rounded-lg p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer inline-flex items-center"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: COURSE MATERIALS ================= */}
      {activeTab === 'materials' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Academic Coursework (Homework, Assignments, Practicals)
              </h2>
              <p className="text-xs text-slate-500">
                Send homework, practical manuals, and practice questions to students of your branch.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateMaterial(true)}
              className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow"
            >
              <Plus className="h-4 w-4" />
              <span>Create & Send Material</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {academicMaterials
              .filter((m) => m.teacherId === teacher.id || m.branchId === teacher.departmentBranchId)
              .map((mat) => {
                const typeBadges = {
                  homework: 'bg-blue-100 text-blue-800',
                  assignment: 'bg-emerald-100 text-emerald-800',
                  practical: 'bg-purple-100 text-purple-800',
                  practice_question: 'bg-amber-100 text-amber-800',
                  lecture_notes: 'bg-slate-100 text-slate-800',
                };
                const submissionsCount = materialSubmissions.filter((s) => s.materialId === mat.id).length;

                return (
                  <div
                    key={mat.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                          typeBadges[mat.type] || 'bg-slate-100'
                        }`}
                      >
                        {mat.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Due: {mat.dueDate}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">{mat.title}</h3>
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">{mat.subject}</p>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {mat.description}
                    </p>

                    {mat.questions && mat.questions.length > 0 && (
                      <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700">
                        <span className="font-semibold text-slate-500 block mb-1">
                          Key Questions ({mat.questions.length}):
                        </span>
                        <ul className="list-disc list-inside space-y-0.5">
                          {mat.questions.slice(0, 2).map((q, i) => (
                            <li key={i} className="truncate">
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Max Marks: {mat.maxMarks || 20}</span>
                      <span className="font-bold text-slate-900">
                        {submissionsCount} Submissions Received
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Create Material Modal */}
          {showCreateMaterial && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
              <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Send Academic Material to Students
                </h3>

                <form onSubmit={handleCreateMaterialSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Material Type *</label>
                      <select
                        value={matType}
                        onChange={(e) => setMatType(e.target.value as AcademicMaterialType)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                      >
                        <option value="assignment">Assignment</option>
                        <option value="homework">Homework</option>
                        <option value="practical">Practical / Lab Work</option>
                        <option value="practice_question">Practice Questions Bank</option>
                        <option value="lecture_notes">Lecture Notes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                      <input
                        type="text"
                        required
                        value={matSubject}
                        onChange={(e) => setMatSubject(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Graph Traversal Algorithms Implementation"
                      value={matTitle}
                      onChange={(e) => setMatTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={matDueDate}
                        onChange={(e) => setMatDueDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Max Marks</label>
                      <input
                        type="number"
                        value={matMaxMarks}
                        onChange={(e) => setMatMaxMarks(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Detailed Description *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Provide instructions, expected deliverables, and guidelines..."
                      value={matDescription}
                      onChange={(e) => setMatDescription(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                    />
                  </div>

                  {/* Add Questions List */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Add Specific Problem Questions
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        placeholder="Type question prompt..."
                        value={matQuestionInput}
                        onChange={(e) => setMatQuestionInput(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-300 p-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (matQuestionInput.trim()) {
                            setMatQuestionsList([...matQuestionsList, matQuestionInput.trim()]);
                            setMatQuestionInput('');
                          }
                        }}
                        className="rounded-xl bg-slate-800 px-3 py-2 text-white font-semibold text-xs"
                      >
                        Add
                      </button>
                    </div>

                    {matQuestionsList.length > 0 && (
                      <div className="space-y-1">
                        {matQuestionsList.map((q, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-xs text-slate-700"
                          >
                            <span>
                              {i + 1}. {q}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setMatQuestionsList(matQuestionsList.filter((_, idx) => idx !== i))
                              }
                              className="text-rose-500 font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowCreateMaterial(false)}
                      className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-500"
                    >
                      Broadcast to Students
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: SUBMISSIONS ================= */}
      {activeTab === 'submissions' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Coursework Submissions</h2>
              <p className="text-xs text-slate-500">
                Review submitted homework and lab practicals, assign marks, and provide feedback.
              </p>
            </div>
          </div>

          {materialSubmissions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
              No submissions recorded yet. When students submit answers from their student portal, they appear here.
            </div>
          ) : (
            <div className="space-y-4">
              {materialSubmissions.map((sub) => {
                const mat = academicMaterials.find((m) => m.id === sub.materialId);
                return (
                  <div
                    key={sub.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <span className="font-mono text-xs font-bold text-indigo-600 mr-2">
                          {sub.scholarNo}
                        </span>
                        <strong className="text-slate-900">{sub.studentName}</strong>
                        <span className="text-xs text-slate-400 ml-2">
                          Submitted on {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          sub.status === 'graded'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sub.status === 'graded' ? `Graded: ${sub.marksAwarded} Marks` : 'Needs Grading'}
                      </span>
                    </div>

                    <div className="mt-3">
                      <span className="text-xs font-bold text-slate-700">Assignment: {mat?.title}</span>
                      <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                        {sub.content}
                      </p>
                    </div>

                    {/* Quick grade input */}
                    <div className="mt-4 flex items-center space-x-3 text-xs">
                      <label className="font-semibold text-slate-700">Award Marks:</label>
                      <input
                        type="number"
                        defaultValue={sub.marksAwarded || 18}
                        id={`grade-input-${sub.id}`}
                        className="w-20 rounded-lg border border-slate-300 p-1.5 font-bold text-center"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById(`grade-input-${sub.id}`) as HTMLInputElement;
                          const marks = Number(input.value) || 0;
                          gradeSubmission(sub.id, marks, 'Good analysis and code implementation.');
                        }}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white font-semibold"
                      >
                        Save Grade
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: REPORT CARDS ================= */}
      {activeTab === 'reports' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Semester Report Cards</h2>
              <p className="text-xs text-slate-500">
                Official marks records, internal assessments, and attendance scorecards for your branch.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportCards.map((rc) => (
              <div
                key={rc.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-600">{rc.scholarNo}</span>
                    <h3 className="text-base font-bold text-slate-900">{rc.studentName}</h3>
                    <p className="text-xs text-slate-500">Semester {rc.semester} • Academic Year {rc.academicYear}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Overall GPA</span>
                    <div className="text-2xl font-bold text-indigo-700">{rc.overallGPA}</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {rc.subjects.map((sub, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 block">{sub.subjectName}</span>
                        <span className="text-slate-400 text-[10px]">
                          Internal: {sub.internalMarks}/{sub.maxInternal} • Practical: {sub.practicalMarks}/
                          {sub.maxPractical}
                        </span>
                      </div>
                      <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 font-bold text-slate-800">
                        Grade: {sub.grade}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Attendance: <strong className="text-emerald-700">{rc.overallAttendancePercentage}%</strong>
                  </span>
                  <span className="text-slate-400 text-[11px]">Issued: {rc.issuedDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: ANNOUNCEMENTS ================= */}
      {activeTab === 'announcements' && (
        <div className="max-w-xl mx-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Broadcast Instant Notice</h2>
              <p className="text-xs text-slate-500">
                Send urgent alerts or academic announcements directly to student notifications.
              </p>
            </div>
          </div>

          {announcementSent && (
            <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Announcement sent successfully to all students in section!</span>
            </div>
          )}

          <form onSubmit={handleBroadcastAnnouncement} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Notice Headline *</label>
              <input
                type="text"
                required
                placeholder="e.g. Tomorrow's Lab Practical Rescheduled to Room 302"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Notice Message *</label>
              <textarea
                rows={4}
                required
                placeholder="Write your detailed announcement for the students..."
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-500 transition cursor-pointer"
            >
              Send Notice
            </button>
          </form>
        </div>
      )}

      {/* Visual Photo Inspection Modal */}
      {inspectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Physical In-Class Verification Proof</h3>
              </div>
              <button
                onClick={() => setInspectedRecord(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Registered Profile Photo
                </span>
                <img
                  src={
                    students.find((s) => s.id === inspectedRecord.studentId)?.photoUrl ||
                    inspectedRecord.livePhotoUrl
                  }
                  alt="Registered Photo"
                  className="h-44 w-full rounded-xl object-cover border border-slate-200"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                  Live In-Class Selfie
                </span>
                <img
                  src={inspectedRecord.livePhotoUrl}
                  alt="Captured Selfie"
                  className="h-44 w-full rounded-xl object-cover border-2 border-emerald-500"
                />
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 space-y-1 font-mono">
              <div>Student: <strong>{inspectedRecord.studentName} ({inspectedRecord.scholarNo})</strong></div>
              <div>Captured Time: {inspectedRecord.timestamp}</div>
              <div>Geofence Proximity: {inspectedRecord.distanceMeters}m from classroom beacon</div>
              <div className="text-emerald-700 font-bold">Biometric Match: {inspectedRecord.verificationScore}% Confidence</div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectedRecord(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                Close Proof
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Attendance Session Modal */}
      {showAddSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                  <Play className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Add New Attendance Session</h3>
                  <p className="text-xs text-slate-500">
                    Broadcast a live geofenced attendance beacon to your class.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSessionModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {activeSession && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 mb-5 flex items-start space-x-2.5 text-xs text-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Notice:</strong> An attendance session is currently active for <em>{activeSession.subject}</em>. Starting a new session will automatically conclude the active session.
                </span>
              </div>
            )}

            <form onSubmit={handleStartSession} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Branch *</label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => {
                      setSelectedBranchId(e.target.value);
                      const firstSec = sections.find((s) => s.branchId === e.target.value);
                      if (firstSec) setSelectedSectionId(firstSec.id);
                    }}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Section *</label>
                  <select
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                  >
                    {sections
                      .filter((s) => s.branchId === selectedBranchId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Classroom (Geofence Beacon) *
                </label>
                <select
                  value={selectedClassroomId}
                  onChange={(e) => setSelectedClassroomId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                >
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.roomNo} - {c.buildingName} ({c.geofenceRadiusMeters}m geofence)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Structures & Algorithms"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Session Duration</label>
                  <select
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                  >
                    <option value={5}>5 Minutes (Quick Call)</option>
                    <option value={10}>10 Minutes</option>
                    <option value={15}>15 Minutes (Standard)</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Topic / Lecture Notes</label>
                <input
                  type="text"
                  placeholder="e.g. B-Trees and Distributed DB Replication"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                />
              </div>

              <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-3.5 text-indigo-900 space-y-1 text-xs">
                <div className="flex items-center space-x-1.5 font-bold">
                  <Radio className="h-4 w-4 text-indigo-600" />
                  <span>Geofenced Physical Security</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Students registered in this section can only mark attendance while present inside the classroom geofence with biometric photo verification.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSessionModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow cursor-pointer flex items-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Start Live Attendance Session</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Inspection Modal */}
      {historyInspectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    {historyInspectedSession.subject}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(historyInspectedSession.startedAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Attendance Records ({historyInspectedSession.records.length} Students Verified)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHistoryInspectedSession(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
              {historyInspectedSession.records.map((rec) => (
                <div key={rec.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={rec.livePhotoUrl}
                      alt={rec.studentName}
                      className="h-10 w-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{rec.studentName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Scholar: {rec.scholarNo} • Roll: {rec.rollNo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right">
                      <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold text-[11px]">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Verified {rec.verificationScore}%</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">{rec.timestamp}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInspectedRecord(rec)}
                      className="rounded-lg bg-slate-100 hover:bg-slate-200 p-1.5 text-slate-700 transition cursor-pointer"
                      title="Inspect Photo Proof"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setHistoryInspectedSession(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                Close Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
