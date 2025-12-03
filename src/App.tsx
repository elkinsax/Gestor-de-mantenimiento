import React, { useEffect, useState } from 'react';
import { MaintenanceUnit, Role, Status } from './types';
import { getUnits, updateUnit, getCampuses, addCampus, createUnit, renameCampus, deleteCampus } from './services/sheetService';
import UnitCard from './components/UnitCard';
import UnitModal from './components/UnitModal';
import CreateUnitModal from './components/CreateUnitModal';
import ManageCampusesModal from './components/ManageCampusesModal';
import AdminSettingsModal from './components/AdminSettingsModal';
import WarehouseModal from './components/WarehouseModal';
import { Settings, Filter, MapPin, Plus, Building, Package } from 'lucide-react';

const App: React.FC = () => {
  const [units, setUnits] = useState<MaintenanceUnit[]>([]);
  const [availableCampuses, setAvailableCampuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>('MAINTENANCE');
  
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
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [unitsData, campusesData] = await Promise.all([getUnits(), getCampuses()]);
    setUnits(unitsData);
    setAvailableCampuses(campusesData);
    setLoading(false);
  };

  const handleSaveUnit = async (updatedUnit: MaintenanceUnit) => {
    const newUnits = await updateUnit(updatedUnit);
    setUnits(newUnits);
    setSelectedUnit(null); // Close modal
  };

  // --- Campus Management Handlers ---

  const handleAddCampus = async (name: string) => {
    const newCampuses = await addCampus(name);
    setAvailableCampuses(newCampuses);
  };

  const handleRenameCampus = async (oldName: string, newName: string) => {
    const { campuses, units } = await renameCampus(oldName, newName);
    setAvailableCampuses(campuses);
    setUnits(units);
    // Update filter if currently filtering by the renamed campus
    if (selectedCampus === oldName) {
      setSelectedCampus(newName);
    }
  };

  const handleDeleteCampus = async (name: string) => {
    const { campuses, units } = await deleteCampus(name);
    setAvailableCampuses(campuses);
    setUnits(units);
    // Reset filter if deleted campus was selected
    if (selectedCampus === name) {
      setSelectedCampus('TODAS');
    }
  };

  // --- Unit Management Handlers ---

  const handleCreateUnit = async (newUnit: MaintenanceUnit) => {
    const newUnits = await createUnit(newUnit);
    setUnits(newUnits);
    setIsCreateUnitOpen(false);
    // Switch filter to see the new unit if necessary
    if (selectedCampus !== 'TODAS' && selectedCampus !== newUnit.campus) {
        setSelectedCampus(newUnit.campus);
    }
  };

  // Combine available campuses with 'TODAS' for the filter
  const filterCampuses = ['TODAS', ...availableCampuses];

  // Filtering Logic: Campus -> Status
  const unitsInCampus = selectedCampus === 'TODAS' 
    ? units 
    : units.filter(u => u.campus === selectedCampus);

  const filteredUnits = unitsInCampus.filter(u => filterStatus === 'ALL' || u.status === filterStatus);

  // Statistics for Dashboard Header (Reflecting the current campus view)
  const stats = {
    operative: unitsInCampus.filter(u => u.status === Status.OPERATIVE).length,
    prevention: unitsInCampus.filter(u => u.status === Status.PREVENTION).length,
    repair: unitsInCampus.filter(u => u.status === Status.REPAIR).length,
  };

  // Permissions helper
  const canEditStructure = role === 'MAINTENANCE' || role === 'ADMIN';

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
                    alt="LOGO-Colegio-Boston-Internacionall" 
                    className="w-full h-full object-contain"
                  />
                </div>
             
              <span className="font-bold text-lg tracking-tight hidden sm:block">GESTOR DE MANTENIMIENTO</span>
              <span className="font-bold text-lg tracking-tight sm:hidden">GESTOR</span>
            </div>

            {/* Role Switcher (For Demo Purposes) */}
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Modo de Vista:</span>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value as Role)}
                className="bg-gray-900 border border-gray-700 text-white text-sm rounded px-3 py-1 focus:outline-none focus:border-blue-500"
              >
                <option value="MAINTENANCE">Jefe Mantenimiento</option>
                <option value="TREASURY">Tesorería</option>
                <option value="ADMIN">Administrador</option>
                <option value="VIEWER">Usuario (Solo ver)</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
               {role === 'ADMIN' && (
                 <button 
                  onClick={() => setIsAdminSettingsOpen(true)}
                  title="Configuración Admin" 
                  className="p-2 text-gray-300 hover:text-white transition hover:bg-gray-800 rounded-full"
                 >
                    <Settings size={18} />
                 </button>
               )}
               <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-white/20"></div>
            </div>
          </div>
        </div>
        {/* Mobile Role Switcher */}
        <div className="md:hidden bg-gray-900 px-4 py-2 border-t border-gray-800 flex justify-between items-center">
             <span className="text-xs text-gray-400">Rol:</span>
             <select 
                value={role} 
                onChange={(e) => setRole(e.target.value as Role)}
                className="bg-black border border-gray-700 text-white text-xs rounded px-2 py-1"
              >
                <option value="MAINTENANCE">Mantenimiento</option>
                <option value="TREASURY">Tesorería</option>
                <option value="ADMIN">Admin</option>
                <option value="VIEWER">Usuario</option>
              </select>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Dashboard Header / Filters */}
        <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-light text-gray-900">Gestión de Sedes</h1>
                    <p className="text-gray-500 mt-1 text-sm">Administra el estado, inventario y requerimientos de cada unidad.</p>
                </div>

                {/* Actions and Filter Area */}
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

                    {/* Campus Filter */}
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
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Stats Summary (Context-aware) */}
                <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
                    <div className="bg-white px-5 py-3 rounded-lg shadow-sm border-l-4 border-blue-600 min-w-[120px]">
                        <span className="block text-2xl font-bold text-gray-800">{stats.operative}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Operativo</span>
                    </div>
                    <div className="bg-white px-5 py-3 rounded-lg shadow-sm border-l-4 border-orange-500 min-w-[120px]">
                        <span className="block text-2xl font-bold text-gray-800">{stats.prevention}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Prevención</span>
                    </div>
                    <div className="bg-white px-5 py-3 rounded-lg shadow-sm border-l-4 border-red-600 min-w-[120px]">
                        <span className="block text-2xl font-bold text-gray-800">{stats.repair}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Reparación</span>
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
                        En Prevención
                    </button>
                    <button 
                        onClick={() => setFilterStatus(Status.REPAIR)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${filterStatus === Status.REPAIR ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        En Reparación
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
      </main>

      {/* Edit Modal */}
      {selectedUnit && (
        <UnitModal
          unit={selectedUnit}
          role={role}
          isOpen={!!selectedUnit}
          onClose={() => setSelectedUnit(null)}
          onSave={handleSaveUnit}
        />
      )}

      {/* Manage Campuses Modal (Replaces CreateCampusModal) */}
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