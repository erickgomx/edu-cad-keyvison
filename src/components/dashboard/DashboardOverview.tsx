import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Users, 
  BookOpen, 
  FileCheck, 
  Percent, 
  UserPlus, 
  Plus, 
  GraduationCap, 
  ArrowRight, 
  ShieldCheck, 
  Printer 
} from 'lucide-react';

interface DashboardOverviewProps {
  onNavigateTab: (tab: 'students' | 'classes' | 'enrollments') => void;
  onNewStudent: () => void;
  onNewClass: () => void;
  onNewEnrollment: () => void;
  onViewReceipt: (enrollmentId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateTab,
  onNewStudent,
  onNewClass,
  onNewEnrollment,
  onViewReceipt
}) => {
  const { 
    students, 
    classes, 
    enrollments, 
    currentUser, 
    getClassEnrolledCount, 
    getStudentById, 
    getClassById 
  } = useSchool();

  // Metrics
  const totalStudents = students.length;
  const totalClasses = classes.length;
  const activeEnrollments = enrollments.filter((e) => e.status === 'Ativa').length;
  
  const totalCapacity = classes.reduce((acc, c) => acc + c.maxCapacity, 0);
  const totalOccupancyPercentage = totalCapacity > 0 
    ? Math.round((activeEnrollments / totalCapacity) * 100) 
    : 0;

  const recentEnrollments = enrollments.slice(0, 5);

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-brand-300 text-xs font-semibold mb-3 border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>EduCad • Sistema Escolar Seguro e em Conformidade com a LGPD (RNF07)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Olá, {currentUser.name}! 👋
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Painel de controle unificado para cadastro escolar, gestão de turmas por turnos, validação de regras de negócio e emissão de comprovantes oficiais.
          </p>

          {/* Quick Shortcuts */}
          {currentUser.role === 'admin' && (
            <div className="flex flex-wrap items-center gap-2.5 mt-5">
              <button
                onClick={onNewStudent}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Novo Aluno</span>
              </button>
              <button
                onClick={onNewEnrollment}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Matricular Aluno</span>
              </button>
              <button
                onClick={onNewClass}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Turma</span>
              </button>
            </div>
          )}
        </div>

        {/* Decorative circle */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Alunos */}
        <div 
          onClick={() => onNavigateTab('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Alunos Cadastrados</span>
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalStudents}</span>
            <span className="text-xs text-emerald-600 font-semibold">Fichas ativas</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Ver listagem completa</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Turmas */}
        <div 
          onClick={() => onNavigateTab('classes')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Turmas / Salas</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalClasses}</span>
            <span className="text-xs text-blue-600 font-semibold">{totalCapacity} vagas totais</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Gerenciar salas e turnos</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Matrículas Ativas */}
        <div 
          onClick={() => onNavigateTab('enrollments')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Matrículas Ativas</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{activeEnrollments}</span>
            <span className="text-xs text-emerald-600 font-semibold">Alunos enturmados</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Consultar registros (RF04)</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Taxa de Ocupação */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Ocupação Geral</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalOccupancyPercentage}%</span>
            <span className="text-xs text-slate-500 font-medium">das vagas preenchidas</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${totalOccupancyPercentage}%` }}
            />
          </div>
        </div>

      </div>

      {/* Two-column layout: Turmas em Destaque & Últimas Matrículas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Turmas & Ocupação (2 colunas) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Turmas e Ocupação de Vagas (RN03)
              </h2>
              <p className="text-xs text-slate-500">Monitoramento em tempo real da capacidade máxima</p>
            </div>
            <button
              onClick={() => onNavigateTab('classes')}
              className="text-xs font-bold text-brand-600 hover:text-brand-800 transition-colors cursor-pointer"
            >
              Ver Todas →
            </button>
          </div>

          <div className="space-y-3">
            {classes.map((c) => {
              const enrolled = getClassEnrolledCount(c.id);
              const percentage = Math.round((enrolled / c.maxCapacity) * 100);
              const isFull = enrolled >= c.maxCapacity;

              return (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{c.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 font-semibold text-slate-600">
                        {c.shift}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{c.room} • Ano {c.academicYear}</p>
                  </div>

                  <div className="sm:text-right min-w-[140px]">
                    <div className="flex sm:justify-end items-center gap-1.5 text-xs font-semibold">
                      <span className={isFull ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                        {enrolled} / {c.maxCapacity} alunos
                      </span>
                      {isFull && <span className="text-[10px] text-rose-600 font-bold">(LOTADA)</span>}
                    </div>
                    <div className="w-full sm:w-36 h-2 bg-slate-200 rounded-full mt-1.5 overflow-hidden ml-auto">
                      <div 
                        className={`h-full rounded-full ${isFull ? 'bg-rose-500' : percentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Últimas Matrículas (1 coluna) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Últimas Matrículas
              </h2>
              <p className="text-xs text-slate-500">Registros recentes</p>
            </div>
            <button
              onClick={() => onNavigateTab('enrollments')}
              className="text-xs font-bold text-brand-600 hover:text-brand-800 transition-colors cursor-pointer"
            >
              Ver Todas →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentEnrollments.map((e) => {
              const student = getStudentById(e.studentId);
              const classRoom = getClassById(e.classRoomId);

              return (
                <div key={e.id} className="py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-slate-900 truncate">
                      {student?.name || 'Aluno'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {classRoom?.name || 'Turma'} • <span className="font-mono">{e.code}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => onViewReceipt(e.id)}
                    className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Emitir Comprovante em PDF (RF07)"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
