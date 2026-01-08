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
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full relative group">
      <div className={`absolute top-4 left-4 z-10 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider rounded shadow-md ${getStatusColor(unit.status)}`}>
        {getStatusLabel(unit.status)}
      </div>
      <div className="h-48">
        <Carousel images={unit.images} heightClass="h-full" />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] text-gray-400 uppercase font-bold">{unit.campus} • {unit.type}</span>
        <h3 className="font-bold text-gray-900 mt-1">{unit.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mt-2 flex-1">{unit.description}</p>
        <button onClick={onClick} className="mt-4 w-full py-2 bg-black text-white text-xs font-bold uppercase rounded hover:bg-gray-800 transition">
          Gestionar
        </button>
      </div>
    </div>
  );
};

export default UnitCard;