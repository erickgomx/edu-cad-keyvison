/**
 * ============================================================================
 * EduCad - Sistema de Gestão e Cadastro Escolar
 * ARQUIVO: src/utils/mockData.ts
 * 
 * OBJETIVO:
 * Fornecer uma base de dados inicial (Seed / Mock Data) realista para a demonstração
 * do sistema. Permite que o professor ou avaliador teste imediatamente todas as
 * funcionalidades (busca, visualização por turma, emissão de comprovantes e perfis)
 * sem precisar começar com o sistema totalmente vazio.
 * ============================================================================
 */

import { ClassRoom, Student, Enrollment, User } from '../types';

/**
 * 1. USUÁRIOS DE DEMONSTRAÇÃO (RF08 - Acesso por Perfis):
 * - Secretaria: perfil administrador com poder total (cadastra, edita, matricula, exclui).
 * - Professor: visualiza turmas e listas de chamada.
 * - Aluno: consulta seus dados cadastrais e visualiza o comprovante de matrícula.
 */
export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Ana Cláudia (Secretaria)',
    email: 'secretaria@educad.escola.br',
    password: 'admin',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-prof',
    name: 'Prof. Carlos Eduardo',
    email: 'carlos.eduardo@educad.escola.br',
    password: 'prof',
    role: 'professor',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-aluno',
    name: 'Mariana Duarte (Aluna)',
    email: 'mariana.duarte@aluno.educad.br',
    password: 'aluno',
    role: 'aluno',
    studentId: 'student-1',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  }
];

/**
 * 2. TURMAS INICIAIS (RF03 / RN03):
 * Turmas com diferentes turnos, salas e capacidades máximas para demonstrar
 * os indicadores visuais de lotação e o bloqueio de capacidade.
 */
export const INITIAL_CLASSES: ClassRoom[] = [
  {
    id: 'class-1',
    name: '1º Ano A - Ensino Médio',
    academicYear: '2026',
    shift: 'Matutino',
    room: 'Sala 101 - Bloco Acadêmico',
    maxCapacity: 30,
    description: 'Turma de Ensino Médio Integrado com foco em Ciências da Natureza.'
  },
  {
    id: 'class-2',
    name: '2º Ano B - Ensino Médio',
    academicYear: '2026',
    shift: 'Matutino',
    room: 'Sala 102 - Bloco Acadêmico',
    maxCapacity: 25,
    description: 'Turma voltada para o itinerário formativo de Linguagens e Humanas.'
  },
  {
    id: 'class-3',
    name: '3º Ano Terceirão - Preparatório',
    academicYear: '2026',
    shift: 'Integral',
    room: 'Auditório Anexo 2',
    maxCapacity: 35,
    description: 'Turma preparatória para ENEM e vestibulares com tutoria intensiva.'
  },
  {
    id: 'class-4',
    name: '9º Ano C - Fundamental II',
    academicYear: '2026',
    shift: 'Vespertino',
    room: 'Sala 204 - Bloco Fundamental',
    maxCapacity: 28,
    description: 'Último ano do Ensino Fundamental com oficinas práticas.'
  }
];

/**
 * 3. ALUNOS CADASTRADOS (RF01 / RF02 / RN01 / RN05):
 * Exemplos com alunos menores de 18 anos (com responsável obrigatório)
 * e maiores de 18 anos, todos com CPFs matematicamente válidos.
 */
export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'student-1',
    registrationNumber: '2026-1001',
    name: 'Mariana Duarte da Silva',
    cpf: '824.912.040-02',
    birthDate: '2009-04-15', // Aluna menor de 18 anos -> Exige Responsável (RN05)
    gender: 'Feminino',
    phone: '(81) 98765-4321',
    email: 'mariana.duarte@email.com',
    address: {
      street: 'Rua das Flores',
      number: '120',
      complement: 'Apto 302',
      neighborhood: 'Boa Viagem',
      city: 'Recife',
      state: 'PE',
      zipCode: '51020-000'
    },
    guardian: {
      name: 'Roberto da Silva',
      cpf: '542.198.760-49',
      relationship: 'Pai',
      phone: '(81) 99123-4567',
      email: 'roberto.silva@email.com'
    },
    notes: 'Aluna dedicada, com excelente desempenho em matemática.',
    createdAt: '2026-01-10T10:00:00.000Z'
  },
  {
    id: 'student-2',
    registrationNumber: '2026-1002',
    name: 'Lucas Gabriel Albuquerque',
    cpf: '123.456.789-09',
    birthDate: '2007-08-20', // Aluno maior de 18 anos -> Responsável opcional
    gender: 'Masculino',
    phone: '(81) 99876-1122',
    email: 'lucas.albuquerque@email.com',
    address: {
      street: 'Avenida Governador Agamenon Magalhães',
      number: '4500',
      complement: 'Bloco C',
      neighborhood: 'Derby',
      city: 'Recife',
      state: 'PE',
      zipCode: '52010-040'
    },
    notes: 'Inscrito nas olimpíadas de robótica escolar.',
    createdAt: '2026-01-12T14:30:00.000Z'
  },
  {
    id: 'student-3',
    registrationNumber: '2026-1003',
    name: 'Beatriz Martins de Souza',
    cpf: '987.654.321-00',
    birthDate: '2010-11-05', // Aluna menor de 18 anos -> Exige Responsável (RN05)
    gender: 'Feminino',
    phone: '(81) 98112-3344',
    email: 'beatriz.martins@email.com',
    address: {
      street: 'Rua da Aurora',
      number: '780',
      neighborhood: 'Santo Amaro',
      city: 'Recife',
      state: 'PE',
      zipCode: '50050-000'
    },
    guardian: {
      name: 'Helena Martins',
      cpf: '331.442.553-60',
      relationship: 'Mãe',
      phone: '(81) 99445-6677',
      email: 'helena.martins@email.com'
    },
    notes: 'Interesse em artes e teatro da escola.',
    createdAt: '2026-01-15T09:15:00.000Z'
  }
];

/**
 * 4. MATRÍCULAS EFETIVADAS (RF04 / RF07 / RN02):
 * Registros de estudantes já vinculados a turmas para permitir
 * a visualização imediata da listagem por turma (RF09) e emissão de comprovantes (RF07).
 */
export const INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enroll-1',
    code: 'MAT-2026-1001',
    studentId: 'student-1',
    classRoomId: 'class-1',
    enrolledAt: '2026-01-20T10:30:00.000Z',
    status: 'Ativa'
  },
  {
    id: 'enroll-2',
    code: 'MAT-2026-1002',
    studentId: 'student-2',
    classRoomId: 'class-1',
    enrolledAt: '2026-01-21T11:00:00.000Z',
    status: 'Ativa'
  },
  {
    id: 'enroll-3',
    code: 'MAT-2026-1003',
    studentId: 'student-3',
    classRoomId: 'class-4',
    enrolledAt: '2026-01-22T15:20:00.000Z',
    status: 'Ativa'
  }
];
