
import React, { useState, useEffect, useCallback } from 'react';
/* Added RefreshCw to icons imported from lucide-react */
import { X, Package, Wrench, User, Calendar, Plus, Minus, AlertCircle, RefreshCw } from 'lucide-react';
import { Tool, WarehouseItem } from '../types';
import { getTools, updateTool, addTool, getWarehouse, updateWarehouseItem, addWarehouseItem } from '../services/sheetService';

interface WarehouseModalProps {
  onClose: () => void;
}

const WarehouseModal: React.FC<WarehouseModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'tools'>('materials');
  const [tools, setTools] = useState<Tool[]>([]);
  const [materials, setMaterials] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Forms state
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [newMaterial, setNewMaterial] = useState<Partial<WarehouseItem>>({ name: '', quantity: 0, category: 'General', unit: 'Unidad' });
  const [newToolName, setNewToolName] = useState('');

  // Tool Checkout State
  const [checkoutToolId, setCheckoutToolId] = useState<string | null>(null);
  const [assigneeName, setAssigneeName] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [t, m] = await Promise.all([getTools(), getWarehouse()]);
      setTools(t);
      setMaterials(m);
    } catch (e) {
      console.error("Error al cargar inventario:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    
    // Soporte para cerrar con Escape
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [loadData, onClose]);

  const handleStockChange = async (item: WarehouseItem, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    const updated = { ...item, quantity: newQty };
    await updateWarehouseItem(updated);
    setMaterials(materials.map(m => m.id === item.id ? updated : m));
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMaterial.name && newMaterial.quantity !== undefined) {
      const item: WarehouseItem = {
        id: Date.now().toString(),
        orgId: '', 
        name: newMaterial.name,
        quantity: newMaterial.quantity,
        category: newMaterial.category || 'General',
        unit: newMaterial.unit || 'Unidad'
      };
      await addWarehouseItem(item);
      setMaterials([...materials, item]);
      setIsAddingMaterial(false);
      setNewMaterial({ name: '', quantity: 0, category: 'General', unit: 'Unidad' });
    }
  };

  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newToolName.trim()) {
      const tool: Tool = {
        id: Date.now().toString(),
        orgId: '', 
        name: newToolName,
        status: 'AVAILABLE'
      };
      await addTool(tool);
      setTools([...tools, tool]);
      setNewToolName('');
    }
  };

  const handleCheckoutTool = async () => {
    if (checkoutToolId && assigneeName.trim()) {
      const tool = tools.find(t => t.id === checkoutToolId);
      if (tool) {
        const updated: Tool = {
          ...tool,
          status: 'IN_USE',
          assignedTo: assigneeName,
          assignedDate: new Date().toISOString().split('T')[0]
        };
        await updateTool(updated);
        setTools(tools.map(t => t.id === checkoutToolId ? updated : t));
        setCheckoutToolId(null);
        setAssigneeName('');
      }
    }
  };

  const handleReturnTool = async (tool: Tool) => {
    const updated: Tool = {
      ...tool,
      status: 'AVAILABLE',
      assignedTo: undefined,
      assignedDate: undefined
    };
    await updateTool(updated);
    setTools(tools.map(t => t.id === tool.id ? updated : t));
  };

  const handleReportBroken = async (tool: Tool) => {
    if (confirm(`¿Marcar ${tool.name} como AVERIADA?`)) {
        const updated: Tool = { ...tool, status: 'BROKEN' };
        await updateTool(updated);
        setTools(tools.map(t => t.id === tool.id ? updated : t));
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-4xl h-[90vh] md:h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header con botón de cerrar mas grande */}
        <div className="bg-gray-900 text-white p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <Package size={24} className="text-blue-400" />
            <h2 className="text-xl font-bold uppercase tracking-tight">Almacén e Inventario</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 -mr-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-90"
            title="Cerrar modal"
          >
            <X size={28} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b shrink-0 bg-white">
            <button 
                onClick={() => setActiveTab('materials')}
                className={`flex-1 py-5 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'materials' ? 'border-black text-black bg-gray-50' : 'border-transparent text-gray-400 hover:text-black'}`}
            >
                <Package size={16} /> Materiales
            </button>
            <button 
                onClick={() => setActiveTab('tools')}
                className={`flex-1 py-5 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'tools' ? 'border-black text-black bg-gray-50' : 'border-transparent text-gray-400 hover:text-black'}`}
            >
                <Wrench size={16} /> Herramientas
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                    <RefreshCw className="animate-spin" size={32} />
                    <p className="font-bold uppercase text-xs tracking-widest">Sincronizando inventario...</p>
                </div>
            ) : (
                <>
                    {activeTab === 'materials' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-black text-gray-800 uppercase text-sm tracking-widest">Existencias Actuales</h3>
                                    <button 
                                        onClick={() => setIsAddingMaterial(!isAddingMaterial)}
                                        className={`text-xs px-4 py-2 rounded-xl font-bold uppercase tracking-widest transition shadow-sm ${isAddingMaterial ? 'bg-gray-100 text-gray-500' : 'bg-black text-white hover:bg-blue-600'}`}
                                    >
                                        {isAddingMaterial ? 'Cancelar' : '+ Nuevo'}
                                    </button>
                                </div>

                                {isAddingMaterial && (
                                    <form onSubmit={handleAddMaterial} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4">
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Descripción</label>
                                            <input required className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black" placeholder="Nombre del material" value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Categoría</label>
                                            <select className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none" value={newMaterial.category} onChange={e => setNewMaterial({...newMaterial, category: e.target.value})}>
                                                <option value="General">General</option>
                                                <option value="Eléctrico">Eléctrico</option>
                                                <option value="Plomería">Plomería</option>
                                                <option value="Pintura">Pintura</option>
                                                <option value="Limpieza">Limpieza</option>
                                            </select>
                                        </div>
                                        <button type="submit" className="bg-blue-600 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 mt-auto">Guardar</button>
                                    </form>
                                )}

                                <div className="overflow-x-auto -mx-6">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-y">
                                            <tr>
                                                <th className="px-6 py-4">Item</th>
                                                <th className="px-6 py-4">Categoría</th>
                                                <th className="px-6 py-4 text-center">Stock</th>
                                                <th className="px-6 py-4 text-right">Ajuste</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {materials.map(item => (
                                                <tr key={item.id} className="hover:bg-gray-50/50 transition">
                                                    <td className="px-6 py-5 font-bold text-gray-800">{item.name}</td>
                                                    <td className="px-6 py-5"><span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-bold uppercase">{item.category}</span></td>
                                                    <td className="px-6 py-5 text-center"><span className={`font-mono text-lg font-black ${item.quantity < 5 ? 'text-red-500' : 'text-gray-900'}`}>{item.quantity}</span></td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button onClick={() => handleStockChange(item, 1)} className="p-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200 transition active:scale-90"><Plus size={16} /></button>
                                                            <button onClick={() => handleStockChange(item, -1)} className="p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 transition active:scale-90"><Minus size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {materials.length === 0 && (
                                                <tr><td colSpan={4} className="text-center py-12 text-gray-400 font-medium">No hay registros en almacén.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tools' && (
                        <div className="space-y-6">
                             <form onSubmit={handleAddTool} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-3 items-center">
                                 <div className="bg-black text-white p-3 rounded-xl"><Wrench size={20} /></div>
                                 <input className="flex-1 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none font-medium" placeholder="Nueva herramienta (Ej: Rotomartillo Hilti)" value={newToolName} onChange={(e) => setNewToolName(e.target.value)} />
                                 <button disabled={!newToolName.trim()} type="submit" className="bg-black text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition">Agregar</button>
                             </form>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tools.map(tool => (
                                    <div key={tool.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="font-bold text-gray-800 text-lg leading-tight">{tool.name}</h4>
                                                <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                                                    tool.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                                                    tool.status === 'IN_USE' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {tool.status === 'AVAILABLE' ? 'Disponible' : tool.status === 'IN_USE' ? 'En Uso' : 'Averiada'}
                                                </span>
                                            </div>
                                            
                                            {tool.status === 'IN_USE' && (
                                                <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 text-[11px] text-orange-800 mb-4 animate-in fade-in">
                                                    <div className="flex items-center gap-2 font-black mb-1"><User size={14}/> {tool.assignedTo}</div>
                                                    <div className="flex items-center gap-2 font-bold opacity-70"><Calendar size={14}/> {tool.assignedDate}</div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t pt-4 mt-2">
                                            {tool.status === 'AVAILABLE' && (
                                                checkoutToolId === tool.id ? (
                                                    <div className="flex gap-2 animate-in slide-in-from-right-2">
                                                        <input autoFocus placeholder="¿Quién retira?" className="flex-1 text-xs border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500" value={assigneeName} onChange={e => setAssigneeName(e.target.value)} />
                                                        <button onClick={handleCheckoutTool} className="bg-blue-600 text-white text-xs px-4 rounded-lg font-black uppercase tracking-widest">OK</button>
                                                        <button onClick={() => setCheckoutToolId(null)} className="p-2 text-gray-400 hover:text-red-500"><X size={18}/></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2 w-full">
                                                        <button onClick={() => { setCheckoutToolId(tool.id); setAssigneeName(''); }} className="flex-1 bg-gray-900 text-white text-[10px] font-black py-3 rounded-xl uppercase tracking-widest hover:bg-blue-600 transition shadow-sm">Asignar Préstamo</button>
                                                        <button onClick={() => handleReportBroken(tool)} className="p-3 text-red-300 hover:text-red-600 transition" title="Reportar Daño"><AlertCircle size={20} /></button>
                                                    </div>
                                                )
                                            )}

                                            {tool.status === 'IN_USE' && (
                                                <button onClick={() => handleReturnTool(tool)} className="w-full bg-green-600 text-white text-[10px] font-black py-3 rounded-xl uppercase tracking-widest hover:bg-green-700 shadow-sm transition">Finalizar Préstamo</button>
                                            )}
                                            
                                            {tool.status === 'BROKEN' && (
                                                 <button onClick={() => handleReturnTool(tool)} className="w-full bg-white border border-gray-200 text-gray-900 text-[10px] font-black py-3 rounded-xl uppercase tracking-widest hover:bg-gray-50 transition">Habilitar Reparada</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default WarehouseModal;
