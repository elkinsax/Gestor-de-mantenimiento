import React, { useState, useEffect } from 'react';
import { X, Package, Wrench, User, Calendar, Plus, Minus, Search, AlertCircle } from 'lucide-react';
import { Tool, WarehouseItem } from '../types';
import { getTools, updateTool, addTool, getWarehouse, updateWarehouseItem, addWarehouseItem } from '../services/sheetService';

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WarehouseModal: React.FC<WarehouseModalProps> = ({ isOpen, onClose }) => {
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

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    const [t, m] = await Promise.all([getTools(), getWarehouse()]);
    setTools(t);
    setMaterials(m);
    setLoading(false);
  };

  // --- MATERIAL ACTIONS ---

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

  // --- TOOL ACTIONS ---

  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newToolName.trim()) {
      const tool: Tool = {
        id: Date.now().toString(),
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Package size={20} />
            <h2 className="text-xl font-bold">Gestión de Almacén y Herramientas</h2>
          </div>
          <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded transition">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b shrink-0">
            <button 
                onClick={() => setActiveTab('materials')}
                className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'materials' ? 'border-black text-black bg-gray-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
            >
                <Package size={18} /> Materiales y Consumibles
            </button>
            <button 
                onClick={() => setActiveTab('tools')}
                className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'tools' ? 'border-black text-black bg-gray-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
            >
                <Wrench size={18} /> Herramientas y Equipos
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            
            {loading && <div className="text-center py-10">Cargando inventario...</div>}

            {/* --- MATERIALS TAB --- */}
            {!loading && activeTab === 'materials' && (
                <div className="space-y-6">
                    {/* Add Material Form */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800">Inventario de Consumibles</h3>
                            <button 
                                onClick={() => setIsAddingMaterial(!isAddingMaterial)}
                                className="text-sm bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800 transition flex items-center gap-1"
                            >
                                <Plus size={14} /> {isAddingMaterial ? 'Cancelar' : 'Nuevo Material'}
                            </button>
                        </div>

                        {isAddingMaterial && (
                            <form onSubmit={handleAddMaterial} className="bg-gray-50 p-3 rounded-lg mb-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                                <div className="md:col-span-2">
                                    <label className="text-xs text-gray-500 block mb-1">Nombre</label>
                                    <input 
                                        required
                                        className="w-full border rounded px-2 py-1.5 text-sm"
                                        placeholder="Ej: Pintura Roja"
                                        value={newMaterial.name}
                                        onChange={e => setNewMaterial({...newMaterial, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Categoría</label>
                                    <select 
                                        className="w-full border rounded px-2 py-1.5 text-sm"
                                        value={newMaterial.category}
                                        onChange={e => setNewMaterial({...newMaterial, category: e.target.value})}
                                    >
                                        <option value="General">General</option>
                                        <option value="Eléctrico">Eléctrico</option>
                                        <option value="Plomería">Plomería</option>
                                        <option value="Pintura">Pintura</option>
                                        <option value="Limpieza">Limpieza</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Cant. Inicial</label>
                                    <input 
                                        type="number"
                                        className="w-full border rounded px-2 py-1.5 text-sm"
                                        value={newMaterial.quantity}
                                        onChange={e => setNewMaterial({...newMaterial, quantity: parseInt(e.target.value)})}
                                    />
                                </div>
                                <button type="submit" className="bg-green-600 text-white py-1.5 rounded text-sm hover:bg-green-700">Guardar</button>
                            </form>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-600 font-medium">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-lg">Item</th>
                                        <th className="px-4 py-3">Categoría</th>
                                        <th className="px-4 py-3">Unidad</th>
                                        <th className="px-4 py-3 text-center">Stock</th>
                                        <th className="px-4 py-3 rounded-tr-lg text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {materials.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50 group">
                                            <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                                            <td className="px-4 py-3 text-gray-500"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{item.category}</span></td>
                                            <td className="px-4 py-3 text-gray-500">{item.unit}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`font-bold ${item.quantity < 5 ? 'text-red-500' : 'text-gray-800'}`}>
                                                    {item.quantity}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleStockChange(item, 1)}
                                                        className="p-1 bg-green-50 text-green-700 rounded hover:bg-green-100 border border-green-200" title="Ingresar Stock"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStockChange(item, -1)}
                                                        className="p-1 bg-red-50 text-red-700 rounded hover:bg-red-100 border border-red-200" title="Retirar Stock"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {materials.length === 0 && (
                                        <tr><td colSpan={5} className="text-center py-6 text-gray-400">No hay materiales registrados.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TOOLS TAB --- */}
            {!loading && activeTab === 'tools' && (
                <div className="space-y-6">
                    
                     {/* Add Tool Form */}
                     <form onSubmit={handleAddTool} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-2 items-center">
                         <div className="bg-black text-white p-2 rounded">
                            <Wrench size={18} />
                         </div>
                         <input 
                            className="flex-1 border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
                            placeholder="Registrar nueva herramienta (ej: Taladro Bosch)"
                            value={newToolName}
                            onChange={(e) => setNewToolName(e.target.value)}
                         />
                         <button disabled={!newToolName.trim()} type="submit" className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50">
                             Agregar
                         </button>
                     </form>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tools.map(tool => (
                            <div key={tool.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-gray-800">{tool.name}</h4>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${
                                            tool.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                                            tool.status === 'IN_USE' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {tool.status === 'AVAILABLE' ? 'Disponible' : tool.status === 'IN_USE' ? 'En Uso' : 'Averiada'}
                                        </span>
                                    </div>
                                    
                                    {tool.status === 'IN_USE' && (
                                        <div className="bg-orange-50 p-2 rounded border border-orange-100 text-xs text-orange-800 mb-3">
                                            <div className="flex items-center gap-1 font-semibold mb-0.5"><User size={12}/> {tool.assignedTo}</div>
                                            <div className="flex items-center gap-1 opacity-80"><Calendar size={12}/> {tool.assignedDate}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="border-t pt-3 mt-2 flex justify-between items-center">
                                    {tool.status === 'AVAILABLE' && (
                                        checkoutToolId === tool.id ? (
                                            <div className="flex-1 flex gap-2 animate-in fade-in">
                                                <input 
                                                    autoFocus
                                                    placeholder="¿Quién retira?"
                                                    className="flex-1 text-xs border rounded px-2 py-1"
                                                    value={assigneeName}
                                                    onChange={e => setAssigneeName(e.target.value)}
                                                />
                                                <button onClick={handleCheckoutTool} className="bg-blue-600 text-white text-xs px-2 rounded hover:bg-blue-700">OK</button>
                                                <button onClick={() => setCheckoutToolId(null)} className="text-gray-500 hover:text-gray-800"><X size={14}/></button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 w-full">
                                                <button 
                                                    onClick={() => { setCheckoutToolId(tool.id); setAssigneeName(''); }}
                                                    className="flex-1 bg-white border border-gray-300 text-gray-700 text-xs font-medium py-1.5 rounded hover:bg-gray-50"
                                                >
                                                    Prestar
                                                </button>
                                                <button 
                                                    onClick={() => handleReportBroken(tool)}
                                                    className="px-2 text-red-400 hover:text-red-600 text-xs" title="Reportar Avería"
                                                >
                                                    <AlertCircle size={16} />
                                                </button>
                                            </div>
                                        )
                                    )}

                                    {tool.status === 'IN_USE' && (
                                        <button 
                                            onClick={() => handleReturnTool(tool)}
                                            className="w-full bg-green-600 text-white text-xs font-medium py-1.5 rounded hover:bg-green-700 shadow-sm"
                                        >
                                            Recibir (Devolución)
                                        </button>
                                    )}
                                    
                                    {tool.status === 'BROKEN' && (
                                         <button 
                                            onClick={() => handleReturnTool(tool)}
                                            className="w-full bg-white border border-gray-300 text-gray-700 text-xs font-medium py-1.5 rounded hover:bg-gray-50"
                                        >
                                            Reparada (Habilitar)
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                     </div>
                     
                     {tools.length === 0 && <div className="text-center py-10 text-gray-400">No hay herramientas registradas.</div>}
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default WarehouseModal;