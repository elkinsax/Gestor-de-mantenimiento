import { INITIAL_UNITS, INITIAL_TOOLS, INITIAL_WAREHOUSE } from '../constants';
import { MaintenanceUnit, Tool, WarehouseItem, AuthData, Organization } from '../types';

const STORAGE_PREFIX = 'saas_maint_v1_';
const ORGS_KEY = 'saas_organizations_registry';
const API_CONFIG_KEY = 'saas_api_config_v1';

const getOrgKey = (orgId: string, key: string) => `${STORAGE_PREFIX}${orgId}_${key}`;

// Helper to retrieve the current organization context from local storage
const getCurrentOrgId = () => {
  return localStorage.getItem('saas_current_org_id') || '';
};

// --- ORGANIZATIONS ---
export const getSavedOrganizations = (): Organization[] => {
  const data = localStorage.getItem(ORGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveOrganization = (org: Organization) => {
  const orgs = getSavedOrganizations();
  const exists = orgs.find(o => o.id === org.id);
  const updated = exists ? orgs.map(o => o.id === org.id ? org : o) : [...orgs, org];
  localStorage.setItem(ORGS_KEY, JSON.stringify(updated));
};

// --- DATA ACCESS (Scoped by Org) ---
export const getUnits = (orgId: string = getCurrentOrgId()): MaintenanceUnit[] => {
  if (!orgId) return [];
  const data = localStorage.getItem(getOrgKey(orgId, 'units'));
  // Si no hay datos, devolvemos los iniciales pero marcados con esta Org
  return data ? JSON.parse(data) : INITIAL_UNITS.map(u => ({ ...u, orgId }));
};

export const saveUnits = (orgId: string, units: MaintenanceUnit[]) => {
  localStorage.setItem(getOrgKey(orgId, 'units'), JSON.stringify(units));
};

export const getCampuses = (orgId: string = getCurrentOrgId()): string[] => {
  if (!orgId) return [];
  const data = localStorage.getItem(getOrgKey(orgId, 'campuses'));
  if (data) return JSON.parse(data);
  const units = getUnits(orgId);
  const campuses = Array.from(new Set(units.map(u => u.campus)));
  saveCampuses(orgId, campuses);
  return campuses;
};

export const saveCampuses = (orgId: string, campuses: string[]) => {
  localStorage.setItem(getOrgKey(orgId, 'campuses'), JSON.stringify(campuses));
};

export const getTools = (orgId: string = getCurrentOrgId()): Tool[] => {
  if (!orgId) return [];
  const data = localStorage.getItem(getOrgKey(orgId, 'tools'));
  return data ? JSON.parse(data) : INITIAL_TOOLS.map(t => ({ ...t, orgId }));
};

export const saveTools = (orgId: string, tools: Tool[]) => {
  localStorage.setItem(getOrgKey(orgId, 'tools'), JSON.stringify(tools));
};

export const getWarehouse = (orgId: string = getCurrentOrgId()): WarehouseItem[] => {
  if (!orgId) return [];
  const data = localStorage.getItem(getOrgKey(orgId, 'warehouse'));
  return data ? JSON.parse(data) : INITIAL_WAREHOUSE.map(w => ({ ...w, orgId }));
};

export const saveWarehouse = (orgId: string, items: WarehouseItem[]) => {
  localStorage.setItem(getOrgKey(orgId, 'warehouse'), JSON.stringify(items));
};

// Fix: Added missing tool update functions for WarehouseModal
export const updateTool = async (updatedTool: Tool): Promise<Tool[]> => {
  const orgId = updatedTool.orgId || getCurrentOrgId();
  const tools = getTools(orgId);
  const newTools = tools.map(t => t.id === updatedTool.id ? updatedTool : t);
  saveTools(orgId, newTools);
  return newTools;
};

export const addTool = async (newTool: Tool): Promise<Tool[]> => {
  const orgId = newTool.orgId || getCurrentOrgId();
  const tools = getTools(orgId);
  const newTools = [...tools, newTool];
  saveTools(orgId, newTools);
  return newTools;
};

// Fix: Added missing warehouse update functions for WarehouseModal
export const updateWarehouseItem = async (updatedItem: WarehouseItem): Promise<WarehouseItem[]> => {
  const orgId = updatedItem.orgId || getCurrentOrgId();
  const items = getWarehouse(orgId);
  const newItems = items.map(i => i.id === updatedItem.id ? updatedItem : i);
  saveWarehouse(orgId, newItems);
  return newItems;
};

export const addWarehouseItem = async (newItem: WarehouseItem): Promise<WarehouseItem[]> => {
  const orgId = newItem.orgId || getCurrentOrgId();
  const items = getWarehouse(orgId);
  const newItems = [...items, newItem];
  saveWarehouse(orgId, newItems);
  return newItems;
};

export const getAuthData = (): AuthData => {
  const data = localStorage.getItem('saas_auth_data');
  return data ? JSON.parse(data) : {};
};

export const saveAuthData = (data: AuthData) => {
  localStorage.setItem('saas_auth_data', JSON.stringify(data));
};

// Fix: Added missing API config and sync functions for AdminSettingsModal
export const getApiConfig = (): string => {
  return localStorage.getItem(API_CONFIG_KEY) || '';
};

export const saveApiConfig = (url: string) => {
  localStorage.setItem(API_CONFIG_KEY, url.trim());
};

export const syncWithGoogleSheets = async (): Promise<{success: boolean, message: string}> => {
  const url = getApiConfig();
  if (!url) {
    return { success: false, message: 'No se ha configurado la URL del API.' };
  }

  const orgId = getCurrentOrgId();
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      action: 'SYNC_UP',
      orgId,
      data: {
        units: getUnits(orgId),
        campuses: getCampuses(orgId),
        tools: getTools(orgId),
        warehouse: getWarehouse(orgId),
        auth: getAuthData()
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 
        'Content-Type': 'text/plain' 
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const result = await response.json();
    return { 
      success: true, 
      message: result.message || 'Datos enviados correctamente al servidor.' 
    };

  } catch (error: any) {
    console.error("Sync Error:", error);
    return { 
      success: false, 
      message: `Error de conexión: ${error.message || 'Desconocido'}.` 
    };
  }
};

export const fetchFromGoogleSheets = async (): Promise<{success: boolean, message: string}> => {
  const url = getApiConfig();
  if (!url) {
    return { success: false, message: 'No se ha configurado la URL del API.' };
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const result = await response.json();
    if (result.status === 'success') {
      const orgId = getCurrentOrgId();
      saveUnits(orgId, result.data.units);
      saveCampuses(orgId, result.data.campuses);
      saveTools(orgId, result.data.tools);
      saveWarehouse(orgId, result.data.warehouse);
      saveAuthData(result.data.auth);
      return { success: true, message: 'Datos descargados correctamente.' };
    }
    return { success: false, message: result.message || 'Error al obtener datos.' };

  } catch (error: any) {
    console.error("Fetch Error:", error);
    return { 
      success: false, 
      message: `Error de conexión: ${error.message || 'Desconocido'}.` 
    };
  }
};

export const resetData = () => {
  localStorage.clear();
  window.location.reload();
};

export const sheetService = {
  getSavedOrganizations,
  saveOrganization,
  getUnits,
  saveUnits,
  getCampuses,
  saveCampuses,
  getTools,
  saveTools,
  getWarehouse,
  saveWarehouse,
  getAuthData,
  saveAuthData,
  resetData,
  // Fix: Added missing syncOrgWithCloud for App component
  syncOrgWithCloud: async (org: Organization) => {
    return syncWithGoogleSheets();
  }
};