
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { ShieldCheck, LogIn, UserPlus, Mail, Lock, AlertCircle, Building } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        // 1. Crear usuario en Auth
        // FIX: Casting 'supabase.auth' to 'any' to bypass 'Property signUp does not exist' errors
        const { data: authData, error: authError } = await (supabase.auth as any).signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          // 2. Crear Organización
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .insert([{ name: orgName, slug: orgName.toLowerCase().replace(/\s+/g, '-') }])
            .select()
            .single();

          if (orgError) throw orgError;

          // 3. Crear Perfil vinculado
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: authData.user.id,
              organization_id: orgData.id,
              full_name: fullName,
              role: 'ADMIN'
            }]);

          if (profileError) throw profileError;
        }
      } else {
        // FIX: Casting 'supabase.auth' to 'any' for 'signInWithPassword'
        const { error } = await (supabase.auth as any).signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 bg-black text-white text-center">
          <div className="w-20 h-20 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center p-2">
            <img src="https://i.ibb.co/4QC1Xxx/LOGO-Colegio-Boston-Internacionall.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold">Mantenimiento Pro</h1>
          <p className="text-gray-400 text-sm mt-1">Gestión SaaS para Colegios</p>
        </div>

        <form onSubmit={handleAuth} className="p-8 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {isRegistering && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Colegio</label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input required type="text" className="w-full border rounded-lg pl-10 p-2.5 text-sm outline-none focus:ring-2 focus:ring-black" placeholder="Ej: Colegio Boston" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tu Nombre Completo</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input required type="text" className="w-full border rounded-lg pl-10 p-2.5 text-sm outline-none focus:ring-2 focus:ring-black" placeholder="Ej: Juan Pérez" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input required type="email" className="w-full border rounded-lg pl-10 p-2.5 text-sm outline-none focus:ring-2 focus:ring-black" placeholder="admin@colegio.com" value={email} onChange={(e) => setEmail(email)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input required type="password" title="Mínimo 6 caracteres" className="w-full border rounded-lg pl-10 p-2.5 text-sm outline-none focus:ring-2 focus:ring-black" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition flex justify-center items-center gap-2">
            {loading ? 'Procesando...' : isRegistering ? 'Crear Cuenta SaaS' : 'Iniciar Sesión'}
            <LogIn size={18} />
          </button>

          <div className="text-center mt-4">
            <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-gray-500 hover:text-black transition">
              {isRegistering ? '¿Ya tienes cuenta? Ingresa aquí' : '¿Eres un colegio nuevo? Regístrate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
