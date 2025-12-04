import React from 'react';
import { MaintenanceUnit, Status } from '../types';
import Carousel from './Carousel';
import { Edit2, Package, AlertTriangle, Send } from 'lucide-react';

interface UnitCardProps {
  unit: MaintenanceUnit;
  onClick: () => void;
}

const UnitCard: React.FC<UnitCardProps> = ({ unit, onClick }) => {
  
  const getStatusColor = (s: Status) => {
    switch (s) {
      case Status.OPERATIVE: return 'bg-blue-600';
      case Status.PREVENTION: return 'bg-orange-500';
      case Status.REPAIR: return 'bg-red-600';
      case Status.REQUEST: return 'bg-purple-600';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (s: Status) => {
    switch (s) {
      case Status.OPERATIVE: return 'Operativo';
      case Status.PREVENTION: return 'Prevención';
      case Status.REPAIR: return 'Reparación';
      case Status.REQUEST: return 'Solicitud';
    }
  };

  return (
    <div className="group bg-white rounded-none md:rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full relative">
      
      {/* Status Badge - Floating */}
      <div className={`absolute top-4 left-4 z-10 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider rounded shadow-md ${getStatusColor(unit.status)}`}>
        {getStatusLabel(unit.status)}
      </div>

      <div className="h-64 md:h-72">
        <Carousel images={unit.images} heightClass="h-full" />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
            <div>
                 <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">{unit.campus} • {unit.type}</span>
                 <h3 className="text-lg font-bold text-gray-900 leading-tight mt-1 group-hover:text-blue-700 transition-colors">{unit.name}</h3>
            </div>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
          {unit.description || "Sin descripción disponible."}
        </p>
        
        <div className="border-t pt-4 mt-auto">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                    <Package size={14} />
                    <span>{unit.inventory.length} Items</span>
                </div>
                {unit.status === Status.REPAIR && (
                     <div className="flex items-center gap-1 text-red-600 font-medium">
                        <AlertTriangle size={14} />
                        <span>Atención Requerida</span>
                     </div>
                )}
                 {unit.status === Status.REQUEST && (
                     <div className="flex items-center gap-1 text-purple-600 font-medium">
                        <Send size={14} />
                        <span>Revisión Pendiente</span>
                     </div>
                )}
            </div>

            <button 
                onClick={onClick}
                className="w-full py-2.5 px-4 bg-white border border-black text-black text-sm font-medium uppercase tracking-wider hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
            >
                <Edit2 size={14} />
                Gestionar
            </button>
        </div>
      </div>
    </div>
  );
};

export default UnitCard;