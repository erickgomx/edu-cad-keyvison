/**
 * ============================================================================
 * PONTO DE ENTRADA: main.tsx (Inicialização do React 18 e Estilos Globais)
 * ============================================================================
 * 
 * Este arquivo é o primeiro executado pelo navegador (definido no `index.html`).
 * 
 * Principais responsabilidades:
 * 1. Montagem do DOM com React 18 (`ReactDOM.createRoot`).
 * 2. Injeção dos Estilos Globais:
 *    - Bootstrap 5 CSS (`bootstrap/dist/css/bootstrap.min.css`)
 *    - Bootstrap Icons (`bootstrap-icons/font/bootstrap-icons.css`)
 *    - Tailwind CSS, tipografia e diretivas de impressão (`./index.css`)
 * 3. Envolvimento com o `SchoolProvider`:
 *    - Disponibiliza todo o estado de alunos, turmas, matrículas, autenticação
 *      e persistência do LocalStorage para todos os componentes filhos da aplicação.
 * 4. Ativação do `React.StrictMode`:
 *    - Ajuda a detectar efeitos colaterais e práticas depreciadas durante o desenvolvimento.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { SchoolProvider } from './context/SchoolContext'

// Importação das bibliotecas de design e estilos solicitadas
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './index.css'

// Localiza a div `#root` no `index.html` e inicia o ciclo de vida do React 18
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* O SchoolProvider envolve o App fornecendo acesso global a todas as regras e dados */}
    <SchoolProvider>
      <App />
    </SchoolProvider>
  </React.StrictMode>,
)
