/**
 * ============================================================================
 * COMPONENTE: EnrollmentList (Painel de Gestão de Matrículas)
 * ============================================================================
 * 
 * Este componente gerencia os seguintes Requisitos do Sistema:
 * - RF04: Efetivar Matrícula e enturmação de alunos
 * - RF07: Geração e visualização do Comprovante Oficial de Matrícula
 * - RF10: Cancelamento de Matrícula com justificativa e liberação de vaga
 * 
 * Funcionalidades principais:
 * 1. Tabela com listagem de todas as matrículas ativas e canceladas.
 * 2. Busca dinâmica e instantânea por código autenticador, nome do aluno, CPF ou turma.
 * 3. Filtros rápidos por estado da matrícula (Todas, Ativas, Canceladas).
 * 4. Acesso em um clique ao comprovante oficial para impressão (RF07).
 * 5. Diálogo modal de cancelamento de matrícula com registro opcional de motivo (RF10).
 */

import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  FileCheck, 
  Plus, 
  Printer, 
  XCircle, 
  CheckCircle2, 
  Search, 
  AlertTriangle 
} from 'lucide-react';

interface EnrollmentListProps {
  onNewEnrollment: () => void;
  onViewReceipt: (enrollmentId: string) => void;
}

export const EnrollmentList: React.FC<EnrollmentListProps> = ({
  onNewEnrollment,
  onViewReceipt
}) => {
  // Consumimos os dados e ações disponibilizados pelo SchoolContext
  const { 
    enrollments, 
    cancelEnrollment, 
    getStudentById, 
    getClassById, 
    currentUser 
  } = useSchool();

  // Estados locais para filtragem da tabela e barra de pesquisa
  const [filterStatus, setFilterStatus] = useState<'all' | 'Ativa' | 'Cancelada'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados locais para controlar o modal de cancelamento (RF10)
  const [cancellingEnrollmentId, setCancellingEnrollmentId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  /**
   * Filtragem combinada: status da matrícula + termo pesquisado.
   * A busca examina simultaneamente o código da matrícula, o nome do aluno,
   * o CPF do aluno e o nome da turma.
   */
  const filteredEnrollments = enrollments.filter((enrollment) => {
    // 1. Filtro por status
    if (filterStatus !== 'all' && enrollment.status !== filterStatus) return false;

    // 2. Resolução dos relacionamentos (Aluno e Turma)
    const student = getStudentById(enrollment.studentId);
    const classRoom = getClassById(enrollment.classRoomId);

    // 3. Termo de busca em minúsculas
    const term = searchTerm.toLowerCase();
    const matchCode = enrollment.code.toLowerCase().includes(term);
    const matchStudent = student?.name.toLowerCase().includes(term) || student?.cpf.includes(term);
    const matchClass = classRoom?.name.toLowerCase().includes(term);

    return matchCode || matchStudent || matchClass;
  });

  /**
   * Confirma o cancelamento da matrícula e libera a vaga na turma correspondente (RF10)
   */
  const handleConfirmCancel = () => {
    if (!cancellingEnrollmentId) return;
    cancelEnrollment(cancellingEnrollmentId, cancelReason);
    setCancellingEnrollmentId(null);
    setCancelReason('');
  };

  return (
    <div className="space-y-6">
      
      {/* ====================================================================
          CABEÇALHO DA SEÇÃO DE MATRÍCULAS
         ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Matrículas & Enturmação
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gerenciamento de registros de matrícula, cancelamentos e emissão de comprovantes
          </p>
        </div>

        {/* Botão de Nova Matrícula (Exclusivo para perfil Administrador/Secretaria) */}
        {currentUser.role === 'admin' && (
          <button
            onClick={onNewEnrollment}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-sm shadow-brand-500/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Efetivar Matrícula (RF04)</span>
          </button>
        )}
      </div>

      {/* ====================================================================
          BARRA DE PESQUISA E FILTROS RÁPIDOS DE STATUS
         ==================================================================== */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código de matrícula, aluno ou turma..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-brand-500 bg-slate-50/50 focus:bg-white"
          />
        </div>

        {/* Chips de filtro por situação da matrícula */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({enrollments.length})
          </button>
          <button
            onClick={() => setFilterStatus('Ativa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              filterStatus === 'Ativa'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ativas
          </button>
          <button
            onClick={() => setFilterStatus('Cancelada')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              filterStatus === 'Cancelada'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Canceladas (RF10)
          </button>
        </div>
      </div>

      {/* ====================================================================
          TABELA DE MATRÍCULAS
         ==================================================================== */}
      {filteredEnrollments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">Nenhum registro encontrado</h3>
          <p className="text-xs text-slate-500 mt-1">
            Não existem matrículas que correspondam aos filtros pesquisados.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Código / Autenticação</th>
                  <th scope="col" className="px-5 py-3.5">Aluno Matriculado</th>
                  <th scope="col" className="px-5 py-3.5">Turma & Turno</th>
                  <th scope="col" className="px-5 py-3.5">Data Matrícula</th>
                  <th scope="col" className="px-5 py-3.5">Situação</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnrollments.map((enrollment) => {
                  const student = getStudentById(enrollment.studentId);
                  const classRoom = getClassById(enrollment.classRoomId);
                  const isCancelled = enrollment.status === 'Cancelada';

                  return (
                    <tr key={enrollment.id} className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* Código Único Gerado */}
                      <td className="px-5 py-4 font-mono font-bold text-xs text-slate-800">
                        {enrollment.code}
                      </td>

                      {/* Identificação do Aluno */}
                      <td className="px-5 py-4">
                        {student ? (
                          <div>
                            <span className="font-semibold text-slate-900 block">{student.name}</span>
                            <span className="text-xs text-slate-500 font-mono">CPF: {student.cpf}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Aluno removido</span>
                        )}
                      </td>

                      {/* Identificação da Turma e Espaço */}
                      <td className="px-5 py-4">
                        {classRoom ? (
                          <div>
                            <span className="font-medium text-slate-800 block">{classRoom.name}</span>
                            <span className="text-xs text-slate-500">{classRoom.shift} • {classRoom.room}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Turma não encontrada</span>
                        )}
                      </td>

                      {/* Data em que a matrícula foi efetivada */}
                      <td className="px-5 py-4 text-xs text-slate-600">
                        {new Date(enrollment.enrolledAt).toLocaleDateString('pt-BR')}
                      </td>

                      {/* Status Visual: Ativa ou Cancelada */}
                      <td className="px-5 py-4">
                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5" />
                            Cancelada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Ativa
                          </span>
                        )}
                      </td>

                      {/* Botões de Ação */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* Visualizar Comprovante Oficial em PDF (RF07) */}
                          <button
                            onClick={() => onViewReceipt(enrollment.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                            title="Gerar / Visualizar Comprovante Oficial (RF07)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Comprovante</span>
                          </button>

                          {/* Cancelar Matrícula (RF10 - restrito a administradores) */}
                          {!isCancelled && currentUser.role === 'admin' && (
                            <button
                              onClick={() => setCancellingEnrollmentId(enrollment.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors cursor-pointer"
                              title="Cancelar Matrícula (RF10)"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancelar</span>
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

      {/* ====================================================================
          MODAL DE CONFIRMAÇÃO DE CANCELAMENTO DE MATRÍCULA (RF10)
         ==================================================================== */}
      {cancellingEnrollmentId && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Cancelar Matrícula (RF10)</h3>
                <p className="text-xs text-slate-500">Esta ação liberará a vaga na turma correspondente.</p>
              </div>
            </div>

            <div>
              <label htmlFor="cancel-reason" className="block text-xs font-semibold text-slate-700 mb-1">
                Motivo do Cancelamento (Opcional):
              </label>
              <textarea
                id="cancel-reason"
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Transferência de colégio, mudança de endereço, etc."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancellingEnrollmentId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md cursor-pointer"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
