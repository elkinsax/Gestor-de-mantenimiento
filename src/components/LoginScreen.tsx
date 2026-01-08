import React, { useState, useEffect } from 'react';
import { Role, Organization } from '../types';
import { sheetService } from '../services/sheetService';
import { ShieldCheck, User, Wrench, Wallet, Lock, ArrowRight, Building, Plus, X, Globe, CreditCard } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (org: Organization, role: Role) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [step, setStep] = useState<'portal' | 'role' | 'pass'>('portal');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [password, setPassword] = useState('');
  
  // Registration state
  const [showRegister, setShowRegister] = useState(false);
  const [regName, setRegName] = useState('');
  const [regLogo, setRegLogo] = useState('');

  useEffect(() => {
    const saved = sheetService.getSavedOrganizations();
    setOrganizations(saved);
  }, []);

  const handleRegisterOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (regName.trim()) {
      const newOrg: Organization = {
        id: 'org_' + Math.random().toString(36).substr(2, 9),
        name: regName,
        logoUrl: regLogo || 'https://i.ibb.co/4QC1Xxx/LOGO-Colegio-Boston-Internacionall.png',
        plan: 'FREE'
      };
      sheetService.saveOrganization(newOrg);
      setOrganizations([...organizations, newOrg]);
      setShowRegister(false);
      setRegName('');
      setRegLogo('');
      // Seleccionar automáticamente la recién creada
      setSelectedOrg(newOrg);
      setStep('role');
    }
  };

  const handleOrgSelect = (org: Organization) => {
    setSelectedOrg(org);
    setStep('role');
  };

  const handleRoleSelect = (role: Role) => {
    if (role === 'VIEWER') {
      localStorage.setItem('saas_current_org_id', selectedOrg!.id);
      onLogin(selectedOrg!, 'VIEWER');
    } else {
      setSelectedRole(role);
      setStep('pass');
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // En un SaaS real aquí validarías contra la DB de esa escuela
    if (password === '1234' || password === 'admin123') {
      localStorage.setItem('saas_current_org_id', selectedOrg!.id);
      onLogin(selectedOrg!, selectedRole!);
    } else {
      alert("PIN incorrecto para esta institución.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center p-4 text-white font-sans selection:bg-blue-500">
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-4xl w-full z-10 animate-in fade-in zoom-in duration-700">
        
        {step === 'portal' && (
          <div className="text-center space-y-8">
            <div className="space-y-2">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                Mantenimiento <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-8">PRO</span>
              </h1>
              <p className="text-gray-400 font-medium tracking-widest text-xs uppercase">Infraestructura Escolar Inteligente</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              {/* Existing Schools */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center">
                <Globe className="text-blue-400 mb-4" size={32} />
                <h2 className="text-xl font-bold mb-6">Escuelas Registradas</h2>
                <div className="w-full space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                  {organizations.map(org => (
                    <button 
                      key={org.id}
                      onClick={() => handleOrgSelect(org)}
                      className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/50 transition-all flex items-center gap-4 group"
                    >
                      <img src={org.logoUrl} className="w-10 h-10 object-contain bg-white rounded-lg p-1" alt="Logo" />
                      <span className="font-bold text-left flex-1">{org.name}</span>
                      <ArrowRight size={18} className="text-gray-600 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                  {organizations.length === 0 && (
                    <p className="text-gray-500 text-sm py-4 italic">No hay instituciones dadas de alta.</p>
                  )}
                </div>
              </div>

              {/* Register New School Card */}
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                <Building className="text-blue-400 mb-4" size={48} />
                <h2 className="text-2xl font-bold mb-4">¿Eres una Escuela Nueva?</h2>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                  Crea tu propio ecosistema de mantenimiento, gestiona sedes, inventarios y reportes QR en minutos.
                </p>
                <button 
                  onClick={() => setShowRegister(true)}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-black uppercase tracking-widest transition shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Registrar mi Colegio
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 text-[10px] mt-12 uppercase tracking-[0.3em]">© 2024 SaaS Maintenance Engine • v2.0 Global</p>
          </div>
        )}

        {step === 'role' && selectedOrg && (
          <div className="max-w-md mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
             <div className="text-center">
                <img src={selectedOrg.logoUrl} className="w-20 h-20 mx-auto bg-white rounded-2xl p-2 shadow-2xl mb-4 object-contain" alt="Org Logo" />
                <h2 className="text-3xl font-black uppercase tracking-tighter">{selectedOrg.name}</h2>
                <p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-widest">Portal de Acceso Institucional</p>
             </div>

             <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { r: 'ADMIN', i: ShieldCheck, l: 'Administrador', c: 'orange', d: 'Gestión Global' },
                    { r: 'MAINTENANCE', i: Wrench, l: 'Mantenimiento', c: 'blue', d: 'Operativa' },
                    { r: 'TREASURY', i: Wallet, l: 'Tesorería', c: 'green', d: 'Presupuestos' },
                    { r: 'SOLICITOR', i: User, l: 'Solicitante', c: 'purple', d: 'Reportes QR' }
                  ].map(({r, i: Icon, l, c, d}) => (
                    <button 
                      key={r}
                      onClick={() => handleRoleSelect(r as Role)}
                      className="flex flex-col items-center text-center gap-2 p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all group"
                    >
                      <Icon size={28} className={`text-${c}-500 group-hover:scale-110 transition`} />
                      <div>
                        <span className="block text-[10px] font-black uppercase tracking-tighter mb-0.5">{l}</span>
                        <span className="block text-[8px] text-gray-500 uppercase">{d}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep('portal')} className="w-full mt-6 text-[10px] text-gray-500 hover:text-white transition uppercase font-bold tracking-widest">← Volver al Portal Global</button>
             </div>
          </div>
        )}

        {step === 'pass' && selectedRole && (
          <div className="max-w-sm mx-auto animate-in zoom-in duration-300">
             <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl text-center">
               <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Lock size={24} className="text-blue-500" />
               </div>
               <h2 className="text-xl font-bold mb-2 uppercase tracking-tighter">Verificación</h2>
               <p className="text-gray-500 text-xs mb-8">Ingresa el PIN de seguridad para el perfil <strong>{selectedRole}</strong></p>
               
               <form onSubmit={handleFinalSubmit} className="space-y-4">
                 <input 
                  type="password" 
                  autoFocus
                  placeholder="PIN DE ACCESO"
                  className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 text-center text-xl font-black tracking-[0.5em] focus:border-blue-500 outline-none transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                 />
                 <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black uppercase tracking-widest transition active:scale-95 shadow-lg shadow-blue-500/20">
                   Entrar al Sistema
                 </button>
               </form>
               <button onClick={() => setStep('role')} className="mt-6 text-[10px] text-gray-500 uppercase font-bold tracking-widest">Cambiar Perfil</button>
             </div>
          </div>
        )}

      </div>

      {/* Modal Registro */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-gray-900 border border-white/10 p-8 rounded-[3rem] w-full max-w-md shadow-2xl animate-in fade-in slide-in-from-bottom-12">
             <div className="flex justify-between items-start mb-8">
                <div>
                   <h3 className="text-2xl font-black tracking-tighter uppercase">Nueva Escuela</h3>
                   <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Configuración Inicial SaaS</p>
                </div>
                <button onClick={() => setShowRegister(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={20}/></button>
             </div>
             
             <form onSubmit={handleRegisterOrg} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nombre de la Institución</label>
                   <input 
                    required
                    placeholder="Ej. Liceo Moderno Internacional"
                    className="w-full bg-black border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-500 transition"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">URL del Logo (Opcional)</label>
                   <input 
                    placeholder="https://servidor.com/logo.png"
                    className="w-full bg-black border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-500 transition"
                    value={regLogo}
                    onChange={(e) => setRegLogo(e.target.value)}
                   />
                </div>

                <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex gap-3 items-start">
                   <CreditCard size={18} className="text-blue-500 mt-1 shrink-0" />
                   <div>
                      <p className="text-[10px] font-bold text-blue-400 uppercase">Plan Gratuito Activado</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">Incluye hasta 50 unidades y sincronización básica con LocalStorage.</p>
                   </div>
                </div>

                <button type="submit" className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition active:scale-95">
                  Crear Espacio de Trabajo
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;