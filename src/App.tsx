
import React, { useEffect, useState } from 'react';
import { MaintenanceUnit, Role, Tool, WarehouseItem, Organization } from './types';
import { sheetService } from './services/sheetService';
import UnitCard from './components/UnitCard';
import UnitModal from './components/UnitModal';
import CreateUnitModal from './components/CreateUnitModal';
import AdminSettingsModal from './components/AdminSettingsModal';
import WarehouseModal from './components/WarehouseModal';
import LoginScreen from './components/LoginScreen';
import GeneralDashboard from './components/GeneralDashboard';
import { Settings, MapPin, Plus, LogOut, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  
  const [units, setUnits] = useState<MaintenanceUnit[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [warehouse, setWarehouse] = useState<WarehouseItem[]>([]);
  const [availableCampuses, setAvailableCampuses] = useState<string[]>([]);
  
  const [showGlobalDashboard, setShowGlobalDashboard] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Modals
  const [selectedUnit, setSelectedUnit] = useState<MaintenanceUnit | null>(null);
  const [isCreateUnitOpen, setIsCreateUnitOpen] = useState(false);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);

  // Filters
  const [selectedCampus, setSelectedCampus] = useState<string>('TODAS');

  useEffect(() => {
    if (currentOrg) {
      loadOrgData();
    }
  }, [currentOrg]);

  const loadOrgData = () => {
    const orgId = currentOrg!.id;
    setUnits(sheetService.getUnits(orgId));
    setAvailableCampuses(sheetService.getCampuses(orgId));
    setTools(sheetService.getTools(orgId));
    setWarehouse(sheetService.getWarehouse(orgId));
  };

  const handleLogin = (org: Organization, role: Role) => {
    setCurrentOrg(org);
    setRole(role);
  };

  const handleLogout = () => {
    setCurrentOrg(null);
    setRole(null);
  };

  const handleSaveUnit = (unit: MaintenanceUnit) => {
    const updated = { ...unit, lastUpdated: new Date().toISOString() };
    const newUnits = units.map(u => u.id === unit.id ? updated : u);
    sheetService.saveUnits(currentOrg!.id, newUnits);
    setUnits(newUnits);
    setSelectedUnit(null);
  };

  const handleCreateUnit = (unit: MaintenanceUnit) => {
    const newUnits = [{ ...unit, orgId: currentOrg!.id }, ...units];
    sheetService.saveUnits(currentOrg!.id, newUnits);
    setUnits(newUnits);
    setIsCreateUnitOpen(false);
  };

  // Fixed: syncOrgWithCloud expects 0 arguments as per its definition in sheetService.ts
  const handleSync = async () => {
    setSyncing(true);
    await sheetService.syncOrgWithCloud();
    setSyncing(false);
  };

  if (!currentOrg || !role) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const filteredUnits = units
    .filter(u => selectedCampus === 'TODAS' || u.campus === selectedCampus);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-black text-white px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-xl border-b border-white/10">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-lg">
             <img src="https://i.ibb.co/4QC1Xxx/LOGO-Colegio-Boston-Internacionall.png" alt="Logo" className="max-h-full" />
           </div>
           <div>
             <h1 className="font-black text-sm uppercase tracking-tighter leading-none">{currentOrg.name}</h1>
             <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{currentOrg.plan} PLAN</span>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <button onClick={handleSync} className={`p-2 hover:bg-white/10 rounded-full transition ${syncing ? 'animate-spin' : ''}`}>
             <RefreshCw size={20} />
           </button>
           <button onClick={() => setIsAdminSettingsOpen(true)} className="p-2 hover:bg-white/10 rounded-full">
             <Settings size={20} />
           </button>
           <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full">
             <LogOut size={20} />
           </button>
        </div>
      </header>

      <nav className="bg-white border-b px-6 py-2 flex gap-8 shadow-sm overflow-x-auto">
        <button onClick={() => setShowGlobalDashboard(false)} className={`py-3 px-1 border-b-2 font-black text-xs uppercase tracking-widest transition ${!showGlobalDashboard ? 'border-black text-black' : 'border-transparent text-gray-400'}`}>UNIDADES</button>
        <button onClick={() => setShowGlobalDashboard(true)} className={`py-3 px-1 border-b-2 font-black text-xs uppercase tracking-widest transition ${showGlobalDashboard ? 'border-black text-black' : 'border-transparent text-gray-400'}`}>DASHBOARD</button>
        <button onClick={() => setIsWarehouseOpen(true)} className="py-3 px-1 border-b-2 border-transparent font-black text-xs uppercase tracking-widest text-gray-400 hover:text-black">ALMACÉN</button>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {showGlobalDashboard ? (
          <GeneralDashboard units={units} tools={tools} warehouse={warehouse} campuses={availableCampuses} />
        ) : (
          <div className="space-y-8">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Inventario de Espacios</h2>
                  <p className="text-gray-500 text-sm">Control total sobre {units.length} unidades registradas.</p>
                </div>
                
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                   <div className="flex items-center gap-2 bg-white border px-4 py-2 rounded-2xl shadow-sm">
                      <MapPin size={16} className="text-gray-400" />
                      <select value={selectedCampus} onChange={(e) => setSelectedCampus(e.target.value)} className="bg-transparent text-sm font-bold focus:outline-none">
                         {['TODAS', ...availableCampuses].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <button onClick={() => setIsCreateUnitOpen(true)} className="flex-1 md:flex-none bg-black text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition shadow-lg active:scale-95">
                      <Plus size={18} /> Nueva Unidad
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {filteredUnits.map(unit => (
                 <UnitCard key={unit.id} unit={unit} onClick={() => setSelectedUnit(unit)} />
               ))}
             </div>
          </div>
        )}
      </main>

      {selectedUnit && (
        <UnitModal unit={selectedUnit} role={role} isOpen={true} onClose={() => setSelectedUnit(null)} onSave={handleSaveUnit} warehouse={warehouse} />
      )}
      {isWarehouseOpen && <WarehouseModal isOpen={true} onClose={loadOrgData} />}
      {isAdminSettingsOpen && <AdminSettingsModal isOpen={true} onClose={() => setIsAdminSettingsOpen(false)} />}
      {isCreateUnitOpen && <CreateUnitModal isOpen={true} campuses={availableCampuses} onClose={() => setIsCreateUnitOpen(false)} onSave={handleCreateUnit} />}
    </div>
  );
};

export default App;
