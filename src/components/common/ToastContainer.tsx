/**
 * ============================================================================
 * COMPONENTE: ToastContainer (Central Flutuante de Notificações / Feedbacks)
 * ============================================================================
 * 
 * Este componente implementa:
 * - RNF02: Usabilidade & Feedback Visual Imediato (sucesso, alertas, erros).
 * - RNF06: Acessibilidade Digital (WAI-ARIA).
 * 
 * Por que este componente existe e como ele funciona:
 * 1. O usuário precisa saber imediatamente quando uma ação deu certo (ex: "Aluno
 *    cadastrado com sucesso") ou quando ocorreu um bloqueio de regra de negócio
 *    (ex: "Capacidade máxima da turma atingida - RN03").
 * 2. Posicionado fixamente no canto inferior direito (`fixed bottom-5 right-5`).
 * 3. Utiliza atributos de acessibilidade `role="status"` e `aria-live="polite"`,
 *    permitindo que softwares de leitura de tela para pessoas com deficiência visual
 *    leiam as notificações assim que surgirem, sem interromper o foco atual.
 * 4. Suporta 4 variações temáticas: Sucesso (verde), Erro (vermelho), Alerta (âmbar) e Info (azul).
 */

import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  // Obtemos a lista de toasts ativos e o método para fechar manualmente
  const { toasts, removeToast } = useSchool();

  // Se não há notificações ativas, não ocupa nenhum espaço no DOM
  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 sm:px-0 no-print"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        // Configuração de estilo visual e ícone de acordo com o tipo de mensagem
        let bgStyle = 'bg-slate-900 text-white';
        let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;

        if (toast.type === 'success') {
          bgStyle = 'bg-emerald-950/95 border-emerald-500/40 text-emerald-50';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        } else if (toast.type === 'error') {
          bgStyle = 'bg-rose-950/95 border-rose-500/40 text-rose-50';
          icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
        } else if (toast.type === 'warning') {
          bgStyle = 'bg-amber-950/95 border-amber-500/40 text-amber-50';
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
        } else if (toast.type === 'info') {
          bgStyle = 'bg-slate-900/95 border-brand-500/40 text-slate-100';
          icon = <Info className="w-5 h-5 text-brand-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${bgStyle}`}
          >
            {/* Ícone representativo do status */}
            {icon}

            {/* Título e descrição do feedback */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold tracking-wide">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs mt-1 text-slate-300 leading-relaxed break-words">
                  {toast.description}
                </p>
              )}
            </div>

            {/* Botão de fechar notificação antecipadamente */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
