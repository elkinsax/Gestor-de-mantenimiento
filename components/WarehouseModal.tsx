import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Wrench, User, Calendar, Trash2 } from 'lucide-react';
import { Tool, WarehouseItem } from '../types';
import { sheetService } from '../services/sheetService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const WarehouseModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [activeTab, setActiveTab] = useState<'items' | 'tools'>('items');

  useEffect(() => {
    if (isOpen) {
      setTools(sheetService.getTools());
      setItems(sheetService.getWarehouse());
    }
  }, [isOpen]);

  const saveAll = (t: Tool[], i: WarehouseItem[]) => {
    sheetService.saveTools(t);
    sheetService.saveWarehouse(i);
    setTools(t);
    setItems(i);
  };

  const handleStock = (id: string, delta: number) => {
    const next = items.map(it => it.id === id ? {...it, quantity: Math.max(0, it.quantity + delta)} : it);
    saveAll(tools, next);
  };

  const checkoutTool = (id: string, name: string) => {
    const next = tools.map(t => t.id === id ? {
      ...t, 
      status: 'IN_USE' as any, 
      assignedTo: name, 
      assignedDate: new Date().toISOString().split('T')[0]
    } : t);
    saveAll(next, items);
  };

  const returnTool = (id: string) => {
    const next = tools.map(t => t.id === id ? {...t, status: 'AVAILABLE' as any, assignedTo: undefined, assignedDate: undefined} : t);
    saveAll(next, items);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Bodega Interna</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><X size={24} /></button>
        </div>

        <div className="flex bg-gray-50 p-2 gap-2 shrink-0">
           <button onClick={() => setActiveTab('items')} className={`flex-1 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest ${activeTab === 'items' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>Materiales</button>
           <button onClick={() => setActiveTab('tools')} className={`flex-1 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest ${activeTab === 'tools' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>Herramientas</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {activeTab === 'items' ? (
            <div className="grid gap-3">
               {items.map(it => (
                 <div key={it.id} className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-black text-sm">{it.name}</p>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{it.category}</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className={`font-black text-xl ${it.quantity < 5 ? 'text-red-500' : 'text-black'}`}>{it.quantity}</span>
                       <div className="flex gap-1">
                          <button onClick={() => handleStock(it.id, -1)} className="p-2 bg-white border rounded-xl hover:bg-red-50 text-red-600"><Minus size={16}/></button>
                          <button onClick={() => handleStock(it.id, 1)} className="p-2 bg-white border rounded-xl hover:bg-green-50 text-green-600"><Plus size={16}/></button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          ) : (
            <div className="grid gap-3">
               {tools.map(t => (
                 <div key={t.id} className="bg-gray-50 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.status === 'AVAILABLE' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                          <Wrench size={20} />
                       </div>
                       <div>
                          <p className="font-black text-sm">{t.name}</p>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t.status === 'AVAILABLE' ? 'Disponible' : 'En Préstamo'}</span>
                       </div>
                    </div>
                    {t.status === 'IN_USE' ? (
                      <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-orange-100">
                        <div className="text-[10px]">
                           <p className="font-black text-orange-600 uppercase tracking-tighter flex items-center gap-1"><User size={10}/> {t.assignedTo}</p>
                           <p className="text-gray-400 flex items-center gap-1"><Calendar size={10}/> {t.assignedDate}</p>
                        </div>
                        <button onClick={() => returnTool(t.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-[10px] font-black uppercase">Recibir</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                         <input id={`user-${t.id}`} placeholder="¿Quién lo lleva?" className="text-xs bg-white border px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-black" />
                         <button onClick={() => {
                           const val = (document.getElementById(`user-${t.id}`) as HTMLInputElement).value;
                           if(val) checkoutTool(t.id, val);
                         }} className="px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase">Prestar</button>
                      </div>
                    )}
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarehouseModal;