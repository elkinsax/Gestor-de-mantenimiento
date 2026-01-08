import React from 'react';
import { MaintenanceUnit, Tool, WarehouseItem, Status } from '../types';
import { Activity, ShieldCheck, AlertCircle, Clock, Wrench } from 'lucide-react';

interface Props {
  units: MaintenanceUnit[];
  tools: Tool[];
  warehouse: WarehouseItem[];
  campuses: string[];
}

const GeneralDashboard: React.FC<Props> = ({ units, tools, warehouse }) => {
  const stats = {
    total: units.length,
    operative: units.filter(u => u.status === Status.OPERATIVE).length,
    repair: units.filter(u => u.status === Status.REPAIR).length,
    prevention: units.filter(u => u.status === Status.PREVENTION).length,
    request: units.filter(u => u.status === Status.REQUEST).length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10"><ShieldCheck size={60} className="text-blue-600"/></div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Operativos</span>
          <span className="text-4xl font-black text-blue-600">{stats.operative}</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-10"><Clock size={60} className="text-orange-600"/></div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">En Prevención</span>
          <span className="text-4xl font-black text-orange-500">{stats.prevention}</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10"><AlertCircle size={60} className="text-red-600"/></div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">En Reparación</span>
          <span className="text-4xl font-black text-red-600">{stats.repair}</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10"><Activity size={60} className="text-purple-600"/></div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Solicitudes</span>
          <span className="text-4xl font-black text-purple-600">{stats.request}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black text-white p-6 rounded-3xl">
          <h4 className="flex items-center gap-2 font-black uppercase text-xs tracking-widest mb-4">
            <Wrench size={16} /> Estado Herramientas
          </h4>
          <div className="space-y-3">
             <div className="flex justify-between items-center text-sm">
                <span>Disponibles</span>
                <span className="font-black text-green-400">{tools.filter(t => t.status === 'AVAILABLE').length}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span>En Uso</span>
                <span className="font-black text-orange-400">{tools.filter(t => t.status === 'IN_USE').length}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span>Averiadas</span>
                <span className="font-black text-red-400">{tools.filter(t => t.status === 'BROKEN').length}</span>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <h4 className="flex items-center gap-2 font-black uppercase text-xs tracking-widest mb-4 text-gray-400">
            <Activity size={16} /> Alertas de Almacén
          </h4>
          {warehouse.filter(w => w.quantity < 5).length > 0 ? (
            <div className="space-y-2">
              {warehouse.filter(w => w.quantity < 5).map(item => (
                <div key={item.id} className="flex justify-between items-center bg-red-50 p-2 rounded-xl text-red-700 text-xs font-bold">
                  <span>{item.name}</span>
                  <span>Queda: {item.quantity} {item.unit}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-300 text-xs italic">No hay alertas de stock bajo.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralDashboard;