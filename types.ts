// Added SOLICITOR to Role and REQUEST to Status. Added Organization, AuthData and orgId to entities.
export type Role = 'MAINTENANCE' | 'TREASURY' | 'VIEWER' | 'ADMIN' | 'SOLICITOR';

export enum Status {
  OPERATIVE = 'OPERATIVE',   // Azul
  PREVENTION = 'PREVENTION', // Naranja
  REPAIR = 'REPAIR',         // Rojo
  REQUEST = 'REQUEST'        // Púrpura
}

export type ToolStatus = 'AVAILABLE' | 'IN_USE' | 'BROKEN';

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  sheetsUrl?: string;
}

export interface Tool {
  id: string;
  orgId: string;
  name: string;
  status: ToolStatus;
  assignedTo?: string; // Name of person who has the tool
  assignedDate?: string;
  image?: string;
}

export interface WarehouseItem {
  id: string;
  orgId: string;
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
  orgId: string;
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

export interface AuthData {
  [role: string]: string;
}
