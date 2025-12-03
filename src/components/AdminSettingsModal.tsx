import React, { useState, useEffect } from 'react';
import { X, Database, Save, Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { getApiConfig, saveApiConfig, syncWithGoogleSheets, getUnits } from '../services/sheetService';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiUrl, setApiUrl] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiUrl(getApiConfig());
      setSyncStatus('idle');
      setStatusMessage('');
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

  const handleExportJson = async () => {
    const units = await getUnits();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(units, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "mantenimiento_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
        
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Database size={20} />
            <h2 className="text-lg font-bold">Administración de Base de Datos</h2>
          </div>
          <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Connection Config */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL del Endpoint (Google Apps Script / Python API)
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
            <p className="text-xs text-gray-500 mt-2">
              Ingrese la URL de su Web App de Google Sheets o servidor Python para sincronizar los datos en tiempo real.
            </p>
          </div>

          {/* Actions */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Acciones de Datos</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleSync}
                disabled={syncStatus === 'loading'}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition disabled:opacity-70"
              >
                {syncStatus === 'loading' ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                Sincronizar
              </button>

              <button 
                onClick={handleExportJson}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 py-3 px-4 rounded-lg transition"
              >
                <Download size={18} />
                Exportar JSON
              </button>
            </div>
          </div>

          {/* Status Feedback */}
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
      </div>
    </div>
  );
};

export default AdminSettingsModal;