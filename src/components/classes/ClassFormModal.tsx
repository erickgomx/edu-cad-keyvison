import React, { useState, useEffect } from 'react';
import { ClassRoom, ShiftType } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { X, BookOpen, Check } from 'lucide-react';

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  classToEdit?: ClassRoom | null;
}

export const ClassFormModal: React.FC<ClassFormModalProps> = ({
  isOpen,
  onClose,
  classToEdit
}) => {
  const { addClass, updateClass } = useSchool();

  const [name, setName] = useState('');
  const [academicYear, setAcademicYear] = useState('2026');
  const [shift, setShift] = useState<ShiftType>('Matutino');
  const [room, setRoom] = useState('');
  const [maxCapacity, setMaxCapacity] = useState<number>(30);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (classToEdit) {
      setName(classToEdit.name);
      setAcademicYear(classToEdit.academicYear);
      setShift(classToEdit.shift);
      setRoom(classToEdit.room);
      setMaxCapacity(classToEdit.maxCapacity);
      setDescription(classToEdit.description || '');
    } else {
      setName('');
      setAcademicYear('2026');
      setShift('Matutino');
      setRoom('');
      setMaxCapacity(30);
      setDescription('');
    }
    setErrors({});
  }, [classToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Nome da turma é obrigatório (Ex: 1º Ano A).';
    if (!academicYear.trim()) newErrors.academicYear = 'Ano letivo é obrigatório.';
    if (!room.trim()) newErrors.room = 'Sala/Local é obrigatório.';
    if (maxCapacity <= 0) newErrors.maxCapacity = 'A capacidade máxima deve ser maior que zero.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      name: name.trim(),
      academicYear: academicYear.trim(),
      shift,
      room: room.trim(),
      maxCapacity,
      description: description.trim()
    };

    if (classToEdit) {
      const res = updateClass(classToEdit.id, payload);
      if (res.success) onClose();
    } else {
      const res = addClass(payload);
      if (res.success) onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-600 rounded-lg text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">
                {classToEdit ? 'Editar Turma' : 'Cadastrar Nova Turma (RF03)'}
              </h2>
              <p className="text-xs text-slate-300">
                Defina ano letivo, turno, espaço físico e capacidade máxima
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="class-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Nome da Turma / Série *
            </label>
            <input
              id="class-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: 1º Ano A - Ensino Médio"
              className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all ${
                errors.name ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-brand-500'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="class-year" className="block text-xs font-semibold text-slate-700 mb-1">
                Ano Letivo *
              </label>
              <input
                id="class-year"
                type="text"
                required
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="Ex: 2026"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-brand-500"
              />
            </div>

            <div>
              <label htmlFor="class-shift" className="block text-xs font-semibold text-slate-700 mb-1">
                Turno *
              </label>
              <select
                id="class-shift"
                value={shift}
                onChange={(e) => setShift(e.target.value as ShiftType)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-brand-500 bg-white"
              >
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Noturno">Noturno</option>
                <option value="Integral">Integral</option>
              </select>
            </div>

            <div>
              <label htmlFor="class-room" className="block text-xs font-semibold text-slate-700 mb-1">
                Sala / Local de Aula *
              </label>
              <input
                id="class-room"
                type="text"
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Ex: Sala 102 - Bloco B"
                className={`w-full px-3.5 py-2 rounded-xl border text-sm transition-all ${
                  errors.room ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus:border-brand-500'
                }`}
              />
              {errors.room && <p className="text-xs text-rose-600 mt-1">{errors.room}</p>}
            </div>

            <div>
              <label htmlFor="class-cap" className="block text-xs font-semibold text-slate-700 mb-1">
                Capacidade Máxima de Alunos (RN03) *
              </label>
              <input
                id="class-cap"
                type="number"
                min={1}
                max={60}
                required
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-brand-500 font-mono"
              />
              {errors.maxCapacity && <p className="text-xs text-rose-600 mt-1">{errors.maxCapacity}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="class-desc" className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição / Observações da Turma
            </label>
            <textarea
              id="class-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Turma com foco em ciências exatas, laboratório às quintas..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-brand-500"
            />
          </div>

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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{classToEdit ? 'Atualizar Turma' : 'Salvar Turma (RF03)'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
