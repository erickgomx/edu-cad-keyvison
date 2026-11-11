export type UserRole = 'admin' | 'professor' | 'aluno';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  studentId?: string; // If role is aluno
}

export interface Guardian {
  name: string;
  cpf: string;
  relationship: 'Pai' | 'Mãe' | 'Tutor Legal' | 'Outro';
  phone: string;
  email: string;
}

export interface Student {
  id: string;
  registrationNumber: string; // Matrícula, ex: "2026-0014"
  name: string;
  cpf: string;
  birthDate: string; // YYYY-MM-DD
  gender?: 'Masculino' | 'Feminino' | 'Outro' | 'Prefiro não informar';
  phone: string;
  email: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  guardian?: Guardian; // Obrigatório se menor de 18 anos (RN05)
  notes?: string;
  createdAt: string;
}

export type ShiftType = 'Matutino' | 'Vespertino' | 'Noturno' | 'Integral';

export interface ClassRoom {
  id: string;
  name: string; // Ex: "1º Ano A", "9º Ano B"
  academicYear: string; // Ex: "2026"
  shift: ShiftType;
  room: string; // Ex: "Sala 102 - Bloco B"
  maxCapacity: number; // Ex: 35
  description?: string;
}

export type EnrollmentStatus = 'Ativa' | 'Cancelada' | 'Concluída';

export interface Enrollment {
  id: string;
  code: string; // Código de verificação da matrícula (ex: "MAT-2026-8942")
  studentId: string;
  classRoomId: string;
  enrolledAt: string;
  status: EnrollmentStatus;
  cancelledAt?: string;
  cancelReason?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}
