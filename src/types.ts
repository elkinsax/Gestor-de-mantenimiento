
export type Role = 'MAINTENANCE' | 'TREASURY' | 'VIEWER' | 'ADMIN' | 'SOLICITOR' | 'SAAS_OWNER';

export enum Status {
  OPERATIVE = 'OPERATIVE',
  PREVENTION = 'PREVENTION',
  REPAIR = 'REPAIR',
  REQUEST = 'REQUEST'
}

export type ToolStatus = 'AVAILABLE' | 'IN_USE' | 'BROKEN';

// SaaS Core: Organization/Tenant structure
export interface Organization {
  id: string;
  name: string;
  slug: string; // unique identifier in URL (e.g., 'colegio-boston')
  logoUrl?: string;
  subscriptionPlan: 'FREE' | 'PRO' | 'ENTERPRISE';
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  organizationId: string;
  fullName: string;
}

export interface Tool {
  id: string;
  organizationId?: string; // Optional for local demo
  name: string;
  status: ToolStatus;
  assignedTo?: string;
  assignedDate?: string;
  image?: string; // Renamed from imageUrl to match component usage
}

export interface WarehouseItem {
  id: string;
  organizationId?: string; // Optional for local demo
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
  requestedBy?: string; // Optional for local demo
}

export interface MaintenanceUnit {
  id: string;
  organizationId?: string; // Optional for local demo
  campus: string;
  name: string;
  type: string;
  description: string;
  status: Status;
  images: string[]; // Renamed from imageUrls to match component usage
  inventory: InventoryItem[];
  requests: MaterialRequest[];
  lastUpdated: string;
}
