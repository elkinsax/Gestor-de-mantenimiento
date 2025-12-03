export type Role = 'MAINTENANCE' | 'TREASURY' | 'VIEWER';

export enum Status {
  OPERATIVE = 'OPERATIVE',   // Azul
  PREVENTION = 'PREVENTION', // Naranja
  REPAIR = 'REPAIR'          // Rojo
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