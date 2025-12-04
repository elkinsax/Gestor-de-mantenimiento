import React, { useState } from 'react';
import { Role } from '../types';
import { ShieldCheck, User, Wrench, Wallet, Eye, Lock, ArrowRight, AlertCircle, X } from 'lucide-react';
import { checkPassword } from '../services/sheetService';

interface LoginScreenProps {
  onSelectRole: (role: Role) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSelectRole }) => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const initiateLogin = (role: Role) => {
    if (role === 'VIEWER') {
      onSelectRole('VIEWER');
    } else {
      setSelectedRole(role);
      setPassword('');
      setError('');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole) {
      if (checkPassword(selectedRole, password)) {
        onSelectRole(selectedRole);
      } else {
        setError('Contraseña incorrecta');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-4">
      
      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-24 h-24 bg-white rounded-xl mx-auto mb-6 flex items-center justify-center shadow-2xl p-2">
            <img 
              src="https://i.ibb.co/4QC1Xxx/LOGO-Colegio-Boston-Internacionall.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Gestor de Mantenimiento</h1>
        <p className="text-gray-400 mt-2 text-sm">Selecciona tu perfil para ingresar al sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        
        <button 
          onClick={() => initiateLogin('MAINTENANCE')}
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-6 rounded-xl flex items-center gap-4 transition group text-left"
        >
          <div className="bg-blue-900/50 p-3 rounded-lg text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
            <Wrench size={24} />
          </div>
          <div>
            <h3 className="text-white font-semibold">Jefe de Mantenimiento</h3>
            <p className="text-gray-500 text-xs mt-1">Gestión operativa, asignaciones y reparaciones.</p>
          </div>
        </button>

        <button 
          onClick={() => initiateLogin('TREASURY')}
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-6 rounded-xl flex items-center gap-4 transition group text-left"
        >
          <div className="bg-green-900/50 p-3 rounded-lg text-green-400 group-hover:bg-green-600 group-hover:text-white transition">
            <Wallet size={24} />
          </div>
          <div>
            <h3 className="text-white font-semibold">Tesorería / Compras</h3>
            <p className="text-gray-500 text-xs mt-1">Aprobación de gastos, costos e inventario.</p>
          </div>
        </button>

        <button 
          onClick={() => initiateLogin('SOLICITOR')}
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-6 rounded-xl flex items-center gap-4 transition group text-left"
        >
          <div className="bg-purple-900/50 p-3 rounded-lg text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition">
            <User size={24} />
          </div>
          <div>
            <h3 className="text-white font-semibold">Solicitante / Encargado</h3>
            <p className="text-gray-500 text-xs mt-1">Reportar novedades y realizar solicitudes vía QR.</p>
          </div>
        </button>

        <button 
          onClick={() => initiateLogin('ADMIN')}
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-6 rounded-xl flex items-center gap-4 transition group text-left"
        >
          <div className="bg-orange-900/50 p-3 rounded-lg text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-white font-semibold">Administrador</h3>
            <p className="text-gray-500 text-xs mt-1">Configuración global, bases de datos y usuarios.</p>
          </div>
        </button>

      </div>

      <button 
        onClick={() => initiateLogin('VIEWER')}
        className="mt-8 text-gray-500 hover:text-white text-sm flex items-center gap-2 transition"
      >
        <Eye size={16} />
        Entrar como observador (Solo lectura)
      </button>

      {/* Password Modal */}
      {selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl w-full max-w-sm shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-white font-bold">Ingresar Contraseña</h3>
                 <button onClick={() => setSelectedRole(null)} className="text-gray-400 hover:text-white">
                    <X size={20} />
                 </button>
              </div>
              <p className="text-gray-400 text-xs mb-4">
                Ingresa la clave para el rol de <span className="text-blue-400 font-bold">{selectedRole}</span>
              </p>

              <form onSubmit={handleLoginSubmit}>
                  <div className="relative mb-4">
                    <Lock className="absolute left-3 top-2.5 text-gray-500" size={16} />
                    <input 
                      type="password"
                      autoFocus
                      className="w-full bg-black border border-gray-600 text-white rounded-lg py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  
                  {error && (
                    <div className="mb-4 flex items-center gap-2 text-red-400 text-xs bg-red-900/20 p-2 rounded">
                       <AlertCircle size={14} />
                       {error}
                    </div>
                  )}

                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition flex justify-center items-center gap-2">
                     Ingresar <ArrowRight size={16} />
                  </button>
              </form>
           </div>
        </div>
      )}

      <div className="mt-12 text-gray-600 text-xs">
        © 2024 Sistema de Gestión de Activos Escolares
      </div>
    </div>
  );
};

export default LoginScreen;