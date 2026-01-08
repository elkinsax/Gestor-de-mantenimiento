import React, { useState, useEffect } from 'react';
import { MaintenanceUnit, Role, Status, InventoryItem, MaterialRequest, WarehouseItem } from '../types';
import Carousel from './Carousel';
import { X, Save, Plus, DollarSign, Package, AlertTriangle, CheckCircle, Clock, QrCode, Send } from 'lucide-react';

interface UnitModalProps {
  unit: MaintenanceUnit;
  role: Role;
  isOpen: boolean;
  onClose: () => void;
  onSave: (unit: MaintenanceUnit) => void;
  warehouse?: WarehouseItem[]; // Optional prop for checking stock
}

const UnitModal: React.FC<UnitModalProps> = ({ unit, role, isOpen, onClose, onSave, warehouse = [] }) => {
  const [editedUnit, setEditedUnit] = useState<MaintenanceUnit>(unit);
  const [activeTab, setActiveTab] = useState<'info' | 'inventory' | 'requests' | 'qr'>('info');
  
  // Request Form State
  const [newRequestItem, setNewRequestItem] = useState('');
  const [newRequestCost, setNewRequestCost] = useState(0);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');

  useEffect(() => {
    setEditedUnit(unit);
    // Default to info tab when opening
    setActiveTab('info');
  }, [unit]);

  if (!isOpen) return null;

  // Permissions Logic
  const canEditStructure = role === 'MAINTENANCE' || role === 'ADMIN';
  const isTreasury = role === 'TREASURY' || role === 'ADMIN'; 
  const isSolicitor = role === 'SOLICITOR';

  // For solicitors, default view is limited
  const showInventory = !isSolicitor;
  const showCosts = !isSolicitor;

  const handleStatusChange = (status: Status) => {
    if (canEditStructure) {
      setEditedUnit({ ...editedUnit, status });
    }
  };

  const handleInventoryChange = (id: string, field: keyof InventoryItem, value: any) => {
    if (!canEditStructure) return;
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

  const handleWarehouseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      setSelectedWarehouseId(id);
      
      const item = warehouse.find(w => w.id === id);
      if (item) {
          setNewRequestItem(item.name);
          // Optional: You could set a default cost here if you tracked it
      } else {
          setNewRequestItem('');
      }
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
    setSelectedWarehouseId(''); // Reset selector
  };

  const toggleApproval = (reqId: string) => {
    if (!isTreasury) return;
    const newRequests = editedUnit.requests.map(req => 
      req.id === reqId ? { ...req, approved: !req.approved } : req
    );
    setEditedUnit({ ...editedUnit, requests: newRequests });
  };

  // Image Compression Utility
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); 
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      const compressedBase64 = await compressImage(file);
      setEditedUnit(prev => ({
        ...prev,
        images: [...prev.images, compressedBase64].slice(0, 5) // Max 5 photos
      }));
    } catch (error) {
      console.error("Error compressing image:", error);
      alert("Error al procesar la imagen.");
    }
  };

  const handleDeleteImage = (index: number) => {
    if (!canEditStructure && !isSolicitor) return;
    
    const newImages = editedUnit.images.filter((_, i) => i !== index);
    setEditedUnit(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleSolicitorSubmit = () => {
    const updated = { ...editedUnit, status: Status.REQUEST };
    onSave(updated);
  };

  // QR Code URL Generation
  const qrDataUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?unitId=${editedUnit.id}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrDataUrl)}`;

  // Determine availability of currently typed item
  const matchingWarehouseItem = warehouse.find(w => w.name.toLowerCase() === newRequestItem.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900">{editedUnit.name}</h2>
                {isSolicitor && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-bold">MODO SOLICITUD</span>}
            </div>
            <p className="text-sm text-gray-500">{editedUnit.campus} • {editedUnit.type}</p>
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
                  editable={canEditStructure || isSolicitor}
                  onUpload={handleImageUpload}
                  onDelete={handleDeleteImage}
                />
              </div>

              {/* Semaphore Controls (Hidden or Modified for Solicitor) */}
              {!isSolicitor ? (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Estado Actual</h3>
                    <div className="flex gap-2 flex-wrap">
                      {(Object.keys(Status) as Array<keyof typeof Status>).map((key) => {
                        const statusValue = Status[key];
                        const isSelected = editedUnit.status === statusValue;
                        const baseClass = "flex-1 min-w-[80px] py-3 px-1 rounded-md text-sm font-medium transition-all duration-200 border-2 flex flex-col items-center gap-1";
                        
                        let activeClass = "";
                        if (statusValue === Status.OPERATIVE) activeClass = isSelected ? "border-blue-600 bg-blue-50 text-blue-700" : "border-transparent bg-white text-gray-500 hover:bg-gray-100";
                        if (statusValue === Status.PREVENTION) activeClass = isSelected ? "border-orange-500 bg-orange-50 text-orange-700" : "border-transparent bg-white text-gray-500 hover:bg-gray-100";
                        if (statusValue === Status.REPAIR) activeClass = isSelected ? "border-red-600 bg-red-50 text-red-700" : "border-transparent bg-white text-gray-500 hover:bg-gray-100";
                        if (statusValue === Status.REQUEST) activeClass = isSelected ? "border-purple-600 bg-purple-50 text-purple-700" : "border-transparent bg-white text-gray-500 hover:bg-gray-100";

                        return (
                          <button
                            /* Fix: key must be string or number. Casting key to String ensures compatibility with Key type. */
                            key={String(key)}
                            disabled={!canEditStructure}
                            onClick={() => handleStatusChange(statusValue)}
                            className={`${baseClass} ${activeClass} ${!canEditStructure ? 'opacity-70 cursor-not-allowed' : ''}`}
                          >
                            {statusValue === Status.OPERATIVE && <CheckCircle size={18} />}
                            {statusValue === Status.PREVENTION && <Clock size={18} />}
                            {statusValue === Status.REPAIR && <AlertTriangle size={18} />}
                            {statusValue === Status.REQUEST && <Send size={18} />}
                            <span className="text-[10px] uppercase">{statusValue === Status.REQUEST ? 'Solicitud' : statusValue === Status.OPERATIVE ? 'Operativo' : statusValue === Status.PREVENTION ? 'Prevención' : 'Reparación'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
              ) : (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-purple-800 text-sm">
                      <strong>Instrucciones:</strong> Tome fotos de la incidencia y describa el problema abajo. Luego presione "Enviar Solicitud".
                  </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Bitácora / Descripción</label>
                <textarea
                  className="w-full border rounded-md p-3 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                  rows={5}
                  value={editedUnit.description}
                  disabled={!canEditStructure && !isSolicitor}
                  onChange={(e) => setEditedUnit({...editedUnit, description: e.target.value})}
                  placeholder="Descripción del estado, novedades o requerimientos..."
                />
              </div>
            </div>

            {/* Right Column: Tabs */}
            <div className="border-l border-gray-100 flex flex-col h-full bg-gray-50/50">
              <div className="flex border-b bg-white overflow-x-auto">
                 {showInventory && (
                    <button 
                    onClick={() => setActiveTab('inventory')}
                    className={`flex-1 min-w-[100px] py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'inventory' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                    <Package size={18} /> Inventario
                    </button>
                 )}
                 {showCosts && (
                    <button 
                    onClick={() => setActiveTab('requests')}
                    className={`flex-1 min-w-[100px] py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'requests' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                    <DollarSign size={18} /> Costos
                    </button>
                 )}
                 <button 
                    onClick={() => setActiveTab('qr')}
                    className={`flex-1 min-w-[100px] py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'qr' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                 >
                    <QrCode size={18} /> Código QR
                 </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                
                {/* QR TAB */}
                {activeTab === 'qr' && (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                             <img src={qrImageUrl} alt="QR Code" className="w-48 h-48 mix-blend-multiply" />
                        </div>
                        <div className="text-center max-w-xs">
                            <h4 className="font-bold text-gray-900">Acceso Rápido</h4>
                            <p className="text-sm text-gray-500 mt-1">Imprima este código y péguelo en la unidad ({editedUnit.name}) para que los usuarios puedan reportar incidencias escaneándolo.</p>
                            
                            <a href={qrDataUrl} target="_blank" rel="noreferrer" className="block mt-4 text-xs text-blue-600 underline truncate">
                                {qrDataUrl}
                            </a>
                        </div>
                    </div>
                )}

                {/* INVENTORY TAB */}
                {activeTab === 'inventory' && showInventory && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-900">Activos Fijos</h4>
                        {canEditStructure && (
                            <button onClick={addInventoryItem} className="text-xs bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800 transition flex items-center gap-1">
                                <Plus size={14} /> Agregar Item
                            </button>
                        )}
                    </div>
                    
                    {editedUnit.inventory.map((item) => (
                      <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
                        <div className="flex-1">
                          {canEditStructure ? (
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
                             {canEditStructure ? (
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
                            {canEditStructure ? (
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

                {/* REQUESTS TAB */}
                {activeTab === 'requests' && showCosts && (
                  <div className="space-y-6">
                    {/* Add Request Form */}
                    {canEditStructure && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="text-sm font-semibold text-blue-800 mb-3">Nueva Solicitud / Factura</h4>
                        <div className="flex flex-col gap-3">
                            
                            {/* Warehouse Selector */}
                            <div className="relative">
                                <label className="text-[10px] uppercase font-bold text-blue-400 mb-1 block">Recurso (Material o Servicio)</label>
                                {warehouse.length > 0 && (
                                    <select 
                                        className="w-full text-sm border p-2 rounded mb-2 bg-white"
                                        value={selectedWarehouseId}
                                        onChange={handleWarehouseSelect}
                                    >
                                        <option value="">-- Cargar desde Almacén (Opcional) --</option>
                                        {warehouse.map(w => (
                                            <option key={w.id} value={w.id}>
                                                {w.name} (Stock: {w.quantity} {w.unit})
                                            </option>
                                        ))}
                                    </select>
                                )}
                                
                                <div className="flex items-center">
                                    <input 
                                        placeholder="Escriba el nombre del material..."
                                        className="w-full text-sm border p-2 rounded"
                                        value={newRequestItem}
                                        onChange={(e) => setNewRequestItem(e.target.value)}
                                    />
                                    {matchingWarehouseItem && (
                                        <span className={`ml-2 text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${
                                            matchingWarehouseItem.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {matchingWarehouseItem.quantity > 0 ? `Stock: ${matchingWarehouseItem.quantity}` : 'Sin Stock'}
                                        </span>
                                    )}
                                </div>
                            </div>

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
            {isSolicitor && (
                 <button 
                    onClick={handleSolicitorSubmit}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-sm transition flex items-center gap-2"
                >
                    <Send size={16} />
                    Enviar Solicitud
                </button>
            )}
            {(canEditStructure || isTreasury) && (
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