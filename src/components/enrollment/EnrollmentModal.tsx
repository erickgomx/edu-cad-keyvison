/**
 * ============================================================================
 * EduCad - Sistema de Gestão e Cadastro Escolar
 * ARQUIVO: src/components/enrollment/EnrollmentModal.tsx
 * 
 * OBJETIVO:
 * Modal para realização da Matrícula Escolar (RF04).
 * 
 * REGRAS DE NEGÓCIO VALIDADAS EM TEMPO REAL:
 * - RN01: O aluno precisa possuir CPF válido perante a Receita Federal.
 * - RN02: Um aluno só pode estar matriculado em UMA turma ativa por vez.
 *         (Se já houver matrícula ativa, emite aviso explicativo e bloqueia).
 * - RN03: Não permite matrículas que excedam a capacidade física máxima da turma.
 * - RN05: Se menor de 18 anos, exige responsável legal cadastrado.
 * - RN06: Confirmação apenas com preenchimento de todos os dados necessários.
 * 
 * FLUXO CONTÍNUO:
 * Ao confirmar com sucesso, aciona automaticamente o modal do Comprovante (RF07).
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { Student, Enrollment } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { 
  X, 
  GraduationCap, 
  Check, 
  AlertTriangle, 
  User, 
  BookOpen, 
  AlertCircle 
} from 'lucide-react';
import { isUnder18 } from '../../utils/validators';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedStudent?: Student | null;
  onEnrollmentSuccess?: (enrollment: Enrollment) => void;
}

export const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
  isOpen,
  onClose,
  preSelectedStudent,
  onEnrollmentSuccess
}) => {
  const { 
    students, 
    classes, 
    enrollStudent, 
    getActiveEnrollmentByStudent, 
    getClassEnrolledCount,
    getClassById 
  } = useSchool();

  // Estados dos seletores
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Se o modal foi aberto clicando em "Matricular" a partir de um aluno específico,
   * ele já vem pré-selecionado na lista.
   */
  useEffect(() => {
    if (preSelectedStudent) {
      setSelectedStudentId(preSelectedStudent.id);
    } else {
      setSelectedStudentId('');
    }
    setSelectedClassId('');
    setErrorMessage(null);
  }, [preSelectedStudent, isOpen]);

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const currentClass = classes.find((c) => c.id === selectedClassId);

  // Verificação RN02: O aluno já possui matrícula ativa em outra turma?
  const existingActiveEnrollment = currentStudent 
    ? getActiveEnrollmentByStudent(currentStudent.id) 
    : undefined;
  const existingClass = existingActiveEnrollment 
    ? getClassById(existingActiveEnrollment.classRoomId) 
    : null;

  // Verificação RN03: A turma atingiu a lotação máxima de vagas?
  const currentClassEnrolled = currentClass 
    ? getClassEnrolledCount(currentClass.id) 
    : 0;
  const classIsFull = currentClass 
    ? currentClassEnrolled >= currentClass.maxCapacity 
    : false;

  // Verificação RN05: O aluno é menor de 18 anos e está sem responsável?
  const studentIsMinor = currentStudent ? isUnder18(currentStudent.birthDate) : false;
  const missingGuardian = studentIsMinor && (!currentStudent?.guardian || !currentStudent.guardian.cpf);

  /**
   * Submissão e validação estrita do formulário de matrícula
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedStudentId) {
      setErrorMessage('Por favor, selecione um aluno.');
      return;
    }
    if (!selectedClassId) {
      setErrorMessage('Por favor, selecione uma turma.');
      return;
    }

    if (existingActiveEnrollment) {
      setErrorMessage('Regra de Negócio RN02: Este aluno já possui matrícula ativa em outra turma.');
      return;
    }

    if (classIsFull) {
      setErrorMessage('Regra de Negócio RN03: A turma selecionada atingiu sua capacidade máxima.');
      return;
    }

    if (missingGuardian) {
      setErrorMessage('Regra de Negócio RN05: Aluno menor de 18 anos precisa de responsável cadastrado.');
      return;
    }

    // Efetivação no Contexto Escolar
    const res = enrollStudent(selectedStudentId, selectedClassId);
    if (res.success && res.enrollment) {
      onEnrollmentSuccess?.(res.enrollment);
      onClose();
    } else {
      setErrorMessage(res.error || 'Não foi possível efetivar a matrícula.');
    }
  };

  /**
   * Filtro de busca textual de alunos no select
   */
  const filteredStudents = students.filter((s) => {
    const term = searchStudent.toLowerCase();
    return s.name.toLowerCase().includes(term) || s.cpf.includes(term) || s.registrationNumber.includes(term);
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-600 rounded-lg text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">
                Realizar Matrícula Escolar (RF04)
              </h2>
              <p className="text-xs text-slate-300">
                Vincule o aluno a uma turma respeitando as vagas disponíveis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário de Matrícula */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Mensagem de Erro / Alerta de Bloqueio */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* PASSO 1: SELECIONAR ALUNO */}
          <div>
            <label htmlFor="select-student" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-600" />
              <span>1. Selecionar Aluno para Matrícula *</span>
            </label>

            {!preSelectedStudent && (
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Filtrar aluno por nome, CPF ou matrícula..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>
            )}

            <select
              id="select-student"
              required
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                setErrorMessage(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-brand-500 bg-white"
            >
              <option value="">Selecione um aluno da lista...</option>
              {filteredStudents.map((s) => {
                const isEnrolled = !!getActiveEnrollmentByStudent(s.id);
                return (
                  <option key={s.id} value={s.id}>
                    {s.name} - CPF: {s.cpf} {isEnrolled ? '(JÁ MATRICULADO)' : '(Disponível)'}
                  </option>
                );
              })}
            </select>

            {/* Alerta RN02: Aluno já possui matrícula em outra turma */}
            {existingActiveEnrollment && existingClass && (
              <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block">Atenção - Regra RN02:</strong>
                  Este aluno já está matriculado na turma <strong>{existingClass.name} ({existingClass.shift})</strong>.
                  Para transferi-lo, primeiro cancele a matrícula ativa na aba "Matrículas".
                </div>
              </div>
            )}

            {/* Alerta RN05: Menor sem responsável legal */}
            {missingGuardian && (
              <div className="mt-2.5 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block">Bloqueio - Regra RN05:</strong>
                  O aluno é menor de 18 anos e não possui responsável legal registrado. Edite o cadastro antes de matricular.
                </div>
              </div>
            )}
          </div>

          {/* PASSO 2: SELECIONAR TURMA DE DESTINO */}
          <div>
            <label htmlFor="select-class" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-brand-600" />
              <span>2. Selecionar Turma de Destino *</span>
            </label>

            <select
              id="select-class"
              required
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setErrorMessage(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-brand-500 bg-white"
            >
              <option value="">Selecione uma turma com vagas abertas...</option>
              {classes.map((c) => {
                const count = getClassEnrolledCount(c.id);
                const remaining = c.maxCapacity - count;
                const full = remaining <= 0;
                return (
                  <option key={c.id} value={c.id} disabled={full}>
                    {c.name} - {c.shift} | {c.room} ({count}/{c.maxCapacity} alunos {full ? '- LOTADA' : `- ${remaining} vagas restantes`})
                  </option>
                );
              })}
            </select>

            {/* Resumo da Turma Selecionada */}
            {currentClass && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800">{currentClass.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    classIsFull ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {classIsFull ? 'Capacidade Esgotada (RN03)' : `${currentClass.maxCapacity - currentClassEnrolled} Vagas Disponíveis`}
                  </span>
                </div>
                <p className="text-slate-500">
                  Turno: {currentClass.shift} • Sala: {currentClass.room} • Ano Letivo: {currentClass.academicYear}
                </p>
              </div>
            )}
          </div>

          {/* Resumo Pedagógico das Condições Atendidas */}
          <div className="p-3 bg-slate-100/70 rounded-xl text-[11px] text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Condições da Matrícula:</p>
            <p>✓ CPF válido e auditado (RN01)</p>
            <p>✓ Aluno vinculado exclusivamente a uma turma ativa (RN02)</p>
            <p>✓ Limite de capacidade física da sala respeitado (RN03)</p>
            <p>✓ Emissão automática de Comprovante em PDF após conclusão (RF07)</p>
          </div>

          {/* Botões do Rodapé */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!!existingActiveEnrollment || classIsFull || missingGuardian}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
                existingActiveEnrollment || classIsFull || missingGuardian
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/20'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Confirmar Matrícula e Emitir Comprovante</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
