import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  AcademicMaterial,
  AdminUser,
  AttendanceRecord,
  AttendanceSession,
  Branch,
  Classroom,
  MaterialSubmission,
  NotificationItem,
  ReportCard,
  Section,
  StudentUser,
  TeacherUser,
  UserRole,
} from '../types';
import {
  INITIAL_ACADEMIC_MATERIALS,
  INITIAL_ADMINS,
  INITIAL_BRANCHES,
  INITIAL_CLASSROOMS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORT_CARDS,
  INITIAL_SECTIONS,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  MASTER_ADMIN_CODE,
} from '../data/mockData';
import { isWithinGeofence } from '../utils/geoUtils';

interface AppContextType {
  // Auth state
  currentRole: UserRole | null;
  currentUser: StudentUser | TeacherUser | AdminUser | null;
  loginStudent: (scholarNo: string, password?: string) => { success: boolean; message?: string };
  loginTeacher: (teacherNo: string, password?: string) => { success: boolean; message?: string };
  loginAdminMaster: (code: string) => { success: boolean; message?: string };
  loginAdminCredentials: (name: string, mobileNo: string, email: string, password: string) => { success: boolean; message?: string };
  logout: () => void;

  // Master lists
  branches: Branch[];
  sections: Section[];
  classrooms: Classroom[];
  teachers: TeacherUser[];
  students: StudentUser[];
  admins: AdminUser[];
  academicMaterials: AcademicMaterial[];
  materialSubmissions: MaterialSubmission[];
  reportCards: ReportCard[];
  notifications: NotificationItem[];
  attendanceSessions: AttendanceSession[];

  // Helpers
  getBranch: (branchId: string) => Branch | undefined;
  getSection: (sectionId: string) => Section | undefined;
  getClassroom: (classroomId: string) => Classroom | undefined;
  getSectionsByBranch: (branchId: string) => Section[];
  getClassroomsByBranch: (branchId: string) => Classroom[];

  // Admin Actions
  addAdmin: (admin: Omit<AdminUser, 'id' | 'createdAt'>) => void;
  removeAdmin: (adminId: string) => { success: boolean; message?: string };
  addClassroom: (classroom: Omit<Classroom, 'id'>) => void;
  removeClassroom: (classroomId: string) => void;
  addTeacher: (teacher: Omit<TeacherUser, 'id'>) => void;
  removeTeacher: (teacherId: string) => void;
  addStudent: (student: Omit<StudentUser, 'id'>) => void;
  removeStudent: (studentId: string) => void;

  // Teacher Actions
  startAttendanceSession: (params: {
    teacherId: string;
    branchId: string;
    sectionId: string;
    classroomId: string;
    subject: string;
    topic?: string;
    durationMinutes?: number;
  }) => AttendanceSession;
  endAttendanceSession: (sessionId: string) => void;
  deleteAttendanceSession: (sessionId: string) => void;
  getActiveSessionForTeacher: (teacherId: string) => AttendanceSession | undefined;
  addAcademicMaterial: (material: Omit<AcademicMaterial, 'id' | 'createdAt'>) => void;
  gradeSubmission: (submissionId: string, marks: number, feedback: string) => void;
  updateReportCard: (reportCard: ReportCard) => void;

  // Student Actions
  getActiveSessionForStudent: (student: StudentUser) => AttendanceSession | undefined;
  markAttendance: (params: {
    sessionId: string;
    student: StudentUser;
    livePhotoUrl: string;
    userLat: number;
    userLng: number;
  }) => { success: boolean; message: string; record?: AttendanceRecord };
  submitAcademicWork: (params: {
    materialId: string;
    student: StudentUser;
    content: string;
    attachmentName?: string;
  }) => void;

  // Notifications
  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  resetToDemoData: () => void;

  // Cloud & Multi-Device Synchronization
  isServerSynced: boolean;
  lastServerSyncTime: string | null;
  syncWithServer: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(`vericlass_${key}`);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.error(`Error loading key ${key}:`, err);
  }
  return fallback;
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`vericlass_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving key ${key}:`, err);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(() =>
    loadStorage<UserRole | null>('currentRole', null)
  );
  const [currentUser, setCurrentUser] = useState<StudentUser | TeacherUser | AdminUser | null>(() =>
    loadStorage<StudentUser | TeacherUser | AdminUser | null>('currentUser', null)
  );

  const [branches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [sections] = useState<Section[]>(INITIAL_SECTIONS);

  const [classrooms, setClassrooms] = useState<Classroom[]>(() =>
    loadStorage<Classroom[]>('classrooms', INITIAL_CLASSROOMS)
  );
  const [teachers, setTeachers] = useState<TeacherUser[]>(() =>
    loadStorage<TeacherUser[]>('teachers', INITIAL_TEACHERS)
  );
  const [students, setStudents] = useState<StudentUser[]>(() =>
    loadStorage<StudentUser[]>('students', INITIAL_STUDENTS)
  );
  const [admins, setAdmins] = useState<AdminUser[]>(() =>
    loadStorage<AdminUser[]>('admins', INITIAL_ADMINS)
  );
  const [academicMaterials, setAcademicMaterials] = useState<AcademicMaterial[]>(() =>
    loadStorage<AcademicMaterial[]>('materials', INITIAL_ACADEMIC_MATERIALS)
  );
  const [materialSubmissions, setMaterialSubmissions] = useState<MaterialSubmission[]>(() =>
    loadStorage<MaterialSubmission[]>('submissions', [])
  );
  const [reportCards, setReportCards] = useState<ReportCard[]>(() =>
    loadStorage<ReportCard[]>('reportCards', INITIAL_REPORT_CARDS)
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadStorage<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS)
  );

  // Initialize a pre-active session for CSE Section A if none exists, or load stored sessions
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() => {
    const saved = loadStorage<AttendanceSession[]>('attendance_sessions', []);
    if (saved && saved.length > 0) return saved;
    // Provide an initial ready-to-test active session
    const initialSession: AttendanceSession = {
      id: 'sess-live-01',
      teacherId: 'teacher-101',
      teacherName: 'Prof. Rajesh Verma',
      teacherNo: 'TCH-101',
      branchId: 'branch-cse',
      sectionId: 'sec-cse-a',
      classroomId: 'room-302',
      subject: 'Data Structures & Algorithms',
      topic: 'Graph Algorithms & Geofenced Verification',
      startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
      status: 'active',
      records: [
        {
          id: 'rec-002',
          sessionId: 'sess-live-01',
          studentId: 'student-002',
          scholarNo: 'SCH-2024-002',
          studentName: 'Rhea Sharma',
          rollNo: '24CSE02',
          branchId: 'branch-cse',
          sectionId: 'sec-cse-a',
          timestamp: new Date(Date.now() - 3 * 60 * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          livePhotoUrl:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
          latitude: 28.61393,
          longitude: 77.20906,
          distanceMeters: 4.2,
          isInsideGeofence: true,
          verificationScore: 98,
          status: 'verified',
          notes: 'Inside Class 302 - Face matched successfully',
        },
      ],
    };
    return [initialSession];
  });

  // Save changes
  useEffect(() => saveStorage('currentRole', currentRole), [currentRole]);
  useEffect(() => saveStorage('currentUser', currentUser), [currentUser]);
  useEffect(() => saveStorage('classrooms', classrooms), [classrooms]);
  useEffect(() => saveStorage('teachers', teachers), [teachers]);
  useEffect(() => saveStorage('students', students), [students]);
  useEffect(() => saveStorage('admins', admins), [admins]);
  useEffect(() => saveStorage('materials', academicMaterials), [academicMaterials]);
  useEffect(() => saveStorage('submissions', materialSubmissions), [materialSubmissions]);
  useEffect(() => saveStorage('reportCards', reportCards), [reportCards]);
  useEffect(() => saveStorage('notifications', notifications), [notifications]);
  useEffect(() => saveStorage('attendance_sessions', attendanceSessions), [attendanceSessions]);

  // Real-time server sync state
  const [isServerSynced, setIsServerSynced] = useState<boolean>(true);
  const [lastServerSyncTime, setLastServerSyncTime] = useState<string | null>(null);
  const serverVersionRef = useRef<number>(0);
  const isApplyingServerUpdate = useRef<boolean>(false);

  // Sync state to server database
  const pushStateToServer = async (payload?: Record<string, any>) => {
    try {
      const stateToSave = payload || {
        classrooms,
        teachers,
        students,
        admins,
        academicMaterials,
        materialSubmissions,
        reportCards,
        notifications,
        attendanceSessions,
      };

      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stateToSave),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.version) {
          serverVersionRef.current = data.version;
        }
        setIsServerSynced(true);
        setLastServerSyncTime(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      }
    } catch (err) {
      // Offline fallback
      setIsServerSynced(false);
    }
  };

  // Fetch full server state on boot
  const syncWithServer = async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) {
        setIsServerSynced(false);
        return;
      }
      const json = await res.json();
      if (json.data) {
        isApplyingServerUpdate.current = true;
        const d = json.data;
        if (Array.isArray(d.classrooms)) setClassrooms(d.classrooms);
        if (Array.isArray(d.teachers)) setTeachers(d.teachers);
        if (Array.isArray(d.students)) setStudents(d.students);
        if (Array.isArray(d.admins)) setAdmins(d.admins);
        if (Array.isArray(d.academicMaterials)) setAcademicMaterials(d.academicMaterials);
        if (Array.isArray(d.materialSubmissions)) setMaterialSubmissions(d.materialSubmissions);
        if (Array.isArray(d.reportCards)) setReportCards(d.reportCards);
        if (Array.isArray(d.notifications)) setNotifications(d.notifications);
        if (Array.isArray(d.attendanceSessions)) setAttendanceSessions(d.attendanceSessions);
        if (json.version) serverVersionRef.current = json.version;
        setIsServerSynced(true);
        setLastServerSyncTime(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
        setTimeout(() => {
          isApplyingServerUpdate.current = false;
        }, 200);
      }
    } catch (err) {
      console.warn('Initial server fetch failed, running with local cache:', err);
      setIsServerSynced(false);
    }
  };

  // On mount: fetch latest server state
  useEffect(() => {
    syncWithServer();
  }, []);

  // Polling every 2.5s to receive live changes from other devices (e.g. teacher starts attendance session)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sync?v=${serverVersionRef.current}`);
        if (!res.ok) {
          setIsServerSynced(false);
          return;
        }
        const json = await res.json();
        if (json.changed && json.data) {
          isApplyingServerUpdate.current = true;
          const d = json.data;
          if (Array.isArray(d.classrooms)) setClassrooms(d.classrooms);
          if (Array.isArray(d.teachers)) setTeachers(d.teachers);
          if (Array.isArray(d.students)) setStudents(d.students);
          if (Array.isArray(d.admins)) setAdmins(d.admins);
          if (Array.isArray(d.academicMaterials)) setAcademicMaterials(d.academicMaterials);
          if (Array.isArray(d.materialSubmissions)) setMaterialSubmissions(d.materialSubmissions);
          if (Array.isArray(d.reportCards)) setReportCards(d.reportCards);
          if (Array.isArray(d.notifications)) setNotifications(d.notifications);
          if (Array.isArray(d.attendanceSessions)) setAttendanceSessions(d.attendanceSessions);
          if (json.version) serverVersionRef.current = json.version;
          setIsServerSynced(true);
          setLastServerSyncTime(
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          );
          setTimeout(() => {
            isApplyingServerUpdate.current = false;
          }, 200);
        } else {
          setIsServerSynced(true);
        }
      } catch (err) {
        setIsServerSynced(false);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Debounced auto-save to server when user makes local edits
  useEffect(() => {
    if (isApplyingServerUpdate.current) return;
    const timer = setTimeout(() => {
      pushStateToServer({
        classrooms,
        teachers,
        students,
        admins,
        academicMaterials,
        materialSubmissions,
        reportCards,
        notifications,
        attendanceSessions,
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [
    classrooms,
    teachers,
    students,
    admins,
    academicMaterials,
    materialSubmissions,
    reportCards,
    notifications,
    attendanceSessions,
  ]);

  // Auth methods
  const loginStudent = (scholarNo: string, password?: string) => {
    const cleanScholar = scholarNo.trim().toUpperCase();
    const found = students.find(
      (s) => s.scholarNo.toUpperCase() === cleanScholar
    );
    if (!found) {
      return { success: false, message: `No student record found with Scholar No. "${scholarNo}"` };
    }
    if (password && password.trim() && found.password && found.password !== password.trim()) {
      return { success: false, message: 'Invalid student password' };
    }
    setCurrentRole('student');
    setCurrentUser(found);
    return { success: true };
  };

  const loginTeacher = (teacherNo: string, password?: string) => {
    const cleanTeacherNo = teacherNo.trim().toUpperCase();
    const found = teachers.find(
      (t) => t.teacherNo.toUpperCase() === cleanTeacherNo
    );
    if (!found) {
      return { success: false, message: `No teacher record found with Teacher No. "${teacherNo}"` };
    }
    if (password && password.trim() && found.password && found.password !== password.trim()) {
      return { success: false, message: 'Invalid teacher password' };
    }
    setCurrentRole('teacher');
    setCurrentUser(found);
    return { success: true };
  };

  const loginAdminMaster = (code: string) => {
    if (code.trim() === MASTER_ADMIN_CODE) {
      const masterAdmin = admins.find((a) => a.isMaster) || admins[0];
      setCurrentRole('admin');
      setCurrentUser(masterAdmin);
      return { success: true };
    }
    return { success: false, message: 'Invalid Admin Master Access Code' };
  };

  const loginAdminCredentials = (
    name: string,
    mobileNo: string,
    email: string,
    password: string
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobileNo.trim();
    const cleanName = name.trim().toLowerCase();

    const found = admins.find(
      (a) =>
        a.email.toLowerCase() === cleanEmail &&
        a.mobileNo === cleanMobile &&
        a.name.toLowerCase() === cleanName &&
        a.password === password.trim()
    );

    if (found) {
      setCurrentRole('admin');
      setCurrentUser(found);
      return { success: true };
    }
    return {
      success: false,
      message: 'Admin verification failed. Please check your Name, Mobile, Email, and Password.',
    };
  };

  const logout = () => {
    setCurrentRole(null);
    setCurrentUser(null);
  };

  // Helper getters
  const getBranch = (branchId: string) => branches.find((b) => b.id === branchId);
  const getSection = (sectionId: string) => sections.find((s) => s.id === sectionId);
  const getClassroom = (classroomId: string) => classrooms.find((c) => c.id === classroomId);
  const getSectionsByBranch = (branchId: string) => sections.filter((s) => s.branchId === branchId);
  const getClassroomsByBranch = (branchId: string) => classrooms.filter((c) => c.branchId === branchId);

  // Admin Actions
  const addAdmin = (adminData: Omit<AdminUser, 'id' | 'createdAt'>) => {
    const newAdmin: AdminUser = {
      ...adminData,
      id: `admin-${Date.now()}`,
      createdAt: new Date().toISOString(),
      addedByAdminName: currentUser?.name || 'Administrator',
    };
    setAdmins((prev) => [...prev, newAdmin]);
  };

  const removeAdmin = (adminId: string): { success: boolean; message?: string } => {
    const target = admins.find((a) => a.id === adminId);
    if (!target) {
      return { success: false, message: 'Administrator not found.' };
    }
    if (currentUser && currentUser.id === adminId) {
      return { success: false, message: 'You cannot remove your own active administrator account.' };
    }
    if (target.isMaster) {
      const masterCount = admins.filter((a) => a.isMaster).length;
      if (masterCount <= 1) {
        return { success: false, message: 'Cannot remove the primary master administrator account.' };
      }
    }
    setAdmins((prev) => prev.filter((a) => a.id !== adminId));
    return { success: true };
  };

  const addClassroom = (classroomData: Omit<Classroom, 'id'>) => {
    const newClass: Classroom = {
      ...classroomData,
      id: `room-${Date.now()}`,
    };
    setClassrooms((prev) => [newClass, ...prev]);
  };

  const removeClassroom = (classroomId: string) => {
    setClassrooms((prev) => prev.filter((c) => c.id !== classroomId));
  };

  const addTeacher = (teacherData: Omit<TeacherUser, 'id'>) => {
    const newTeacher: TeacherUser = {
      ...teacherData,
      id: `teacher-${Date.now()}`,
    };
    setTeachers((prev) => [newTeacher, ...prev]);
  };

  const removeTeacher = (teacherId: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
  };

  const addStudent = (studentData: Omit<StudentUser, 'id'>) => {
    const newStudent: StudentUser = {
      ...studentData,
      id: `student-${Date.now()}`,
    };
    setStudents((prev) => [newStudent, ...prev]);

    // Also initialize an empty report card for the student
    const newReport: ReportCard = {
      id: `rep-${Date.now()}`,
      studentId: newStudent.id,
      scholarNo: newStudent.scholarNo,
      studentName: newStudent.name,
      semester: newStudent.semester,
      branchId: newStudent.branchId,
      sectionId: newStudent.sectionId,
      academicYear: '2025-2026',
      overallGPA: 8.5,
      overallAttendancePercentage: 100,
      teacherRemarks: 'Enrolled in current semester. Keep up good academic progress.',
      issuedDate: new Date().toISOString().split('T')[0],
      subjects: [
        {
          subjectName: 'Core Engineering Subject I',
          teacherName: 'Faculty Advisor',
          internalMarks: 25,
          maxInternal: 30,
          practicalMarks: 18,
          maxPractical: 20,
          grade: 'A',
          attendancePercentage: 100,
          remarks: 'Good start to the semester',
        },
      ],
    };
    setReportCards((prev) => [...prev, newReport]);
  };

  const removeStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setReportCards((prev) => prev.filter((r) => r.studentId !== studentId));
  };

  // Teacher Attendance Actions
  const startAttendanceSession = ({
    teacherId,
    branchId,
    sectionId,
    classroomId,
    subject,
    topic,
    durationMinutes = 15,
  }: {
    teacherId: string;
    branchId: string;
    sectionId: string;
    classroomId: string;
    subject: string;
    topic?: string;
    durationMinutes?: number;
  }) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    const newSession: AttendanceSession = {
      id: `sess-${Date.now()}`,
      teacherId,
      teacherName: teacher?.name || 'Instructor',
      teacherNo: teacher?.teacherNo || 'TCH',
      branchId,
      sectionId,
      classroomId,
      subject,
      topic,
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000).toISOString(),
      status: 'active',
      records: [],
    };

    // Close any other active session of this teacher and prepend new active session
    setAttendanceSessions((prev) => [
      newSession,
      ...prev.map((s) =>
        s.teacherId === teacherId && s.status === 'active'
          ? { ...s, status: 'completed' as const }
          : s
      ),
    ]);

    // Send instant notification to students of this branch & section
    const branch = branches.find((b) => b.id === branchId);
    const classroom = classrooms.find((c) => c.id === classroomId);
    addNotification({
      targetRole: 'student',
      branchId,
      sectionId,
      title: `⚡ Attendance Started: ${subject}`,
      message: `${teacher?.name} has initiated live geofenced attendance for ${branch?.code} in ${classroom?.roomNo}. You have ${durationMinutes} minutes to mark your presence.`,
      type: 'attendance',
    });

    return newSession;
  };

  const endAttendanceSession = (sessionId: string) => {
    setAttendanceSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'completed' as const } : s))
    );
  };

  const deleteAttendanceSession = (sessionId: string) => {
    setAttendanceSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const getActiveSessionForTeacher = (teacherId: string) => {
    return attendanceSessions.find((s) => s.teacherId === teacherId && s.status === 'active');
  };

  const getActiveSessionForStudent = (student: StudentUser) => {
    return attendanceSessions.find(
      (s) =>
        s.branchId === student.branchId &&
        s.sectionId === student.sectionId &&
        s.status === 'active'
    );
  };

  const markAttendance = ({
    sessionId,
    student,
    livePhotoUrl,
    userLat,
    userLng,
  }: {
    sessionId: string;
    student: StudentUser;
    livePhotoUrl: string;
    userLat: number;
    userLng: number;
  }) => {
    const session = attendanceSessions.find((s) => s.id === sessionId);
    if (!session) {
      return { success: false, message: 'Attendance session not found.' };
    }
    if (session.status !== 'active') {
      return { success: false, message: 'This attendance session has already closed.' };
    }

    // Check if student already marked
    const existing = session.records.find((r) => r.studentId === student.id);
    if (existing) {
      return {
        success: false,
        message: 'You have already marked your attendance for this session!',
        record: existing,
      };
    }

    const classroom = classrooms.find((c) => c.id === session.classroomId);
    if (!classroom) {
      return { success: false, message: 'Classroom location data is unavailable.' };
    }

    const { isInside, distanceMeters } = isWithinGeofence(
      userLat,
      userLng,
      classroom.latitude,
      classroom.longitude,
      classroom.geofenceRadiusMeters
    );

    if (!isInside) {
      return {
        success: false,
        message: `Geofence check failed: You are ${Math.round(
          distanceMeters
        )}m away from ${classroom.roomNo}. You must be within ${
          classroom.geofenceRadiusMeters
        }m of the classroom.`,
      };
    }

    const newRecord: AttendanceRecord = {
      id: `rec-${Date.now()}`,
      sessionId,
      studentId: student.id,
      scholarNo: student.scholarNo,
      studentName: student.name,
      rollNo: student.rollNo,
      branchId: student.branchId,
      sectionId: student.sectionId,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      livePhotoUrl,
      latitude: userLat,
      longitude: userLng,
      distanceMeters,
      isInsideGeofence: true,
      verificationScore: 97, // High biometric in-classroom confidence
      status: 'verified',
      notes: `Verified in ${classroom.roomNo} (${Math.round(distanceMeters)}m from beacon)`,
    };

    setAttendanceSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, records: [newRecord, ...s.records] } : s))
    );

    return {
      success: true,
      message: `Attendance marked successfully! Verified physically inside ${classroom.roomNo}.`,
      record: newRecord,
    };
  };

  // Academic Materials Actions
  const addAcademicMaterial = (materialData: Omit<AcademicMaterial, 'id' | 'createdAt'>) => {
    const newMaterial: AcademicMaterial = {
      ...materialData,
      id: `mat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAcademicMaterials((prev) => [newMaterial, ...prev]);

    // Send notification to students
    const branch = branches.find((b) => b.id === materialData.branchId);
    addNotification({
      targetRole: 'student',
      branchId: materialData.branchId,
      sectionId: materialData.sectionId,
      title: `📚 New ${materialData.type.toUpperCase()}: ${materialData.title}`,
      message: `Teacher ${materialData.teacherName} assigned new ${materialData.type} for ${materialData.subject} (${branch?.code}). Due: ${materialData.dueDate}`,
      type: 'academic',
    });
  };

  const submitAcademicWork = ({
    materialId,
    student,
    content,
    attachmentName,
  }: {
    materialId: string;
    student: StudentUser;
    content: string;
    attachmentName?: string;
  }) => {
    const newSubmission: MaterialSubmission = {
      id: `sub-${Date.now()}`,
      materialId,
      studentId: student.id,
      scholarNo: student.scholarNo,
      studentName: student.name,
      submittedAt: new Date().toISOString(),
      content,
      attachmentName,
      status: 'submitted',
    };
    setMaterialSubmissions((prev) => [
      ...prev.filter((s) => !(s.materialId === materialId && s.studentId === student.id)),
      newSubmission,
    ]);
  };

  const gradeSubmission = (submissionId: string, marks: number, feedback: string) => {
    setMaterialSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? { ...s, marksAwarded: marks, feedback, status: 'graded' as const }
          : s
      )
    );
  };

  const updateReportCard = (updatedCard: ReportCard) => {
    setReportCards((prev) =>
      prev.map((r) => (r.studentId === updatedCard.studentId ? updatedCard : r))
    );
  };

  const addNotification = (notifData: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notifData,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const resetToDemoData = async () => {
    localStorage.clear();
    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch (err) {
      console.warn('Server reset error:', err);
    }
    setClassrooms(INITIAL_CLASSROOMS);
    setTeachers(INITIAL_TEACHERS);
    setStudents(INITIAL_STUDENTS);
    setAdmins(INITIAL_ADMINS);
    setAcademicMaterials(INITIAL_ACADEMIC_MATERIALS);
    setMaterialSubmissions([]);
    setReportCards(INITIAL_REPORT_CARDS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentRole(null);
    setCurrentUser(null);
    window.location.reload();
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        currentUser,
        loginStudent,
        loginTeacher,
        loginAdminMaster,
        loginAdminCredentials,
        logout,
        branches,
        sections,
        classrooms,
        teachers,
        students,
        admins,
        academicMaterials,
        materialSubmissions,
        reportCards,
        notifications,
        attendanceSessions,
        getBranch,
        getSection,
        getClassroom,
        getSectionsByBranch,
        getClassroomsByBranch,
        addAdmin,
        removeAdmin,
        addClassroom,
        removeClassroom,
        addTeacher,
        removeTeacher,
        addStudent,
        removeStudent,
        startAttendanceSession,
        endAttendanceSession,
        deleteAttendanceSession,
        getActiveSessionForTeacher,
        addAcademicMaterial,
        gradeSubmission,
        updateReportCard,
        getActiveSessionForStudent,
        markAttendance,
        submitAcademicWork,
        addNotification,
        markNotificationRead,
        resetToDemoData,
        isServerSynced,
        lastServerSyncTime,
        syncWithServer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
