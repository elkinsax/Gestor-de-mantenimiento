
import React, { useState } from 'react';
import { MaintenanceUnit, Status } from '../types';
import { X, Layout } from 'lucide-react';

interface CreateUnitModalProps {
  isOpen: boolean;
  campuses: string[];
  onClose: () => void;
  onSave: (unit: MaintenanceUnit) => void;
}

const CreateUnitModal: React.FC<CreateUnitModalProps> = ({ isOpen, campuses, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [campus, setCampus] = useState(campuses[0] || '');
  const [type, setType] = useState('Aula');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUnit: MaintenanceUnit = {
      id: Date.now().toString(),
      orgId: '',
      name,
      campus,
      type,
      description,
      status: Status.OPERATIVE,
      images: [],
      inventory: [],
      requests: [],
      lastUpdated: new Date().toISOString()
    };
    onSave(newUnit);
    setName('');
    setType('Aula');
    setDescription('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 cursor-default"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-2">
            <div className="bg-black text-white p-2 rounded-lg">
                <Layout size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tighter">Nueva Unidad</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Sede</label>
                <select required value={campus} onChange={(e) => setCampus(e.target.value)} className="w-full border rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-black">
                    {campuses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Tipo</label>
                <select required value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-black">
                    <option value="Aula">Aula</option>
                    <option value="Laboratorio">Laboratorio</option>
                    <option value="Baño">Baño</option>
                    <option value="Pasillo">Pasillo</option>
                    <option value="Auditorio">Auditorio</option>
                </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Nombre</label>
            <input type="text" required placeholder="Ej: Salón 304" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg p-3 outline-none focus:ring-1 focus:ring-black" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Descripción</label>
            <textarea rows={3} placeholder="Estado inicial..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg p-3 outline-none focus:ring-1 focus:ring-black resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 uppercase tracking-widest">Cancelar</button>
            <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-lg shadow-sm transition uppercase tracking-widest">Crear Unidad</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUnitModal;
