import React from 'react';
import { Student } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Edit3, 
  GraduationCap 
} from 'lucide-react';
import { calculateAge } from '../../utils/validators';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onEdit?: (student: Student) => void;
  onEnroll?: (student: Student) => void;
  onViewReceipt?: (enrollmentId: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student,
  onEdit,
  onEnroll,
  onViewReceipt
}) => {
  const { getActiveEnrollmentByStudent, getClassById, currentUser } = useSchool();

  if (!isOpen || !student) return null;

  const age = calculateAge(student.birthDate);
  const activeEnrollment = getActiveEnrollmentByStudent(student.id);
  const currentClass = activeEnrollment ? getClassById(activeEnrollment.classRoomId) : null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-lg">
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-lg leading-snug">{student.name}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span>Matrícula: <strong className="font-mono text-white">{student.registrationNumber}</strong></span>
                <span>•</span>
                <span>CPF: {student.cpf}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar detalhes"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Status da Matrícula Card */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            activeEnrollment
              ? 'bg-emerald-50/70 border-emerald-200'
              : 'bg-amber-50/70 border-amber-200'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                {activeEnrollment ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                )}
                <span className="font-bold text-sm text-slate-900">
                  {activeEnrollment ? 'Aluno Matriculado Ativo' : 'Sem Matrícula Ativa no Momento'}
                </span>
              </div>
              {activeEnrollment && currentClass ? (
                <p className="text-xs text-slate-600 mt-1">
                  Turma: <strong className="text-slate-800">{currentClass.name}</strong> ({currentClass.shift}) • Sala: {currentClass.room}
                </p>
              ) : (
                <p className="text-xs text-slate-600 mt-1">
                  O aluno possui cadastro escolar, mas ainda não foi vinculado a uma turma neste ano letivo.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeEnrollment ? (
                <button
                  onClick={() => {
                    onViewReceipt?.(activeEnrollment.id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Ver Comprovante (RF07)</span>
                </button>
              ) : (
                currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      onClose();
                      onEnroll?.(student);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Realizar Matrícula (RF04)</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Dados Pessoais */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-1 mb-3">
              Informações Pessoais
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div>
                <span className="block text-slate-500 text-[11px]">Data de Nascimento</span>
                <span className="font-semibold text-slate-800">
                  {new Date(student.birthDate).toLocaleDateString('pt-BR')} ({age} anos)
                </span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px]">Gênero</span>
                <span className="font-semibold text-slate-800">{student.gender || 'Não informado'}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px]">Telefone</span>
                <span className="font-semibold text-slate-800">{student.phone}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="block text-slate-500 text-[11px]">E-mail</span>
                <span className="font-semibold text-slate-800">{student.email}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px]">Data do Cadastro</span>
                <span className="text-slate-700">{new Date(student.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-1 mb-3">
              Endereço Residencial
            </h3>
            <p className="text-xs sm:text-sm text-slate-800">
              {student.address.street}, {student.address.number}
              {student.address.complement ? ` (${student.address.complement})` : ''} - {student.address.neighborhood}, {student.address.city}/{student.address.state} • <strong>CEP: {student.address.zipCode}</strong>
            </p>
          </div>

          {/* Responsável Legal (RN05) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-1 mb-3">
              Responsável Legal Vinculado
            </h3>
            {student.guardian ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                <div>
                  <span className="block text-slate-500 text-[11px]">Nome</span>
                  <span className="font-bold text-slate-900">{student.guardian.name}</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-[11px]">CPF</span>
                  <span className="font-mono text-slate-800">{student.guardian.cpf}</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-[11px]">Parentesco</span>
                  <span className="font-semibold text-slate-800">{student.guardian.relationship}</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-[11px]">Telefone</span>
                  <span className="text-slate-800">{student.guardian.phone}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-slate-500 text-[11px]">E-mail</span>
                  <span className="text-slate-800">{student.guardian.email || 'Não informado'}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Nenhum responsável cadastrado (Aluno maior de 18 anos).
              </p>
            )}
          </div>

          {/* Observações */}
          {student.notes && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-1 mb-2">
                Observações
              </h3>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {student.notes}
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">EduCad • Ficha Cadastral</span>
          <div className="flex items-center gap-2">
            {currentUser.role === 'admin' && onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(student);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Cadastro</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
