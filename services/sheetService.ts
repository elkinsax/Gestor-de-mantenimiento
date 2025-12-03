import { INITIAL_UNITS } from '../constants';
import { MaintenanceUnit } from '../types';

/**
 * In a real application, this service would make HTTP requests to a Python backend (Flask/FastAPI)
 * or use the Google Sheets API directly to sync data. 
 * 
 * For this demo, we use LocalStorage to persist data between reloads.
 */

const STORAGE_KEY = 'school_maint_data_v1';
const CAMPUS_KEY = 'school_maint_campuses_v1';

// --- UNITS ---

export const getUnits = async (): Promise<MaintenanceUnit[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return INITIAL_UNITS;
};

export const updateUnit = async (updatedUnit: MaintenanceUnit): Promise<MaintenanceUnit[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const stored = localStorage.getItem(STORAGE_KEY);
  const units: MaintenanceUnit[] = stored ? JSON.parse(stored) : INITIAL_UNITS;
  
  const newUnits = units.map(u => u.id === updatedUnit.id ? updatedUnit : u);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUnits));
  
  return newUnits;
};

export const createUnit = async (newUnit: MaintenanceUnit): Promise<MaintenanceUnit[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const stored = localStorage.getItem(STORAGE_KEY);
  const units: MaintenanceUnit[] = stored ? JSON.parse(stored) : INITIAL_UNITS;

  const updatedUnits = [...units, newUnit];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUnits));

  return updatedUnits;
};


// --- CAMPUSES ---

export const getCampuses = async (): Promise<string[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const stored = localStorage.getItem(CAMPUS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  // If no stored campuses, derive from INITIAL_UNITS
  const derivedCampuses = Array.from(new Set(INITIAL_UNITS.map(u => u.campus)));
  // Save them so we can add to them later
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

export const resetData = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CAMPUS_KEY);
  window.location.reload();
};