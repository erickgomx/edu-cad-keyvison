/**
 * ============================================================================
 * EduCad - Sistema de Gestão e Cadastro Escolar
 * ARQUIVO: src/components/students/StudentList.tsx
 * 
 * OBJETIVO:
 * Exibição, busca, filtragem e gerenciamento de alunos cadastrados.
 * 
 * REQUISITOS ATENDIDOS:
 * - RF01: Acesso ao formulário de novo cadastro (ou pré-cadastro pelo aluno).
 * - RF05: Edição de dados e exclusão com segurança.
 * - RF06: Busca em tempo real por Nome, CPF ou Matrícula acadêmica.
 * - RF07: Acesso direto ao Comprovante Oficial de Matrícula em PDF.
 * - RN04: Apenas Secretaria / Admin tem permissão de exclusão (botão de lixeira restrito).
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { Student } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { 
  Search, 
  UserPlus, 
  Edit, 
  Trash2, 
  Eye, 
  GraduationCap, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { calculateAge, isUnder18 } from '../../utils/validators';

interface StudentListProps {
  onNewStudent: () => void;
  onEditStudent: (student: Student) => void;
  onSelectStudent: (student: Student) => void;
  onEnrollStudent: (student: Student) => void;
  onViewReceipt: (enrollmentId: string) => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  onNewStudent,
  onEditStudent,
  onSelectStudent,
  onEnrollStudent,
  onViewReceipt
}) => {
  const { students, deleteStudent, getActiveEnrollmentByStudent, getClassById, currentUser } = useSchool();

  // Estados de busca e filtros rápidos (RF06)
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enrolled' | 'not_enrolled' | 'minor' | 'adult'>('all');

  /**
   * Filtragem em memória memoizada para alta performance e resposta instantânea (< 100ms)
   * Busca por nome parcial, número de matrícula ou CPF (com ou sem pontuação).
   */
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const term = searchTerm.toLowerCase().trim();
      const cleanTermCpf = term.replace(/\D/g, '');
      const studentCleanCpf = student.cpf.replace(/\D/g, '');

      const matchesSearch =
        student.name.toLowerCase().includes(term) ||
        student.registrationNumber.toLowerCase().includes(term) ||
        student.cpf.includes(term) ||
        (cleanTermCpf.length > 0 && studentCleanCpf.includes(cleanTermCpf));

      if (!matchesSearch) return false;

      const activeEnrollment = getActiveEnrollmentByStudent(student.id);
      const isMinor = isUnder18(student.birthDate);

      if (statusFilter === 'enrolled') return !!activeEnrollment;
      if (statusFilter === 'not_enrolled') return !activeEnrollment;
      if (statusFilter === 'minor') return isMinor;
      if (statusFilter === 'adult') return !isMinor;

      return true;
    });
  }, [students, searchTerm, statusFilter, getActiveEnrollmentByStudent]);

  /**
   * Confirmação segura de exclusão (Apenas Secretaria - RN04)
   */
  const handleDelete = (student: Student) => {
    if (window.confirm(`Tem certeza que deseja excluir o cadastro de ${student.name}? Esta ação não pode ser desfeita.`)) {
      deleteStudent(student.id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho da Seção com Título e Botão de Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Alunos Cadastrados
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gerenciamento e busca de fichas cadastrais dos alunos ({filteredStudents.length} de {students.length} encontrados)
          </p>
        </div>

        {/* Botão de Cadastro: Secretaria realiza cadastro total, Aluno realiza pré-cadastro */}
        {currentUser.role === 'admin' ? (
          <button
            onClick={onNewStudent}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-sm shadow-brand-500/20 transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Aluno (RF01)</span>
          </button>
        ) : currentUser.role === 'aluno' ? (
          <button
            onClick={onNewStudent}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-sm shadow-purple-500/20 transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Realizar Pré-Cadastro (RF01)</span>
          </button>
        ) : null}
      </div>

      {/* Barra de Busca e Filtros Rápidos (RF06) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Input de Busca com Ícone e Botão de Limpar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar aluno por Nome, CPF ou Matrícula... (RF06)"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand-500 transition-all bg-slate-50/50 focus:bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtros Rápidos em Abas Horizontais */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({students.length})
            </button>
            <button
              onClick={() => setStatusFilter('enrolled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                statusFilter === 'enrolled'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Matriculados
            </button>
            <button
              onClick={() => setStatusFilter('not_enrolled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                statusFilter === 'not_enrolled'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Sem Turma
            </button>
            <button
              onClick={() => setStatusFilter('minor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                statusFilter === 'minor'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Menores (&lt;18)
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Listagem de Alunos */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Nenhum aluno encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Não encontramos nenhum estudante correspondente aos filtros pesquisados.
          </p>
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="mt-4 px-3.5 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Aluno & Matrícula</th>
                  <th scope="col" className="px-5 py-3.5">CPF & Idade</th>
                  <th scope="col" className="px-5 py-3.5">Contato</th>
                  <th scope="col" className="px-5 py-3.5">Situação da Turma</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const activeEnrollment = getActiveEnrollmentByStudent(student.id);
                  const enrolledClass = activeEnrollment ? getClassById(activeEnrollment.classRoomId) : null;
                  const age = calculateAge(student.birthDate);
                  const isMinor = isUnder18(student.birthDate);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      
                      {/* Nome e Matrícula Acadêmica */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-xs shrink-0 border border-brand-100">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <button
                              onClick={() => onSelectStudent(student)}
                              className="font-semibold text-slate-900 hover:text-brand-600 transition-colors text-left cursor-pointer"
                            >
                              {student.name}
                            </button>
                            <span className="block text-xs font-mono text-slate-500">
                              Nº {student.registrationNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CPF e Idade (com destaque para menor de idade) */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-slate-700 block">{student.cpf}</span>
                        <span className="text-xs text-slate-500">
                          {age} anos {isMinor && <strong className="text-amber-600 text-[11px]">(Menor)</strong>}
                        </span>
                      </td>

                      {/* Dados de Contato */}
                      <td className="px-5 py-4">
                        <span className="text-xs text-slate-800 block truncate max-w-[180px]">{student.email}</span>
                        <span className="text-xs text-slate-500 block">{student.phone}</span>
                      </td>

                      {/* Status da Enturmação */}
                      <td className="px-5 py-4">
                        {activeEnrollment && enrolledClass ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              {enrolledClass.name}
                            </span>
                            <span className="block text-[11px] text-slate-500 mt-0.5">
                              Turno: {enrolledClass.shift}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle className="w-3 h-3" />
                            Sem Matrícula Ativa
                          </span>
                        )}
                      </td>

                      {/* Botões de Ações Rápidas */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Visualizar Ficha Cadastral Completa */}
                          <button
                            onClick={() => onSelectStudent(student)}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Ver Ficha Cadastral Completa"
                            aria-label={`Ver detalhes de ${student.name}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Se tiver matrícula, visualiza comprovante; se não, botão de matricular (apenas admin) */}
                          {activeEnrollment ? (
                            <button
                              onClick={() => onViewReceipt(activeEnrollment.id)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Ver Comprovante de Matrícula (RF07)"
                              aria-label={`Comprovante de ${student.name}`}
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          ) : (
                            currentUser.role === 'admin' && (
                              <button
                                onClick={() => onEnrollStudent(student)}
                                className="p-1.5 text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer"
                                title="Realizar Matrícula (RF04)"
                                aria-label={`Matricular ${student.name}`}
                              >
                                <GraduationCap className="w-4 h-4" />
                              </button>
                            )
                          )}

                          {/* Editar Cadastro (RF05) */}
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => onEditStudent(student)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Editar Cadastro"
                              aria-label={`Editar ${student.name}`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {/* Excluir Aluno (RF05 & RN04: Apenas Administrador/Secretaria) */}
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => handleDelete(student)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Excluir Aluno (RN04)"
                              aria-label={`Excluir ${student.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
