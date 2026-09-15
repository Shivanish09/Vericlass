import JSZip from 'jszip';
import {
  AttendanceRecord,
  AttendanceSession,
  Classroom,
  StudentUser,
  TeacherUser,
  AcademicMaterial,
  ReportCard,
} from '../types';

export async function exportInstitutionDataZip({
  branchName,
  sessions,
  students,
  teachers,
  classrooms,
  materials,
  reportCards,
}: {
  branchName?: string;
  sessions: AttendanceSession[];
  students: StudentUser[];
  teachers: TeacherUser[];
  classrooms: Classroom[];
  materials: AcademicMaterial[];
  reportCards: ReportCard[];
}): Promise<Blob> {
  const zip = new JSZip();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // 1. Attendance Records CSV
  let attendanceCsv =
    'Session ID,Date,Subject,Classroom,Teacher,Scholar No,Student Name,Roll No,Time,Distance (m),Geofence Status,Verification Status\n';
  sessions.forEach((s) => {
    s.records.forEach((r) => {
      attendanceCsv += `"${s.id}","${s.startedAt.split('T')[0]}","${s.subject}","${s.classroomId}","${s.teacherName}","${r.scholarNo}","${r.studentName}","${r.rollNo}","${r.timestamp}","${r.distanceMeters}","${r.isInsideGeofence ? 'INSIDE' : 'OUTSIDE'}","${r.status}"\n`;
    });
  });
  zip.file('attendance_records.csv', attendanceCsv);

  // 2. Students Master List CSV
  let studentsCsv =
    'Scholar No,Roll No,Full Name,Branch ID,Section ID,Semester,Email,Mobile,Parent Name,Parent Contact,Blood Group\n';
  students.forEach((st) => {
    studentsCsv += `"${st.scholarNo}","${st.rollNo}","${st.name}","${st.branchId}","${st.sectionId}","${st.semester}","${st.email}","${st.mobileNo}","${st.parentName}","${st.parentContact}","${st.bloodGroup}"\n`;
  });
  zip.file('students_roster.csv', studentsCsv);

  // 3. Teachers Roster CSV
  let teachersCsv =
    'Teacher No,Full Name,Department,Email,Mobile,Designation,Qualification,Joining Date\n';
  teachers.forEach((t) => {
    teachersCsv += `"${t.teacherNo}","${t.name}","${t.departmentBranchId}","${t.email}","${t.mobileNo}","${t.designation}","${t.qualification}","${t.joiningDate}"\n`;
  });
  zip.file('teachers_roster.csv', teachersCsv);

  // 4. Classrooms Geofence & Details JSON
  const classroomsData = classrooms.map((c) => ({
    roomNo: c.roomNo,
    branchId: c.branchId,
    building: c.buildingName,
    floor: c.floor,
    capacity: c.capacity,
    latitude: c.latitude,
    longitude: c.longitude,
    geofenceRadiusMeters: c.geofenceRadiusMeters,
    imagesCount: c.images.length,
    amenities: c.amenities,
  }));
  zip.file(
    'classrooms_geofence_inventory.json',
    JSON.stringify(classroomsData, null, 2)
  );

  // 5. Academic Materials Summary
  let materialsText = `=========================================================\n`;
  materialsText += `VERICLASS ACADEMIC MATERIALS REPORT\n`;
  materialsText += `Generated at: ${new Date().toLocaleString()}\n`;
  materialsText += `=========================================================\n\n`;
  materials.forEach((m, idx) => {
    materialsText += `[${idx + 1}] Type: ${m.type.toUpperCase()} | Subject: ${m.subject}\n`;
    materialsText += `Title: ${m.title}\n`;
    materialsText += `Teacher: ${m.teacherName} | Due: ${m.dueDate} | Max Marks: ${m.maxMarks || 'N/A'}\n`;
    materialsText += `Instructions:\n${m.description}\n`;
    if (m.questions && m.questions.length > 0) {
      materialsText += `Questions:\n${m.questions.map((q, i) => `  ${i + 1}. ${q}`).join('\n')}\n`;
    }
    materialsText += `---------------------------------------------------------\n\n`;
  });
  zip.file('academic_materials_guide.txt', materialsText);

  // 6. Student Report Cards Summary
  let reportCardsText = `=========================================================\n`;
  reportCardsText += `STUDENT ACADEMIC REPORT CARDS OVERVIEW\n`;
  reportCardsText += `=========================================================\n\n`;
  reportCards.forEach((rc) => {
    reportCardsText += `Scholar No: ${rc.scholarNo} | Name: ${rc.studentName} | Semester: ${rc.semester}\n`;
    reportCardsText += `Attendance Rate: ${rc.overallAttendancePercentage}% | Overall GPA: ${rc.overallGPA}\n`;
    reportCardsText += `Remarks: ${rc.teacherRemarks}\n`;
    reportCardsText += `Subjects:\n`;
    rc.subjects.forEach((sub) => {
      reportCardsText += `  - ${sub.subjectName}: Internal ${sub.internalMarks}/${sub.maxInternal}, Practical ${sub.practicalMarks}/${sub.maxPractical} (Grade: ${sub.grade})\n`;
    });
    reportCardsText += `\n`;
  });
  zip.file('student_report_cards.txt', reportCardsText);

  // 7. Readme & Audit documentation
  const readme = `VERICLASS INSTITUTIONAL ATTENDANCE & ACADEMIC BACKUP
Timestamp: ${new Date().toISOString()}
Branch Filter: ${branchName || 'All Branches'}
Total Attendance Sessions: ${sessions.length}
Total Registered Students: ${students.length}
Total Registered Teachers: ${teachers.length}
Total Classrooms: ${classrooms.length}

Security & Verification Standard:
- Geofencing: Haversine GPS proximity verification within classroom radius (10m - 50m).
- Real-time Visual Verification: In-class camera facial snapshots with timestamp encryption.
- Master Code Authorization: Supported for institutional directors.
`;
  zip.file('README_VERICLASS.txt', readme);

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
