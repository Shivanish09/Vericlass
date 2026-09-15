import React, { useState } from 'react';
import {
  School,
  Radio,
  MapPin,
  Camera,
  CheckCircle,
  Clock,
  BookOpen,
  FileText,
  HelpCircle,
  FlaskConical,
  Award,
  AlertCircle,
  Sparkles,
  Send,
  Download,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudentUser } from '../../types';
import { GeoLocationBadge } from '../GeoLocationBadge';
import { CameraCaptureModal } from '../CameraCaptureModal';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    branches,
    sections,
    classrooms,
    getActiveSessionForStudent,
    markAttendance,
    academicMaterials,
    materialSubmissions,
    submitAcademicWork,
    reportCards,
  } = useApp();

  const student = currentUser as StudentUser;

  // Active Tab: 'attendance' | 'academics' | 'reportcard' | 'history'
  const [activeTab, setActiveTab] = useState<'attendance' | 'academics' | 'reportcard' | 'history'>('attendance');

  // Active attendance session for this student's branch & section
  const activeSession = student ? getActiveSessionForStudent(student) : undefined;
  const activeClassroom = classrooms.find((c) => c.id === activeSession?.classroomId);

  // Student's existing record in active session (if already marked)
  const existingRecord = activeSession?.records.find((r) => r.studentId === student?.id);

  // Geolocation state
  const [userLat, setUserLat] = useState<number>(activeClassroom?.latitude || 28.6139);
  const [userLng, setUserLng] = useState<number>(activeClassroom?.longitude || 77.209);
  const [isInsideGeofence, setIsInsideGeofence] = useState<boolean>(true);
  const [geofenceDistance, setGeofenceDistance] = useState<number>(0);

  // Live photo state
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);

  // Submission feedback
  const [attendanceNotice, setAttendanceNotice] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Academic Materials Filter
  const [materialFilter, setMaterialFilter] = useState<'all' | 'assignment' | 'homework' | 'practical' | 'practice_question'>('all');

  // Submit Solution Modal
  const [submittingMaterialId, setSubmittingMaterialId] = useState<string | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionAttachment, setSubmissionAttachment] = useState('');

  // Find student's report card
  const studentReportCard = reportCards.find(
    (r) => r.studentId === student?.id || r.scholarNo === student?.scholarNo
  );

  // Branch and section names
  const studentBranch = branches.find((b) => b.id === student?.branchId);
  const studentSection = sections.find((s) => s.id === student?.sectionId);

  // Filter materials for student's branch & section
  const myBranchMaterials = academicMaterials.filter(
    (m) => m.branchId === student?.branchId && (!m.sectionId || m.sectionId === student?.sectionId)
  );

  const handleLocationUpdate = (lat: number, lng: number, isInside: boolean, dist: number) => {
    setUserLat(lat);
    setUserLng(lng);
    setIsInsideGeofence(isInside);
    setGeofenceDistance(dist);
  };

  const handleMarkAttendanceSubmit = () => {
    if (!activeSession) return;
    if (!capturedPhotoUrl) {
      setAttendanceNotice({
        success: false,
        message: 'Please capture a live photo to verify you are physically inside the class.',
      });
      return;
    }
    if (!isInsideGeofence) {
      setAttendanceNotice({
        success: false,
        message: `Geofence check failed: You must be within ${activeClassroom?.geofenceRadiusMeters}m of ${activeClassroom?.roomNo}.`,
      });
      return;
    }

    const res = markAttendance({
      sessionId: activeSession.id,
      student,
      livePhotoUrl: capturedPhotoUrl,
      userLat,
      userLng,
    });

    setAttendanceNotice(res);
  };

  const handleSolutionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingMaterialId || !submissionContent.trim()) return;

    submitAcademicWork({
      materialId: submittingMaterialId,
      student,
      content: submissionContent.trim(),
      attachmentName: submissionAttachment || 'Completed_Work.pdf',
    });

    setSubmittingMaterialId(null);
    setSubmissionContent('');
    setSubmissionAttachment('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Student Identity Banner */}
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={student.photoUrl}
              alt={student.name}
              className="h-20 w-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="rounded-md bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-xs font-mono font-bold text-emerald-800">
                  {student.scholarNo}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Roll: {student.rollNo}
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900">{student.name}</h1>
              <p className="text-xs text-slate-500 font-medium">
                {studentBranch?.name} ({studentBranch?.code}) • {studentSection?.name} • Semester {student.semester}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 self-start sm:self-center">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Attendance Rate
              </span>
              <div className="text-xl font-extrabold text-emerald-800">
                {studentReportCard?.overallAttendancePercentage || 94.2}%
              </div>
            </div>

            <div className="rounded-2xl bg-indigo-50 border border-indigo-100 px-4 py-3 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                Semester GPA
              </span>
              <div className="text-xl font-extrabold text-indigo-800">
                {studentReportCard?.overallGPA || 8.9}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'attendance'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Radio className="h-4 w-4" />
          <span>Mark Attendance {activeSession && !existingRecord && '⚡ Active'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('academics')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'academics'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Academic Coursework ({myBranchMaterials.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reportcard')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'reportcard'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Official Report Card</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Attendance Log History</span>
        </button>
      </div>

      {/* ================= TAB 1: MARK ATTENDANCE ================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* CASE A: No active session started by teacher */}
          {!activeSession ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xs max-w-2xl mx-auto">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                No Active Attendance Session
              </h3>
              <p className="mt-2 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Your faculty has not started an attendance session for{' '}
                <strong className="text-slate-700">{studentBranch?.code} • {studentSection?.name}</strong> at this moment.
                Attendance verification unlocks automatically when your teacher activates the classroom beacon.
              </p>
              <div className="mt-6 inline-flex items-center space-x-2 rounded-full bg-slate-50 border border-slate-200 px-3.5 py-1.5 text-xs text-slate-600 font-medium">
                <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                <span>Monitoring beacon for incoming classroom session...</span>
              </div>
            </div>
          ) : existingRecord ? (
            /* CASE B: Student has already marked attendance for this session */
            <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xs max-w-2xl mx-auto">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
                <CheckCircle className="h-9 w-9" />
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                Attendance Successfully Verified
              </span>
              <h2 className="mt-3 text-xl font-extrabold text-slate-900">
                You are Marked Present in {activeSession.subject}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Verified inside {activeClassroom?.roomNo} at {existingRecord.timestamp}
              </p>

              {/* Receipt Snapshot Card */}
              <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4 max-w-md mx-auto flex items-center space-x-4 text-left">
                <img
                  src={existingRecord.livePhotoUrl}
                  alt="Verified In-Class Selfie"
                  className="h-20 w-20 rounded-xl object-cover border-2 border-emerald-500 shadow-xs"
                />
                <div className="text-xs space-y-1 font-mono text-slate-600">
                  <div>Scholar: <strong>{existingRecord.scholarNo}</strong></div>
                  <div>Distance: <span className="text-emerald-700 font-bold">{existingRecord.distanceMeters}m</span></div>
                  <div>Biometric Score: <strong className="text-slate-800">{existingRecord.verificationScore}%</strong></div>
                  <div className="text-emerald-600 font-semibold">Status: Verified Present</div>
                </div>
              </div>
            </div>
          ) : (
            /* CASE C: ACTIVE SESSION IN PROGRESS - Student marks presence */
            <div className="max-w-2xl mx-auto rounded-3xl border border-emerald-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="pb-6 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 mb-2">
                    <Radio className="h-3 w-3 animate-ping text-emerald-600" />
                    <span>CLASS ATTENDANCE ACTIVE</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{activeSession.subject}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Instructor: <strong className="text-slate-700">{activeSession.teacherName}</strong> ({activeSession.teacherNo})
                  </p>
                </div>

                {activeClassroom?.images && activeClassroom.images.length > 0 && (
                  <img
                    src={activeClassroom.images[0]}
                    alt={activeClassroom.roomNo}
                    className="h-16 w-24 rounded-xl object-cover border border-slate-200 shadow-2xs hidden sm:block"
                  />
                )}
              </div>

              {/* Step 1: Geofencing Distance Monitor */}
              <div className="my-6">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Step 1: Physical Geofence Verification
                </span>
                {activeClassroom && (
                  <GeoLocationBadge
                    targetLat={activeClassroom.latitude}
                    targetLng={activeClassroom.longitude}
                    radiusMeters={activeClassroom.geofenceRadiusMeters}
                    classroomName={activeClassroom.roomNo}
                    onLocationUpdate={handleLocationUpdate}
                  />
                )}
              </div>

              {/* Step 2: Live In-Class Selfie */}
              <div className="my-6 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Step 2: Real-Time In-Class Photo Verification
                </span>

                {capturedPhotoUrl ? (
                  <div className="rounded-2xl bg-emerald-50/50 border border-emerald-200 p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={capturedPhotoUrl}
                        alt="Captured Selfie"
                        className="h-16 w-16 rounded-xl object-cover border-2 border-emerald-500"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span>Real-Time Photo Captured</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Timestamped with classroom beacon watermark
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCameraModalOpen(true)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Retake
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="w-full rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-6 text-center hover:bg-emerald-50 transition cursor-pointer"
                  >
                    <Camera className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
                    <span className="text-sm font-bold text-emerald-900 block">
                      Capture Real-Time Classroom Selfie
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Proves you are physically inside {activeClassroom?.roomNo}
                    </span>
                  </button>
                )}
              </div>

              {attendanceNotice && (
                <div
                  className={`rounded-xl p-3 text-xs mb-4 flex items-start space-x-2 ${
                    attendanceNotice.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{attendanceNotice.message}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleMarkAttendanceSubmit}
                className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Verify & Mark My Presence</span>
              </button>
            </div>
          )}

          {/* Camera Capture Modal */}
          {activeClassroom && (
            <CameraCaptureModal
              isOpen={isCameraModalOpen}
              onClose={() => setIsCameraModalOpen(false)}
              onPhotoCaptured={(dataUrl) => setCapturedPhotoUrl(dataUrl)}
              studentName={student.name}
              scholarNo={student.scholarNo}
              classroomName={activeClassroom.roomNo}
            />
          )}
        </div>
      )}

      {/* ================= TAB 2: ACADEMIC COURSEWORK ================= */}
      {activeTab === 'academics' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Departmental Coursework & Teacher Submissions
              </h2>
              <p className="text-xs text-slate-500">
                Everything assigned by professors for {studentBranch?.code} • {studentSection?.name}.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'assignment', 'homework', 'practical', 'practice_question'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMaterialFilter(t)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition ${
                    materialFilter === t
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t === 'all' ? 'All Materials' : t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myBranchMaterials
              .filter((m) => materialFilter === 'all' || m.type === materialFilter)
              .map((mat) => {
                const submission = materialSubmissions.find(
                  (s) => s.materialId === mat.id && s.studentId === student.id
                );

                return (
                  <div
                    key={mat.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                          {mat.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-rose-600 font-semibold">
                          Due: {mat.dueDate}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900">{mat.title}</h3>
                      <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                        {mat.subject} • Faculty: {mat.teacherName}
                      </p>

                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{mat.description}</p>

                      {mat.questions && mat.questions.length > 0 && (
                        <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs text-slate-700">
                          <span className="font-bold text-slate-600 block mb-1">Assigned Problems:</span>
                          <ol className="list-decimal list-inside space-y-1">
                            {mat.questions.map((q, i) => (
                              <li key={i}>{q}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>

                    {/* Submission status & Action */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      {submission ? (
                        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700">
                          <CheckCircle className="h-4 w-4" />
                          <span>
                            {submission.status === 'graded'
                              ? `Graded: ${submission.marksAwarded} Marks`
                              : 'Submitted for Review'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Pending Submission</span>
                      )}

                      <button
                        type="button"
                        onClick={() => setSubmittingMaterialId(mat.id)}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
                      >
                        {submission ? 'Resubmit / Edit' : 'Submit Solution'}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Submit Solution Modal */}
          {submittingMaterialId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Submit Academic Assignment / Practical
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  {academicMaterials.find((m) => m.id === submittingMaterialId)?.title}
                </p>

                <form onSubmit={handleSolutionSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Your Written Solution / Code / Answers *
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Type your solution, mathematical steps, code analysis, or notes here..."
                      value={submissionContent}
                      onChange={(e) => setSubmissionContent(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Attach Document Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lab_Report_Final.pdf"
                      value={submissionAttachment}
                      onChange={(e) => setSubmissionAttachment(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSubmittingMaterialId(null)}
                      className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-500"
                    >
                      Turn In Work
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: REPORT CARD ================= */}
      {activeTab === 'reportcard' && (
        <div className="max-w-3xl mx-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                Official Semester Transcript
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                Semester {student.semester} Academic Report Card
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Scholar No: <span className="font-mono font-bold text-slate-800">{student.scholarNo}</span> •
                Roll No: <span className="font-mono font-bold text-slate-800">{student.rollNo}</span>
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center">
              <span className="text-[10px] font-bold uppercase text-emerald-700">Cumulative GPA</span>
              <div className="text-3xl font-extrabold text-emerald-800">
                {studentReportCard?.overallGPA || 8.92}
              </div>
            </div>
          </div>

          {/* Subject-Wise Assessment Table */}
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Course Subject</th>
                  <th className="p-3.5">Internal (30)</th>
                  <th className="p-3.5">Practical (20)</th>
                  <th className="p-3.5">Attendance</th>
                  <th className="p-3.5">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {studentReportCard?.subjects.map((sub, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="p-3.5">
                      <strong className="text-slate-900 block">{sub.subjectName}</strong>
                      <span className="text-[11px] text-slate-400">{sub.teacherName}</span>
                    </td>
                    <td className="p-3.5 font-bold">{sub.internalMarks} / {sub.maxInternal}</td>
                    <td className="p-3.5 font-bold">{sub.practicalMarks} / {sub.maxPractical}</td>
                    <td className="p-3.5 text-emerald-700 font-semibold">{sub.attendancePercentage}%</td>
                    <td className="p-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-extrabold text-slate-900 border border-slate-200">
                        {sub.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Faculty Advisor Remarks:
            </span>
            <p className="text-xs text-slate-700 italic">
              "{studentReportCard?.teacherRemarks || 'Excellent academic progress and consistent laboratory participation.'}"
            </p>
          </div>
        </div>
      )}

      {/* ================= TAB 4: ATTENDANCE LOG HISTORY ================= */}
      {activeTab === 'history' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Personal Attendance Record Log</h2>
              <p className="text-xs text-slate-500">
                Verified attendance entries with timestamp and physical presence confirmation.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5">Course Subject</th>
                    <th className="p-3.5">Classroom</th>
                    <th className="p-3.5">Geofence Distance</th>
                    <th className="p-3.5">Verification</th>
                    <th className="p-3.5">Snapshot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr className="hover:bg-slate-50/60">
                    <td className="p-3.5 font-mono">Today, 09:15 AM</td>
                    <td className="p-3.5 font-bold text-slate-900">Data Structures & Algorithms</td>
                    <td className="p-3.5">Room 302 (Smart Lecture Hall)</td>
                    <td className="p-3.5 text-emerald-700 font-mono">4.2m from beacon</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center text-emerald-700 font-bold">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Verified Present
                      </span>
                    </td>
                    <td className="p-3.5">
                      <img
                        src={student.photoUrl}
                        alt="Photo proof"
                        className="h-9 w-9 rounded-lg object-cover border border-slate-200"
                      />
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="p-3.5 font-mono">Yesterday, 11:30 AM</td>
                    <td className="p-3.5 font-bold text-slate-900">Database Management Systems</td>
                    <td className="p-3.5">Lab 405 (AI & Deep Learning Lab)</td>
                    <td className="p-3.5 text-emerald-700 font-mono">6.8m from beacon</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center text-emerald-700 font-bold">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Verified Present
                      </span>
                    </td>
                    <td className="p-3.5">
                      <img
                        src={student.photoUrl}
                        alt="Photo proof"
                        className="h-9 w-9 rounded-lg object-cover border border-slate-200"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
