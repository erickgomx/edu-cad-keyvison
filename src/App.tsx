/**
 * ============================================================================
 * COMPONENTE RAIZ: App.tsx (Orquestrador Principal da Aplicação EduCad)
 * ============================================================================
 * 
 * Este arquivo atua como o maestro da interface do sistema, sendo responsável por:
 * 
 * 1. Portal de Autenticação (Gatekeeper):
 *    - Se o usuário NÃO estiver logado (`!isAuthenticated`), renderiza imediatamente
 *      a tela de Login/Cadastro (`LoginScreen`), cumprindo a diretriz de segurança.
 * 
 * 2. Roteamento por Abas de Navegação:
 *    - Quando autenticado, gerencia a alternância dinâmica entre as telas:
 *      * 'dashboard': Visão geral com métricas e ocupação de vagas
 *      * 'students': Cadastro, busca e gerenciamento de alunos (RF01, RF02, RF05, RF06)
 *      * 'classes': Gerenciamento de turmas, turnos e chamada (RF03, RF09)
 *      * 'enrollments': Matrículas, enturmação e cancelamentos (RF04, RF07, RF10)
 * 
 * 3. Centralização de Diálogos Modais:
 *    - Mantém os estados de abertura/fechamento e os registros em edição de forma limpa,
 *      evitando duplicação de modais na árvore de renderização do React.
 * 
 * 4. Feedback Acessível (Toasts):
 *    - Renderiza o `ToastContainer` globalmente para exibir notificações sem recarregar a tela.
 */

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
import { LoginScreen } from './components/auth/LoginScreen';
import { Student, ClassRoom, Enrollment } from './types';
import { ShieldCheck, GraduationCap } from 'lucide-react';

export const App: React.FC = () => {
  // Consumimos o estado de autenticação e a busca do comprovante pelo contexto
  const { getEnrollmentReceiptData, isAuthenticated } = useSchool();
  
  // Aba atualmente selecionada pelo usuário
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'students' | 'classes' | 'enrollments'>('dashboard');

  // ==========================================================================
  // ESTADOS DOS DIÁLOGOS MODAIS (Abertura e dados sob manipulação)
  // ==========================================================================
  
  // Modal de Cadastro / Edição de Aluno (RF01/RF02)
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Modal de Dossiê / Detalhes do Aluno (RF06)
  const [isStudentDetailOpen, setIsStudentDetailOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Modal de Criação / Edição de Turma (RF03)
  const [isClassFormOpen, setIsClassFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);

  // Modal de Lista de Presença da Turma (RF09)
  const [isClassStudentsOpen, setIsClassStudentsOpen] = useState(false);
  const [viewingClass, setViewingClass] = useState<ClassRoom | null>(null);

  // Modal de Efetivação de Matrícula (RF04)
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [enrollmentTargetStudent, setEnrollmentTargetStudent] = useState<Student | null>(null);

  // Modal de Exibição / Impressão do Comprovante Oficial (RF07)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<{ enrollment: Enrollment; student: Student; classRoom: ClassRoom } | null>(null);

  // ==========================================================================
  // DISPARADORES E HANDLERS DE AÇÕES
  // ==========================================================================
  
  // Abre o formulário limpo para cadastrar um novo aluno
  const handleOpenNewStudent = () => {
    setEditingStudent(null);
    setIsStudentFormOpen(true);
  };

  // Abre o formulário pré-preenchido para editar um aluno existente
  const handleOpenEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsStudentFormOpen(true);
  };

  // Abre a visualização em detalhes do aluno
  const handleOpenStudentDetail = (student: Student) => {
    setViewingStudent(student);
    setIsStudentDetailOpen(true);
  };

  // Abre o modal de matrícula, opcionalmente pré-selecionando um estudante
  const handleOpenEnrollStudent = (student?: Student | null) => {
    setEnrollmentTargetStudent(student || null);
    setIsEnrollmentModalOpen(true);
  };

  // Abre o formulário limpo para criar uma nova turma
  const handleOpenNewClass = () => {
    setEditingClass(null);
    setIsClassFormOpen(true);
  };

  // Abre o formulário pré-preenchido para alterar capacidade/turno de uma turma
  const handleOpenEditClass = (c: ClassRoom) => {
    setEditingClass(c);
    setIsClassFormOpen(true);
  };

  // Abre a lista oficial de estudantes matriculados em uma turma específica (RF09)
  const handleOpenClassStudents = (c: ClassRoom) => {
    setViewingClass(c);
    setIsClassStudentsOpen(true);
  };

  // Busca os dados da matrícula e abre o comprovante oficial para visualização/PDF
  const handleOpenReceipt = (enrollmentId: string) => {
    const data = getEnrollmentReceiptData(enrollmentId);
    if (data) {
      setReceiptData(data);
      setIsReceiptModalOpen(true);
    }
  };

  // Ao concluir uma matrícula com sucesso, abre o comprovante automaticamente (RF07)
  const handleEnrollmentSuccess = (enrollment: Enrollment) => {
    handleOpenReceipt(enrollment.id);
  };

  // ==========================================================================
  // GUARDIÃO DE AUTENTICAÇÃO: Se não autenticado, exibe Tela de Login
  // ==========================================================================
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <ToastContainer />
      </>
    );
  }

  // ==========================================================================
  // ÁREA LOGADA: Interface completa com Menu, Abas e Modais
  // ==========================================================================
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Barra de Navegação Superior */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Conteúdo Dinâmico com base na aba ativa */}
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

      {/* Rodapé Institucional com avisos de LGPD e Acessibilidade */}
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

      {/* ====================================================================
          MODAIS GLOBAIS CONTROLADOS PELO APP
         ==================================================================== */}
      
      {/* Modal: Formulário de Aluno (RF01/RF02) */}
      <StudentFormModal
        isOpen={isStudentFormOpen}
        onClose={() => setIsStudentFormOpen(false)}
        studentToEdit={editingStudent}
        onSuccess={(student) => {
          // Mantém sincronizada a visualização detalhada caso o modal de detalhes esteja aberto
          if (viewingStudent && viewingStudent.id === student.id) {
            setViewingStudent(student);
          }
        }}
      />

      {/* Modal: Dossiê Detalhado do Estudante (RF06) */}
      <StudentDetailModal
        isOpen={isStudentDetailOpen}
        onClose={() => setIsStudentDetailOpen(false)}
        student={viewingStudent}
        onEdit={handleOpenEditStudent}
        onEnroll={handleOpenEnrollStudent}
        onViewReceipt={handleOpenReceipt}
      />

      {/* Modal: Formulário de Turma (RF03) */}
      <ClassFormModal
        isOpen={isClassFormOpen}
        onClose={() => setIsClassFormOpen(false)}
        classToEdit={editingClass}
      />

      {/* Modal: Diário / Lista de Presença da Turma (RF09) */}
      <ClassStudentsModal
        isOpen={isClassStudentsOpen}
        onClose={() => setIsClassStudentsOpen(false)}
        classRoom={viewingClass}
        onSelectStudent={handleOpenStudentDetail}
      />

      {/* Modal: Matrícula & Enturmação (RF04) */}
      <EnrollmentModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        preSelectedStudent={enrollmentTargetStudent}
        onEnrollmentSuccess={handleEnrollmentSuccess}
      />

      {/* Modal: Comprovante Oficial de Matrícula (RF07) */}
      <EnrollmentReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        data={receiptData}
      />

      {/* Central de Toasts de Notificação */}
      <ToastContainer />

    </div>
  );
};

export default App;
