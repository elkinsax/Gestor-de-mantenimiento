import React, { useState, useEffect } from 'react';
import { MaintenanceUnit, Role, Status, InventoryItem, MaterialRequest } from '../types';
import Carousel from './Carousel';
import { X, Save, Plus, Trash2, DollarSign, Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface UnitModalProps {
  unit: MaintenanceUnit;
  role: Role;
  isOpen: boolean;
  onClose: () => void;
  onSave: (unit: MaintenanceUnit) => void;
}

const UnitModal: React.FC<UnitModalProps> = ({ unit, role, isOpen, onClose, onSave }) => {
  const [editedUnit, setEditedUnit] = useState<MaintenanceUnit>(unit);
  const [activeTab, setActiveTab] = useState<'info' | 'inventory' | 'requests'>('info');
  const [newRequestItem, setNewRequestItem] = useState('');
  const [newRequestCost, setNewRequestCost] = useState(0);

  useEffect(() => {
    setEditedUnit(unit);
  }, [unit]);

  if (!isOpen) return null;

  const isMaintenance = role === 'MAINTENANCE';
  const isTreasury = role === 'TREASURY';

  const handleStatusChange = (status: Status) => {
    if (isMaintenance) {
      setEditedUnit({ ...editedUnit, status });
    }
  };

  const handleInventoryChange = (id: string, field: keyof InventoryItem, value: any) => {
    if (!isMaintenance) return;
    const newInventory = editedUnit.inventory.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setEditedUnit({ ...editedUnit, inventory: newInventory });
  };

  const addInventoryItem = () => {
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: 'Nuevo Item',
      quantity: 1,
      condition: 'Good'
    };
    setEditedUnit({ ...editedUnit, inventory: [...editedUnit.inventory, newItem] });
  };

  const addRequest = () => {
    if (!newRequestItem) return;
    const req: MaterialRequest = {
      id: Date.now().toString(),
      item: newRequestItem,
      quantity: 1,
      estimatedCost: newRequestCost,
      approved: false,
      date: new Date().toISOString().split('T')[0]
    };
    setEditedUnit({ ...editedUnit, requests: [...editedUnit.requests, req] });
    setNewRequestItem('');
    setNewRequestCost(0);
  };

  const toggleApproval = (reqId: string) => {
    if (!isTreasury) return;
    const newRequests = editedUnit.requests.map(req => 
      req.id === reqId ? { ...req, approved: !req.approved } : req
    );
    setEditedUnit({ ...editedUnit, requests: newRequests });
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setEditedUnit(prev => ({
        ...prev,
        images: [...prev.images, base64].slice(0, 5) // Max 5 photos
      }));
    };
    reader.readAsDataURL(file);
  };

  const getStatusColor = (s: Status) => {
    switch (s) {
      case Status.OPERATIVE: return 'bg-blue-600 text-white';
      case Status.PREVENTION: return 'bg-orange-500 text-white';
      case Status.REPAIR: return 'bg-red-600 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{editedUnit.name}</h2>
            <p className="text-sm text-gray-500">{editedUnit.campus} • {editedUnit.type} • ID: {editedUnit.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Visuals & Status */}
            <div className="p-6 space-y-6">
              <div className="rounded-lg overflow-hidden shadow-md">
                <Carousel 
                  images={editedUnit.images} 
                  heightClass="h-72" 
                  editable={isMaintenance}
                  onUpload={handleImageUpload}
                />
              </div>

              {/* Semaphore Controls */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Estado Actual (Semaforización)</h3>
                <div className="flex gap-2">
                  {(Object.keys(Status) as Array<keyof typeof Status>).map((key) => {
                    const statusValue = Status[key];
                    const isSelected = editedUnit.status === statusValue;
                    const baseClass = "flex-1 py-3 px-2 rounded-md text-sm font-medium transition-all duration-200 border-2 flex flex-col items-center gap-1";
                    
                    let activeClass = "";
                    if (statusValue === Status.OPERATIVE) activeClass = isSelected ? "border-blue-600 bg-blue-50 text-blue-700" : "border-transparent bg-white text-gray-500 hover:bg-gray-100";
                    if (statusValue === Status.PREVENTION) activeClass = isSelected ? "border-orange-500 bg-orange-50 text-orange-700" : "border-transparent bg-white text-gray-500 hover:bg-gray-100";
                    if (statusValue === Status.REPAIR) activeClass = isSelected ? "border-red-600 bg-red-50 text-red-700" : "border-transparent bg-white text-gray-500 hover:bg-gray-100";

                    return (
                      <button
                        key={key}
                        disabled={!isMaintenance}
                        onClick={() => handleStatusChange(statusValue)}
                        className={`${baseClass} ${activeClass} ${!isMaintenance ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                         {statusValue === Status.OPERATIVE && <CheckCircle size={20} className={isSelected ? 'text-blue-600' : 'text-gray-400'} />}
                         {statusValue === Status.PREVENTION && <Clock size={20} className={isSelected ? 'text-orange-500' : 'text-gray-400'} />}
                         {statusValue === Status.REPAIR && <AlertTriangle size={20} className={isSelected ? 'text-red-600' : 'text-gray-400'} />}
                        <span>{statusValue === Status.OPERATIVE ? 'Operativo' : statusValue === Status.PREVENTION ? 'Prevención' : 'Reparación'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Bitácora / Descripción</label>
                <textarea
                  className="w-full border rounded-md p-3 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                  rows={5}
                  value={editedUnit.description}
                  disabled={!isMaintenance}
                  onChange={(e) => setEditedUnit({...editedUnit, description: e.target.value})}
                  placeholder="Descripción del estado, novedades o requerimientos..."
                />
              </div>
            </div>

            {/* Right Column: Tabs */}
            <div className="border-l border-gray-100 flex flex-col h-full bg-gray-50/50">
              <div className="flex border-b bg-white">
                <button 
                  onClick={() => setActiveTab('inventory')}
                  className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'inventory' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <Package size={18} /> Inventario
                </button>
                <button 
                  onClick={() => setActiveTab('requests')}
                  className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'requests' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <DollarSign size={18} /> Costos & Solicitudes
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                {activeTab === 'inventory' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-900">Activos Fijos</h4>
                        {isMaintenance && (
                            <button onClick={addInventoryItem} className="text-xs bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800 transition flex items-center gap-1">
                                <Plus size={14} /> Agregar Item
                            </button>
                        )}
                    </div>
                    
                    {editedUnit.inventory.map((item) => (
                      <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
                        <div className="flex-1">
                          {isMaintenance ? (
                            <input 
                              value={item.name} 
                              onChange={(e) => handleInventoryChange(item.id, 'name', e.target.value)}
                              className="font-medium text-gray-900 w-full border-b border-dashed border-gray-300 focus:border-black outline-none bg-transparent py-1"
                            />
                          ) : (
                            <p className="font-medium text-gray-900">{item.name}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Cant:</span>
                             {isMaintenance ? (
                                <input 
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleInventoryChange(item.id, 'quantity', parseInt(e.target.value))}
                                  className="w-12 text-center border rounded py-1 text-sm"
                                />
                             ) : (
                                <span className="font-mono">{item.quantity}</span>
                             )}
                        </div>

                        <div className="w-24">
                            {isMaintenance ? (
                                <select 
                                    value={item.condition}
                                    onChange={(e) => handleInventoryChange(item.id, 'condition', e.target.value)}
                                    className="w-full text-xs border rounded py-1"
                                >
                                    <option value="Good">Bueno</option>
                                    <option value="Fair">Regular</option>
                                    <option value="Poor">Malo</option>
                                </select>
                            ) : (
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    item.condition === 'Good' ? 'bg-green-100 text-green-800' : 
                                    item.condition === 'Fair' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {item.condition === 'Good' ? 'Bueno' : item.condition === 'Fair' ? 'Regular' : 'Malo'}
                                </span>
                            )}
                        </div>
                      </div>
                    ))}
                    {editedUnit.inventory.length === 0 && (
                        <p className="text-center text-gray-400 py-8 text-sm">No hay inventario registrado.</p>
                    )}
                  </div>
                )}

                {activeTab === 'requests' && (
                  <div className="space-y-6">
                    {/* Add Request Form */}
                    {isMaintenance && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="text-sm font-semibold text-blue-800 mb-3">Nueva Solicitud / Factura</h4>
                        <div className="flex flex-col gap-3">
                            <input 
                                placeholder="Nombre del material / servicio"
                                className="w-full text-sm border p-2 rounded"
                                value={newRequestItem}
                                onChange={(e) => setNewRequestItem(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-2 top-2 text-gray-500 text-sm">$</span>
                                    <input 
                                        type="number"
                                        placeholder="Costo Est."
                                        className="w-full text-sm border p-2 pl-6 rounded"
                                        value={newRequestCost || ''}
                                        onChange={(e) => setNewRequestCost(parseFloat(e.target.value))}
                                    />
                                </div>
                                <button onClick={addRequest} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                                    Solicitar
                                </button>
                            </div>
                        </div>
                      </div>
                    )}

                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex justify-between items-center">
                            Historial de Solicitudes
                            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">Total: ${editedUnit.requests.reduce((acc, curr) => curr.approved ? acc + curr.estimatedCost : acc, 0).toLocaleString()}</span>
                        </h4>
                        <div className="space-y-3">
                            {editedUnit.requests.map((req) => (
                                <div key={req.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium text-sm text-gray-900">{req.item}</span>
                                        <span className="font-mono text-sm text-gray-600">${req.estimatedCost.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400">{req.date}</span>
                                        {isTreasury ? (
                                            <button 
                                                onClick={() => toggleApproval(req.id)}
                                                className={`text-xs px-3 py-1 rounded-full border transition ${
                                                    req.approved 
                                                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                {req.approved ? 'Aprobado' : 'Aprobar Gasto'}
                                            </button>
                                        ) : (
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${req.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {req.approved ? 'Aprobado' : 'Pendiente'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {editedUnit.requests.length === 0 && (
                                <p className="text-center text-gray-400 py-8 text-sm italic">Sin solicitudes pendientes.</p>
                            )}
                        </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-md transition"
            >
                Cancelar
            </button>
            {(isMaintenance || isTreasury) && (
                <button 
                    onClick={() => onSave(editedUnit)}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-md shadow-sm transition flex items-center gap-2"
                >
                    <Save size={16} />
                    Guardar Cambios
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default UnitModal;