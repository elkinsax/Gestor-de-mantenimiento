
import React, { useState, useEffect } from 'react';
import { X, Database, Save, Download, RefreshCw, CheckCircle, AlertCircle, DownloadCloud, Trash2, Users, Lock } from 'lucide-react';
import { getApiConfig, saveApiConfig, syncWithGoogleSheets, getUnits, getCampuses, getTools, getWarehouse, fetchFromGoogleSheets, getAuthData, saveAuthData, resetData } from '../services/sheetService';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'db' | 'users'>('db');
  const [apiUrl, setApiUrl] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [authData, setAuthData] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (isOpen) {
      setApiUrl(getApiConfig());
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
    setStatusMessage('Configuración guardada.');
    setTimeout(() => setSyncStatus('idle'), 2000);
  };

  const handleSync = async () => {
    setSyncStatus('loading');
    const result = await syncWithGoogleSheets();
    setSyncStatus(result.success ? 'success' : 'error');
    setStatusMessage(result.message);
  };

  const handleDownloadCloud = async () => {
    if (confirm("¿Reemplazar datos locales con la nube?")) {
      setSyncStatus('loading');
      const result = await fetchFromGoogleSheets();
      setSyncStatus(result.success ? 'success' : 'error');
      setStatusMessage(result.message);
      if (result.success) setTimeout(() => window.location.reload(), 1500);
    }
  };

  const handleSavePasswords = () => {
    saveAuthData(authData);
    alert("Claves guardadas.");
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Database size={20} />
            <h2 className="text-lg font-bold">Administración</h2>
          </div>
          <button onClick={onClose} className="hover:bg-gray-700 p-1.5 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b bg-gray-50">
            <button onClick={() => setActiveTab('db')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'db' ? 'border-black bg-white' : 'border-transparent text-gray-500'}`}><Database size={16} /> Base de Datos</button>
            <button onClick={() => setActiveTab('users')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'users' ? 'border-black bg-white' : 'border-transparent text-gray-500'}`}><Users size={16} /> Claves</button>
        </div>

        <div className="p-6 overflow-y-auto">
          {activeTab === 'db' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Endpoint URL</label>
                <div className="flex gap-2">
                  <input type="text" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} className="flex-1 border rounded p-2 text-sm outline-none focus:ring-1 focus:ring-black" />
                  <button onClick={handleSaveConfig} className="bg-gray-100 p-2 rounded border hover:bg-gray-200"><Save size={18} /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <button onClick={handleSync} disabled={syncStatus === 'loading'} className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest">{syncStatus === 'loading' ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />} Subir</button>
                  <button onClick={handleDownloadCloud} disabled={syncStatus === 'loading'} className="flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest">{syncStatus === 'loading' ? <RefreshCw className="animate-spin" size={16} /> : <DownloadCloud size={16} />} Bajar</button>
              </div>
              <button onClick={() => { if(confirm("¿Reiniciar app?")) resetData(); }} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 py-3 rounded-lg text-xs font-bold uppercase tracking-widest border border-red-200"><Trash2 size={16} /> Reset Fábrica</button>
            </div>
          )}
          {activeTab === 'users' && (
             <div className="space-y-4">
                {['ADMIN', 'MAINTENANCE', 'TREASURY', 'SOLICITOR'].map(role => (
                    <div key={role} className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">{role}</label>
                        <div className="relative">
                            <Lock size={14} className="absolute left-3 top-3 text-gray-400" />
                            <input type="text" className="w-full border rounded pl-9 p-2 text-sm" value={authData[role] || ''} onChange={(e) => setAuthData({...authData, [role]: e.target.value})} />
                        </div>
                    </div>
                ))}
                <button onClick={handleSavePasswords} className="w-full bg-black text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest mt-4">Guardar Claves</button>
             </div>
          )}
          {statusMessage && <div className="mt-4 p-3 bg-gray-100 text-xs text-center rounded">{statusMessage}</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsModal;
