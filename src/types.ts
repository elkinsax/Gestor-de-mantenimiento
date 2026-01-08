export type Role = 'MAINTENANCE' | 'TREASURY' | 'VIEWER' | 'ADMIN' | 'SOLICITOR';

export enum Status {
  OPERATIVE = 'OPERATIVE',
  PREVENTION = 'PREVENTION',
  REPAIR = 'REPAIR',
  REQUEST = 'REQUEST'
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
  assignedTo?: string;
  assignedDate?: string;
  image?: string;
}

export interface WarehouseItem {
  id: string;
  orgId: string;
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
  orgId: string;
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

export interface AuthData {
  [role: string]: string;
}