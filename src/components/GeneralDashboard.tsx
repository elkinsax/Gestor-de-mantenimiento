import React from 'react';
import { MaintenanceUnit, Tool, WarehouseItem, Status } from '../types';
import { PieChart, Activity, AlertTriangle, CheckCircle, Clock, Wrench, Package, Building } from 'lucide-react';

interface GeneralDashboardProps {
  units: MaintenanceUnit[];
  tools: Tool[];
  warehouse: WarehouseItem[];
  campuses: string[];
}

const GeneralDashboard: React.FC<GeneralDashboardProps> = ({ units, tools, warehouse, campuses }) => {
  
  // Calculations
  const totalUnits = units.length;
  const operative = units.filter(u => u.status === Status.OPERATIVE).length;
  const prevention = units.filter(u => u.status === Status.PREVENTION).length;
  const repair = units.filter(u => u.status === Status.REPAIR).length;
  const requests = units.filter(u => u.status === Status.REQUEST).length;

  const totalTools = tools.length;
  const toolsInUse = tools.filter(t => t.status === 'IN_USE').length;
  const toolsBroken = tools.filter(t => t.status === 'BROKEN').length;

  const lowStockItems = warehouse.filter(w => w.quantity < 3);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="text-black" />
        <h2 className="text-xl font-bold text-gray-900">Dashboard Global</h2>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1.5 bg-blue-600"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Unidades Operativas</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{operative}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <CheckCircle size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">{Math.round((operative / (totalUnits || 1)) * 100)}% del total</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1.5 bg-orange-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">En Prevención</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{prevention}</h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Mantenimiento preventivo</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1.5 bg-red-600"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">En Reparación</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{repair}</h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-xs text-red-400 mt-3">Atención Prioritaria</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1.5 bg-purple-600"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Solicitudes Nuevas</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{requests}</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Activity size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Reportadas vía QR</p>
        </div>

      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Resource Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Wrench size={18} className="text-gray-500" />
                Resumen de Herramientas
            </h4>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Inventario</span>
                    <span className="font-bold">{totalTools}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex">
                    <div className="bg-green-500 h-2" style={{width: `${((totalTools - toolsInUse - toolsBroken)/totalTools)*100}%`}}></div>
                    <div className="bg-orange-500 h-2" style={{width: `${(toolsInUse/totalTools)*100}%`}}></div>
                    <div className="bg-red-500 h-2" style={{width: `${(toolsBroken/totalTools)*100}%`}}></div>
                </div>
                <div className="flex gap-4 text-xs text-gray-500 justify-center">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Disp.</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> En Uso</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Averiada</span>
                </div>
            </div>
        </div>

        {/* Alerts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-500" />
                Alertas de Almacén
            </h4>
            {lowStockItems.length > 0 ? (
                <ul className="space-y-3">
                    {lowStockItems.slice(0, 4).map(item => (
                        <li key={item.id} className="flex justify-between items-center bg-red-50 p-2 rounded text-sm">
                            <span className="text-red-800 font-medium">{item.name}</span>
                            <span className="bg-white px-2 py-0.5 rounded text-red-600 text-xs font-bold border border-red-100">
                                Queda: {item.quantity}
                            </span>
                        </li>
                    ))}
                    {lowStockItems.length > 4 && (
                        <li className="text-xs text-center text-gray-500 pt-2">
                            + {lowStockItems.length - 4} items más con bajo stock
                        </li>
                    )}
                </ul>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 pb-4">
                    <CheckCircle size={32} className="mb-2 text-green-100" />
                    <span className="text-sm">Stock saludable</span>
                </div>
            )}
        </div>

        {/* Campuses Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Building size={18} className="text-gray-500" />
                Distribución por Sede
            </h4>
            <div className="space-y-2 overflow-y-auto max-h-40 pr-2">
                {campuses.map(campus => {
                    const count = units.filter(u => u.campus === campus).length;
                    return (
                        <div key={campus} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded cursor-default">
                            <span className="text-gray-700 truncate max-w-[70%]">{campus}</span>
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{count} Unidades</span>
                        </div>
                    );
                })}
            </div>
        </div>

      </div>
    </div>
  );
};

export default GeneralDashboard;