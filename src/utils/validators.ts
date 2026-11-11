/**
 * ============================================================================
 * EduCad - Sistema de Gestão e Cadastro Escolar
 * ARQUIVO: src/utils/validators.ts
 * 
 * OBJETIVO:
 * Funções utilitárias de validação, formatação de máscaras visuais (CPF, CEP, Telefone),
 * cálculo dinâmico de idade para aplicação de regras de negócio (RN01, RN05)
 * e geradores de números de identificação legíveis.
 * ============================================================================
 */

/**
 * Validação Matemática do CPF Brasileiro (RN01)
 * 
 * Como funciona o cálculo oficial da Receita Federal:
 * 1. Remove qualquer caractere que não seja dígito numérico.
 * 2. Rejeita números que não tenham exatamente 11 dígitos ou sejam sequências repetidas (ex: 111.111.111-11).
 * 3. Calcula o primeiro dígito verificador multiplicando os 9 primeiros dígitos por pesos decrescentes de 10 a 2.
 * 4. Calcula o segundo dígito verificador multiplicando os 10 primeiros dígitos por pesos decrescentes de 11 a 2.
 * 5. Retorna `true` apenas se ambos os dígitos calculados coincidirem com os informados pelo usuário.
 */
export function validateCPF(rawCpf: string): boolean {
  const cleanCpf = rawCpf.replace(/\D/g, '');

  // O CPF brasileiro possui obrigatoriamente 11 dígitos
  if (cleanCpf.length !== 11) return false;

  // Rejeita sequências de dígitos iguais conhecidas (ex: 000.000.000-00, 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

  let sum = 0;
  let remainder: number;

  // --- Passo 1: Cálculo do primeiro dígito verificador ---
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i), 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(9, 10), 10)) return false;

  // --- Passo 2: Cálculo do segundo dígito verificador ---
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i), 10) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(10, 11), 10)) return false;

  return true;
}

/**
 * Gerador de CPF válido para testes rápidos e demonstração
 * 
 * Por que foi criado?
 * Facilita a vida do professor ou avaliador que estiver testando o sistema,
 * permitindo gerar instantaneamente um CPF matematicamente válido sem precisar
 * acessar sites externos de geradores.
 */
export function generateValidCPF(): string {
  const rnd = (n: number) => Math.round(Math.random() * n);
  const n1 = rnd(9);
  const n2 = rnd(9);
  const n3 = rnd(9);
  const n4 = rnd(9);
  const n5 = rnd(9);
  const n6 = rnd(9);
  const n7 = rnd(9);
  const n8 = rnd(9);
  const n9 = rnd(9);

  // Calcula 1º dígito verificador
  let d1 = n9 * 2 + n8 * 3 + n7 * 4 + n6 * 5 + n5 * 6 + n4 * 7 + n3 * 8 + n2 * 9 + n1 * 10;
  d1 = 11 - (d1 % 11);
  if (d1 >= 10) d1 = 0;

  // Calcula 2º dígito verificador
  let d2 = d1 * 2 + n9 * 3 + n8 * 4 + n7 * 5 + n6 * 6 + n5 * 7 + n4 * 8 + n3 * 9 + n2 * 10 + n1 * 11;
  d2 = 11 - (d2 % 11);
  if (d2 >= 10) d2 = 0;

  return `${n1}${n2}${n3}.${n4}${n5}${n6}.${n7}${n8}${n9}-${d1}${d2}`;
}

/**
 * Máscara visual de CPF: Formata enquanto o usuário digita
 * Exemplo: converte "12345678901" para "123.456.789-01"
 */
export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

/**
 * Máscara visual de Telefone brasileiro:
 * Suporta tanto telefones fixos (8 dígitos) quanto celulares com nono dígito (9 dígitos).
 * Exemplo: "(81) 98765-4321" ou "(81) 3456-7890"
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

/**
 * Máscara visual de CEP postal brasileiro:
 * Exemplo: converte "51020000" para "51020-000"
 */
export function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, '$1-$2');
}

/**
 * Calcula a idade exata do aluno em anos com base na data de nascimento (YYYY-MM-DD).
 * Leva em consideração se o aniversário do ano corrente já ocorreu ou não.
 */
export function calculateAge(birthDateString: string): number {
  if (!birthDateString) return 0;
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Se o mês atual for anterior ao mês de nascimento, ou se for o mesmo mês
  // mas o dia atual for anterior ao dia de aniversário, subtrai 1 ano.
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return isNaN(age) || age < 0 ? 0 : age;
}

/**
 * Regra de Negócio RN05:
 * Verifica se o aluno é menor de 18 anos.
 * Quando retorna `true`, o sistema aciona a obrigatoriedade dos dados do Responsável Legal.
 */
export function isUnder18(birthDateString: string): boolean {
  if (!birthDateString) return false;
  return calculateAge(birthDateString) < 18;
}

/**
 * Gera um número de matrícula acadêmica único e humanizado (Ex: "2026-1042").
 * Composto pelo ano letivo atual + sufixo de 4 dígitos.
 */
export function generateRegistrationNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${year}-${randomSuffix}`;
}

/**
 * Gera o código de autenticação para o Comprovante de Matrícula (Ex: "MAT-2026-8791").
 * Utilizado para validação digital da autenticidade da matrícula (RF07).
 */
export function generateEnrollmentCode(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MAT-${year}-${rand}`;
}
