/**
 * ============================================================================
 * EduCad - Sistema de Gestão e Cadastro Escolar
 * ARQUIVO: src/types/index.ts
 * 
 * OBJETIVO:
 * Centralizar todas as interfaces e definições de tipos TypeScript do sistema.
 * Ajuda a garantir consistência de dados, prevenção de erros em tempo de compilação
 * e documenta as entidades fundamentais do domínio escolar (Alunos, Turmas, Matrículas e Usuários).
 * ============================================================================
 */

/**
 * Papéis de acesso disponíveis no sistema (RF08 - Controle de Perfis):
 * - 'admin': Secretaria / Administrador escolar (Acesso irrestrito a cadastros, exclusões e enturmações)
 * - 'professor': Corpo docente (Consulta turmas, alunos matriculados e listas de presença)
 * - 'aluno': Aluno ou seu Responsável legal (Acompanhamento e emissão de comprovante em PDF)
 */
export type UserRole = 'admin' | 'professor' | 'aluno';

/**
 * Representa um usuário autenticado no sistema escolar.
 */
export interface User {
  id: string;               // Identificador único (ex: "user-admin")
  name: string;             // Nome completo do usuário
  email: string;            // E-mail corporativo ou pessoal usado para login
  role: UserRole;           // Papel/Nível de permissão no sistema
  password?: string;        // Senha de autenticação (armazenada de forma segura/mock)
  avatar?: string;          // Foto de perfil ilustrativa
  studentId?: string;       // Vincula o usuário ao seu registro de aluno correspondente
}

/**
 * Dados do Responsável Legal (RF02 / RN05):
 * Obrigatório no cadastro caso o estudante tenha menos de 18 anos.
 */
export interface Guardian {
  name: string;                                           // Nome do responsável
  cpf: string;                                            // CPF válido do responsável
  relationship: 'Pai' | 'Mãe' | 'Tutor Legal' | 'Outro';  // Vínculo familiar com o estudante
  phone: string;                                          // Telefone/WhatsApp para contato de emergência
  email: string;                                          // E-mail para recebimento de informativos escolares
}

/**
 * Ficha cadastral completa do estudante (RF01):
 * Armazena informações civis, de contato, endereço residencial e observações médicas/pedagógicas.
 */
export interface Student {
  id: string;                                             // ID interno único do registro
  registrationNumber: string;                             // Matrícula acadêmica única (ex: "2026-1001")
  name: string;                                           // Nome completo do estudante
  cpf: string;                                            // CPF válido com algoritmo da Receita (RN01)
  birthDate: string;                                      // Data de nascimento no formato ISO YYYY-MM-DD
  gender?: 'Masculino' | 'Feminino' | 'Outro' | 'Prefiro não informar'; // Gênero
  phone: string;                                          // Telefone de contato
  email: string;                                          // E-mail do aluno
  address: {                                              // Endereço residencial completo
    street: string;                                       // Logradouro (Rua, Avenida, etc.)
    number: string;                                       // Número do imóvel
    complement?: string;                                  // Complemento (Apto, Bloco, Casa)
    neighborhood: string;                                 // Bairro
    city: string;                                         // Município
    state: string;                                        // UF (Sigla do Estado)
    zipCode: string;                                      // CEP formatado
  };
  guardian?: Guardian;                                    // Responsável (Obrigatório se idade < 18 anos - RN05)
  notes?: string;                                         // Observações médicas ou necessidades especiais
  createdAt: string;                                      // Data e hora em que a ficha foi criada
}

/**
 * Turnos escolares oferecidos pela instituição de ensino.
 */
export type ShiftType = 'Matutino' | 'Vespertino' | 'Noturno' | 'Integral';

/**
 * Entidade de Turma / Sala de Aula (RF03):
 * Define a capacidade física do espaço e evita superlotação nas salas (RN03).
 */
export interface ClassRoom {
  id: string;               // ID único da turma
  name: string;             // Nome representativo (Ex: "1º Ano A - Ensino Médio")
  academicYear: string;     // Ano letivo correspondente (Ex: "2026")
  shift: ShiftType;         // Turno em que as aulas ocorrem
  room: string;             // Espaço físico onde as aulas acontecem (Ex: "Sala 101 - Bloco A")
  maxCapacity: number;      // Limite máximo de estudantes permitidos na sala (RN03)
  description?: string;     // Descrição pedagógica, ênfase curricular ou observações da turma
}

/**
 * Situação jurídica da matrícula no ano corrente.
 */
export type EnrollmentStatus = 'Ativa' | 'Cancelada' | 'Concluída';

/**
 * Registro de Matrícula (RF04 / RF07 / RF10):
 * Conecta o estudante a uma turma específica no ano letivo.
 */
export interface Enrollment {
  id: string;               // ID único da matrícula
  code: string;             // Código de autenticação gerado para o comprovante (ex: "MAT-2026-1001")
  studentId: string;        // Chave estrangeira que aponta para o Aluno
  classRoomId: string;      // Chave estrangeira que aponta para a Turma vinculada
  enrolledAt: string;       // Timestamp do momento da efetivação da matrícula
  status: EnrollmentStatus; // Situação atual da matrícula
  cancelledAt?: string;     // Data de cancelamento (preenchida caso RF10 seja executado)
  cancelReason?: string;    // Justificativa fornecida para o cancelamento (RF10)
}

/**
 * Mensagem de notificação flutuante acessível (Toast):
 * Notifica o usuário sobre ações bem-sucedidas ou erros de validação em tempo real.
 */
export interface ToastMessage {
  id: string;                                       // Identificador temporário da notificação
  type: 'success' | 'error' | 'info' | 'warning';   // Nível de severidade visual
  title: string;                                    // Título curto e objetivo
  description?: string;                             // Detalhamento pedagógico ou instrução de correção
}
