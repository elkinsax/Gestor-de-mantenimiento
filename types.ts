export type Role = 'ADMIN' | 'MAINTENANCE' | 'TREASURY' | 'SOLICITOR';

export enum Status {
  OPERATIVE = 'OPERATIVE',
  PREVENTION = 'PREVENTION',
  REPAIR = 'REPAIR',
  REQUEST = 'REQUEST'
}

export type ToolStatus = 'AVAILABLE' | 'IN_USE' | 'BROKEN';

export interface Tool {
  id: string;
  name: string;
  status: ToolStatus;
  assignedTo?: string;
  assignedDate?: string;
}

export interface WarehouseItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
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
  campus: string;
  name: string;
  type: string;
  description: string;
  status: Status;
  images: string[];
  inventory: InventoryItem[];
  requests: MaterialRequest[];
  lastUpdated: string;
}