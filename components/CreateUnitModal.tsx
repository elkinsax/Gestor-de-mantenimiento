import React, { useState } from 'react';
import { X, Save, Layout, MapPin } from 'lucide-react';
import { MaintenanceUnit, Status } from '../types';

interface Props {
  isOpen: boolean;
  campuses: string[];
  onClose: () => void;
  onSave: (unit: MaintenanceUnit) => void;
}

const CreateUnitModal: React.FC<Props> = ({ isOpen, campuses, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [campus, setCampus] = useState(campuses[0] || '');
  const [type, setType] = useState('Aula');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const unit: MaintenanceUnit = {
      id: Date.now().toString(),
      name,
      campus,
      type,
      description: 'Unidad recién creada. Sin observaciones.',
      status: Status.OPERATIVE,
      images: [],
      inventory: [],
      requests: [],
      lastUpdated: new Date().toISOString()
    };
    onSave(unit);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl space-y-8 animate-in zoom-in duration-300">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Crear Unidad</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Nombre del Espacio</label>
              <input required className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-black" placeholder="Ej: Laboratorio de Física" value={name} onChange={e => setName(e.target.value)} />
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Sede</label>
                <select className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none" value={campus} onChange={e => setCampus(e.target.value)}>
                  {campuses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Tipo</label>
                <select className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none" value={type} onChange={e => setType(e.target.value)}>
                   <option>Aula</option>
                   <option>Laboratorio</option>
                   <option>Baño</option>
                   <option>Auditorio</option>
                   <option>Oficina</option>
                </select>
              </div>
           </div>

           <button type="submit" className="w-full py-5 bg-black text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2">
             <Save size={18} /> Registrar Unidad
           </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUnitModal;