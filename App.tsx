import React, { useState, useEffect } from 'react';
import { MaintenanceUnit, Tool, WarehouseItem, Role, Status } from './types';
import { sheetService } from './services/sheetService';
import UnitCard from './components/UnitCard';
import UnitModal from './components/UnitModal';
import GeneralDashboard from './components/GeneralDashboard';
import WarehouseModal from './components/WarehouseModal';
import AdminSettingsModal from './components/AdminSettingsModal';
import CreateUnitModal from './components/CreateUnitModal';
import { LayoutGrid, Package, Settings, Plus, RefreshCw, Search } from 'lucide-react';

const App: React.FC = () => {
  const [units, setUnits] = useState<MaintenanceUnit[]>([]);
  const [campuses, setCampuses] = useState<string[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [warehouse, setWarehouse] = useState<WarehouseItem[]>([]);
  
  const [activeView, setActiveView] = useState<'dashboard' | 'units'>('dashboard');
  const [selectedUnit, setSelectedUnit] = useState<MaintenanceUnit | null>(null);
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<Role>('ADMIN');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    setUnits(sheetService.getUnits());
    setCampuses(sheetService.getCampuses());
    setTools(sheetService.getTools());
    setWarehouse(sheetService.getWarehouse());
  };

  const handleSaveUnit = (updatedUnit: MaintenanceUnit) => {
    const newUnits = units.map(u => u.id === updatedUnit.id ? updatedUnit : u);
    sheetService.saveUnits(newUnits);
    setUnits(newUnits);
    setSelectedUnit(null);
  };

  const handleCreateUnit = (newUnit: MaintenanceUnit) => {
    const newUnits = [newUnit, ...units];
    sheetService.saveUnits(newUnits);
    setUnits(newUnits);
    setIsCreateOpen(false);
  };

  const filteredUnits = units.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.campus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-black text-white px-4 py-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
            <img src="https://i.ibb.co/4QC1Xxx/LOGO-Colegio-Boston-Internacionall.png" alt="Logo" className="max-h-full p-1" />
          </div>
          <div>
            <h1 className="font-black text-sm uppercase tracking-tighter leading-none">Mantenimiento Pro</h1>
            <span className="text-[10px] text-gray-400">Colegio Interno</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-gray-800 rounded-full">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Navigation (Desktop) */}
      <nav className="hidden md:flex bg-white border-b px-6 py-2 gap-8 items-center">
        <button 
          onClick={() => setActiveView('dashboard')}
          className={`py-2 px-1 border-b-2 font-bold text-sm transition ${activeView === 'dashboard' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
        >
          DASHBOARD
        </button>
        <button 
          onClick={() => setActiveView('units')}
          className={`py-2 px-1 border-b-2 font-bold text-sm transition ${activeView === 'units' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
        >
          UNIDADES
        </button>
        <button onClick={() => setIsWarehouseOpen(true)} className="text-gray-400 font-bold text-sm hover:text-black">
          ALMACÉN
        </button>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        {activeView === 'dashboard' ? (
          <GeneralDashboard units={units} tools={tools} warehouse={warehouse} campuses={campuses} />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar unidad o sede..." 
                  className="w-full pl-10 pr-4 py-2 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setIsCreateOpen(true)}
                className="w-full md:w-auto bg-black text-white px-6 py-2 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-gray-800"
              >
                <Plus size={20} /> Nueva Unidad
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUnits.map(unit => (
                <UnitCard key={unit.id} unit={unit} onClick={() => setSelectedUnit(unit)} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 z-40">
        <button onClick={() => setActiveView('dashboard')} className={`p-2 flex flex-col items-center ${activeView === 'dashboard' ? 'text-black' : 'text-gray-400'}`}>
          <LayoutGrid size={24} />
          <span className="text-[10px] font-bold">Inicio</span>
        </button>
        <button onClick={() => setActiveView('units')} className={`p-2 flex flex-col items-center ${activeView === 'units' ? 'text-black' : 'text-gray-400'}`}>
          <Search size={24} />
          <span className="text-[10px] font-bold">Unidades</span>
        </button>
        <button onClick={() => setIsWarehouseOpen(true)} className="p-2 flex flex-col items-center text-gray-400">
          <Package size={24} />
          <span className="text-[10px] font-bold">Almacén</span>
        </button>
      </div>

      {selectedUnit && (
        <UnitModal 
          unit={selectedUnit} 
          role={userRole} 
          isOpen={true} 
          onClose={() => setSelectedUnit(null)} 
          onSave={handleSaveUnit}
          warehouse={warehouse}
        />
      )}

      {isWarehouseOpen && (
        <WarehouseModal isOpen={true} onClose={() => { setIsWarehouseOpen(false); loadAllData(); }} />
      )}

      {isSettingsOpen && (
        <AdminSettingsModal isOpen={true} onClose={() => setIsSettingsOpen(false)} />
      )}

      {isCreateOpen && (
        <CreateUnitModal 
          isOpen={true} 
          campuses={campuses} 
          onClose={() => setIsCreateOpen(false)} 
          onSave={handleCreateUnit} 
        />
      )}
    </div>
  );
};

export default App;