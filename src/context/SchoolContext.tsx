import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Student, 
  ClassRoom, 
  Enrollment, 
  User, 
  UserRole, 
  ToastMessage 
} from '../types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_CLASSES, 
  INITIAL_ENROLLMENTS, 
  INITIAL_USERS 
} from '../utils/mockData';
import { 
  validateCPF, 
  isUnder18, 
  generateRegistrationNumber, 
  generateEnrollmentCode 
} from '../utils/validators';

interface SchoolContextType {
  students: Student[];
  classes: ClassRoom[];
  enrollments: Enrollment[];
  currentUser: User;
  users: User[];
  isAuthenticated: boolean;
  toasts: ToastMessage[];
  login: (email: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  addToast: (type: ToastMessage['type'], title: string, description?: string) => void;
  removeToast: (id: string) => void;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  
  // Student operations
  addStudent: (studentData: Omit<Student, 'id' | 'registrationNumber' | 'createdAt'>) => { success: boolean; error?: string; student?: Student };
  updateStudent: (id: string, studentData: Partial<Student>) => { success: boolean; error?: string };
  deleteStudent: (id: string) => { success: boolean; error?: string };
  getStudentById: (id: string) => Student | undefined;
  
  // Class operations
  addClass: (classData: Omit<ClassRoom, 'id'>) => { success: boolean; error?: string };
  updateClass: (id: string, classData: Partial<ClassRoom>) => { success: boolean; error?: string };
  deleteClass: (id: string) => { success: boolean; error?: string };
  getClassById: (id: string) => ClassRoom | undefined;
  getClassEnrolledCount: (classId: string) => number;
  getStudentsByClass: (classId: string) => Student[];
  
  // Enrollment operations
  enrollStudent: (studentId: string, classId: string) => { success: boolean; error?: string; enrollment?: Enrollment };
  cancelEnrollment: (enrollmentId: string, reason?: string) => { success: boolean; error?: string };
  getActiveEnrollmentByStudent: (studentId: string) => Enrollment | undefined;
  getEnrollmentReceiptData: (enrollmentId: string) => { enrollment: Enrollment; student: Student; classRoom: ClassRoom } | null;
  
  // Reset demo data
  resetToDefaultData: () => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

const STORAGE_KEYS = {
  STUDENTS: 'educad_students_v1',
  CLASSES: 'educad_classes_v1',
  ENROLLMENTS: 'educad_enrollments_v1',
  USERS: 'educad_users_v1',
  CURRENT_USER: 'educad_current_user_v1'
};

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from LocalStorage or initialize with mock data
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLASSES);
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
    return saved ? JSON.parse(saved) : INITIAL_ENROLLMENTS;
  });

  const [users] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Default: Secretaria/Admin
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
  }, [enrollments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Toast Notification helper
  const addToast = (type: ToastMessage['type'], title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);

    // Auto-dismiss after 4.5s
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchRole = (role: UserRole) => {
    const targetUser = users.find((u) => u.role === role) || users[0];
    setCurrentUser(targetUser);
    addToast('info', 'Perfil alternado', `Você agora está visualizando o sistema como: ${targetUser.name} (${role.toUpperCase()})`);
  };

  // Student CRUD operations
  const addStudent = (studentData: Omit<Student, 'id' | 'registrationNumber' | 'createdAt'>) => {
    // Validação RN01: CPF obrigatório e válido
    if (!studentData.cpf || !validateCPF(studentData.cpf)) {
      addToast('error', 'CPF Inválido', 'Informe um CPF válido para realizar o cadastro.');
      return { success: false, error: 'CPF inválido.' };
    }

    // CPF duplicado
    const cleanNewCpf = studentData.cpf.replace(/\D/g, '');
    const cpfExists = students.some((s) => s.cpf.replace(/\D/g, '') === cleanNewCpf);
    if (cpfExists) {
      addToast('error', 'CPF Já Cadastrado', 'Já existe um aluno cadastrado com este CPF.');
      return { success: false, error: 'CPF já cadastrado.' };
    }

    // Validação RN05: Menor de 18 anos exige responsável
    if (isUnder18(studentData.birthDate)) {
      if (!studentData.guardian || !studentData.guardian.name || !studentData.guardian.cpf) {
        addToast('error', 'Responsável Obrigatório', 'Alunos menores de 18 anos devem ter um responsável cadastrado (RN05).');
        return { success: false, error: 'Responsável obrigatório para menores de 18 anos.' };
      }
      if (!validateCPF(studentData.guardian.cpf)) {
        addToast('error', 'CPF do Responsável Inválido', 'O CPF do responsável informado não é válido.');
        return { success: false, error: 'CPF do responsável inválido.' };
      }
    }

    const newStudent: Student = {
      ...studentData,
      id: `student-${Date.now()}`,
      registrationNumber: generateRegistrationNumber(),
      createdAt: new Date().toISOString()
    };

    setStudents((prev) => [newStudent, ...prev]);
    addToast('success', 'Aluno Cadastrado com Sucesso!', `Matrícula gerada: ${newStudent.registrationNumber}`);
    return { success: true, student: newStudent };
  };

  const updateStudent = (id: string, updatedData: Partial<Student>) => {
    const existing = students.find((s) => s.id === id);
    if (!existing) {
      addToast('error', 'Erro ao atualizar', 'Aluno não encontrado.');
      return { success: false, error: 'Aluno não encontrado.' };
    }

    // Se CPF foi alterado, valida novamente
    if (updatedData.cpf && updatedData.cpf !== existing.cpf) {
      if (!validateCPF(updatedData.cpf)) {
        addToast('error', 'CPF Inválido', 'O novo CPF informado é inválido.');
        return { success: false, error: 'CPF inválido.' };
      }
    }

    // Se a idade for menor de 18 anos, valida responsável
    const targetBirthDate = updatedData.birthDate || existing.birthDate;
    if (isUnder18(targetBirthDate)) {
      const guardian = updatedData.guardian || existing.guardian;
      if (!guardian || !guardian.name || !guardian.cpf) {
        addToast('error', 'Responsável Obrigatório', 'Alunos menores de 18 anos devem ter um responsável cadastrado.');
        return { success: false, error: 'Responsável obrigatório para menor de 18 anos.' };
      }
    }

    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s))
    );
    addToast('success', 'Cadastro Atualizado', 'Os dados do aluno foram salvos com sucesso.');
    return { success: true };
  };

  const deleteStudent = (id: string) => {
    // RN04: Apenas o Administrador / Secretaria pode excluir cadastros
    if (currentUser.role !== 'admin') {
      addToast('error', 'Ação Não Permitida', 'Apenas a Secretaria / Administrador tem permissão para excluir cadastros (RN04).');
      return { success: false, error: 'Permissão negada.' };
    }

    const student = students.find((s) => s.id === id);
    if (!student) return { success: false, error: 'Aluno não encontrado.' };

    // Cancela matrículas ativas vinculadas
    setEnrollments((prev) =>
      prev.map((e) => (e.studentId === id && e.status === 'Ativa' ? { ...e, status: 'Cancelada', cancelReason: 'Exclusão do cadastro de aluno' } : e))
    );

    setStudents((prev) => prev.filter((s) => s.id !== id));
    addToast('info', 'Aluno Excluído', `O cadastro de ${student.name} foi removido.`);
    return { success: true };
  };

  const getStudentById = (id: string) => students.find((s) => s.id === id);

  // Class operations
  const addClass = (classData: Omit<ClassRoom, 'id'>) => {
    if (!classData.name || !classData.academicYear || !classData.room || classData.maxCapacity <= 0) {
      addToast('error', 'Campos Inválidos', 'Preencha todos os campos da turma e capacidade superior a zero.');
      return { success: false, error: 'Campos inválidos.' };
    }

    const newClass: ClassRoom = {
      ...classData,
      id: `class-${Date.now()}`
    };

    setClasses((prev) => [...prev, newClass]);
    addToast('success', 'Turma Cadastrada', `A turma ${newClass.name} foi criada.`);
    return { success: true };
  };

  const updateClass = (id: string, classData: Partial<ClassRoom>) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...classData } : c)));
    addToast('success', 'Turma Atualizada', 'Dados da turma salvos com sucesso.');
    return { success: true };
  };

  const deleteClass = (id: string) => {
    if (currentUser.role !== 'admin') {
      addToast('error', 'Acesso Negado', 'Apenas a secretaria pode excluir turmas.');
      return { success: false, error: 'Acesso negado.' };
    }

    const enrolledCount = getClassEnrolledCount(id);
    if (enrolledCount > 0) {
      addToast('error', 'Turma Possui Alunos', `Não é possível excluir turma com ${enrolledCount} aluno(s) matriculado(s). Transfira ou cancele antes.`);
      return { success: false, error: 'Turma possui alunos ativos.' };
    }

    setClasses((prev) => prev.filter((c) => c.id !== id));
    addToast('info', 'Turma Removida', 'A turma foi excluída do sistema.');
    return { success: true };
  };

  const getClassById = (id: string) => classes.find((c) => c.id === id);

  const getClassEnrolledCount = (classId: string) => {
    return enrollments.filter((e) => e.classRoomId === classId && e.status === 'Ativa').length;
  };

  const getStudentsByClass = (classId: string): Student[] => {
    const activeStudentIds = enrollments
      .filter((e) => e.classRoomId === classId && e.status === 'Ativa')
      .map((e) => e.studentId);

    return students.filter((s) => activeStudentIds.includes(s.id));
  };

  // Enrollment operations
  const enrollStudent = (studentId: string, classId: string) => {
    const student = getStudentById(studentId);
    const targetClass = getClassById(classId);

    if (!student || !targetClass) {
      addToast('error', 'Erro', 'Aluno ou Turma não encontrados.');
      return { success: false, error: 'Dados inválidos.' };
    }

    // RN01: CPF Válido
    if (!validateCPF(student.cpf)) {
      addToast('error', 'CPF Inválido (RN01)', 'O aluno não possui um CPF válido registrado.');
      return { success: false, error: 'CPF inválido.' };
    }

    // RN02: Um aluno só pode estar matriculado em uma turma por vez
    const existingActive = enrollments.find(
      (e) => e.studentId === studentId && e.status === 'Ativa'
    );
    if (existingActive) {
      const activeClass = getClassById(existingActive.classRoomId);
      addToast(
        'warning',
        'Matrícula Já Existente (RN02)',
        `Este aluno já está matriculado na turma: ${activeClass?.name || 'outra turma'}. Cancele a matrícula anterior antes de matricular em nova turma.`
      );
      return { success: false, error: 'Aluno já possui matrícula ativa.' };
    }

    // RN03: Uma turma não pode ultrapassar sua capacidade máxima
    const currentEnrolled = getClassEnrolledCount(classId);
    if (currentEnrolled >= targetClass.maxCapacity) {
      addToast(
        'error',
        'Turma Lotada (RN03)',
        `A turma ${targetClass.name} atingiu a capacidade máxima de ${targetClass.maxCapacity} alunos.`
      );
      return { success: false, error: 'Capacidade máxima atingida.' };
    }

    // RN05: Menor de 18 deve ter responsável
    if (isUnder18(student.birthDate) && (!student.guardian || !student.guardian.cpf)) {
      addToast('error', 'Responsável Pendente (RN05)', 'Menor de 18 anos requer responsável para ser matriculado.');
      return { success: false, error: 'Responsável não cadastrado.' };
    }

    // Efetivação da Matrícula (RF04)
    const newEnrollment: Enrollment = {
      id: `enroll-${Date.now()}`,
      code: generateEnrollmentCode(),
      studentId,
      classRoomId: classId,
      enrolledAt: new Date().toISOString(),
      status: 'Ativa'
    };

    setEnrollments((prev) => [newEnrollment, ...prev]);
    addToast(
      'success',
      'Matrícula Realizada com Sucesso!',
      `${student.name} matriculado(a) em ${targetClass.name}. Comprovante ${newEnrollment.code} gerado.`
    );

    return { success: true, enrollment: newEnrollment };
  };

  const cancelEnrollment = (enrollmentId: string, reason?: string) => {
    // RF10: Cancelar Matrícula
    const enrollment = enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return { success: false, error: 'Matrícula não encontrada.' };

    const student = getStudentById(enrollment.studentId);

    setEnrollments((prev) =>
      prev.map((e) =>
        e.id === enrollmentId
          ? {
              ...e,
              status: 'Cancelada',
              cancelledAt: new Date().toISOString(),
              cancelReason: reason || 'Cancelamento solicitado pela secretaria/responsável.'
            }
          : e
      )
    );

    addToast('info', 'Matrícula Cancelada (RF10)', `A matrícula de ${student?.name || 'aluno'} foi cancelada com sucesso.`);
    return { success: true };
  };

  const getActiveEnrollmentByStudent = (studentId: string) => {
    return enrollments.find((e) => e.studentId === studentId && e.status === 'Ativa');
  };

  const getEnrollmentReceiptData = (enrollmentId: string) => {
    const enrollment = enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return null;
    const student = getStudentById(enrollment.studentId);
    const classRoom = getClassById(enrollment.classRoomId);
    if (!student || !classRoom) return null;

    return { enrollment, student, classRoom };
  };

  const login = (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const foundUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!foundUser) {
      addToast('error', 'Usuário Não Encontrado', 'Verifique o e-mail informado ou use uma das contas de acesso rápido.');
      return { success: false, error: 'E-mail não cadastrado.' };
    }

    if (password && foundUser.password && password !== foundUser.password) {
      addToast('error', 'Senha Incorreta', 'A senha digitada está incorreta.');
      return { success: false, error: 'Senha incorreta.' };
    }

    setCurrentUser(foundUser);
    setIsAuthenticated(true);
    addToast('success', `Bem-vindo(a), ${foundUser.name}!`, `Login efetuado com sucesso no perfil ${foundUser.role.toUpperCase()}.`);
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    addToast('info', 'Sessão Encerrada', 'Você saiu do sistema com segurança.');
  };

  const resetToDefaultData = () => {
    setStudents(INITIAL_STUDENTS);
    setClasses(INITIAL_CLASSES);
    setEnrollments(INITIAL_ENROLLMENTS);
    setCurrentUser(INITIAL_USERS[0]);
    addToast('info', 'Dados Restaurados', 'O sistema foi restaurado para os dados iniciais de demonstração.');
  };

  return (
    <SchoolContext.Provider
      value={{
        students,
        classes,
        enrollments,
        currentUser,
        users,
        isAuthenticated,
        toasts,
        login,
        logout,
        addToast,
        removeToast,
        setCurrentUser,
        switchRole,
        addStudent,
        updateStudent,
        deleteStudent,
        getStudentById,
        addClass,
        updateClass,
        deleteClass,
        getClassById,
        getClassEnrolledCount,
        getStudentsByClass,
        enrollStudent,
        cancelEnrollment,
        getActiveEnrollmentByStudent,
        getEnrollmentReceiptData,
        resetToDefaultData
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool deve ser utilizado dentro de um SchoolProvider');
  }
  return context;
};
