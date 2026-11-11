import React, { useState } from 'react';
import { useSchool } from './context/SchoolContext';
import { Navbar } from './components/common/Navbar';
import { ToastContainer } from './components/common/ToastContainer';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { StudentList } from './components/students/StudentList';
import { StudentFormModal } from './components/students/StudentFormModal';
import { StudentDetailModal } from './components/students/StudentDetailModal';
import { ClassList } from './components/classes/ClassList';
import { ClassFormModal } from './components/classes/ClassFormModal';
import { ClassStudentsModal } from './components/classes/ClassStudentsModal';
import { EnrollmentList } from './components/enrollment/EnrollmentList';
import { EnrollmentModal } from './components/enrollment/EnrollmentModal';
import { EnrollmentReceiptModal } from './components/enrollment/EnrollmentReceiptModal';
import { Student, ClassRoom, Enrollment } from './types';
import { ShieldCheck, GraduationCap } from 'lucide-react';

export const App: React.FC = () => {
  const { getEnrollmentReceiptData } = useSchool();
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'students' | 'classes' | 'enrollments'>('dashboard');

  // Modals state
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isStudentDetailOpen, setIsStudentDetailOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  const [isClassFormOpen, setIsClassFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);

  const [isClassStudentsOpen, setIsClassStudentsOpen] = useState(false);
  const [viewingClass, setViewingClass] = useState<ClassRoom | null>(null);

  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [enrollmentTargetStudent, setEnrollmentTargetStudent] = useState<Student | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<{ enrollment: Enrollment; student: Student; classRoom: ClassRoom } | null>(null);

  // Handlers
  const handleOpenNewStudent = () => {
    setEditingStudent(null);
    setIsStudentFormOpen(true);
  };

  const handleOpenEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsStudentFormOpen(true);
  };

  const handleOpenStudentDetail = (student: Student) => {
    setViewingStudent(student);
    setIsStudentDetailOpen(true);
  };

  const handleOpenEnrollStudent = (student?: Student | null) => {
    setEnrollmentTargetStudent(student || null);
    setIsEnrollmentModalOpen(true);
  };

  const handleOpenNewClass = () => {
    setEditingClass(null);
    setIsClassFormOpen(true);
  };

  const handleOpenEditClass = (c: ClassRoom) => {
    setEditingClass(c);
    setIsClassFormOpen(true);
  };

  const handleOpenClassStudents = (c: ClassRoom) => {
    setViewingClass(c);
    setIsClassStudentsOpen(true);
  };

  const handleOpenReceipt = (enrollmentId: string) => {
    const data = getEnrollmentReceiptData(enrollmentId);
    if (data) {
      setReceiptData(data);
      setIsReceiptModalOpen(true);
    }
  };

  const handleEnrollmentSuccess = (enrollment: Enrollment) => {
    // Open receipt right after successful enrollment
    handleOpenReceipt(enrollment.id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Top Navbar */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <DashboardOverview
            onNavigateTab={setCurrentTab}
            onNewStudent={handleOpenNewStudent}
            onNewClass={handleOpenNewClass}
            onNewEnrollment={() => handleOpenEnrollStudent(null)}
            onViewReceipt={handleOpenReceipt}
          />
        )}

        {currentTab === 'students' && (
          <StudentList
            onNewStudent={handleOpenNewStudent}
            onEditStudent={handleOpenEditStudent}
            onSelectStudent={handleOpenStudentDetail}
            onEnrollStudent={handleOpenEnrollStudent}
            onViewReceipt={handleOpenReceipt}
          />
        )}

        {currentTab === 'classes' && (
          <ClassList
            onNewClass={handleOpenNewClass}
            onEditClass={handleOpenEditClass}
            onViewClassStudents={handleOpenClassStudents}
          />
        )}

        {currentTab === 'enrollments' && (
          <EnrollmentList
            onNewEnrollment={() => handleOpenEnrollStudent(null)}
            onViewReceipt={handleOpenReceipt}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-auto text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-800">EduCad</span>
            <span>•</span>
            <span>Sistema Escolar Funcional (Front-end Completo)</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Conformidade LGPD (RNF07)</span>
            </span>
            <span>•</span>
            <span>Acessibilidade WCAG AA (RNF06)</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <StudentFormModal
        isOpen={isStudentFormOpen}
        onClose={() => setIsStudentFormOpen(false)}
        studentToEdit={editingStudent}
        onSuccess={(student) => {
          // If editing active student in details modal, keep in sync
          if (viewingStudent && viewingStudent.id === student.id) {
            setViewingStudent(student);
          }
        }}
      />

      <StudentDetailModal
        isOpen={isStudentDetailOpen}
        onClose={() => setIsStudentDetailOpen(false)}
        student={viewingStudent}
        onEdit={handleOpenEditStudent}
        onEnroll={handleOpenEnrollStudent}
        onViewReceipt={handleOpenReceipt}
      />

      <ClassFormModal
        isOpen={isClassFormOpen}
        onClose={() => setIsClassFormOpen(false)}
        classToEdit={editingClass}
      />

      <ClassStudentsModal
        isOpen={isClassStudentsOpen}
        onClose={() => setIsClassStudentsOpen(false)}
        classRoom={viewingClass}
        onSelectStudent={handleOpenStudentDetail}
      />

      <EnrollmentModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        preSelectedStudent={enrollmentTargetStudent}
        onEnrollmentSuccess={handleEnrollmentSuccess}
      />

      <EnrollmentReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        data={receiptData}
      />

      {/* Live Toast Container */}
      <ToastContainer />

    </div>
  );
};
export default App;
