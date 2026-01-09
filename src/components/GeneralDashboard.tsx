
import React from 'react';
import { MaintenanceUnit, Tool, WarehouseItem, Status } from '../types';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Wrench, 
  Building,
  TrendingUp,
  Package,
  ShieldCheck
} from 'lucide-react';

interface GeneralDashboardProps {
  units: MaintenanceUnit[];
  tools: Tool[];
  warehouse: WarehouseItem[];
  campuses: string[];
}

const GeneralDashboard: React.FC<GeneralDashboardProps> = ({ units, tools, warehouse, campuses }) => {
  
  // Cálculos de Unidades
  const totalUnits = units.length;
  const operative = units.filter(u => u.status === Status.OPERATIVE).length;
  const prevention = units.filter(u => u.status === Status.PREVENTION).length;
  const repair = units.filter(u => u.status === Status.REPAIR).length;
  const requests = units.filter(u => u.status === Status.REQUEST).length;

  const healthPercentage = totalUnits > 0 ? Math.round((operative / totalUnits) * 100) : 0;

  // Cálculos de Herramientas
  const totalTools = tools.length;
  const toolsAvailable = tools.filter(t => t.status === 'AVAILABLE').length;
  const toolsInUse = tools.filter(t => t.status === 'IN_USE').length;

  // Alertas de Inventario
  const lowStockItems = warehouse.filter(w => w.quantity < 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      
      {/* Header del Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
            <Activity className="text-blue-600" size={32} />
            Dashboard Global
          </h2>
          <p className="text-gray-500 text-sm font-medium">Estado situacional de la infraestructura institucional.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Datos en Tiempo Real</span>
        </div>
      </div>

      {/* Grid Principal de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Salud de Infraestructura */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ShieldCheck size={80} />
          </div>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Salud del Plantel</p>
          <div className="flex items-end gap-2">
            <h3 className="text-4xl font-black text-gray-900">{healthPercentage}%</h3>
            <TrendingUp size={20} className="text-green-500 mb-2" />
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${healthPercentage}%` }}></div>
          </div>
          <p className="text-[10px] text-gray-400 mt-3 font-bold uppercase">{operative} de {totalUnits} unidades operativas</p>
        </div>

        {/* Alertas Críticas */}
        <div className="bg-red-600 p-6 rounded-[2rem] shadow-xl text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:rotate-12 transition-transform">
            <AlertTriangle size={80} />
          </div>
          <p className="text-red-200 text-[10px] font-black uppercase tracking-widest mb-1">Atención Urgente</p>
          <h3 className="text-4xl font-black">{repair}</h3>
          <p className="text-sm font-medium mt-1">Unidades en reparación</p>
          <div className="mt-4 flex gap-2">
            <span className="bg-white/20 px-2 py-1 rounded-lg text-[10px] font-black uppercase">{requests} Solicitudes</span>
            <span className="bg-white/20 px-2 py-1 rounded-lg text-[10px] font-black uppercase">{prevention} Prevención</span>
          </div>
        </div>

        {/* Herramientas */}
        <div className="bg-gray-900 p-6 rounded-[2rem] shadow-sm text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Wrench size={80} />
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Equipamiento</p>
          <h3 className="text-4xl font-black">{totalTools}</h3>
          <div className="mt-4 grid grid-cols-2 gap-2">
             <div className="bg-white/5 p-2 rounded-xl">
                <p className="text-[8px] text-gray-500 uppercase font-black">En Uso</p>
                <p className="text-orange-400 font-bold">{toolsInUse}</p>
             </div>
             <div className="bg-white/5 p-2 rounded-xl">
                <p className="text-[8px] text-gray-500 uppercase font-black">Disponibles</p>
                <p className="text-green-400 font-bold">{toolsAvailable}</p>
             </div>
          </div>
        </div>

        {/* Inventario */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Package size={80} />
          </div>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Stock de Almacén</p>
          <h3 className="text-4xl font-black text-gray-900">{warehouse.length}</h3>
          <p className="text-sm font-bold text-red-500 mt-1 flex items-center gap-1">
             <AlertTriangle size={14} /> {lowStockItems.length} items en bajo stock
          </p>
          <button className="mt-4 text-[10px] font-black uppercase text-blue-600 hover:underline">Ver Almacén →</button>
        </div>
      </div>

      {/* Grid Secundario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Distribución por Sede */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-8">
              <h4 className="font-black text-gray-900 uppercase tracking-tighter text-lg flex items-center gap-2">
                <Building size={20} className="text-gray-400" />
                Carga de Trabajo por Sede
              </h4>
           </div>
           
           <div className="space-y-6">
              {campuses.map(campus => {
                const campusUnits = units.filter(u => u.campus === campus);
                const critical = campusUnits.filter(u => u.status === Status.REPAIR || u.status === Status.REQUEST).length;
                const percentage = campusUnits.length > 0 ? (critical / campusUnits.length) * 100 : 0;
                
                return (
                  <div key={campus} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-sm font-bold text-gray-900">{campus}</span>
                        <span className="text-[10px] text-gray-400 ml-2 uppercase font-black">{campusUnits.length} UNIDADES TOTALES</span>
                      </div>
                      <span className="text-[10px] font-black text-red-500 uppercase">{critical} Críticas</span>
                    </div>
                    <div className="w-full bg-gray-50 h-4 rounded-xl overflow-hidden flex border">
                       <div className="bg-red-500 h-full transition-all duration-700" style={{ width: `${percentage}%` }}></div>
                       <div className="bg-blue-500/20 h-full flex-1"></div>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>

        {/* Alertas de Materiales Recientes */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
           <h4 className="font-black text-gray-900 uppercase tracking-tighter text-lg mb-6">Insumos Críticos</h4>
           <div className="space-y-4">
              {lowStockItems.length > 0 ? (
                lowStockItems.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-red-200 transition">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                           <Package size={18} />
                        </div>
                        <div>
                           <p className="text-xs font-bold text-gray-900">{item.name}</p>
                           <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{item.category}</p>
                        </div>
                     </div>
                     <span className="text-red-600 font-black text-lg">{item.quantity}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                   <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} />
                   </div>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Stock Completo</p>
                </div>
              )}
           </div>
           {lowStockItems.length > 5 && (
             <p className="text-center mt-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
               + {lowStockItems.length - 5} items adicionales
             </p>
           )}
        </div>

      </div>
    </div>
  );
};

export default GeneralDashboard;
