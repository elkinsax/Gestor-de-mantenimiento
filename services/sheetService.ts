import { MaintenanceUnit, Tool, WarehouseItem } from '../types';
import { INITIAL_UNITS, INITIAL_TOOLS, INITIAL_WAREHOUSE } from '../constants';

const KEYS = {
  UNITS: 'maint_units_v2',
  CAMPUSES: 'maint_campuses_v2',
  TOOLS: 'maint_tools_v2',
  WAREHOUSE: 'maint_warehouse_v2',
  CONFIG: 'maint_config_v2'
};

export const sheetService = {
  getUnits: (): MaintenanceUnit[] => {
    const data = localStorage.getItem(KEYS.UNITS);
    return data ? JSON.parse(data) : INITIAL_UNITS;
  },
  saveUnits: (units: MaintenanceUnit[]) => {
    localStorage.setItem(KEYS.UNITS, JSON.stringify(units));
  },
  getCampuses: (): string[] => {
    const data = localStorage.getItem(KEYS.CAMPUSES);
    if (data) return JSON.parse(data);
    const initial = Array.from(new Set(INITIAL_UNITS.map(u => u.campus)));
    localStorage.setItem(KEYS.CAMPUSES, JSON.stringify(initial));
    return initial;
  },
  saveCampuses: (campuses: string[]) => {
    localStorage.setItem(KEYS.CAMPUSES, JSON.stringify(campuses));
  },
  getTools: (): Tool[] => {
    const data = localStorage.getItem(KEYS.TOOLS);
    return data ? JSON.parse(data) : INITIAL_TOOLS;
  },
  saveTools: (tools: Tool[]) => {
    localStorage.setItem(KEYS.TOOLS, JSON.stringify(tools));
  },
  getWarehouse: (): WarehouseItem[] => {
    const data = localStorage.getItem(KEYS.WAREHOUSE);
    return data ? JSON.parse(data) : INITIAL_WAREHOUSE;
  },
  saveWarehouse: (items: WarehouseItem[]) => {
    localStorage.setItem(KEYS.WAREHOUSE, JSON.stringify(items));
  },
  getConfig: () => localStorage.getItem(KEYS.CONFIG) || '',
  saveConfig: (url: string) => localStorage.setItem(KEYS.CONFIG, url)
};