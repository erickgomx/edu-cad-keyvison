/**
 * ============================================================================
 * EduCad - Sistema de Gestão e Cadastro Escolar
 * ARQUIVO: src/components/classes/ClassList.tsx
 * 
 * OBJETIVO:
 * Painel de gerenciamento visual de Turmas e Salas de Aula (RF03).
 * 
 * DESTAQUES E REGRAS:
 * - Filtro dinâmico por turnos (Matutino, Vespertino, Noturno, Integral).
 * - Monitoramento de Capacidade Máxima (RN03): exibe barra de progresso colorida
 *   (verde para vagas livres, âmbar para alerta e vermelho para turma lotada).
 * - RF09: Botão "Ver Alunos" que abre a relação nominal de alunos enturmados.
 * - Edição e exclusão seguras restritas à Secretaria.
 * ============================================================================
 */

import React, { useState } from 'react';
import { ClassRoom } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { 
  BookOpen, 
  Plus, 
  Users, 
  MapPin, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  Eye
} from 'lucide-react';

interface ClassListProps {
  onNewClass: () => void;
  onEditClass: (classRoom: ClassRoom) => void;
  onViewClassStudents: (classRoom: ClassRoom) => void;
}

export const ClassList: React.FC<ClassListProps> = ({
  onNewClass,
  onEditClass,
  onViewClassStudents
}) => {
  const { classes, getClassEnrolledCount, deleteClass, currentUser } = useSchool();
  const [shiftFilter, setShiftFilter] = useState<string>('all');

  // Filtragem de turmas por turno
  const filteredClasses = classes.filter((c) => {
    if (shiftFilter === 'all') return true;
    return c.shift === shiftFilter;
  });

  const handleDelete = (c: ClassRoom) => {
    if (window.confirm(`Deseja realmente excluir a turma ${c.name}?`)) {
      deleteClass(c.id);
    }
  };

  /**
   * Cores temáticas para distinguir visualmente cada turno escolar
   */
  const getShiftBadge = (shift: ClassRoom['shift']) => {
    switch (shift) {
      case 'Matutino':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Vespertino':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Noturno':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Integral':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Turmas & Vagas
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gerenciamento de turmas, salas, capacidade máxima e ocupação de vagas (RN03)
          </p>
        </div>

        {/* Apenas Secretaria / Admin pode criar novas turmas */}
        {currentUser.role === 'admin' && (
          <button
            onClick={onNewClass}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-sm shadow-brand-500/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Turma (RF03)</span>
          </button>
        )}
      </div>

      {/* Abas de Filtro por Turno */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'Matutino', 'Vespertino', 'Integral', 'Noturno'].map((shift) => (
          <button
            key={shift}
            onClick={() => setShiftFilter(shift)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
              shiftFilter === shift
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {shift === 'all' ? 'Todos os Turnos' : shift}
          </button>
        ))}
      </div>

      {/* Grid de Cards de Turmas */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">Nenhuma turma cadastrada</h3>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre turmas para organizar salas e turnos escolares.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {filteredClasses.map((classRoom) => {
            const enrolled = getClassEnrolledCount(classRoom.id);
            const percentage = Math.min(100, Math.round((enrolled / classRoom.maxCapacity) * 100));
            const availableSeats = Math.max(0, classRoom.maxCapacity - enrolled);
            const isFull = availableSeats === 0;

            // Altera dinamicamente a cor da barra de ocupação
            let progressColor = 'bg-emerald-500';
            if (percentage >= 90) progressColor = 'bg-rose-500';
            else if (percentage >= 70) progressColor = 'bg-amber-500';

            return (
              <div 
                key={classRoom.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Topo do Card: Nome da Turma e Badge de Lotação */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border mb-2 ${getShiftBadge(classRoom.shift)}`}>
                        {classRoom.shift}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900">{classRoom.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Ano Letivo {classRoom.academicYear}</p>
                    </div>

                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        isFull 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isFull ? (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Lotada (RN03)
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            {availableSeats} vaga{availableSeats > 1 ? 's' : ''} livre{availableSeats > 1 ? 's' : ''}
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {classRoom.description && (
                    <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                      {classRoom.description}
                    </p>
                  )}

                  {/* Espaço Físico e Capacidade Máxima */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{classRoom.room}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Users className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Capacidade: <strong>{classRoom.maxCapacity} alunos</strong></span>
                    </div>
                  </div>

                  {/* Barra Visual de Ocupação da Turma (RN03) */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700">Ocupação da Turma</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        <strong>{enrolled}</strong> / {classRoom.maxCapacity} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Ações da Turma: Ver Alunos (RF09), Editar e Excluir */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewClassStudents(classRoom)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                    title="Visualizar relação de alunos da turma (RF09)"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    <span>Ver Alunos ({enrolled})</span>
                  </button>

                  {currentUser.role === 'admin' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditClass(classRoom)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Editar Turma"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(classRoom)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Excluir Turma"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
