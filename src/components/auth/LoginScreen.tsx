import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  Sparkles, 
  User as UserIcon, 
  UserPlus 
} from 'lucide-react';
import { UserRole } from '../../types';

export const LoginScreen: React.FC = () => {
  const { login, registerUser, users } = useSchool();
  
  // Mode: Login or Register
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('aluno');
  const [lgpdConsent, setLgpdConsent] = useState(true);

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Informe o seu e-mail cadastrado.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Informe a sua senha de acesso.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Credenciais inválidas.');
      }
    }, 350);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Informe seu nome completo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Informe um e-mail válido.');
      return;
    }
    if (!password || password.length < 3) {
      setErrorMessage('A senha deve ter no mínimo 3 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem. Digite a mesma senha em ambos os campos.');
      return;
    }
    if (!lgpdConsent) {
      setErrorMessage('Você deve concordar com os termos da LGPD para criar o cadastro.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role: selectedRole
      });
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Não foi possível cadastrar.');
      }
    }, 400);
  };

  const handleQuickLogin = (role: UserRole) => {
    const targetUser = users.find((u) => u.role === role);
    if (!targetUser) return;

    setEmail(targetUser.email);
    setPassword(targetUser.password || 'admin');
    setErrorMessage(null);

    setIsLoading(true);
    setTimeout(() => {
      login(targetUser.email, targetUser.password);
      setIsLoading(false);
    }, 300);
  };

  const toggleMode = (register: boolean) => {
    setIsRegisterMode(register);
    setErrorMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 mb-6">
        
        {/* Brand Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-xl shadow-brand-500/30 mb-3 animate-in fade-in zoom-in-90 duration-300">
          <GraduationCap className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
          Edu<span className="text-brand-400">Cad</span>
        </h1>
        <p className="text-sm text-slate-300 mt-0.5 font-medium">
          Sistema de Cadastro e Gestão Escolar
        </p>

        <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] text-slate-300 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Front-end Funcional com Persistência Local (LocalStorage)</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-100 p-7 sm:p-9 space-y-5">
          
          {/* Card Header & Toggle Tabs */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {isRegisterMode ? 'Criar Nova Conta' : 'Acesse sua Conta'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRegisterMode 
                  ? 'Cadastre-se para acessar o sistema escolar' 
                  : 'Entre com suas credenciais para continuar'}
              </p>
            </div>

            {/* Switch Tab buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => toggleMode(false)}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  !isRegisterMode 
                    ? 'bg-white text-slate-900 shadow-xs font-bold' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => toggleMode(true)}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  isRegisterMode 
                    ? 'bg-white text-brand-700 shadow-xs font-bold' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Cadastre-se
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          {/* Form: Register Mode */}
          {isRegisterMode ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              
              {/* Name */}
              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João da Silva Santos"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-brand-500 bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-brand-500 bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Role selection */}
              <div>
                <label htmlFor="reg-role" className="block text-xs font-semibold text-slate-700 mb-1">
                  Perfil de Acesso *
                </label>
                <select
                  id="reg-role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-brand-500 bg-white"
                >
                  <option value="aluno">Aluno / Responsável (Consultas e comprovante)</option>
                  <option value="professor">Professor / Docente (Consulta de turmas e chamada)</option>
                  <option value="admin">Secretaria / Administrador (Acesso total)</option>
                </select>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-pass" className="block text-xs font-semibold text-slate-700 mb-1">
                    Senha *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-pass"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 3 dígitos"
                      className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-300 text-sm focus:border-brand-500 bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-confirm-pass" className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-confirm-pass"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:border-brand-500 bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* LGPD Consent */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={lgpdConsent}
                    onChange={(e) => setLgpdConsent(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Concordo com o armazenamento dos dados no navegador para fins acadêmicos e educacionais (LGPD - RNF07).</span>
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white text-sm font-bold shadow-md shadow-brand-500/25 transition-all cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <span>Criando conta e salvando no LocalStorage...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Concluir Cadastro e Entrar</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Já possui uma conta cadastrada?{' '}
                  <button
                    type="button"
                    onClick={() => toggleMode(false)}
                    className="text-brand-600 font-bold hover:underline cursor-pointer"
                  >
                    Fazer Login
                  </button>
                </p>
              </div>

            </form>
          ) : (
            /* Form: Login Mode */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Email field */}
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail Cadastrado *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@educad.escola.br"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-brand-500 transition-all bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 mb-1">
                  Senha de Acesso *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-brand-500 transition-all bg-slate-50/50 focus:bg-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Lembrar meu acesso</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert('Para fins de teste acadêmico, utilize as contas rápidas logo abaixo ou cadastre um novo usuário.')}
                  className="text-brand-600 hover:text-brand-800 font-semibold cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white text-sm font-bold shadow-md shadow-brand-500/25 transition-all cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <span>Autenticando...</span>
                ) : (
                  <>
                    <span>Entrar no EduCad</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Não tem uma conta cadastrada?{' '}
                  <button
                    type="button"
                    onClick={() => toggleMode(true)}
                    className="text-brand-600 font-bold hover:underline cursor-pointer"
                  >
                    Cadastre-se gratuitamente
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Quick Demo Access Buttons (Acesso Rápido para Avaliação) */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Acesso Rápido para Demonstração (1 Clique):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Secretaria */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 hover:border-emerald-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                    Secretaria
                  </span>
                  <KeyRound className="w-3 h-3 text-emerald-600 opacity-60 group-hover:opacity-100" />
                </div>
                <p className="text-xs font-bold text-slate-900 mt-1 truncate">Ana Cláudia</p>
                <p className="text-[10px] text-slate-500">Acesso Total (Admin)</p>
              </button>

              {/* Professor */}
              <button
                type="button"
                onClick={() => handleQuickLogin('professor')}
                className="p-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 hover:border-blue-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-200 text-blue-900">
                    Professor
                  </span>
                  <KeyRound className="w-3 h-3 text-blue-600 opacity-60 group-hover:opacity-100" />
                </div>
                <p className="text-xs font-bold text-slate-900 mt-1 truncate">Prof. Carlos</p>
                <p className="text-[10px] text-slate-500">Consulta de Turmas</p>
              </button>

              {/* Aluno */}
              <button
                type="button"
                onClick={() => handleQuickLogin('aluno')}
                className="p-3 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 hover:border-purple-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-200 text-purple-900">
                    Aluna
                  </span>
                  <KeyRound className="w-3 h-3 text-purple-600 opacity-60 group-hover:opacity-100" />
                </div>
                <p className="text-xs font-bold text-slate-900 mt-1 truncate">Mariana Duarte</p>
                <p className="text-[10px] text-slate-500">Comprovante</p>
              </button>

            </div>
          </div>

          {/* LGPD notice */}
          <div className="pt-2 text-center text-[10px] text-slate-400 leading-tight">
            🔐 Seus dados estão protegidos de acordo com os princípios da LGPD (Lei 13.709/2018 - RNF07).
          </div>

        </div>
      </div>

      {/* Footer info */}
      <div className="mt-8 text-center text-xs text-slate-400 relative z-10">
        EduCad • Sistema Escolar Funcional • Front-end
      </div>

    </div>
  );
};
