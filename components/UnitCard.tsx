import React from 'react';
import { MaintenanceUnit, Status } from '../types';
import { MapPin, ArrowRight } from 'lucide-react';

interface Props {
  unit: MaintenanceUnit;
  onClick: () => void;
}

const UnitCard: React.FC<Props> = ({ unit, onClick }) => {
  const getStatusStyle = (s: Status) => {
    switch (s) {
      case Status.OPERATIVE: return 'bg-blue-600 text-white';
      case Status.PREVENTION: return 'bg-orange-500 text-white';
      case Status.REPAIR: return 'bg-red-600 text-white';
      case Status.REQUEST: return 'bg-purple-600 text-white';
    }
  };

  const getStatusText = (s: Status) => {
    switch (s) {
      case Status.OPERATIVE: return 'Operativo';
      case Status.PREVENTION: return 'Prevención';
      case Status.REPAIR: return 'Reparación';
      case Status.REQUEST: return 'Solicitud';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
      <div className="h-44 relative overflow-hidden">
        <img src={unit.images[0] || 'https://images.unsplash.com/photo-1590341328520-63256eb32bc3?w=800'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg ${getStatusStyle(unit.status)}`}>
          {getStatusText(unit.status)}
        </div>
      </div>
      <div className="p-5 space-y-3">
        <div>
          <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">
            <MapPin size={12} /> {unit.campus}
          </div>
          <h3 className="font-black text-lg text-gray-900 leading-tight">{unit.name}</h3>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2">{unit.description}</p>
        <button 
          onClick={onClick}
          className="w-full py-3 bg-gray-50 text-black border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-black group-hover:text-white transition-colors"
        >
          Gestionar <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default UnitCard;