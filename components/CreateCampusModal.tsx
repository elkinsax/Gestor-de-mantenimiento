import React, { useState } from 'react';
import { X, Building } from 'lucide-react';

interface CreateCampusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

const CreateCampusModal: React.FC<CreateCampusModalProps> = ({ isOpen, onClose, onSave }) => {
  const [campusName, setCampusName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (campusName.trim()) {
      onSave(campusName.trim());
      setCampusName('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-2 rounded-lg">
                <Building size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Crear Nueva Sede</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Sede
            </label>
            <input
              type="text"
              required
              autoFocus
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
              placeholder="Ej: Sede Norte, Edificio Principal..."
              value={campusName}
              onChange={(e) => setCampusName(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!campusName.trim()}
              className="px-6 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar Sede
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampusModal;