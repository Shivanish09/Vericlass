export type UserRole = 'student' | 'teacher' | 'admin';

export interface Branch {
  id: string;
  name: string;
  code: string; // e.g. "CSE", "ECE", "ME", "CE", "IT"
  description: string;
}

export interface Section {
  id: string;
  name: string; // e.g. "Section A", "Section B"
  branchId: string;
  currentSemester: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  mobileNo: string;
  password?: string;
  isMaster?: boolean;
  addedByAdminName?: string;
  createdAt: string;
}

export interface Classroom {
  id: string;
  roomNo: string; // e.g. "Room 302", "Advanced Computing Lab 1"
  branchId: string;
  buildingName: string;
  floor: string;
  capacity: number;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number; // e.g. 50
  images: string[]; // Classroom photos added by admin
  amenities: string[];
}

export interface AssignedClass {
  branchId: string;
  sectionId: string;
  subject: string;
}

export interface TeacherUser {
  id: string;
  teacherNo: string; // e.g. "TCH-2024-101"
  name: string;
  email: string;
  mobileNo: string;
  departmentBranchId: string;
  assignedClasses: AssignedClass[];
  photoUrl: string;
  password: string;
  qualification: string;
  designation: string;
  joiningDate: string;
}

export interface StudentUser {
  id: string;
  scholarNo: string; // e.g. "SCH-2024-001"
  rollNo: string;
  name: string;
  branchId: string;
  sectionId: string;
  semester: number;
  email: string;
  mobileNo: string;
  parentName: string;
  parentContact: string;
  bloodGroup: string;
  address: string;
  photoUrl: string; // Reference photo for facial/visual verification
  password: string;
  admissionYear: number;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  scholarNo: string;
  studentName: string;
  rollNo: string;
  branchId: string;
  sectionId: string;
  timestamp: string;
  livePhotoUrl: string; // Real-time photo captured by student inside class
  latitude: number;
  longitude: number;
  distanceMeters: number;
  isInsideGeofence: boolean;
  verificationScore: number; // 0-100% confidence match
  status: 'verified' | 'flagged' | 'manual';
  notes?: string;
}

export interface AttendanceSession {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherNo: string;
  branchId: string;
  sectionId: string;
  classroomId: string;
  subject: string;
  topic?: string;
  startedAt: string;
  expiresAt: string;
  status: 'active' | 'completed' | 'cancelled';
  records: AttendanceRecord[];
}

export type AcademicMaterialType =
  | 'homework'
  | 'assignment'
  | 'practical'
  | 'practice_question'
  | 'lecture_notes';

export interface AcademicMaterial {
  id: string;
  type: AcademicMaterialType;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  branchId: string;
  sectionId: string;
  subject: string;
  dueDate: string;
  maxMarks?: number;
  questions?: string[];
  referenceLinks?: string[];
  attachmentName?: string;
  createdAt: string;
}

export interface MaterialSubmission {
  id: string;
  materialId: string;
  studentId: string;
  scholarNo: string;
  studentName: string;
  submittedAt: string;
  content: string;
  attachmentName?: string;
  marksAwarded?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
}

export interface SubjectGrade {
  subjectName: string;
  teacherName: string;
  internalMarks: number;
  maxInternal: number;
  practicalMarks: number;
  maxPractical: number;
  grade: string;
  attendancePercentage: number;
  remarks: string;
}

export interface ReportCard {
  id: string;
  studentId: string;
  scholarNo: string;
  studentName: string;
  semester: number;
  branchId: string;
  sectionId: string;
  academicYear: string;
  subjects: SubjectGrade[];
  overallGPA: number;
  overallAttendancePercentage: number;
  teacherRemarks: string;
  issuedDate: string;
}

export interface NotificationItem {
  id: string;
  targetRole: 'all' | 'student' | 'teacher' | 'admin';
  branchId?: string;
  sectionId?: string;
  title: string;
  message: string;
  type: 'attendance' | 'academic' | 'announcement' | 'alert';
  createdAt: string;
  read: boolean;
}
