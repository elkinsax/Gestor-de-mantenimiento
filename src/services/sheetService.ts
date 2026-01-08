
import { MaintenanceUnit, Tool, WarehouseItem, Status } from '../types';
import { INITIAL_UNITS, INITIAL_TOOLS, INITIAL_WAREHOUSE } from '../constants';

/**
 * Service to manage data persistence and API synchronization.
 * Uses LocalStorage for offline capability and Fetch API for cloud sync.
 */

const STORAGE_KEY = 'school_maint_units_v1';
const CAMPUS_KEY = 'school_maint_campuses_v1';
const TOOLS_KEY = 'school_maint_tools_v1';
const WAREHOUSE_KEY = 'school_maint_warehouse_v1';
const API_CONFIG_KEY = 'school_maint_api_config_v1';
const AUTH_KEY = 'school_maint_auth_v1';

// Helpers
const getStored = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const setStored = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// --- AUTH ---
export const getAuthData = (): {[key: string]: string} => getStored(AUTH_KEY, {});
export const saveAuthData = (data: {[key: string]: string}) => setStored(AUTH_KEY, data);
export const checkPassword = (role: string, pass: string): boolean => {
    const auth = getAuthData();
    // In a real app, this would be a hash check. For this demo, it's direct.
    return auth[role] === pass || pass === 'admin123'; // Fallback for testing
};

// --- CONFIG ---
export const getApiConfig = (): string => localStorage.getItem(API_CONFIG_KEY) || '';
export const saveApiConfig = (url: string) => localStorage.setItem(API_CONFIG_KEY, url.trim());

// --- UNITS ---
export const getUnits = async (orgId?: string): Promise<MaintenanceUnit[]> => {
  return getStored(STORAGE_KEY, INITIAL_UNITS);
};

export const updateUnit = async (updatedUnit: MaintenanceUnit): Promise<MaintenanceUnit[]> => {
  const units = await getUnits();
  const newUnits = units.map(u => u.id === updatedUnit.id ? updatedUnit : u);
  setStored(STORAGE_KEY, newUnits);
  return newUnits;
};

export const createUnit = async (newUnit: MaintenanceUnit): Promise<MaintenanceUnit[]> => {
  const units = await getUnits();
  const updatedUnits = [...units, newUnit];
  setStored(STORAGE_KEY, updatedUnits);
  return updatedUnits;
};

// --- CAMPUSES ---
export const getCampuses = async (): Promise<string[]> => {
  const stored = localStorage.getItem(CAMPUS_KEY);
  if (stored) return JSON.parse(stored);
  const derivedCampuses = Array.from(new Set(INITIAL_UNITS.map(u => u.campus)));
  setStored(CAMPUS_KEY, derivedCampuses);
  return derivedCampuses;
};

export const addCampus = async (name: string): Promise<string[]> => {
  const campuses = await getCampuses();
  if (!campuses.includes(name)) {
    const newCampuses = [...campuses, name];
    setStored(CAMPUS_KEY, newCampuses);
    return newCampuses;
  }
  return campuses;
};

export const renameCampus = async (oldName: string, newName: string): Promise<{campuses: string[], units: MaintenanceUnit[]}> => {
  let campuses = await getCampuses();
  campuses = campuses.map(c => c === oldName ? newName : c);
  setStored(CAMPUS_KEY, campuses);

  let units = await getUnits();
  units = units.map(u => u.campus === oldName ? { ...u, campus: newName } : u);
  setStored(STORAGE_KEY, units);
  return { campuses, units };
};

export const deleteCampus = async (name: string): Promise<{campuses: string[], units: MaintenanceUnit[]}> => {
  let campuses = await getCampuses();
  campuses = campuses.filter(c => c !== name);
  setStored(CAMPUS_KEY, campuses);

  let units = await getUnits();
  units = units.filter(u => u.campus !== name);
  setStored(STORAGE_KEY, units);
  return { campuses, units };
};

// --- TOOLS ---
export const getTools = async (): Promise<Tool[]> => getStored(TOOLS_KEY, INITIAL_TOOLS);

export const updateTool = async (updatedTool: Tool): Promise<Tool[]> => {
  const tools = await getTools();
  const newTools = tools.map(t => t.id === updatedTool.id ? updatedTool : t);
  setStored(TOOLS_KEY, newTools);
  return newTools;
};

export const addTool = async (newTool: Tool): Promise<Tool[]> => {
  const tools = await getTools();
  const newTools = [...tools, newTool];
  setStored(TOOLS_KEY, newTools);
  return newTools;
};

// --- WAREHOUSE ---
export const getWarehouse = async (): Promise<WarehouseItem[]> => getStored(WAREHOUSE_KEY, INITIAL_WAREHOUSE);

export const updateWarehouseItem = async (updatedItem: WarehouseItem): Promise<WarehouseItem[]> => {
  const items = await getWarehouse();
  const newItems = items.map(i => i.id === updatedItem.id ? updatedItem : i);
  setStored(WAREHOUSE_KEY, newItems);
  return newItems;
};

export const addWarehouseItem = async (newItem: WarehouseItem): Promise<WarehouseItem[]> => {
  const items = await getWarehouse();
  const newItems = [...items, newItem];
  setStored(WAREHOUSE_KEY, newItems);
  return newItems;
};

// --- SYNC ---
export const syncWithGoogleSheets = async (): Promise<{success: boolean, message: string}> => {
  const url = getApiConfig();
  if (!url) return { success: false, message: 'No se ha configurado la URL del API.' };

  try {
    const data = {
      units: await getUnits(),
      campuses: await getCampuses(),
      tools: await getTools(),
      warehouse: await getWarehouse(),
      auth: getAuthData()
    };
    
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ action: 'SYNC_UP', data }),
      headers: { 'Content-Type': 'text/plain' }
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const result = await response.json();
    return { success: true, message: result.message || 'Sincronización exitosa.' };
  } catch (error: any) {
    return { success: false, message: `Error: ${error.message}` };
  }
};

export const fetchFromGoogleSheets = async (): Promise<{success: boolean, message: string}> => {
  const url = getApiConfig();
  if (!url) return { success: false, message: 'No se ha configurado la URL.' };
  
  try {
    const response = await fetch(url);
    const result = await response.json();
    if (result.status === 'success' && result.data) {
      const { units, campuses, tools, warehouse, auth } = result.data;
      if (units) setStored(STORAGE_KEY, units);
      if (campuses) setStored(CAMPUS_KEY, campuses);
      if (tools) setStored(TOOLS_KEY, tools);
      if (warehouse) setStored(WAREHOUSE_KEY, warehouse);
      if (auth) setStored(AUTH_KEY, auth);
      return { success: true, message: 'Datos descargados correctamente.' };
    }
    return { success: false, message: 'Respuesta inválida del servidor.' };
  } catch (error: any) {
    return { success: false, message: `Error de conexión: ${error.message}` };
  }
};

export const saveUnitToCloud = async (unit: MaintenanceUnit) => {
    // For simplicity, we sync the whole state
    return syncWithGoogleSheets();
};

export const resetData = () => {
  localStorage.clear();
  window.location.reload();
};
