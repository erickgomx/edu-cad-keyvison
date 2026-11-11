import React from 'react';
import { ClassRoom, Student } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { 
  X, 
  Users, 
  Printer 
} from 'lucide-react';
import { calculateAge } from '../../utils/validators';

interface ClassStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classRoom: ClassRoom | null;
  onSelectStudent?: (student: Student) => void;
}

export const ClassStudentsModal: React.FC<ClassStudentsModalProps> = ({
  isOpen,
  onClose,
  classRoom,
  onSelectStudent
}) => {
  const { getStudentsByClass, getClassEnrolledCount } = useSchool();

  if (!isOpen || !classRoom) return null;

  const enrolledStudents = getStudentsByClass(classRoom.id);
  const enrolledCount = getClassEnrolledCount(classRoom.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-600 rounded-lg text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">
                Relação de Alunos por Turma (RF09)
              </h2>
              <p className="text-xs text-slate-300">
                {classRoom.name} • {classRoom.shift} • Sala: {classRoom.room}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Lista</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Fechar lista"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable List */}
        <div className="p-6 sm:p-8 receipt-card">
          
          {/* Header for print & display */}
          <div className="border-b border-slate-200 pb-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl font-black text-slate-900 uppercase">
                  {classRoom.name}
                </h1>
                <p className="text-xs text-slate-600">
                  Ano Letivo {classRoom.academicYear} • Turno: <strong>{classRoom.shift}</strong> • Sala: <strong>{classRoom.room}</strong>
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
                  {enrolledCount} de {classRoom.maxCapacity} Vagas Ocupadas
                </span>
              </div>
            </div>
          </div>

          {/* Table of students */}
          {enrolledStudents.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Nenhum aluno matriculado nesta turma</p>
              <p className="text-xs text-slate-500 mt-1">
                Realize novas matrículas pela aba "Matrículas" ou no cadastro de alunos.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-xs uppercase">
                  <tr>
                    <th scope="col" className="px-3 py-2.5 w-12 text-center">Nº</th>
                    <th scope="col" className="px-3 py-2.5">Matrícula</th>
                    <th scope="col" className="px-3 py-2.5">Nome Completo do Aluno</th>
                    <th scope="col" className="px-3 py-2.5">CPF</th>
                    <th scope="col" className="px-3 py-2.5">Idade</th>
                    <th scope="col" className="px-3 py-2.5">Responsável / Contato</th>
                    <th scope="col" className="px-3 py-2.5 text-center no-print">Assinatura / Ficha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {enrolledStudents.map((student, idx) => {
                    const age = calculateAge(student.birthDate);
                    return (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-3 text-center font-bold text-slate-500">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="px-3 py-3 font-mono font-bold text-slate-800">
                          {student.registrationNumber}
                        </td>
                        <td className="px-3 py-3 font-medium text-slate-900">
                          {student.name}
                        </td>
                        <td className="px-3 py-3 font-mono text-slate-600">
                          {student.cpf}
                        </td>
                        <td className="px-3 py-3 text-slate-700">
                          {age} anos
                        </td>
                        <td className="px-3 py-3 text-slate-600">
                          {student.guardian ? (
                            <div>
                              <span className="block font-semibold text-slate-800 text-xs">
                                {student.guardian.name} ({student.guardian.relationship})
                              </span>
                              <span className="text-[11px] text-slate-500">{student.guardian.phone}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500">{student.phone}</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center no-print">
                          {onSelectStudent && (
                            <button
                              onClick={() => {
                                onClose();
                                onSelectStudent(student);
                              }}
                              className="text-xs text-brand-600 hover:text-brand-800 font-semibold underline cursor-pointer"
                            >
                              Ver Ficha
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer for Attendance Signature in Print */}
          <div className="mt-8 pt-6 border-t border-slate-200 hidden print:block">
            <div className="flex justify-between items-end text-xs text-slate-700">
              <div>
                <p>Total de Alunos: <strong>{enrolledStudents.length}</strong></p>
                <p>Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
              </div>
              <div className="text-center">
                <div className="w-56 border-b border-slate-900 mb-1"></div>
                <p className="font-semibold">Assinatura do Professor / Coordenador</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
