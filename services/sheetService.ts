
import { INITIAL_UNITS, INITIAL_TOOLS, INITIAL_WAREHOUSE } from '../constants';
import { MaintenanceUnit, Tool, WarehouseItem } from '../types';

/**
 * Service to manage data persistence and API synchronization.
 * Uses LocalStorage for offline capability and Fetch API for cloud sync.
 */

const STORAGE_KEY = 'school_maint_data_v1';
const CAMPUS_KEY = 'school_maint_campuses_v1';
const TOOLS_KEY = 'school_maint_tools_v1';
const WAREHOUSE_KEY = 'school_maint_warehouse_v1';
const API_CONFIG_KEY = 'school_maint_api_config_v1';

// --- UNITS ---

export const getUnits = async (): Promise<MaintenanceUnit[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    // Added type assertion to JSON.parse result
    return JSON.parse(stored) as MaintenanceUnit[];
  }
  return INITIAL_UNITS;
};

export const updateUnit = async (updatedUnit: MaintenanceUnit): Promise<MaintenanceUnit[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const stored = localStorage.getItem(STORAGE_KEY);
  // Added type assertion to JSON.parse result
  const units: MaintenanceUnit[] = stored ? (JSON.parse(stored) as MaintenanceUnit[]) : INITIAL_UNITS;
  const newUnits = units.map(u => u.id === updatedUnit.id ? updatedUnit : u);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUnits));
  return newUnits;
};

export const createUnit = async (newUnit: MaintenanceUnit): Promise<MaintenanceUnit[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const stored = localStorage.getItem(STORAGE_KEY);
  // Added type assertion to JSON.parse result
  const units: MaintenanceUnit[] = stored ? (JSON.parse(stored) as MaintenanceUnit[]) : INITIAL_UNITS;
  const updatedUnits = [...units, newUnit];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUnits));
  return updatedUnits;
};

// --- CAMPUSES ---

export const getCampuses = async (): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const stored = localStorage.getItem(CAMPUS_KEY);
  if (stored) {
    // FIX: Using 'as any' to avoid 'unknown[]' to 'string[]' assignment error on line 59
    return JSON.parse(stored) as any;
  }
  const derivedCampuses = Array.from(new Set(INITIAL_UNITS.map(u => u.campus)));
  localStorage.setItem(CAMPUS_KEY, JSON.stringify(derivedCampuses));
  return derivedCampuses;
};

export const addCampus = async (name: string): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const stored = localStorage.getItem(CAMPUS_KEY);
  // Added type assertion to JSON.parse result
  const campuses: string[] = stored ? (JSON.parse(stored) as string[]) : [];
  if (!campuses.includes(name)) {
    const newCampuses = [...campuses, name];
    localStorage.setItem(CAMPUS_KEY, JSON.stringify(newCampuses));
    return newCampuses;
  }
  return campuses;
};

export const renameCampus = async (oldName: string, newName: string): Promise<{campuses: string[], units: MaintenanceUnit[]}> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const storedCampuses = localStorage.getItem(CAMPUS_KEY);
  // Added type assertion to JSON.parse result
  let campuses: string[] = storedCampuses ? (JSON.parse(storedCampuses) as string[]) : [];
  campuses = campuses.map(c => c === oldName ? newName : c);
  localStorage.setItem(CAMPUS_KEY, JSON.stringify(campuses));
  const storedUnits = localStorage.getItem(STORAGE_KEY);
  // Added type assertion to JSON.parse result
  let units: MaintenanceUnit[] = storedUnits ? (JSON.parse(storedUnits) as MaintenanceUnit[]) : INITIAL_UNITS;
  units = units.map(u => u.campus === oldName ? { ...u, campus: newName } : u);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(units));
  return { campuses, units };
};

export const deleteCampus = async (name: string): Promise<{campuses: string[], units: MaintenanceUnit[]}> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const storedCampuses = localStorage.getItem(CAMPUS_KEY);
  // Added type assertion to JSON.parse result
  let campuses: string[] = storedCampuses ? (JSON.parse(storedCampuses) as string[]) : [];
  campuses = campuses.filter(c => c !== name);
  localStorage.setItem(CAMPUS_KEY, JSON.stringify(campuses));
  const storedUnits = localStorage.getItem(STORAGE_KEY);
  // Added type assertion to JSON.parse result
  let units: MaintenanceUnit[] = storedUnits ? (JSON.parse(storedUnits) as MaintenanceUnit[]) : INITIAL_UNITS;
  units = units.filter(u => u.campus !== name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(units));
  return { campuses, units };
};

// --- TOOLS & WAREHOUSE ---

export const getTools = async (): Promise<Tool[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const stored = localStorage.getItem(TOOLS_KEY);
  // Added type assertion to JSON.parse result
  return stored ? (JSON.parse(stored) as Tool[]) : INITIAL_TOOLS;
};

export const updateTool = async (updatedTool: Tool): Promise<Tool[]> => {
  const tools = await getTools();
  const newTools = tools.map(t => t.id === updatedTool.id ? updatedTool : t);
  localStorage.setItem(TOOLS_KEY, JSON.stringify(newTools));
  return newTools;
};

export const addTool = async (newTool: Tool): Promise<Tool[]> => {
  const tools = await getTools();
  const newTools = [...tools, newTool];
  localStorage.setItem(TOOLS_KEY, JSON.stringify(newTools));
  return newTools;
};

export const getWarehouse = async (): Promise<WarehouseItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const stored = localStorage.getItem(WAREHOUSE_KEY);
  // Added type assertion to JSON.parse result
  return stored ? (JSON.parse(stored) as WarehouseItem[]) : INITIAL_WAREHOUSE;
};

export const updateWarehouseItem = async (updatedItem: WarehouseItem): Promise<WarehouseItem[]> => {
  const items = await getWarehouse();
  const newItems = items.map(i => i.id === updatedItem.id ? updatedItem : i);
  localStorage.setItem(WAREHOUSE_KEY, JSON.stringify(newItems));
  return newItems;
};

export const addWarehouseItem = async (newItem: WarehouseItem): Promise<WarehouseItem[]> => {
  const items = await getWarehouse();
  const newItems = [...items, newItem];
  localStorage.setItem(WAREHOUSE_KEY, JSON.stringify(newItems));
  return newItems;
};


export const resetData = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CAMPUS_KEY);
  localStorage.removeItem(TOOLS_KEY);
  localStorage.removeItem(WAREHOUSE_KEY);
  window.location.reload();
};

// --- GOOGLE SHEETS / BACKEND CONNECTION ---

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

  try {
    const units = await getUnits();
    const campuses = await getCampuses();
    const tools = await getTools();
    const warehouse = await getWarehouse();
    
    const payload = {
      timestamp: new Date().toISOString(),
      action: 'SYNC_UP',
      data: {
        units,
        campuses,
        tools,
        warehouse
      }
    };

    console.log("---------------- SYNC DEBUG ----------------");
    console.log("Sending payload to:", url);
    console.log("Payload Structure:", JSON.stringify(payload, null, 2));
    console.log("--------------------------------------------");

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 
        'Content-Type': 'text/plain' 
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const textResult = await response.text();
    let jsonResult;
    try {
      jsonResult = JSON.parse(textResult);
    } catch (e) {
      console.warn("Response was not valid JSON:", textResult);
    }

    return { 
      success: true, 
      message: jsonResult?.message || 'Datos enviados correctamente al servidor.' 
    };

  } catch (error: any) {
    console.error("Sync Error:", error);
    return { 
      success: false, 
      message: `Error de conexión: ${error.message || 'Desconocido'}. Verifica la URL y CORS.` 
    };
  }
};
