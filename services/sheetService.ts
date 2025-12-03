import { INITIAL_UNITS } from '../constants';
import { MaintenanceUnit } from '../types';

/**
 * Service to manage data persistence and API synchronization.
 * Uses LocalStorage for offline capability and Fetch API for cloud sync.
 */

const STORAGE_KEY = 'school_maint_data_v1';
const CAMPUS_KEY = 'school_maint_campuses_v1';
const API_CONFIG_KEY = 'school_maint_api_config_v1';

// --- UNITS ---

export const getUnits = async (): Promise<MaintenanceUnit[]> => {
  // Simulate network delay for realistic UI feel
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return INITIAL_UNITS;
};

export const updateUnit = async (updatedUnit: MaintenanceUnit): Promise<MaintenanceUnit[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const stored = localStorage.getItem(STORAGE_KEY);
  const units: MaintenanceUnit[] = stored ? JSON.parse(stored) : INITIAL_UNITS;
  
  const newUnits = units.map(u => u.id === updatedUnit.id ? updatedUnit : u);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUnits));
  
  return newUnits;
};

export const createUnit = async (newUnit: MaintenanceUnit): Promise<MaintenanceUnit[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  const stored = localStorage.getItem(STORAGE_KEY);
  const units: MaintenanceUnit[] = stored ? JSON.parse(stored) : INITIAL_UNITS;

  const updatedUnits = [...units, newUnit];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUnits));

  return updatedUnits;
};


// --- CAMPUSES ---

export const getCampuses = async (): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  const stored = localStorage.getItem(CAMPUS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  // If no stored campuses, derive from INITIAL_UNITS
  const derivedCampuses = Array.from(new Set(INITIAL_UNITS.map(u => u.campus)));
  localStorage.setItem(CAMPUS_KEY, JSON.stringify(derivedCampuses));
  
  return derivedCampuses;
};

export const addCampus = async (name: string): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  const stored = localStorage.getItem(CAMPUS_KEY);
  const campuses: string[] = stored ? JSON.parse(stored) : [];

  if (!campuses.includes(name)) {
    const newCampuses = [...campuses, name];
    localStorage.setItem(CAMPUS_KEY, JSON.stringify(newCampuses));
    return newCampuses;
  }
  
  return campuses;
};

export const renameCampus = async (oldName: string, newName: string): Promise<{campuses: string[], units: MaintenanceUnit[]}> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  // 1. Update Campus List
  const storedCampuses = localStorage.getItem(CAMPUS_KEY);
  let campuses: string[] = storedCampuses ? JSON.parse(storedCampuses) : [];
  campuses = campuses.map(c => c === oldName ? newName : c);
  localStorage.setItem(CAMPUS_KEY, JSON.stringify(campuses));

  // 2. Update Units associated with this campus
  const storedUnits = localStorage.getItem(STORAGE_KEY);
  let units: MaintenanceUnit[] = storedUnits ? JSON.parse(storedUnits) : INITIAL_UNITS;
  
  // Update the campus name in all units
  units = units.map(u => u.campus === oldName ? { ...u, campus: newName } : u);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(units));

  return { campuses, units };
};

export const deleteCampus = async (name: string): Promise<{campuses: string[], units: MaintenanceUnit[]}> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  // 1. Remove from Campus List
  const storedCampuses = localStorage.getItem(CAMPUS_KEY);
  let campuses: string[] = storedCampuses ? JSON.parse(storedCampuses) : [];
  campuses = campuses.filter(c => c !== name);
  localStorage.setItem(CAMPUS_KEY, JSON.stringify(campuses));

  // 2. Remove Units associated with this campus (Cascade Delete)
  const storedUnits = localStorage.getItem(STORAGE_KEY);
  let units: MaintenanceUnit[] = storedUnits ? JSON.parse(storedUnits) : INITIAL_UNITS;
  units = units.filter(u => u.campus !== name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(units));

  return { campuses, units };
};

export const resetData = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CAMPUS_KEY);
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
    
    const payload = {
      timestamp: new Date().toISOString(),
      action: 'SYNC_UP', // Tell the backend we are sending updates
      data: {
        units,
        campuses
      }
    };

    console.log("---------------- SYNC DEBUG ----------------");
    console.log("Sending payload to:", url);
    console.log("Payload Structure:", JSON.stringify(payload, null, 2));
    console.log("--------------------------------------------");

    // Using 'text/plain' for Content-Type to avoid CORS preflight (OPTIONS) issues 
    // commonly found with Google Apps Script Web Apps.
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

    // Try to parse JSON response, but handle text response gracefully
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