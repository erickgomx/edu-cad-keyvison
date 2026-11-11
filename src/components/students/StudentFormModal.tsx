import React, { useState, useEffect } from 'react';
import { Student, Guardian } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { 
  X, 
  UserPlus, 
  Edit3, 
  Check, 
  AlertCircle, 
  User, 
  MapPin, 
  HeartHandshake 
} from 'lucide-react';
import { 
  validateCPF, 
  formatCPF, 
  formatPhone, 
  formatCEP, 
  calculateAge, 
  isUnder18 
} from '../../utils/validators';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
  onSuccess?: (student: Student) => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  studentToEdit,
  onSuccess
}) => {
  const { addStudent, updateStudent } = useSchool();

  // Basic info
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Student['gender']>('Prefiro não informar');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Address info
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('Recife');
  const [state, setState] = useState('PE');
  const [zipCode, setZipCode] = useState('');

  // Guardian info (RN05)
  const [guardianName, setGuardianName] = useState('');
  const [guardianCpf, setGuardianCpf] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState<Guardian['relationship']>('Mãe');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name);
      setCpf(studentToEdit.cpf);
      setBirthDate(studentToEdit.birthDate);
      setGender(studentToEdit.gender || 'Prefiro não informar');
      setPhone(studentToEdit.phone);
      setEmail(studentToEdit.email);
      setNotes(studentToEdit.notes || '');

      setStreet(studentToEdit.address.street);
      setNumber(studentToEdit.address.number);
      setComplement(studentToEdit.address.complement || '');
      setNeighborhood(studentToEdit.address.neighborhood);
      setCity(studentToEdit.address.city);
      setState(studentToEdit.address.state);
      setZipCode(studentToEdit.address.zipCode);

      if (studentToEdit.guardian) {
        setGuardianName(studentToEdit.guardian.name);
        setGuardianCpf(studentToEdit.guardian.cpf);
        setGuardianRelationship(studentToEdit.guardian.relationship);
        setGuardianPhone(studentToEdit.guardian.phone);
        setGuardianEmail(studentToEdit.guardian.email || '');
      } else {
        resetGuardian();
      }
    } else {
      resetForm();
    }
    setErrors({});
  }, [studentToEdit, isOpen]);

  const resetGuardian = () => {
    setGuardianName('');
    setGuardianCpf('');
    setGuardianRelationship('Mãe');
    setGuardianPhone('');
    setGuardianEmail('');
  };

  const resetForm = () => {
    setName('');
    setCpf('');
    setBirthDate('');
    setGender('Prefiro não informar');
    setPhone('');
    setEmail('');
    setNotes('');

    setStreet('');
    setNumber('');
    setComplement('');
    setNeighborhood('');
    setCity('Recife');
    setState('PE');
    setZipCode('');

    resetGuardian();
    setErrors({});
  };

  if (!isOpen) return null;

  const currentAge = calculateAge(birthDate);
  const minor = birthDate ? isUnder18(birthDate) : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validations
    if (!name.trim()) newErrors.name = 'Nome completo é obrigatório.';
    if (!cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório.';
    } else if (!validateCPF(cpf)) {
      newErrors.cpf = 'CPF inválido (RN01). Verifique os números digitados.';
    }

    if (!birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória.';
    }

    if (!phone.trim()) newErrors.phone = 'Telefone é obrigatório.';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'E-mail válido é obrigatório.';
    if (!street.trim()) newErrors.street = 'Rua/Logradouro é obrigatório.';
    if (!number.trim()) newErrors.number = 'Número é obrigatório.';
    if (!neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório.';
    if (!city.trim()) newErrors.city = 'Cidade é obrigatória.';
    if (!zipCode.trim()) newErrors.zipCode = 'CEP é obrigatório.';

    // RN05: Se menor de 18 anos, validação obrigatória do responsável
    if (minor) {
      if (!guardianName.trim()) newErrors.guardianName = 'Nome do responsável é obrigatório para menores de 18 anos (RN05).';
      if (!guardianCpf.trim()) {
        newErrors.guardianCpf = 'CPF do responsável é obrigatório.';
      } else if (!validateCPF(guardianCpf)) {
        newErrors.guardianCpf = 'CPF do responsável é inválido.';
      }
      if (!guardianPhone.trim()) newErrors.guardianPhone = 'Telefone do responsável é obrigatório.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const guardianData: Guardian | undefined = (minor || guardianName.trim()) ? {
      name: guardianName.trim(),
      cpf: guardianCpf.trim(),
      relationship: guardianRelationship,
      phone: guardianPhone.trim(),
      email: guardianEmail.trim()
    } : undefined;

    const studentPayload = {
      name: name.trim(),
      cpf: cpf.trim(),
      birthDate,
      gender,
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim(),
      address: {
        street: street.trim(),
        number: number.trim(),
        complement: complement.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim()
      },
      guardian: guardianData
    };

    if (studentToEdit) {
      const res = updateStudent(studentToEdit.id, studentPayload);
      if (res.success) {
        onSuccess?.({ ...studentToEdit, ...studentPayload });
        onClose();
      }
    } else {
      const res = addStudent(studentPayload);
      if (res.success && res.student) {
        onSuccess?.(res.student);
        onClose();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-form-title"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 my-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-600 rounded-lg text-white">
              {studentToEdit ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 id="student-form-title" className="font-bold text-lg">
                {studentToEdit ? 'Editar Cadastro de Aluno (RF05)' : 'Cadastrar Novo Aluno (RF01 / RF02)'}
              </h2>
              <p className="text-xs text-slate-300">
                Preencha os dados cadastrais do estudante e responsável
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          
          {/* Section 1: Dados Pessoais */}
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 font-semibold text-sm">
              <User className="w-4 h-4 text-brand-600" />
              <span>1. Informações Básicas do Aluno</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="sm:col-span-2">
                <label htmlFor="student-name" className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo do Aluno *
                </label>
                <input
                  id="student-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Mariana Duarte da Silva"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all ${
                    errors.name ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-brand-500'
                  }`}
                />
                {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="student-cpf" className="block text-xs font-semibold text-slate-700 mb-1">
                  CPF do Aluno (RN01) *
                </label>
                <input
                  id="student-cpf"
                  type="text"
                  required
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm font-mono transition-all ${
                    errors.cpf ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-brand-500'
                  }`}
                />
                {errors.cpf && <p className="text-xs text-rose-600 mt-1">{errors.cpf}</p>}
              </div>

              <div>
                <label htmlFor="student-birth" className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de Nascimento *
                </label>
                <div className="relative">
                  <input
                    id="student-birth"
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all ${
                      errors.birthDate ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-brand-500'
                    }`}
                  />
                </div>
                {birthDate && (
                  <p className="text-[11px] mt-1 text-slate-500 font-medium">
                    Idade: <strong className="text-slate-800">{currentAge} anos</strong>{' '}
                    {minor ? (
                      <span className="text-amber-600 font-semibold">(Menor de idade - Requer Responsável)</span>
                    ) : (
                      <span className="text-emerald-600 font-semibold">(Maior de 18 anos)</span>
                    )}
                  </p>
                )}
                {errors.birthDate && <p className="text-xs text-rose-600 mt-1">{errors.birthDate}</p>}
              </div>

              <div>
                <label htmlFor="student-gender" className="block text-xs font-semibold text-slate-700 mb-1">
                  Gênero
                </label>
                <select
                  id="student-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Student['gender'])}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-brand-500 bg-white"
                >
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Outro">Outro</option>
                  <option value="Prefiro não informar">Prefiro não informar</option>
                </select>
              </div>

              <div>
                <label htmlFor="student-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefone / WhatsApp *
                </label>
                <input
                  id="student-phone"
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(81) 98765-4321"
                  maxLength={15}
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all ${
                    errors.phone ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-brand-500'
                  }`}
                />
                {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="student-email" className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail de Contato *
                </label>
                <input
                  id="student-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aluno@email.com"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all ${
                    errors.email ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-brand-500'
                  }`}
                />
                {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Endereço */}
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 font-semibold text-sm">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>2. Endereço Residencial</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
              <div className="sm:col-span-1">
                <label htmlFor="addr-cep" className="block text-xs font-semibold text-slate-700 mb-1">
                  CEP *
                </label>
                <input
                  id="addr-cep"
                  type="text"
                  required
                  value={zipCode}
                  onChange={(e) => setZipCode(formatCEP(e.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all ${
                    errors.zipCode ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-brand-500'
                  }`}
                />
                {errors.zipCode && <p className="text-xs text-rose-600 mt-1">{errors.zipCode}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="addr-street" className="block text-xs font-semibold text-slate-700 mb-1">
                  Rua / Logradouro *
                </label>
                <input
                  id="addr-street"
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Ex: Av. Boa Viagem"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all ${
                    errors.street ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-brand-500'
                  }`}
                />
                {errors.street && <p className="text-xs text-rose-600 mt-1">{errors.street}</p>}
              </div>

              <div>
                <label htmlFor="addr-num" className="block text-xs font-semibold text-slate-700 mb-1">
                  Número *
                </label>
                <input
                  id="addr-num"
                  type="text"
                  required
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="120"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all ${
                    errors.number ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-brand-500'
                  }`}
                />
                {errors.number && <p className="text-xs text-rose-600 mt-1">{errors.number}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="addr-neighborhood" className="block text-xs font-semibold text-slate-700 mb-1">
                  Bairro *
                </label>
                <input
                  id="addr-neighborhood"
                  type="text"
                  required
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Ex: Boa Viagem"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all ${
                    errors.neighborhood ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-brand-500'
                  }`}
                />
                {errors.neighborhood && <p className="text-xs text-rose-600 mt-1">{errors.neighborhood}</p>}
              </div>

              <div>
                <label htmlFor="addr-city" className="block text-xs font-semibold text-slate-700 mb-1">
                  Cidade *
                </label>
                <input
                  id="addr-city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all ${
                    errors.city ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-brand-500'
                  }`}
                />
                {errors.city && <p className="text-xs text-rose-600 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="addr-comp" className="block text-xs font-semibold text-slate-700 mb-1">
                  Complemento
                </label>
                <input
                  id="addr-comp"
                  type="text"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  placeholder="Apto 302, Bloco B"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Responsável Legal (RF02 & RN05) */}
          <div className={`p-4 rounded-xl border transition-all ${
            minor 
              ? 'bg-amber-50/70 border-amber-300' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <HeartHandshake className={`w-4 h-4 ${minor ? 'text-amber-700' : 'text-slate-600'}`} />
                <span className={minor ? 'text-amber-900 font-bold' : 'text-slate-800'}>
                  3. Dados do Responsável Legal {minor ? '(Obrigatório - RN05)' : '(Opcional para maiores)'}
                </span>
              </div>
              {minor && (
                <span className="text-[11px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  Aluno Menor de 18 Anos
                </span>
              )}
            </div>

            {minor && (
              <p className="text-xs text-amber-800 mt-2 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Regra de Negócio RN05: Alunos com menos de 18 anos exigem responsável legal cadastrado.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="sm:col-span-2">
                <label htmlFor="guardian-name" className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Responsável {minor && '*'}
                </label>
                <input
                  id="guardian-name"
                  type="text"
                  required={minor}
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Ex: Roberto da Silva"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all bg-white ${
                    errors.guardianName ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-brand-500'
                  }`}
                />
                {errors.guardianName && <p className="text-xs text-rose-600 mt-1">{errors.guardianName}</p>}
              </div>

              <div>
                <label htmlFor="guardian-cpf" className="block text-xs font-semibold text-slate-700 mb-1">
                  CPF do Responsável {minor && '*'}
                </label>
                <input
                  id="guardian-cpf"
                  type="text"
                  required={minor}
                  value={guardianCpf}
                  onChange={(e) => setGuardianCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm font-mono transition-all bg-white ${
                    errors.guardianCpf ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-brand-500'
                  }`}
                />
                {errors.guardianCpf && <p className="text-xs text-rose-600 mt-1">{errors.guardianCpf}</p>}
              </div>

              <div>
                <label htmlFor="guardian-rel" className="block text-xs font-semibold text-slate-700 mb-1">
                  Grau de Parentesco
                </label>
                <select
                  id="guardian-rel"
                  value={guardianRelationship}
                  onChange={(e) => setGuardianRelationship(e.target.value as Guardian['relationship'])}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-brand-500 bg-white"
                >
                  <option value="Mãe">Mãe</option>
                  <option value="Pai">Pai</option>
                  <option value="Tutor Legal">Tutor Legal</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label htmlFor="guardian-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefone do Responsável {minor && '*'}
                </label>
                <input
                  id="guardian-phone"
                  type="text"
                  required={minor}
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(formatPhone(e.target.value))}
                  placeholder="(81) 99123-4567"
                  maxLength={15}
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all bg-white ${
                    errors.guardianPhone ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-brand-500'
                  }`}
                />
                {errors.guardianPhone && <p className="text-xs text-rose-600 mt-1">{errors.guardianPhone}</p>}
              </div>

              <div>
                <label htmlFor="guardian-email" className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail do Responsável
                </label>
                <input
                  id="guardian-email"
                  type="email"
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  placeholder="responsavel@email.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-brand-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Observações / LGPD */}
          <div>
            <label htmlFor="student-notes" className="block text-xs font-semibold text-slate-700 mb-1">
              Observações Médicas / Pedagógicas (Opcional)
            </label>
            <textarea
              id="student-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alergias, necessidades educacionais especiais ou observações gerais..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-brand-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              🔐 Seus dados estão protegidos de acordo com as normas da LGPD (RNF07).
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{studentToEdit ? 'Salvar Alterações' : 'Concluir Cadastro de Aluno'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
