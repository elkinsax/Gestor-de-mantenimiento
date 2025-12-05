import React, { useEffect, useState } from 'react';
import { MaintenanceUnit, Role, Status, Tool, WarehouseItem } from './types';
import { getUnits, updateUnit, getCampuses, addCampus, createUnit, renameCampus, deleteCampus, getTools, getWarehouse, fetchFromGoogleSheets, saveUnitToCloud, syncWithGoogleSheets, getApiConfig } from './services/sheetService';
import UnitCard from './components/UnitCard';
import UnitModal from './components/UnitModal';
import CreateUnitModal from './components/CreateUnitModal';
import ManageCampusesModal from './components/ManageCampusesModal';
import AdminSettingsModal from './components/AdminSettingsModal';
import WarehouseModal from './components/WarehouseModal';
import LoginScreen from './components/LoginScreen';
import GeneralDashboard from './components/GeneralDashboard';
import { Settings, Filter, MapPin, Plus, Building, Package, LayoutDashboard, ArrowLeft, LogOut, Cloud, CloudOff, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [units, setUnits] = useState<MaintenanceUnit[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [warehouse, setWarehouse] = useState<WarehouseItem[]>([]);
  const [availableCampuses, setAvailableCampuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Auth & View State
  const [role, setRole] = useState<Role | null>(null);
  const [showGlobalDashboard, setShowGlobalDashboard] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'disconnected' | 'syncing'>('disconnected');

  // Modals state
  const [selectedUnit, setSelectedUnit] = useState<MaintenanceUnit | null>(null);
  const [isManageCampusesOpen, setIsManageCampusesOpen] = useState(false);
  const [isCreateUnitOpen, setIsCreateUnitOpen] = useState(false);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);

  // Filter state
  const [filterStatus, setFilterStatus] = useState<Status | 'ALL'>('ALL');
  const [selectedCampus, setSelectedCampus] = useState<string>('TODAS');

  useEffect(() => {
    initialLoad();
    checkUrlParams();

    // Auto-polling: Check for cloud updates every 5 seconds (Near Real-time)
    const interval = setInterval(async () => {
        // Only poll if we have an API URL configured
        if (getApiConfig()) {
          const result = await fetchFromGoogleSheets();
          if (result.success) {
              setCloudStatus('connected');
              loadData(); 
          } else {
              setCloudStatus('disconnected');
          }
        }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const initialLoad = async () => {
    // 1. Load Local Data First (Instant)
    await loadData();
    
    // 2. Try to fetch from cloud immediately
    if (getApiConfig()) {
      setCloudStatus('syncing');
      const result = await fetchFromGoogleSheets();
      if (result.success) {
        setCloudStatus('connected');
        await loadData(); // Reload with merged data
      } else {
        setCloudStatus('disconnected');
      }
    }
  };

  const loadData = async () => {
    const [unitsData, campusesData, toolsData, warehouseData] = await Promise.all([
      getUnits(), 
      getCampuses(),
      getTools(),
      getWarehouse()
    ]);
    setUnits(unitsData);
    setAvailableCampuses(campusesData);
    setTools(toolsData);
    setWarehouse(warehouseData);
    if (loading) setLoading(false);
  };

  const checkUrlParams = async () => {
    const params = new URLSearchParams(window.location.search);
    const unitId = params.get('unitId');
    if (unitId) {
      await new Promise(r => setTimeout(r, 500));
      const unitsData = await getUnits();
      const found = unitsData.find(u => u.id === unitId);
      if (found) {
        setSelectedUnit(found);
        setRole('SOLICITOR');
      }
    }
  };

  const handleSaveUnit = async (unitToSave: MaintenanceUnit) => {
    setCloudStatus('syncing');
    const updatedUnit = { 
      ...unitToSave, 
      lastUpdated: new Date().toISOString() 
    };

    const newUnits = await updateUnit(updatedUnit);
    setUnits(newUnits);
    setSelectedUnit(null);
    
    // Auto-Sync
    await saveUnitToCloud(updatedUnit);
    setCloudStatus('connected');
  };

  // --- Campus Management Handlers ---

  const handleAddCampus = async (name: string) => {
    setCloudStatus('syncing');
    const newCampuses = await addCampus(name);
    setAvailableCampuses(newCampuses);
    await syncWithGoogleSheets();
    setCloudStatus('connected');
  };

  const handleRenameCampus = async (oldName: string, newName: string) => {
    setCloudStatus('syncing');
    const { campuses, units } = await renameCampus(oldName, newName);
    setAvailableCampuses(campuses);
    setUnits(units);
    if (selectedCampus === oldName) setSelectedCampus(newName);
    await syncWithGoogleSheets();
    setCloudStatus('connected');
  };

  const handleDeleteCampus = async (name: string) => {
    setCloudStatus('syncing');
    const { campuses, units } = await deleteCampus(name);
    setAvailableCampuses(campuses);
    setUnits(units);
    if (selectedCampus === name) setSelectedCampus('TODAS');
    await syncWithGoogleSheets();
    setCloudStatus('connected');
  };

  // --- Unit Management Handlers ---

  const handleCreateUnit = async (unitToCreate: MaintenanceUnit) => {
    setCloudStatus('syncing');
    const newUnit = {
       ...unitToCreate,
       lastUpdated: new Date().toISOString()
    };

    const newUnits = await createUnit(newUnit);
    setUnits(newUnits);
    setIsCreateUnitOpen(false);
    if (selectedCampus !== 'TODAS' && selectedCampus !== newUnit.campus) {
        setSelectedCampus(newUnit.campus);
    }
    await saveUnitToCloud(newUnit);
    setCloudStatus('connected');
  };

  const handleLogout = () => {
    setRole(null);
    setShowGlobalDashboard(false);
    window.history.pushState({}, document.title, window.location.pathname);
  };

  // Filter Logic
  const filterCampuses = ['TODAS', ...availableCampuses];
  const unitsInCampus = selectedCampus === 'TODAS' 
    ? units 
    : units.filter(u => u.campus === selectedCampus);
  const filteredUnits = unitsInCampus.filter(u => filterStatus === 'ALL' || u.status === filterStatus);

  // Stats
  const stats = {
    operative: unitsInCampus.filter(u => u.status === Status.OPERATIVE).length,
    prevention: unitsInCampus.filter(u => u.status === Status.PREVENTION).length,
    repair: unitsInCampus.filter(u => u.status === Status.REPAIR).length,
    request: unitsInCampus.filter(u => u.status === Status.REQUEST).length,
  };

  const canEditStructure = role === 'MAINTENANCE' || role === 'ADMIN';

  // --- RENDER ---

  if (!role) {
    return <LoginScreen onSelectRole={setRole} />;
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col font-sans">
      
      {/* Navigation Bar */}
      <nav className="bg-black text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-sm overflow-hidden flex items-center justify-center">
                  <img 
                    src="https://i.ibb.co/4QC1Xxx/LOGO-Colegio-Boston-Internacionall.png" 
                    alt="Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              <span className="font-bold text-lg tracking-tight hidden sm:block">GESTOR DE MANTENIMIENTO</span>
            </div>

            <div className="flex items-center gap-4">
               {/* Cloud Status Indicator */}
               <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-900 rounded-full border border-gray-800" title={cloudStatus === 'connected' ? "Sincronizado con la nube" : "Sin conexión a la nube"}>
                  {cloudStatus === 'syncing' && <RefreshCw size={14} className="text-yellow-400 animate-spin" />}
                  {cloudStatus === 'connected' && <Cloud size={14} className="text-green-400" />}
                  {cloudStatus === 'disconnected' && <CloudOff size={14} className="text-red-400" />}
                  <span className={`text-xs font-medium ${
                      cloudStatus === 'connected' ? 'text-green-400' : 
                      cloudStatus === 'syncing' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                      {cloudStatus === 'connected' ? 'En línea' : cloudStatus === 'syncing' ? 'Sync...' : 'Offline'}
                  </span>
               </div>

               {/* Global Dashboard Toggle */}
               {!showGlobalDashboard ? (
                 <button 
                   onClick={() => setShowGlobalDashboard(true)}
                   className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-full text-xs font-medium transition"
                 >
                   <LayoutDashboard size={14} /> Global
                 </button>
               ) : (
                 <button 
                   onClick={() => setShowGlobalDashboard(false)}
                   className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-3 py-1.5 rounded-full text-xs font-bold transition"
                 >
                   <ArrowLeft size={14} /> Volver a Sedes
                 </button>
               )}

               {role === 'ADMIN' && (
                 <button 
                  onClick={() => setIsAdminSettingsOpen(true)}
                  title="Configuración Admin" 
                  className="p-2 text-gray-300 hover:text-white transition hover:bg-gray-800 rounded-full"
                 >
                    <Settings size={18} />
                 </button>
               )}
               
               <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
                  <span className="text-xs text-gray-400 hidden md:block">
                    {role === 'MAINTENANCE' && 'Jefe'}
                    {role === 'TREASURY' && 'Tesorería'}
                    {role === 'ADMIN' && 'Admin'}
                    {role === 'SOLICITOR' && 'Solicitante'}
                    {role === 'VIEWER' && 'Visitante'}
                  </span>
                  <button onClick={handleLogout} title="Salir" className="p-2 text-red-400 hover:text-red-300 transition">
                      <LogOut size={18} />
                  </button>
               </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {showGlobalDashboard ? (
          <GeneralDashboard 
             units={units}
             tools={tools}
             warehouse={warehouse}
             campuses={availableCampuses}
          />
        ) : (
          <>
            {/* Standard Campus View */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-light text-gray-900">Gestión de Sedes</h1>
                        <p className="text-gray-500 mt-1 text-sm">Administra el estado, inventario y requerimientos de cada unidad.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-end">
                        
                        {canEditStructure && (
                            <div className="flex gap-2 flex-wrap">
                                <button 
                                    onClick={() => setIsManageCampusesOpen(true)}
                                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm"
                                >
                                    <Building size={16} />
                                    Sedes
                                </button>
                                <button 
                                    onClick={() => setIsWarehouseOpen(true)}
                                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm"
                                >
                                    <Package size={16} />
                                    Almacén
                                </button>
                                <button 
                                    onClick={() => setIsCreateUnitOpen(true)}
                                    className="bg-black hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm"
                                >
                                    <Plus size={16} />
                                    Nueva Unidad
                                </button>
                            </div>
                        )}

                        <div className="flex flex-col gap-1 w-full md:w-auto">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <MapPin size={12} />
                                Filtrar por Sede
                            </label>
                            <div className="relative">
                                <select 
                                    value={selectedCampus}
                                    onChange={(e) => setSelectedCampus(e.target.value)}
                                    className="w-full md:w-64 appearance-none bg-white border border-gray-300 text-gray-800 py-2 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-medium"
                                >
                                    {filterCampuses.map(c => (
                                        <option key={c} value={c}>
                                            {c === 'TODAS' ? 'Todas las Sedes' : c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Stats Summary */}
                    <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
                        <div className="bg-white px-5 py-3 rounded-lg shadow-sm border-l-4 border-blue-600 min-w-[100px]">
                            <span className="block text-xl font-bold text-gray-800">{stats.operative}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Operativo</span>
                        </div>
                        <div className="bg-white px-5 py-3 rounded-lg shadow-sm border-l-4 border-orange-500 min-w-[100px]">
                            <span className="block text-xl font-bold text-gray-800">{stats.prevention}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Prevención</span>
                        </div>
                        <div className="bg-white px-5 py-3 rounded-lg shadow-sm border-l-4 border-red-600 min-w-[100px]">
                            <span className="block text-xl font-bold text-gray-800">{stats.repair}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Reparación</span>
                        </div>
                        <div className="bg-white px-5 py-3 rounded-lg shadow-sm border-l-4 border-purple-600 min-w-[100px]">
                            <span className="block text-xl font-bold text-gray-800">{stats.request}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Solicitudes</span>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        <button 
                            onClick={() => setFilterStatus('ALL')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${filterStatus === 'ALL' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                        >
                            Todas
                        </button>
                        <button 
                            onClick={() => setFilterStatus(Status.OPERATIVE)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${filterStatus === Status.OPERATIVE ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                        >
                            Operativas
                        </button>
                        <button 
                            onClick={() => setFilterStatus(Status.PREVENTION)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${filterStatus === Status.PREVENTION ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                        >
                            Prevención
                        </button>
                        <button 
                            onClick={() => setFilterStatus(Status.REPAIR)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${filterStatus === Status.REPAIR ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                        >
                            Reparación
                        </button>
                        <button 
                            onClick={() => setFilterStatus(Status.REQUEST)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${filterStatus === Status.REQUEST ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                        >
                            Solicitudes
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredUnits.map((unit) => (
                  <UnitCard 
                    key={unit.id} 
                    unit={unit} 
                    onClick={() => setSelectedUnit(unit)} 
                  />
                ))}
                {filteredUnits.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-400">
                        <Filter className="mx-auto h-12 w-12 mb-4 opacity-20" />
                        <p>No se encontraron unidades con este filtro.</p>
                    </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Edit Modal */}
      {selectedUnit && role && (
        <UnitModal
          unit={selectedUnit}
          role={role}
          isOpen={!!selectedUnit}
          onClose={() => { setSelectedUnit(null); }}
          onSave={handleSaveUnit}
        />
      )}

      {/* Manage Campuses Modal */}
      <ManageCampusesModal 
        isOpen={isManageCampusesOpen}
        campuses={availableCampuses}
        onClose={() => setIsManageCampusesOpen(false)}
        onAdd={handleAddCampus}
        onRename={handleRenameCampus}
        onDelete={handleDeleteCampus}
      />

      {/* Create Unit Modal */}
      <CreateUnitModal
        isOpen={isCreateUnitOpen}
        campuses={availableCampuses}
        onClose={() => setIsCreateUnitOpen(false)}
        onSave={handleCreateUnit}
      />
      
      {/* Warehouse / Tools Modal */}
      <WarehouseModal
        isOpen={isWarehouseOpen}
        onClose={() => setIsWarehouseOpen(false)}
      />

      {/* Admin Settings Modal */}
      <AdminSettingsModal
        isOpen={isAdminSettingsOpen}
        onClose={() => setIsAdminSettingsOpen(false)}
      />

    </div>
  );
};

export default App;