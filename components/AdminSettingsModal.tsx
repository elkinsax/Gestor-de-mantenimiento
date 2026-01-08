import React, { useState } from 'react';
import { X, RefreshCw, Save, Database, Trash2, DownloadCloud } from 'lucide-react';
import { sheetService } from '../services/sheetService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState(sheetService.getConfig());
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleSync = async () => {
    if (!url) { setStatus('Error: Falta URL de Google Sheets'); return; }
    setLoading(true);
    setStatus('Sincronizando...');
    
    try {
      const data = {
        units: sheetService.getUnits(),
        tools: sheetService.getTools(),
        warehouse: sheetService.getWarehouse()
      };
      
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ action: 'SYNC_UP', data }),
        headers: { 'Content-Type': 'text/plain' }
      });
      
      if (!response.ok) throw new Error('Network error');
      setStatus('Sincronización completa ✅');
    } catch (e) {
      setStatus('Error al conectar. Verifique CORS y URL.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl space-y-8 animate-in slide-in-from-bottom-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-black text-white rounded-2xl"><Database size={24} /></div>
             <h2 className="text-2xl font-black uppercase tracking-tighter">Configuración</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={24} /></button>
        </div>

        <div className="space-y-4">
           <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Endpoint de Google Sheets (Web App URL)</label>
              <input 
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-mono focus:ring-2 focus:ring-black outline-none"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/..."
              />
           </div>
           <button 
             onClick={() => { sheetService.saveConfig(url); setStatus('URL Guardada localmente.'); }}
             className="w-full py-4 bg-gray-100 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2"
           >
             <Save size={18} /> Guardar Cambios
           </button>
        </div>

        <div className="pt-8 border-t space-y-4">
           <button 
             onClick={handleSync}
             disabled={loading}
             className="w-full py-5 bg-black text-white rounded-3xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-black/20"
           >
             {loading ? <RefreshCw className="animate-spin" /> : <DownloadCloud />}
             Subir Datos a la Nube
           </button>
           {status && <p className="text-center text-[10px] font-bold text-gray-500 uppercase">{status}</p>}
        </div>

        <div className="pt-8 space-y-2">
            <h4 className="text-red-600 text-[10px] font-black uppercase tracking-widest">Zona de Peligro</h4>
            <button 
              onClick={() => { if(confirm("¿Borrar todo?")) { localStorage.clear(); window.location.reload(); } }}
              className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-xs tracking-widest border border-red-100 flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Reiniciar Aplicación
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsModal;