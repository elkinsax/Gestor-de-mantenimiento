
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
  warehouse?: WarehouseItem[];
}

const UnitModal: React.FC<UnitModalProps> = ({ unit, role, isOpen, onClose, onSave, warehouse = [] }) => {
  const [editedUnit, setEditedUnit] = useState<MaintenanceUnit>(unit);
  const [activeTab, setActiveTab] = useState<'info' | 'inventory' | 'requests' | 'qr'>('info');
  const [newRequestItem, setNewRequestItem] = useState('');
  const [newRequestCost, setNewRequestCost] = useState(0);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');

  useEffect(() => {
    setEditedUnit(unit);
    setActiveTab('info');
  }, [unit]);

  if (!isOpen) return null;

  const canEditStructure = role === 'MAINTENANCE' || role === 'ADMIN';
  const isTreasury = role === 'TREASURY' || role === 'ADMIN'; 
  const isSolicitor = role === 'SOLICITOR';

  const handleStatusChange = (status: Status) => {
    if (canEditStructure) {
      setEditedUnit({ ...editedUnit, status });
    }
  };

  const handleInventoryChange = (id: string, field: keyof InventoryItem, value: any) => {
    if (!canEditStructure) return;
    const newInventory = editedUnit.inventory.map(item => item.id === id ? { ...item, [field]: value } : item);
    setEditedUnit({ ...editedUnit, inventory: newInventory });
  };

  const addInventoryItem = () => {
    const newItem: InventoryItem = { id: Date.now().toString(), name: 'Nuevo Item', quantity: 1, condition: 'Good' };
    setEditedUnit({ ...editedUnit, inventory: [...editedUnit.inventory, newItem] });
  };

  const handleWarehouseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      setSelectedWarehouseId(id);
      const item = warehouse.find(w => w.id === id);
      if (item) setNewRequestItem(item.name);
      else setNewRequestItem('');
  };

  const addRequest = () => {
    if (!newRequestItem) return;
    const req: MaterialRequest = { id: Date.now().toString(), item: newRequestItem, quantity: 1, estimatedCost: newRequestCost, approved: false, date: new Date().toISOString().split('T')[0] };
    setEditedUnit({ ...editedUnit, requests: [...editedUnit.requests, req] });
    setNewRequestItem('');
    setNewRequestCost(0);
    setSelectedWarehouseId('');
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX = 1024;
          if (width > height) { if (width > MAX) { height *= MAX / width; width = MAX; } }
          else { if (height > MAX) { width *= MAX / height; height = MAX; } }
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); 
        };
      };
    });
  };

  const handleImageUpload = async (file: File) => {
    try {
      const compressedBase64 = await compressImage(file);
      setEditedUnit(prev => ({ ...prev, images: [...prev.images, compressedBase64].slice(0, 5) }));
    } catch (e) { console.error(e); }
  };

  const handleDeleteImage = (index: number) => {
    if (!canEditStructure && !isSolicitor) return;
    setEditedUnit(prev => ({ ...prev, images: editedUnit.images.filter((_, i) => i !== index) }));
  };

  const qrDataUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?unitId=${editedUnit.id}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrDataUrl)}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl flex flex-col cursor-default"
        onClick={e => e.stopPropagation()}
      >
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

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 space-y-6">
              <div className="rounded-lg overflow-hidden shadow-md">
                <Carousel images={editedUnit.images} heightClass="h-72" editable={canEditStructure || isSolicitor} onUpload={handleImageUpload} onDelete={handleDeleteImage} />
              </div>
              {!isSolicitor ? (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Estado Actual</h3>
                    <div className="flex gap-2 flex-wrap">
                      {(Object.keys(Status) as Array<keyof typeof Status>).map((key) => {
                        const statusValue = Status[key];
                        const isSelected = editedUnit.status === statusValue;
                        let cls = isSelected ? "border-black bg-gray-100" : "border-transparent bg-white text-gray-500";
                        return (
                          <button key={key} disabled={!canEditStructure} onClick={() => handleStatusChange(statusValue)} className={`flex-1 min-w-[80px] py-3 px-1 rounded-md text-sm font-medium border-2 transition flex flex-col items-center gap-1 ${cls}`}>
                            {statusValue === Status.OPERATIVE && <CheckCircle size={18} />}
                            {statusValue === Status.PREVENTION && <Clock size={18} />}
                            {statusValue === Status.REPAIR && <AlertTriangle size={18} />}
                            {statusValue === Status.REQUEST && <Send size={18} />}
                            <span className="text-[10px] uppercase font-bold">{statusValue}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
              ) : (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-purple-800 text-sm">
                      <strong>Instrucciones:</strong> Tome fotos de la incidencia y describa el problema.
                  </div>
              )}
              <textarea className="w-full border rounded-md p-3 text-sm focus:ring-2 focus:ring-black outline-none transition" rows={5} value={editedUnit.description} disabled={!canEditStructure && !isSolicitor} onChange={(e) => setEditedUnit({...editedUnit, description: e.target.value})} placeholder="Bitácora..." />
            </div>

            <div className="border-l border-gray-100 flex flex-col h-full bg-gray-50/50">
              <div className="flex border-b bg-white overflow-x-auto">
                 {!isSolicitor && <button onClick={() => setActiveTab('inventory')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'inventory' ? 'border-black' : 'border-transparent text-gray-500'}`}><Package size={18} /> Inventario</button>}
                 {!isSolicitor && <button onClick={() => setActiveTab('requests')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'requests' ? 'border-black' : 'border-transparent text-gray-500'}`}><DollarSign size={18} /> Costos</button>}
                 <button onClick={() => setActiveTab('qr')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'qr' ? 'border-black' : 'border-transparent text-gray-500'}`}><QrCode size={18} /> QR</button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                {activeTab === 'qr' && (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                             <img src={qrImageUrl} alt="QR" className="w-48 h-48" />
                        </div>
                        <p className="text-xs text-gray-500 text-center">Escanee para reportar incidencias en {editedUnit.name}.</p>
                    </div>
                )}
                {activeTab === 'inventory' && (
                  <div className="space-y-4">
                    {editedUnit.inventory.map((item) => (
                      <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
                        <p className="flex-1 font-medium">{item.name}</p>
                        <span className="text-xs font-mono">{item.quantity} {item.condition}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-md transition">Cancelar</button>
            <button onClick={() => onSave(editedUnit)} className="px-6 py-2.5 text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-md shadow-sm transition flex items-center gap-2 uppercase tracking-widest">
                <Save size={16} /> Guardar
            </button>
        </div>
      </div>
    </div>
  );
};

export default UnitModal;
