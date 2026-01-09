
import React, { useState, useEffect } from 'react';
import { X, Database, Save, RefreshCw, DownloadCloud, Lock, Users, Trash2, Globe } from 'lucide-react';
import { getApiConfig, saveApiConfig, syncWithGoogleSheets, getUnits, getCampuses, getTools, getWarehouse, fetchFromGoogleSheets, getAuthData, saveAuthData, resetData, getMasterApiUrl, saveMasterApiUrl } from '../services/sheetService';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'db' | 'users' | 'master'>('db');
  
  // DB State
  const [apiUrl, setApiUrl] = useState('');
  const [masterUrl, setMasterUrl] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Auth State
  const [authData, setAuthData] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (isOpen) {
      setApiUrl(getApiConfig());
      setMasterUrl(getMasterApiUrl());
      setAuthData(getAuthData());
      setSyncStatus('idle');
      setStatusMessage('');
      setActiveTab('db');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    saveApiConfig(apiUrl);
    setSyncStatus('success');
    setStatusMessage('Configuración de colegio guardada.');
    setTimeout(() => setSyncStatus('idle'), 2000);
  };

  const handleSaveMaster = () => {
    saveMasterApiUrl(masterUrl);
    setSyncStatus('success');
    setStatusMessage('Registro maestro actualizado.');
    setTimeout(() => setSyncStatus('idle'), 2000);
  };

  const handleSync = async () => {
    setSyncStatus('loading');
    const result = await syncWithGoogleSheets();
    setSyncStatus(result.success ? 'success' : 'error');
    setStatusMessage(result.message);
  };

  const handleDownloadCloud = async () => {
    setSyncStatus('loading');
    if (confirm("¡Atención! Esto reemplazará todos los datos locales con los datos de la nube. ¿Estás seguro?")) {
      const result = await fetchFromGoogleSheets();
      setSyncStatus(result.success ? 'success' : 'error');
      setStatusMessage(result.message);
      if (result.success) {
        setTimeout(() => window.location.reload(), 1500);
      }
    } else {
      setSyncStatus('idle');
    }
  };

  const handleExportJson = async () => {
    const [units, campuses, tools, warehouse] = await Promise.all([
      getUnits(), getCampuses(), getTools(), getWarehouse()
    ]);

    const fullBackup = {
      timestamp: new Date().toISOString(),
      data: { campuses, units, tools, warehouse }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `mantenimiento_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleSavePasswords = () => {
    saveAuthData(authData);
    alert("Contraseñas actualizadas localmente.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Database size={20} />
            <h2 className="text-lg font-bold">Administración</h2>
          </div>
          <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b bg-gray-50 overflow-x-auto">
            <button 
                onClick={() => setActiveTab('db')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'db' ? 'border-black text-black bg-white' : 'border-transparent text-gray-500'}`}
            >
                <Database size={14} /> Local
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'users' ? 'border-black text-black bg-white' : 'border-transparent text-gray-500'}`}
            >
                <Users size={14} /> Claves
            </button>
            <button 
                onClick={() => setActiveTab('master')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'master' ? 'border-black text-black bg-white' : 'border-transparent text-gray-500'}`}
            >
                <Globe size={14} /> Maestro
            </button>
        </div>

        <div className="p-6 overflow-y-auto">
          
          {activeTab === 'db' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Endpoint Institucional (Google Sheets)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://script.google.com/..."
                    className="flex-1 border border-gray-300 rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-black font-mono"
                  />
                  <button onClick={handleSaveConfig} className="bg-gray-100 hover:bg-gray-200 p-2.5 rounded-lg border border-gray-300"><Save size={18} /></button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={handleSync} disabled={syncStatus === 'loading'} className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition shadow-lg shadow-blue-500/20">
                  {syncStatus === 'loading' ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />} Subir
                </button>
                <button onClick={handleDownloadCloud} disabled={syncStatus === 'loading'} className="flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition">
                   <DownloadCloud size={16} /> Bajar
                </button>
              </div>

              <div className="border-t pt-6">
                 <button onClick={handleExportJson} className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4 hover:bg-gray-50 transition">Exportar JSON</button>
                 <button onClick={() => { if(confirm("¿Reiniciar app?")) resetData(); }} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 py-2.5 rounded-lg text-[10px] font-black uppercase border border-red-200"><Trash2 size={16} /> Reinicio de Fábrica</button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
             <div className="space-y-4">
                {['ADMIN', 'MAINTENANCE', 'TREASURY', 'SOLICITOR'].map(role => (
                    <div key={role} className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase">{role}</label>
                        <div className="relative">
                            <Lock size={14} className="absolute left-3 top-3 text-gray-400" />
                            <input type="text" className="w-full border rounded-lg pl-9 p-2.5 text-sm outline-none focus:border-black" value={authData[role] || ''} onChange={(e) => setAuthData({...authData, [role]: e.target.value})} />
                        </div>
                    </div>
                ))}
                <button onClick={handleSavePasswords} className="w-full bg-black text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest mt-4 shadow-xl">Actualizar Claves</button>
             </div>
          )}

          {activeTab === 'master' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                <Globe size={20} className="text-blue-500 shrink-0" />
                <p className="text-[10px] text-blue-700 leading-tight">
                  <strong>Configuración Global:</strong> Esta URL conecta la app con tu Directorio Maestro donde se guardan todos los colegios registrados.
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-700 mb-2 uppercase">URL Endpoint Maestro</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={masterUrl}
                    onChange={(e) => setMasterUrl(e.target.value)}
                    placeholder="URL del Script Maestro"
                    className="flex-1 border rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <button onClick={handleSaveMaster} className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700"><Save size={18} /></button>
                </div>
              </div>
              <p className="text-[9px] text-gray-400 italic">Nota: Si este campo está vacío, el registro de colegios solo será local en este dispositivo.</p>
            </div>
          )}

          {statusMessage && <div className="mt-4 p-3 bg-gray-50 text-[10px] font-bold uppercase text-center rounded-lg border border-gray-100 animate-in fade-in">{statusMessage}</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsModal;
