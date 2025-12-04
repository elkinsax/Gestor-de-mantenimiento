import React, { useState, useEffect } from 'react';
import { X, Database, Save, Download, RefreshCw, CheckCircle, AlertCircle, DownloadCloud, Lock, Users } from 'lucide-react';
import { getApiConfig, saveApiConfig, syncWithGoogleSheets, getUnits, getCampuses, getTools, getWarehouse, fetchFromGoogleSheets, getAuthData, saveAuthData } from '../services/sheetService';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'db' | 'users'>('db');
  
  // DB State
  const [apiUrl, setApiUrl] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Auth State
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
    setStatusMessage('Configuración guardada localmente.');
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
    alert("Contraseñas actualizadas. Recuerda SINCRONIZAR para subirlas a la nube.");
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

        <div className="flex border-b bg-gray-50">
            <button 
                onClick={() => setActiveTab('db')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'db' ? 'border-black text-black bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <Database size={16} /> Base de Datos
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'users' ? 'border-black text-black bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <Users size={16} /> Usuarios y Claves
            </button>
        </div>

        <div className="p-6 overflow-y-auto">
          
          {activeTab === 'db' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL del Endpoint (Google Apps Script)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/..."
                    className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-black outline-none font-mono"
                  />
                  <button 
                    onClick={handleSaveConfig}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2.5 rounded-lg border border-gray-300 transition"
                    title="Guardar URL"
                  >
                    <Save size={18} />
                  </button>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">Sincronización</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleSync}
                    disabled={syncStatus === 'loading'}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition disabled:opacity-70 text-sm"
                  >
                    {syncStatus === 'loading' ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                    Sincronizar (Subir)
                  </button>

                  <button 
                    onClick={handleDownloadCloud}
                    disabled={syncStatus === 'loading'}
                    className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition disabled:opacity-70 text-sm"
                  >
                    {syncStatus === 'loading' ? <RefreshCw size={18} className="animate-spin" /> : <DownloadCloud size={18} />}
                    Descargar (Nube)
                  </button>

                  <button 
                    onClick={handleExportJson}
                    className="col-span-2 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 py-3 px-4 rounded-lg transition text-sm"
                  >
                    <Download size={18} />
                    Exportar Backup JSON
                  </button>
                </div>
              </div>

              {statusMessage && (
                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                  syncStatus === 'success' ? 'bg-green-50 text-green-700' : 
                  syncStatus === 'error' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'
                }`}>
                  {syncStatus === 'success' && <CheckCircle size={16} />}
                  {syncStatus === 'error' && <AlertCircle size={16} />}
                  {statusMessage}
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
             <div className="space-y-6">
                 <p className="text-sm text-gray-500 bg-yellow-50 p-3 rounded border border-yellow-100">
                    Define las contraseñas para cada rol. Los usuarios deberán ingresarla al iniciar la app.
                 </p>
                 <div className="space-y-4">
                    {['ADMIN', 'MAINTENANCE', 'TREASURY', 'SOLICITOR'].map(role => (
                        <div key={role} className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-600">{role}</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                <input 
                                    type="text"
                                    className="w-full border rounded pl-9 p-2 text-sm"
                                    value={authData[role] || ''}
                                    onChange={(e) => setAuthData({...authData, [role]: e.target.value})}
                                />
                            </div>
                        </div>
                    ))}
                 </div>
                 <button onClick={handleSavePasswords} className="w-full bg-black text-white py-2 rounded-lg text-sm hover:bg-gray-800 transition">
                    Guardar Contraseñas
                 </button>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminSettingsModal;