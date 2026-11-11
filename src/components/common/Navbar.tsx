import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  FileCheck, 
  LayoutDashboard, 
  Shield, 
  RotateCcw, 
  UserCircle,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '../../types';

interface NavbarProps {
  currentTab: 'dashboard' | 'students' | 'classes' | 'enrollments';
  setCurrentTab: (tab: 'dashboard' | 'students' | 'classes' | 'enrollments') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { currentUser, switchRole, resetToDefaultData } = useSchool();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'students', label: 'Alunos', icon: Users },
    { id: 'classes', label: 'Turmas', icon: BookOpen },
    { id: 'enrollments', label: 'Matrículas', icon: FileCheck },
  ] as const;

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string }> = {
    admin: { label: 'Secretaria / Admin', badge: 'Secretaria', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    professor: { label: 'Professor', badge: 'Docente', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    aluno: { label: 'Aluno / Responsável', badge: 'Aluno', color: 'bg-purple-100 text-purple-800 border-purple-300' }
  };

  const handleTabClick = (tabId: 'dashboard' | 'students' | 'classes' | 'enrollments') => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-3 group text-left cursor-pointer"
              title="Ir para o Painel Geral"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  Edu<span className="text-brand-600">Cad</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">v1.0</span>
                </span>
                <p className="text-xs text-slate-500 -mt-0.5 hidden sm:block">Gestão de Cadastro Escolar</p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-xl border border-slate-200/60" aria-label="Navegação Principal">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white text-brand-700 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Role Switcher & Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Reset */}
            <button
              onClick={() => {
                if (window.confirm('Deseja restaurar todos os dados para o estado inicial de demonstração?')) {
                  resetToDefaultData();
                }
              }}
              title="Restaurar dados de teste padrão"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Restaurar dados de teste"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Role Switcher (RF08) */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-left shadow-xs cursor-pointer"
                aria-expanded={roleDropdownOpen}
                aria-haspopup="true"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase border border-slate-200">
                  <UserCircle className="w-5 h-5 text-slate-600" />
                </div>
                <div className="hidden lg:block text-xs">
                  <span className="block font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span className={`inline-block px-1.5 py-0.2 text-[10px] rounded font-medium border ${roleLabels[currentUser.role].color}`}>
                    {roleLabels[currentUser.role].badge}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-semibold text-slate-900">Alternar Perfil de Acesso</p>
                    <p className="text-[11px] text-slate-500">Simule a visão de cada usuário (RF08):</p>
                  </div>
                  
                  <button
                    onClick={() => { switchRole('admin'); setRoleDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                      currentUser.role === 'admin' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Secretaria / Admin</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Total</span>
                  </button>

                  <button
                    onClick={() => { switchRole('professor'); setRoleDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                      currentUser.role === 'professor' ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Prof. Carlos Eduardo</span>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Docente</span>
                  </button>

                  <button
                    onClick={() => { switchRole('aluno'); setRoleDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                      currentUser.role === 'aluno' ? 'bg-purple-50 text-purple-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                      <span>Mariana (Aluna)</span>
                    </div>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Aluno</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
              aria-label="Abrir menu de navegação"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 font-medium">Perfil Atual:</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold text-slate-800">{currentUser.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium border ${roleLabels[currentUser.role].color}`}>
                {roleLabels[currentUser.role].badge}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 mt-2">
              <button 
                onClick={() => switchRole('admin')}
                className={`py-1 text-xs rounded border text-center font-medium ${currentUser.role === 'admin' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200'}`}
              >
                Secretaria
              </button>
              <button 
                onClick={() => switchRole('professor')}
                className={`py-1 text-xs rounded border text-center font-medium ${currentUser.role === 'professor' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'}`}
              >
                Professor
              </button>
              <button 
                onClick={() => switchRole('aluno')}
                className={`py-1 text-xs rounded border text-center font-medium ${currentUser.role === 'aluno' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-700 border-slate-200'}`}
              >
                Aluno
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold border border-brand-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5 text-brand-600" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => {
                if (window.confirm('Restaurar dados de teste?')) {
                  resetToDefaultData();
                  setMobileMenuOpen(false);
                }
              }}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 py-1 px-2 rounded"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Dados Padrão
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
