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
      name,
      campus,
      type,
      description,
      status: Status.OPERATIVE, // Default
      images: [], // Start empty
      inventory: [],
      requests: [],
      // Critical for Smart Merge: Use full ISO string, not just date
      lastUpdated: new Date().toISOString()
    };

    onSave(newUnit);
    
    // Reset form
    setName('');
    setType('Aula');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-2">
            <div className="bg-black text-white p-2 rounded-lg">
                <Layout size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Crear Unidad de Mantenimiento</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sede</label>
                <select
                required
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-black outline-none"
                >
                {campuses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Espacio</label>
                <select
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-black outline-none"
                >
                <option value="Aula">Aula de Clases</option>
                <option value="Laboratorio">Laboratorio</option>
                <option value="Baño">Baño</option>
                <option value="Pasillo">Pasillo / Común</option>
                <option value="Oficina">Oficina</option>
                <option value="Auditorio">Auditorio</option>
                <option value="Bodega">Bodega / Almacén</option>
                </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Unidad</label>
            <input
              type="text"
              required
              placeholder="Ej: Salón 304, Baños Norte..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Inicial</label>
            <textarea
              rows={3}
              placeholder="Estado general, observaciones iniciales..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none resize-none"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded text-xs text-gray-500">
            * La unidad se creará con estado <strong>Operativo</strong> por defecto. Podrás agregar fotos e inventario después de crearla.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg shadow-sm transition"
            >
              Crear Unidad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUnitModal;