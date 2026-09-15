import React, { useState } from 'react';
import {
  Building,
  Users,
  GraduationCap,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Download,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  Phone,
  Mail,
  BookOpen,
  Calendar,
  Sparkles,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Classroom, StudentUser, TeacherUser } from '../../types';
import { exportInstitutionDataZip, downloadBlob } from '../../utils/zipUtils';
import { ImageUploader } from '../ImageUploader';

export const AdminDashboard: React.FC = () => {
  const {
    branches,
    sections,
    classrooms,
    teachers,
    students,
    admins,
    attendanceSessions,
    academicMaterials,
    reportCards,
    addClassroom,
    removeClassroom,
    addTeacher,
    removeTeacher,
    addStudent,
    removeStudent,
    addAdmin,
    removeAdmin,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'classrooms' | 'teachers' | 'students' | 'admins' | 'logs'>('classrooms');

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'classroom' | 'teacher' | 'student' | 'admin';
    id: string;
    title: string;
    subtitle?: string;
  } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setDeleteError(null);

    if (deleteTarget.type === 'classroom') {
      removeClassroom(deleteTarget.id);
      setDeleteTarget(null);
    } else if (deleteTarget.type === 'teacher') {
      removeTeacher(deleteTarget.id);
      setDeleteTarget(null);
    } else if (deleteTarget.type === 'student') {
      removeStudent(deleteTarget.id);
      setDeleteTarget(null);
    } else if (deleteTarget.type === 'admin') {
      const res = removeAdmin(deleteTarget.id);
      if (!res.success) {
        setDeleteError(res.message || 'Failed to remove administrator.');
        return;
      }
      setDeleteTarget(null);
    }
  };

  // Filter states
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal open states
  const [showAddClassroom, setShowAddClassroom] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);

  // Form: Add Classroom
  const [roomNo, setRoomNo] = useState('');
  const [classBranchId, setClassBranchId] = useState(branches[0]?.id || '');
  const [buildingName, setBuildingName] = useState('Academic Complex Block A');
  const [floor, setFloor] = useState('3rd Floor');
  const [capacity, setCapacity] = useState(60);
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.209);
  const [geofenceRadius, setGeofenceRadius] = useState(50);
  const [classroomImageUrl, setClassroomImageUrl] = useState('');
  const [classroomImagesList, setClassroomImagesList] = useState<string[]>([
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80',
  ]);

  // Form: Add Teacher
  const [teacherNo, setTeacherNo] = useState(`TCH-${100 + teachers.length + 1}`);
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherMobile, setTeacherMobile] = useState('');
  const [teacherBranch, setTeacherBranch] = useState(branches[0]?.id || '');
  const [teacherSubject, setTeacherSubject] = useState('');
  const [teacherSectionId, setTeacherSectionId] = useState(sections[0]?.id || '');
  const [teacherPhoto, setTeacherPhoto] = useState(
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80'
  );
  const [teacherQualification, setTeacherQualification] = useState('M.Tech, Ph.D.');
  const [teacherDesignation, setTeacherDesignation] = useState('Assistant Professor');
  const [teacherPassword, setTeacherPassword] = useState('teacher123');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);

  // Form: Add Student
  const [scholarNo, setScholarNo] = useState(`SCH-2024-00${students.length + 1}`);
  const [rollNo, setRollNo] = useState(`24CS0${students.length + 1}`);
  const [studentName, setStudentName] = useState('');
  const [studentBranch, setStudentBranch] = useState(branches[0]?.id || '');
  const [studentSection, setStudentSection] = useState(sections[0]?.id || '');
  const [studentSemester, setStudentSemester] = useState(4);
  const [studentEmail, setStudentEmail] = useState('');
  const [studentMobile, setStudentMobile] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('');
  const [studentPhoto, setStudentPhoto] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80'
  );
  const [studentPassword, setStudentPassword] = useState('student123');
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Form: Add Admin
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminMobile, setNewAdminMobile] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Classroom submission
  const handleCreateClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNo.trim()) return;

    addClassroom({
      roomNo,
      branchId: classBranchId,
      buildingName,
      floor,
      capacity: Number(capacity),
      latitude: Number(latitude),
      longitude: Number(longitude),
      geofenceRadiusMeters: Number(geofenceRadius),
      images: classroomImagesList,
      amenities: ['Smart Projector', 'Air Conditioned', 'Wi-Fi 6 Geofence Beacon'],
    });

    setRoomNo('');
    setShowAddClassroom(false);
  };

  // Teacher submission
  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherNo.trim() || !teacherName.trim()) return;

    addTeacher({
      teacherNo: teacherNo.trim().toUpperCase(),
      name: teacherName.trim(),
      email: teacherEmail.trim(),
      mobileNo: teacherMobile.trim(),
      departmentBranchId: teacherBranch,
      assignedClasses: [
        {
          branchId: teacherBranch,
          sectionId: teacherSectionId,
          subject: teacherSubject || 'Core Subject',
        },
      ],
      photoUrl: teacherPhoto,
      password: teacherPassword,
      qualification: teacherQualification,
      designation: teacherDesignation,
      joiningDate: new Date().toISOString().split('T')[0],
    });

    setTeacherName('');
    setTeacherEmail('');
    setTeacherMobile('');
    setTeacherSubject('');
    setShowAddTeacher(false);
  };

  // Student submission
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scholarNo.trim() || !studentName.trim()) return;

    addStudent({
      scholarNo: scholarNo.trim().toUpperCase(),
      rollNo: rollNo.trim().toUpperCase(),
      name: studentName.trim(),
      branchId: studentBranch,
      sectionId: studentSection,
      semester: Number(studentSemester),
      email: studentEmail.trim(),
      mobileNo: studentMobile.trim(),
      parentName: parentName.trim(),
      parentContact: parentContact.trim(),
      bloodGroup,
      address,
      photoUrl: studentPhoto,
      password: studentPassword,
      admissionYear: 2024,
    });

    setStudentName('');
    setStudentEmail('');
    setStudentMobile('');
    setParentName('');
    setParentContact('');
    setAddress('');
    setShowAddStudent(false);
  };

  // Admin submission
  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim() || !newAdminPassword.trim()) return;

    addAdmin({
      name: newAdminName.trim(),
      email: newAdminEmail.trim(),
      mobileNo: newAdminMobile.trim(),
      password: newAdminPassword.trim(),
      isMaster: false,
    });

    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminMobile('');
    setNewAdminPassword('');
    setShowAddAdmin(false);
  };

  // Export Full ZIP
  const handleExportAllZip = async () => {
    const blob = await exportInstitutionDataZip({
      sessions: attendanceSessions,
      students,
      teachers,
      classrooms,
      materials: academicMaterials,
      reportCards,
    });
    downloadBlob(blob, `VeriClass_Full_Backup_${new Date().toISOString().slice(0, 10)}.zip`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner / Stats */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-rose-600">
            <ShieldCheck className="h-4 w-4" />
            <span>Master Institutional Administration</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">
            Campus Registry & System Control
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage classrooms with branch images & GPS geofencing, register teachers and students branch/section wise, and authorize admins.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleExportAllZip}
            className="flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Export Institute Archive (ZIP)</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Students</span>
            <Users className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{students.length}</p>
          <span className="text-[11px] text-slate-400 font-medium">Branch & Section Enrolled</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Faculty</span>
            <GraduationCap className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{teachers.length}</p>
          <span className="text-[11px] text-slate-400 font-medium">Department Assigned</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Classrooms</span>
            <Building className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{classrooms.length}</p>
          <span className="text-[11px] text-slate-400 font-medium">Geofence Active</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Administrators</span>
            <ShieldCheck className="h-5 w-5 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{admins.length}</p>
          <span className="text-[11px] text-slate-400 font-medium">Authorized Roles</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('classrooms')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'classrooms'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Building className="h-4 w-4" />
          <span>Classrooms & Branch Geofences ({classrooms.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('teachers')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'teachers'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Faculty & Teacher Registry ({teachers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'students'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Student Records (Branch & Section) ({students.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('admins')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'admins'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Manage Admins ({admins.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'logs'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Attendance Sessions Audit ({attendanceSessions.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: CLASSROOMS ================= */}
      {activeTab === 'classrooms' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Branch Classrooms & Physical Verification Sites</h2>
              <p className="text-xs text-slate-500">
                Classrooms have photos, GPS coordinates and precise geofencing boundary for student attendance.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddClassroom(true)}
              className="flex items-center space-x-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500 transition shadow"
            >
              <Plus className="h-4 w-4" />
              <span>Add Classroom & Photos</span>
            </button>
          </div>

          {/* Classrooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((c) => {
              const branch = branches.find((b) => b.id === c.branchId);
              return (
                <div
                  key={c.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition"
                >
                  {/* Classroom Image Banner */}
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                    {c.images && c.images.length > 0 ? (
                      <img
                        src={c.images[0]}
                        alt={c.roomNo}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-600">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 rounded-md bg-black/70 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
                      {branch?.code || 'General'} Branch
                    </div>
                    <div className="absolute bottom-3 right-3 rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[11px] font-mono text-white">
                      Geofence: {c.geofenceRadiusMeters}m
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{c.roomNo}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {c.buildingName} • {c.floor} • Capacity: {c.capacity} students
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            type: 'classroom',
                            id: c.id,
                            title: `Classroom ${c.roomNo}`,
                            subtitle: `${c.buildingName} • ${c.floor} (${branch?.code || 'General'} Branch)`,
                          })
                        }
                        title="Remove Classroom"
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono">
                      <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>
                        {c.latitude.toFixed(5)}, {c.longitude.toFixed(5)}
                      </span>
                    </div>

                    {c.images && c.images.length > 1 && (
                      <div className="mt-3">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Classroom Angle Photos ({c.images.length})
                        </span>
                        <div className="flex space-x-2 overflow-x-auto pb-1">
                          {c.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="Room angle"
                              className="h-12 w-16 object-cover rounded-md border border-slate-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {c.amenities.map((a, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Classroom Modal */}
          {showAddClassroom && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
              <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Register Classroom with Geofence & Photos
                </h3>

                <form onSubmit={handleCreateClassroom} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Classroom Number / Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Room 302 or Advanced Robotics Lab"
                      value={roomNo}
                      onChange={(e) => setRoomNo(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Branch *</label>
                      <select
                        value={classBranchId}
                        onChange={(e) => setClassBranchId(e.target.value)}
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
                      <label className="block font-semibold text-slate-700 mb-1">Capacity</label>
                      <input
                        type="number"
                        value={capacity}
                        onChange={(e) => setCapacity(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Building</label>
                      <input
                        type="text"
                        value={buildingName}
                        onChange={(e) => setBuildingName(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Floor</label>
                      <input
                        type="text"
                        value={floor}
                        onChange={(e) => setFloor(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-2">
                      Geofence GPS Coordinates & Radius
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={latitude}
                          onChange={(e) => setLatitude(Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-300 p-1.5 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={longitude}
                          onChange={(e) => setLongitude(Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-300 p-1.5 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">Radius (m)</label>
                        <input
                          type="number"
                          value={geofenceRadius}
                          onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-300 p-1.5 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <ImageUploader
                      label="Classroom Visual Verification Photos"
                      helperText="Upload angle images of this classroom so students and teachers can visually orient and verify the room."
                      multiple={true}
                      maxFiles={6}
                      value={classroomImagesList}
                      onChange={(imgs) => setClassroomImagesList(imgs)}
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddClassroom(false)}
                      className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-amber-600 px-5 py-2 font-semibold text-white hover:bg-amber-500"
                    >
                      Save Classroom
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: TEACHERS ================= */}
      {activeTab === 'teachers' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Faculty & Teacher Master Registry</h2>
              <p className="text-xs text-slate-500">
                Teachers log in using their unique Teacher No. (e.g. TCH-101) with departmental assignments.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddTeacher(true)}
              className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow"
            >
              <Plus className="h-4 w-4" />
              <span>Register New Teacher</span>
            </button>
          </div>

          {/* Teacher Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((t) => {
              const dept = branches.find((b) => b.id === t.departmentBranchId);
              return (
                <div
                  key={t.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition"
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={t.photoUrl}
                      alt={t.name}
                      className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-mono font-bold text-indigo-700">
                          {t.teacherNo}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-semibold text-slate-400">
                            {dept?.code} Dept
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                type: 'teacher',
                                id: t.id,
                                title: t.name,
                                subtitle: `${t.teacherNo} • ${t.designation} (${dept?.code} Dept)`,
                              })
                            }
                            title="Remove Teacher"
                            className="rounded-md p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <h3 className="mt-1 text-base font-bold text-slate-900 truncate">{t.name}</h3>
                      <p className="text-xs text-slate-500 truncate">{t.designation}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{t.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{t.mobileNo}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{t.qualification}</span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Assigned Teaching Loads:
                    </span>
                    {t.assignedClasses.map((ac, i) => (
                      <div key={i} className="text-xs font-medium text-slate-700">
                        • {ac.subject}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Teacher Modal */}
          {showAddTeacher && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
              <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Register Faculty / Teacher</h3>

                <form onSubmit={handleCreateTeacher} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Teacher No. *</label>
                      <input
                        type="text"
                        required
                        value={teacherNo}
                        onChange={(e) => setTeacherNo(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Prof. John Doe"
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={teacherEmail}
                        onChange={(e) => setTeacherEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Mobile No. *</label>
                      <input
                        type="tel"
                        required
                        value={teacherMobile}
                        onChange={(e) => setTeacherMobile(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Department / Branch</label>
                      <select
                        value={teacherBranch}
                        onChange={(e) => setTeacherBranch(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                      >
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                      <input
                        type="text"
                        value={teacherDesignation}
                        onChange={(e) => setTeacherDesignation(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Subject Assignment</label>
                    <input
                      type="text"
                      placeholder="e.g. Computer Networks & Security"
                      value={teacherSubject}
                      onChange={(e) => setTeacherSubject(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <ImageUploader
                      label="Teacher Official Profile Photo"
                      helperText="Upload teacher's photo file (PNG, JPG, WebP) or switch to URL."
                      value={teacherPhoto}
                      onChange={(photo) => setTeacherPhoto(photo)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Login Password</label>
                    <div className="relative">
                      <input
                        type={showTeacherPassword ? 'text' : 'password'}
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 pr-10 text-sm focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showTeacherPassword ? 'Hide password' : 'Show password'}
                      >
                        {showTeacherPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddTeacher(false)}
                      className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-500"
                    >
                      Save Teacher
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: STUDENTS ================= */}
      {activeTab === 'students' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Directory (Branch & Section Wise)</h2>
              <p className="text-xs text-slate-500">
                Students log in using their Scholar No. and are strictly separated by Branch and Section.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddStudent(true)}
              className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow"
            >
              <Plus className="h-4 w-4" />
              <span>Enroll New Student</span>
            </button>
          </div>

          {/* Branch & Section Filtering Bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white border border-slate-200 p-4 mb-6 shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
              <Filter className="h-4 w-4 text-emerald-600" />
              <span>Filter:</span>
            </div>

            <select
              value={selectedBranchId}
              onChange={(e) => {
                setSelectedBranchId(e.target.value);
                setSelectedSectionId('all');
              }}
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>

            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
            >
              <option value="all">All Sections</option>
              {sections
                .filter((s) => selectedBranchId === 'all' || s.branchId === selectedBranchId)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>

            <div className="relative ml-auto w-full sm:w-64">
              <input
                type="text"
                placeholder="Search scholar no. or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-300 pl-8 pr-3 py-1.5 text-xs font-medium"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* Student Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students
              .filter((st) => {
                if (selectedBranchId !== 'all' && st.branchId !== selectedBranchId) return false;
                if (selectedSectionId !== 'all' && st.sectionId !== selectedSectionId) return false;
                if (
                  searchQuery &&
                  !st.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                  !st.scholarNo.toLowerCase().includes(searchQuery.toLowerCase())
                ) {
                  return false;
                }
                return true;
              })
              .map((st) => {
                const branch = branches.find((b) => b.id === st.branchId);
                const section = sections.find((s) => s.id === st.sectionId);
                return (
                  <div
                    key={st.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition"
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={st.photoUrl}
                        alt={st.name}
                        className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-mono font-bold text-emerald-700">
                            {st.scholarNo}
                          </span>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] font-semibold text-slate-400">
                              Roll: {st.rollNo}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'student',
                                  id: st.id,
                                  title: st.name,
                                  subtitle: `${st.scholarNo} • Roll: ${st.rollNo} (${branch?.code} - ${section?.name})`,
                                })
                              }
                              title="Remove Student"
                              className="rounded-md p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <h3 className="mt-1 text-base font-bold text-slate-900 truncate">{st.name}</h3>
                        <p className="text-xs font-medium text-emerald-600">
                          {branch?.code} • {section?.name} (Sem {st.semester})
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate">{st.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{st.mobileNo}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate">
                          Parent: {st.parentName} ({st.parentContact})
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
                      <span>Blood Group: <strong className="text-slate-800">{st.bloodGroup}</strong></span>
                      <span>Verified Biometric Profile</span>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Add Student Modal */}
          {showAddStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
              <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Enroll Student (Institutional Record)
                </h3>

                <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Scholar No. *</label>
                      <input
                        type="text"
                        required
                        value={scholarNo}
                        onChange={(e) => setScholarNo(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Roll No. *</label>
                      <input
                        type="text"
                        required
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm uppercase font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Patel"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Branch *</label>
                      <select
                        value={studentBranch}
                        onChange={(e) => setStudentBranch(e.target.value)}
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
                      <label className="block font-semibold text-slate-700 mb-1">Section *</label>
                      <select
                        value={studentSection}
                        onChange={(e) => setStudentSection(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                      >
                        {sections
                          .filter((s) => s.branchId === studentBranch)
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Semester *</label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={studentSemester}
                        onChange={(e) => setStudentSemester(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Mobile No. *</label>
                      <input
                        type="tel"
                        required
                        value={studentMobile}
                        onChange={(e) => setStudentMobile(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Parent / Guardian Name</label>
                      <input
                        type="text"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Parent Contact</label>
                      <input
                        type="tel"
                        value={parentContact}
                        onChange={(e) => setParentContact(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                      <input
                        type="text"
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Login Password</label>
                      <div className="relative">
                        <input
                          type={showStudentPassword ? 'text' : 'password'}
                          value={studentPassword}
                          onChange={(e) => setStudentPassword(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 p-2.5 pr-10 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowStudentPassword(!showStudentPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                          title={showStudentPassword ? 'Hide password' : 'Show password'}
                        >
                          {showStudentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <ImageUploader
                      label="Reference Facial Photo (Biometric Verification)"
                      helperText="Upload student's official photo for biometric & facial match during attendance."
                      value={studentPhoto}
                      onChange={(photo) => setStudentPhoto(photo)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddStudent(false)}
                      className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-500"
                    >
                      Enroll Student
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: MANAGE ADMINS ================= */}
      {activeTab === 'admins' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Institutional Administration Team</h2>
              <p className="text-xs text-slate-500">
                Only authorized admins can add more admins, configure security codes, and provision accounts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddAdmin(true)}
              className="flex items-center space-x-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition shadow"
            >
              <Plus className="h-4 w-4" />
              <span>Add Administrator</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {admins.map((adm) => (
              <div
                key={adm.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                      adm.isMaster
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {adm.isMaster ? 'Master Registrar' : 'Registered Admin'}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-slate-400">
                      Added: {new Date(adm.createdAt).toLocaleDateString()}
                    </span>
                    {currentUser?.id !== adm.id && (
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            type: 'admin',
                            id: adm.id,
                            title: adm.name,
                            subtitle: `${adm.email} • ${adm.isMaster ? 'Master Registrar' : 'Registered Admin'}`,
                          })
                        }
                        title="Remove Administrator"
                        className="rounded-md p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900">{adm.name}</h3>

                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{adm.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{adm.mobileNo}</span>
                  </div>
                  {adm.addedByAdminName && (
                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      Authorized by: {adm.addedByAdminName}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Admin Modal */}
          {showAddAdmin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Add New Administrator</h3>
                <p className="text-xs text-slate-500 mb-4">
                  This administrator can login with their Name, Mobile, Email and this set password.
                </p>

                <form onSubmit={handleCreateAdmin} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Admin Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mobile No. *</label>
                    <input
                      type="tel"
                      required
                      value={newAdminMobile}
                      onChange={(e) => setNewAdminMobile(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
                    <input
                      type="email"
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        required
                        placeholder="Minimum 6 characters"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-2.5 pr-10 text-sm focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showAdminPassword ? 'Hide password' : 'Show password'}
                      >
                        {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddAdmin(false)}
                      className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-rose-600 px-5 py-2 font-semibold text-white hover:bg-rose-500"
                    >
                      Authorize Admin
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: AUDIT LOGS ================= */}
      {activeTab === 'logs' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Attendance Sessions & Geofence Logs</h2>
              <p className="text-xs text-slate-500">
                Historical records of all physical attendance sessions and verified student photos.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Session & Subject</th>
                    <th className="p-4">Teacher</th>
                    <th className="p-4">Branch & Section</th>
                    <th className="p-4">Classroom</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Present Verified</th>
                    <th className="p-4">Started At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {attendanceSessions.map((s) => {
                    const branch = branches.find((b) => b.id === s.branchId);
                    const section = sections.find((sec) => sec.id === s.sectionId);
                    const room = classrooms.find((c) => c.id === s.classroomId);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-4">
                          <span className="font-bold text-slate-900 block">{s.subject}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{s.id}</span>
                        </td>
                        <td className="p-4">{s.teacherName}</td>
                        <td className="p-4">
                          {branch?.code} • {section?.name}
                        </td>
                        <td className="p-4">{room?.roomNo}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              s.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {s.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-900">
                          {s.records.length} students
                        </td>
                        <td className="p-4 text-slate-500 font-mono text-[11px]">
                          {new Date(s.startedAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 capitalize">
                  Remove {deleteTarget.type}
                </h3>
                <p className="text-xs text-slate-500">
                  Institutional record deletion
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 mb-4">
              <p className="text-xs font-semibold text-slate-800">
                {deleteTarget.title}
              </p>
              {deleteTarget.subtitle && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {deleteTarget.subtitle}
                </p>
              )}
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to permanently remove this {deleteTarget.type}? Associated active credentials and authorizations will be revoked immediately.
            </p>

            {deleteError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 mb-4 text-xs font-semibold text-rose-700">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteError(null);
                }}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition shadow cursor-pointer"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
