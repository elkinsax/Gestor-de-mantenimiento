import React, { useState } from 'react';
import { MaintenanceUnit, Role, Status, InventoryItem, MaterialRequest, WarehouseItem } from '../types';
import { X, Save, Plus, DollarSign, Package, QrCode, Trash2, Camera } from 'lucide-react';

interface Props {
  unit: MaintenanceUnit;
  role: Role;
  isOpen: boolean;
  onClose: () => void;
  onSave: (unit: MaintenanceUnit) => void;
  warehouse: WarehouseItem[];
}

const UnitModal: React.FC<Props> = ({ unit, isOpen, onClose, onSave, warehouse }) => {
  const [edited, setEdited] = useState<MaintenanceUnit>(unit);
  const [tab, setTab] = useState<'info' | 'inventory' | 'costs' | 'qr'>('info');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ ...edited, lastUpdated: new Date().toISOString() });
  };

  const addInventory = () => {
    const newItem: InventoryItem = { id: Date.now().toString(), name: 'Nuevo Item', quantity: 1, condition: 'Good' };
    setEdited({ ...edited, inventory: [...edited.inventory, newItem] });
  };

  const addRequest = (itemName: string) => {
    const newReq: MaterialRequest = {
      id: Date.now().toString(),
      item: itemName,
      quantity: 1,
      estimatedCost: 0,
      approved: false,
      date: new Date().toISOString().split('T')[0]
    };
    setEdited({ ...edited, requests: [...edited.requests, newReq] });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEdited({ ...edited, images: [ev.target?.result as string, ...edited.images].slice(0, 5) });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + '?id=' + unit.id)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-hidden">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-none">{edited.name}</h2>
            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{edited.campus} • {edited.type}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={24} /></button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-50 px-2 pt-2 gap-2 shrink-0">
          {[
            { id: 'info', label: 'Info', icon: <Package size={16} /> },
            { id: 'inventory', label: 'Inventario', icon: <Package size={16} /> },
            { id: 'costs', label: 'Gastos', icon: <DollarSign size={16} /> },
            { id: 'qr', label: 'QR', icon: <QrCode size={16} /> },
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex-1 py-3 px-2 rounded-t-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition ${tab === t.id ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
            >
              {t.icon} <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          
          {tab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.values(Status).map(s => (
                  <button 
                    key={s}
                    onClick={() => setEdited({...edited, status: s})}
                    className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-4 transition ${edited.status === s ? 'border-black bg-gray-100 text-black' : 'border-transparent bg-gray-50 text-gray-400'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block">Bitácora / Descripción</label>
                <textarea 
                  className="w-full bg-gray-50 border-none rounded-3xl p-4 text-sm focus:ring-2 focus:ring-black min-h-[120px]"
                  value={edited.description}
                  onChange={e => setEdited({...edited, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block">Fotos Recientes (Máx 5)</label>
                 <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <label className="shrink-0 w-24 h-24 bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-200 border-2 border-dashed border-gray-300">
                       <Camera size={24} />
                       <span className="text-[8px] font-black">Subir</span>
                       <input type="file" className="hidden" accept="image/*" onChange={handleImage} />
                    </label>
                    {edited.images.map((img, i) => (
                      <div key={i} className="shrink-0 w-24 h-24 rounded-2xl overflow-hidden relative group">
                         <img src={img} className="w-full h-full object-cover" />
                         <button 
                            onClick={() => setEdited({...edited, images: edited.images.filter((_, idx) => idx !== i)})}
                            className="absolute inset-0 bg-red-600/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 size={16} />
                         </button>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {tab === 'inventory' && (
             <div className="space-y-4">
               <button onClick={addInventory} className="w-full py-4 bg-gray-100 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-xs">
                 <Plus size={16} /> Agregar Item al Salón
               </button>
               {edited.inventory.map(item => (
                 <div key={item.id} className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4">
                    <input 
                      className="flex-1 bg-transparent border-none font-bold text-sm"
                      value={item.name}
                      onChange={e => {
                        const inv = edited.inventory.map(i => i.id === item.id ? {...i, name: e.target.value} : i);
                        setEdited({...edited, inventory: inv});
                      }}
                    />
                    <select 
                      className="bg-transparent border-none text-xs font-bold text-gray-500"
                      value={item.condition}
                      onChange={e => {
                        const inv = edited.inventory.map(i => i.id === item.id ? {...i, condition: e.target.value as any} : i);
                        setEdited({...edited, inventory: inv});
                      }}
                    >
                      <option value="Good">Bueno</option>
                      <option value="Fair">Regular</option>
                      <option value="Poor">Malo</option>
                    </select>
                    <button onClick={() => setEdited({...edited, inventory: edited.inventory.filter(i => i.id !== item.id)})} className="text-red-400"><Trash2 size={18} /></button>
                 </div>
               ))}
             </div>
          )}

          {tab === 'costs' && (
            <div className="space-y-6">
               <div className="bg-black text-white p-4 rounded-3xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cargar Material del Almacén</span>
                  <select 
                    onChange={e => addRequest(e.target.value)}
                    className="w-full mt-2 bg-gray-800 border-none rounded-xl text-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>Seleccione material...</option>
                    {warehouse.map(w => <option key={w.id} value={w.name}>{w.name} (Disp: {w.quantity})</option>)}
                  </select>
               </div>

               <div className="space-y-3">
                  {edited.requests.map(req => (
                    <div key={req.id} className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
                       <div className="flex-1">
                          <p className="font-bold text-sm">{req.item}</p>
                          <span className="text-[10px] text-gray-400">{req.date}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="relative">
                            <span className="absolute left-2 top-2 text-[10px] font-black">$</span>
                            <input 
                              type="number"
                              className="bg-white border rounded-xl pl-4 pr-2 py-1.5 text-xs w-24 font-bold"
                              value={req.estimatedCost}
                              onChange={e => {
                                const rs = edited.requests.map(r => r.id === req.id ? {...r, estimatedCost: parseFloat(e.target.value)} : r);
                                setEdited({...edited, requests: rs});
                              }}
                            />
                          </div>
                          <button 
                            onClick={() => {
                              const rs = edited.requests.map(r => r.id === req.id ? {...r, approved: !r.approved} : r);
                              setEdited({...edited, requests: rs});
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition ${req.approved ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
                          >
                            {req.approved ? 'Aprobado' : 'Aprobar'}
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {tab === 'qr' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
               <div className="bg-white p-6 rounded-[2rem] shadow-xl border-8 border-gray-50">
                  <img src={qrUrl} className="w-64 h-64" />
               </div>
               <div className="text-center">
                  <p className="font-black text-lg">Control de Acceso QR</p>
                  <p className="text-xs text-gray-400 max-w-xs mt-2">Pegue este código en la puerta de la unidad para que cualquier profesor pueda reportar fallas instantáneamente.</p>
                  <button onClick={() => window.print()} className="mt-6 px-8 py-3 bg-black text-white rounded-2xl font-black uppercase text-xs tracking-widest">Imprimir Etiqueta</button>
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 shrink-0 flex gap-3">
           <button onClick={onClose} className="flex-1 py-4 text-gray-500 font-black uppercase text-xs tracking-widest">Cerrar</button>
           <button onClick={handleSave} className="flex-[2] py-4 bg-black text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-black/20 flex items-center justify-center gap-2">
             <Save size={18} /> Guardar Cambios
           </button>
        </div>
      </div>
    </div>
  );
};

export default UnitModal;