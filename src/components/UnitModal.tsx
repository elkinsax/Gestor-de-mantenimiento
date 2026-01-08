import React from 'react';
import { MaintenanceUnit, Role, Status } from '../types';
import Carousel from './Carousel';
import { X, Save } from 'lucide-react';

interface UnitModalProps {
  unit: MaintenanceUnit;
  role: Role;
  isOpen: boolean;
  onClose: () => void;
  onSave: (unit: MaintenanceUnit) => void;
}

const UnitModal: React.FC<UnitModalProps> = ({ unit, role, isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{unit.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
           <Carousel images={unit.images} heightClass="h-64 rounded-lg" />
           <div className="mt-6 space-y-4">
              <p className="text-sm text-gray-600">{unit.description}</p>
              <div className="pt-4 border-t">
                 <span className="text-xs font-bold text-gray-400 uppercase">Estado: {unit.status}</span>
              </div>
           </div>
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-end">
           <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default UnitModal;