import React from 'react';
import { Enrollment, Student, ClassRoom } from '../../types';
import { 
  Printer, 
  X, 
  CheckCircle, 
  School, 
  QrCode, 
  ShieldCheck, 
  Download 
} from 'lucide-react';
import { calculateAge } from '../../utils/validators';

interface EnrollmentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    enrollment: Enrollment;
    student: Student;
    classRoom: ClassRoom;
  } | null;
}

export const EnrollmentReceiptModal: React.FC<EnrollmentReceiptModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen || !data) return null;

  const { enrollment, student, classRoom } = data;
  const age = calculateAge(student.birthDate);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 my-8 overflow-hidden">
        
        {/* Modal Top Actions (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 id="receipt-modal-title" className="font-semibold text-base">
              Comprovante Oficial de Matrícula (RF07)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Imprimir ou Salvar em PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Fechar comprovante"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Content */}
        <div className="p-8 sm:p-10 receipt-card bg-white text-slate-900">
          
          {/* Header Escola */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                  <School className="w-8 h-8 text-brand-400" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
                    EduCad - Colégio Integrado
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Credenciado pelo Conselho Estadual de Educação • Registro MEC 9482/2026
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Av. Rui Barbosa, 1420 - Graças, Recife - PE | CNPJ: 12.345.678/0001-90 | (81) 3456-7890
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {enrollment.status}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">Ano Letivo {classRoom.academicYear}</p>
              </div>
            </div>

            <div className="mt-4 bg-slate-100 p-3 rounded-lg flex flex-wrap items-center justify-between gap-2 border border-slate-200">
              <div className="text-xs">
                <span className="text-slate-500 font-medium">Código de Autenticação da Matrícula:</span>{' '}
                <span className="font-mono font-bold text-slate-900 text-sm tracking-wide">
                  {enrollment.code}
                </span>
              </div>
              <div className="text-xs text-slate-600">
                Data/Hora da Matrícula: <strong className="text-slate-800">{new Date(enrollment.enrolledAt).toLocaleString('pt-BR')}</strong>
              </div>
            </div>
          </div>

          {/* Dados do Aluno */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 mb-3">
              1. Identificação do Aluno
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="sm:col-span-2">
                <span className="block text-slate-500 text-[11px]">Nome Completo</span>
                <span className="font-bold text-slate-900 text-base">{student.name}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px]">Nº de Matrícula do Aluno</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{student.registrationNumber}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px]">CPF do Aluno</span>
                <span className="font-medium text-slate-800">{student.cpf}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px]">Data de Nascimento / Idade</span>
                <span className="font-medium text-slate-800">
                  {new Date(student.birthDate).toLocaleDateString('pt-BR')} ({age} anos)
                </span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px]">Telefone de Contato</span>
                <span className="font-medium text-slate-800">{student.phone}</span>
              </div>
              <div className="sm:col-span-3">
                <span className="block text-slate-500 text-[11px]">Endereço Residencial</span>
                <span className="font-medium text-slate-800">
                  {student.address.street}, {student.address.number}
                  {student.address.complement ? ` - ${student.address.complement}` : ''} - {student.address.neighborhood}, {student.address.city}/{student.address.state} - CEP: {student.address.zipCode}
                </span>
              </div>
            </div>
          </div>

          {/* Dados do Responsável (se houver ou se menor de idade) */}
          {student.guardian && (
            <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-1 mb-3">
                2. Responsável Legal Vinculado (RN05)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="block text-slate-500 text-[11px]">Nome do Responsável</span>
                  <span className="font-semibold text-slate-900">{student.guardian.name}</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-[11px]">CPF do Responsável</span>
                  <span className="font-medium text-slate-800">{student.guardian.cpf}</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-[11px]">Grau de Parentesco</span>
                  <span className="font-medium text-slate-800">{student.guardian.relationship}</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-[11px]">Telefone</span>
                  <span className="font-medium text-slate-800">{student.guardian.phone}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-slate-500 text-[11px]">E-mail</span>
                  <span className="font-medium text-slate-800">{student.guardian.email || 'Não informado'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Dados da Turma / Matrícula */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 mb-3">
              3. Dados da Turma e Enturmação (RF04)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-brand-50/60 rounded-xl border border-brand-100 text-xs sm:text-sm">
              <div>
                <span className="block text-slate-500 text-[11px]">Turma / Série</span>
                <span className="font-bold text-brand-900">{classRoom.name}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px]">Turno</span>
                <span className="font-semibold text-brand-900">{classRoom.shift}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px]">Espaço / Sala</span>
                <span className="font-semibold text-brand-900">{classRoom.room}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[11px]">Ano Letivo</span>
                <span className="font-bold text-brand-900">{classRoom.academicYear}</span>
              </div>
            </div>
          </div>

          {/* Autenticação & Assinaturas */}
          <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 border border-slate-300 rounded-lg bg-slate-50">
                <QrCode className="w-16 h-16 text-slate-800" />
              </div>
              <div className="text-[11px] text-slate-500 max-w-xs">
                <p className="font-medium text-slate-700">Autenticação Digital Verificável</p>
                <p>Acesse o portal da escola ou leia o QR Code com a câmera do celular para validar este comprovante com a chave {enrollment.code}.</p>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <div className="w-56 border-b border-slate-800 mb-1 mx-auto sm:ml-auto"></div>
              <p className="text-xs font-bold text-slate-900">Secretaria Escolar / Direção</p>
              <p className="text-[11px] text-slate-500">EduCad Escola Modelo</p>
            </div>
          </div>

          {/* LGPD Notice */}
          <div className="mt-8 text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3">
            Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018 - RNF07), os dados contidos neste comprovante destinam-se exclusivamente para fins acadêmicos e administrativos escolares.
          </div>

        </div>

        {/* Modal Bottom Actions (Hidden on Print) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Fechar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Imprimir / Gerar PDF
          </button>
        </div>

      </div>
    </div>
  );
};
