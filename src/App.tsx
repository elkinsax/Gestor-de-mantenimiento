
import React, { useEffect, useState } from 'react';
import { MaintenanceUnit, Role, User } from './types';
import { dbService } from './services/dbService';
import { supabase } from './supabase';
import UnitCard from './components/UnitCard';
import UnitModal from './components/UnitModal';
import LoginScreen from './components/LoginScreen';
import { LogOut, Cloud, RefreshCw, LayoutGrid, Package, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [units, setUnits] = useState<MaintenanceUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<MaintenanceUnit | null>(null);

  useEffect(() => {
    // FIX: Casting 'supabase.auth' to 'any' to bypass 'Property getSession does not exist' errors
    (supabase.auth as any).getSession().then(({ data: { session } }: any) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setLoading(false);
    });

    // FIX: Casting 'supabase.auth' to 'any' for 'onAuthStateChange'
    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else {
        setUserData(null);
        setUnits([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setUserData({
          id: data.id,
          email: session?.user?.email || '',
          role: data.role as Role,
          organizationId: data.organization_id,
          fullName: data.full_name
        });
        const unitsData = await dbService.getUnits(data.organization_id);
        setUnits(unitsData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // FIX: Casting 'supabase.auth' to 'any' for 'signOut'
    await (supabase.auth as any).signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <RefreshCw size={40} className="animate-spin mb-4" />
        <p className="text-gray-400">Conectando con la nube...</p>
      </div>
    );
  }

  if (!session || !userData) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-black text-white px-4 py-3 shadow-lg flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded p-1">
            <img src="https://i.ibb.co/4QC1Xxx/LOGO-Colegio-Boston-Internacionall.png" alt="Logo" />
          </div>
          <div className="hidden md:block">
            <h2 className="font-bold text-sm leading-none">{userData.fullName}</h2>
            <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Admin SaaS</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-6">
          <div className="flex items-center gap-1 text-[10px] md:text-xs text-green-400">
            <Cloud size={14} /> <span className="hidden sm:inline">Nube Activa</span>
          </div>
          <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <LayoutGrid size={24} /> Dashboard General
          </h1>
          <p className="text-gray-500 text-sm">Gestionando inventario y mantenimiento en tiempo real.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {units.length > 0 ? (
            units.map(unit => (
              <UnitCard key={unit.id} unit={unit} onClick={() => setSelectedUnit(unit)} />
            ))
          ) : (
            <div className="col-span-full bg-white border-2 border-dashed border-gray-200 rounded-2xl h-64 flex flex-col items-center justify-center text-gray-400">
               <Package size={48} className="mb-2 opacity-20" />
               <p>No hay unidades registradas aún.</p>
               <button className="mt-4 bg-black text-white px-4 py-2 rounded-lg text-sm font-bold">Crear Primera Unidad</button>
            </div>
          )}
        </div>
      </main>

      {/* Menú inferior táctil (Mobile Optimizado) */}
      <div className="md:hidden bg-white border-t border-gray-200 p-2 flex justify-around sticky bottom-0">
          <button className="flex flex-col items-center p-2 text-black">
              <LayoutGrid size={20} />
              <span className="text-[10px] font-bold">Inicio</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-400">
              <Package size={20} />
              <span className="text-[10px] font-bold">Almacén</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-400">
              <Settings size={20} />
              <span className="text-[10px] font-bold">Ajustes</span>
          </button>
      </div>

      {selectedUnit && (
        <UnitModal 
          unit={selectedUnit} 
          role={userData.role} 
          isOpen={true} 
          onClose={() => setSelectedUnit(null)}
          onSave={async (u) => {
            await dbService.updateUnit(u);
            setSelectedUnit(null);
            fetchUserProfile(userData.id); // Recargar
          }}
        />
      )}
    </div>
  );
};

export default App;
