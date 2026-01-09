
import React, { useState, useEffect } from 'react';
import { Organization } from '../types';
import { sheetService } from '../services/sheetService';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Settings, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  LogOut,
  Globe,
  Database,
  X
} from 'lucide-react';

interface AdminGlobalDashboardProps {
  onLogout: () => void;
}

const AdminGlobalDashboard: React.FC<AdminGlobalDashboardProps> = ({ onLogout }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Partial<Organization> | null>(null);

  useEffect(() => {
    loadOrgs();
  }, []);

  const loadOrgs = async () => {
    const data = await sheetService.fetchGlobalOrganizations();
    setOrganizations(data);
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrg && editingOrg.name) {
      const orgToSave: Organization = {
        id: editingOrg.id || 'org_' + Math.random().toString(36).substr(2, 9),
        name: editingOrg.name,
        logoUrl: editingOrg.logoUrl || 'https://i.ibb.co/4QC1Xxx/LOGO-Colegio-Boston-Internacionall.png',
        plan: editingOrg.plan || 'FREE',
        sheetsUrl: editingOrg.sheetsUrl
      };

      const success = await sheetService.updateOrgInMaster(orgToSave, editingOrg.id ? 'UPDATE_ORG' : 'REGISTER_ORG');
      if (success) {
        setIsModalOpen(false);
        setEditingOrg(null);
        loadOrgs();
      } else {
        alert("Error al guardar en el Master API.");
      }
    }
  };

  const handleDelete = async (org: Organization) => {
    if (confirm(`¿Seguro que deseas ELIMINAR a ${org.name}? Se perderá su registro global.`)) {
      await sheetService.updateOrgInMaster(org, 'DELETE_ORG');
      loadOrgs();
    }
  };

  const filtered = organizations.filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-black uppercase tracking-tighter italic">
            SaaS <span className="text-blue-500">ENGINE</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Global Console v2.1</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-xl text-sm font-bold transition">
            <Building2 size={18} /> Clientes
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition">
            <CreditCard size={18} /> Suscripciones
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition">
            <Globe size={18} /> Red Maestra
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-bold transition">
            <LogOut size={18} /> Salir del Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-8 py-6 flex justify-between items-center shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Gestión de Clientes</h2>
            <p className="text-sm text-gray-500">Tienes {organizations.length} instituciones vinculadas.</p>
          </div>
          <button 
            onClick={() => { setEditingOrg({ plan: 'FREE' }); setIsModalOpen(true); }}
            className="bg-black text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition shadow-lg active:scale-95"
          >
            <Plus size={18} /> Nuevo Colegio
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Users size={24}/></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Clientes</p><h4 className="text-2xl font-black">{organizations.length}</h4></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center"><CreditCard size={24}/></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Planes Pro</p><h4 className="text-2xl font-black">{organizations.filter(o => o.plan !== 'FREE').length}</h4></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center"><Settings size={24}/></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estado Master</p><h4 className="text-2xl font-black text-green-500 uppercase text-sm">Online</h4></div>
              </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar por nombre de colegio..."
                    className="w-full bg-gray-50 border-none rounded-2xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Institución</th>
                      <th className="px-6 py-4">ID de Cliente</th>
                      <th className="px-6 py-4">Plan</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map(org => (
                      <tr key={org.id} className="hover:bg-gray-50 transition group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={org.logoUrl} className="w-10 h-10 object-contain bg-white rounded-lg p-1 border shadow-sm" alt="Logo" />
                            <span className="font-bold text-gray-900">{org.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{org.id}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${
                            org.plan === 'FREE' ? 'bg-gray-100 text-gray-600' : 
                            org.plan === 'PRO' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                          }`}>
                            {org.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => { setEditingOrg(org); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"><Edit size={16}/></button>
                            <button onClick={() => handleDelete(org)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
             <div className="bg-gray-900 text-white p-8 flex justify-between items-center">
                <div>
                   <h3 className="text-xl font-bold uppercase tracking-tight">{editingOrg?.id ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Configuración Maestra</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition"><X size={24}/></button>
             </div>
             
             <form onSubmit={handleSaveOrg} className="p-8 space-y-6">
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Nombre Comercial</label>
                   <input 
                    required 
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" 
                    value={editingOrg?.name || ''} 
                    onChange={e => setEditingOrg({...editingOrg, name: e.target.value})}
                    placeholder="Ej. Colegio Británico de Medellín"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Nivel de Plan</label>
                    <select 
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                      value={editingOrg?.plan || 'FREE'}
                      onChange={e => setEditingOrg({...editingOrg, plan: e.target.value as any})}
                    >
                      <option value="FREE">FREE</option>
                      <option value="PRO">PRO</option>
                      <option value="ENTERPRISE">ENTERPRISE</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Logo URL (Opcional)</label>
                    <input 
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={editingOrg?.logoUrl || ''} 
                      onChange={e => setEditingOrg({...editingOrg, logoUrl: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Google Sheets Endpoint URL</label>
                   <input 
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={editingOrg?.sheetsUrl || ''} 
                    onChange={e => setEditingOrg({...editingOrg, sheetsUrl: e.target.value})}
                    placeholder="https://script.google.com/macros/s/..."
                   />
                   <p className="text-[9px] text-gray-400 mt-2 italic px-1">* Este URL vincula la instancia privada del cliente con el sistema global.</p>
                </div>

                <button type="submit" className="w-full bg-black text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-600 transition shadow-xl active:scale-95 mt-4">
                  Guardar Cambios Maestros
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGlobalDashboard;
