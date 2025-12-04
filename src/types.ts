export type Role = 'MAINTENANCE' | 'TREASURY' | 'VIEWER' | 'ADMIN' | 'SOLICITOR';

export enum Status {
  OPERATIVE = 'OPERATIVE',   // Azul
  PREVENTION = 'PREVENTION', // Naranja
  REPAIR = 'REPAIR',         // Rojo
  REQUEST = 'REQUEST'        // Morado (Solicitud)
}

export type ToolStatus = 'AVAILABLE' | 'IN_USE' | 'BROKEN';

export interface Tool {
  id: string;
  name: string;
  status: ToolStatus;
  assignedTo?: string; // Name of person who has the tool
  assignedDate?: string;
  image?: string;
}

export interface WarehouseItem {
  id: string;
  name: string;
  category: string; // e.g., "Eléctrico", "Plomería", "Pintura"
  quantity: number;
  unit: string; // "Unidad", "Galón", "Metro"
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  condition: 'Good' | 'Fair' | 'Poor';
}

export interface MaterialRequest {
  id: string;
  item: string;
  quantity: number;
  estimatedCost: number;
  approved: boolean;
  date: string;
}

export interface MaintenanceUnit {
  id: string;
  campus: string; // "Sede Principal", "Sede Norte", etc.
  name: string; // e.g., "Salón 101", "Baño Principal"
  type: string; // "Aula", "Pasillo", "Baño"
  description: string;
  status: Status;
  images: string[];
  inventory: InventoryItem[];
  requests: MaterialRequest[];
  lastUpdated: string;
}