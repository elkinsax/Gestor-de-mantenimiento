import React, { useState } from 'react';
import { X, Building, Trash2, Edit2, Check, Plus, AlertCircle } from 'lucide-react';

interface ManageCampusesModalProps {
  isOpen: boolean;
  campuses: string[];
  onClose: () => void;
  onAdd: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
}

const ManageCampusesModal: React.FC<ManageCampusesModalProps> = ({ 
  isOpen, 
  campuses, 
  onClose, 
  onAdd, 
  onRename, 
  onDelete 
}) => {
  const [newCampusName, setNewCampusName] = useState('');
  const [editingCampus, setEditingCampus] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCampusName.trim()) {
      onAdd(newCampusName.trim());
      setNewCampusName('');
    }
  };

  const startEdit = (campus: string) => {
    setEditingCampus(campus);
    setEditValue(campus);
    setConfirmDelete(null);
  };

  const saveEdit = () => {
    if (editingCampus && editValue.trim() && editValue !== editingCampus) {
      onRename(editingCampus, editValue.trim());
    }
    setEditingCampus(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-2 rounded-lg">
                <Building size={20} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900">Gestionar Sedes</h2>
                <p className="text-xs text-gray-500">Crear, editar o eliminar sedes del colegio</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition">
            <X size={24} />
          </button>
        </div>

        {/* List of Campuses */}
        <div className="p-0 overflow-y-auto flex-1 bg-white">
          <ul className="divide-y divide-gray-100">
            {campuses.map((campus) => (
              <li key={campus} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                {editingCampus === campus ? (
                  <div className="flex-1 flex gap-2 items-center">
                    <input 
                      autoFocus
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-black outline-none"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                    <button onClick={saveEdit} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setEditingCampus(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {campus.charAt(0)}
                        </span>
                        <span className="font-medium text-gray-800">{campus}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {confirmDelete === campus ? (
                             <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                                <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded">¿Eliminar?</span>
                                <button 
                                    onClick={() => { onDelete(campus); setConfirmDelete(null); }}
                                    className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 shadow-sm"
                                    title="Confirmar eliminación"
                                >
                                    <Check size={14} />
                                </button>
                                <button 
                                    onClick={() => setConfirmDelete(null)}
                                    className="p-1.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                                >
                                    <X size={14} />
                                </button>
                             </div>
                        ) : (
                            <>
                                <button 
                                    onClick={() => startEdit(campus)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                                    title="Editar nombre"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => setConfirmDelete(campus)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                                    title="Eliminar sede"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
          
          {campuses.length === 0 && (
             <div className="p-8 text-center text-gray-400">
                <Building className="mx-auto w-10 h-10 opacity-20 mb-2" />
                <p>No hay sedes registradas.</p>
             </div>
          )}
        </div>

        {/* Footer Add Form */}
        <div className="p-5 border-t bg-gray-50">
           <form onSubmit={handleAdd} className="flex gap-2">
              <input 
                type="text"
                placeholder="Nombre nueva sede..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black outline-none text-sm"
                value={newCampusName}
                onChange={(e) => setNewCampusName(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={!newCampusName.trim()}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium transition"
              >
                <Plus size={16} />
                Agregar
              </button>
           </form>
           {confirmDelete && (
                <div className="mt-3 flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    <p>Advertencia: Eliminar una sede borrará también todas las unidades de mantenimiento asociadas a ella.</p>
                </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ManageCampusesModal;